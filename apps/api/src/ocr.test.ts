import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { PrismaClient } from "@prisma/client";
import {
  exhaustOcrPeriod,
  isOcrBillingBlockedError,
  nextOcrResetAt,
  ocrBillingPeriod,
  readOcrMonthlyLimit,
  reserveOcrAttempt
} from "./ocr.js";

test("OCR monthly limit accepts test values but never exceeds 950", () => {
  assert.equal(readOcrMonthlyLimit(undefined), 950);
  assert.equal(readOcrMonthlyLimit("2"), 2);
  assert.throws(() => readOcrMonthlyLimit("951"), /between 1 and 950/);
  assert.throws(() => readOcrMonthlyLimit("0"), /between 1 and 950/);
});

test("billing period resets at midnight in Asia/Shanghai", () => {
  const beforeReset = new Date("2026-07-31T15:59:59.000Z");
  const afterReset = new Date("2026-07-31T16:00:00.000Z");
  assert.equal(ocrBillingPeriod(beforeReset), "2026-07");
  assert.equal(nextOcrResetAt(beforeReset), "2026-08-01T00:00:00+08:00");
  assert.equal(ocrBillingPeriod(afterReset), "2026-08");
  assert.equal(nextOcrResetAt(new Date("2026-12-10T00:00:00.000Z")), "2027-01-01T00:00:00+08:00");
});

test("billing and resource errors are treated as a hard quota stop", () => {
  assert.equal(isOcrBillingBlockedError({ code: "ResourceUnavailable.ResourcePackageRunOut" }), true);
  assert.equal(isOcrBillingBlockedError({ code: "ResourceUnavailable.InArrears" }), true);
  assert.equal(isOcrBillingBlockedError({ code: "ResourcesSoldOut.ChargeStatusException" }), true);
  assert.equal(isOcrBillingBlockedError({ code: "FailedOperation.ImageNoText" }), false);
});

test("concurrent reservations cannot pass the configured monthly limit", async () => {
  const databasePath = join(tmpdir(), `waimai-picker-ocr-${randomUUID()}.db`);
  const databaseUrl = `file:${databasePath.replace(/\\/g, "/")}`;
  const prisma = new PrismaClient({ datasources: { db: { url: databaseUrl } } });

  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "OcrMonthlyUsage" (
        "month" TEXT NOT NULL PRIMARY KEY,
        "attempts" INTEGER NOT NULL DEFAULT 0,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )
    `);
    const reservations = await Promise.all(
      Array.from({ length: 12 }, () => reserveOcrAttempt(prisma, "2026-07", 2))
    );
    assert.equal(reservations.filter(Boolean).length, 2);
    const usage = await prisma.ocrMonthlyUsage.findUniqueOrThrow({ where: { month: "2026-07" } });
    assert.equal(usage.attempts, 2);
    await exhaustOcrPeriod(prisma, "2026-08", 950);
    assert.equal(await reserveOcrAttempt(prisma, "2026-08", 950), false);
  } finally {
    await prisma.$disconnect();
    await rm(databasePath, { force: true });
    await rm(`${databasePath}-journal`, { force: true });
  }
});
