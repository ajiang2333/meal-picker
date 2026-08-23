import { ocr } from "tencentcloud-sdk-nodejs-ocr";

const MAX_FREE_OCR_CALLS = 950;
const SHANGHAI_TIME_ZONE = "Asia/Shanghai";
const BILLING_BLOCK_CODES = new Set([
  "ResourceUnavailable.ResourcePackageRunOut",
  "ResourceUnavailable.InArrears",
  "ResourcesSoldOut.ChargeStatusException"
]);

type OcrUsageClient = {
  ocrMonthlyUsage: {
    upsert(args: {
      where: { month: string };
      create: { month: string; attempts: number };
      update: { attempts?: number };
    }): Promise<unknown>;
    updateMany(args: {
      where: { month: string; attempts: { lt: number } };
      data: { attempts: { increment: number } };
    }): Promise<{ count: number }>;
  };
};

export type OcrLine = {
  text: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type OcrResult = {
  rawText: string;
  lines: OcrLine[];
  requestId: string;
};

function shanghaiDateParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHANGHAI_TIME_ZONE,
    year: "numeric",
    month: "2-digit"
  }).formatToParts(now);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  return { year, month };
}

export function ocrBillingPeriod(now = new Date()) {
  const { year, month } = shanghaiDateParts(now);
  return `${year}-${String(month).padStart(2, "0")}`;
}

export function nextOcrResetAt(now = new Date()) {
  const { year, month } = shanghaiDateParts(now);
  const nextYear = month === 12 ? year + 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  return `${nextYear}-${String(nextMonth).padStart(2, "0")}-01T00:00:00+08:00`;
}

export function readOcrMonthlyLimit(value = process.env.OCR_MONTHLY_CALL_LIMIT) {
  if (value === undefined || value.trim() === "") return MAX_FREE_OCR_CALLS;
  const limit = Number(value);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_FREE_OCR_CALLS) {
    throw new Error(`OCR_MONTHLY_CALL_LIMIT must be an integer between 1 and ${MAX_FREE_OCR_CALLS}`);
  }
  return limit;
}

export async function exhaustOcrPeriod(client: OcrUsageClient, month: string, limit: number) {
  await client.ocrMonthlyUsage.upsert({
    where: { month },
    create: { month, attempts: limit },
    update: { attempts: limit }
  });
}

export async function reserveOcrAttempt(client: OcrUsageClient, month: string, limit: number) {
  await client.ocrMonthlyUsage.upsert({
    where: { month },
    create: { month, attempts: 0 },
    update: {}
  });
  const reserved = await client.ocrMonthlyUsage.updateMany({
    where: { month, attempts: { lt: limit } },
    data: { attempts: { increment: 1 } }
  });
  return reserved.count === 1;
}

function errorCode(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const candidate = error as { code?: unknown; Code?: unknown };
  return String(candidate.code || candidate.Code || "");
}

export function isOcrBillingBlockedError(error: unknown) {
  return BILLING_BLOCK_CODES.has(errorCode(error));
}

export function createTencentOcrClient() {
  const secretId = process.env.TENCENT_SECRET_ID?.trim();
  const secretKey = process.env.TENCENT_SECRET_KEY?.trim();
  if (!secretId || !secretKey) return null;

  const Client = ocr.v20181119.Client;
  return new Client({
    credential: { secretId, secretKey },
    region: process.env.TENCENT_OCR_REGION?.trim() || "ap-guangzhou",
    profile: {
      httpProfile: {
        endpoint: "ocr.tencentcloudapi.com",
        reqTimeout: 15
      }
    }
  });
}

export async function recognizeOrderImage(
  client: NonNullable<ReturnType<typeof createTencentOcrClient>>,
  image: Buffer
): Promise<OcrResult> {
  const response = await client.GeneralAccurateOCR({
    ImageBase64: image.toString("base64"),
    ConfigID: "OCR",
    WordsType: "2"
  });
  const lines = (response.TextDetections || [])
    .map((item) => ({
      text: String(item.DetectedText || "").trim(),
      confidence: Number(item.Confidence || 0),
      x: Number(item.ItemPolygon?.X || 0),
      y: Number(item.ItemPolygon?.Y || 0),
      width: Number(item.ItemPolygon?.Width || 0),
      height: Number(item.ItemPolygon?.Height || 0)
    }))
    .filter((item) => item.text)
    .sort((left, right) => left.y - right.y || left.x - right.x);
  return {
    rawText: lines.map((item) => item.text).join("\n"),
    lines,
    requestId: String(response.RequestId || "")
  };
}
