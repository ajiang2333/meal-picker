import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";
import cors from "cors";
import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
import { loadLocalEnv } from "./env.js";

loadLocalEnv();

const prisma = new PrismaClient();
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
const port = Number(process.env.PORT || 8787);
const uploadsDir = resolve(process.cwd(), "uploads");
const imageMimeExtensions: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif"
};

app.set("trust proxy", true);
app.use(cors());
app.use("/uploads", express.static(uploadsDir));
app.use(express.json({ limit: "10mb" }));

const covers: Record<string, string> = {
  奶茶: "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=500&q=80",
  烧烤: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=500&q=80",
  火锅: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?auto=format&fit=crop&w=500&q=80",
  快餐: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
  轻食: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
  粉面: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80"
};

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
}

function toJsonText(value: unknown): string {
  return JSON.stringify(value ?? []);
}

function mealTimeFromDate(date: Date) {
  const hour = date.getHours();
  if (hour < 10) return "早餐";
  if (hour < 14) return "午餐";
  if (hour < 17) return "下午茶";
  if (hour < 21) return "晚餐";
  return "夜宵";
}

function publicUploadUrl(req: express.Request, fileName: string) {
  const baseUrl = (process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
  return `${baseUrl}/uploads/${fileName}`;
}
function detectImageExtension(file: Express.Multer.File) {
  const byMime = imageMimeExtensions[file.mimetype];
  if (byMime) return byMime;

  const byName = extname(file.originalname || "").toLowerCase();
  if (Object.values(imageMimeExtensions).includes(byName)) return byName;

  const buffer = file.buffer;
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return ".jpg";
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return ".png";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return ".webp";
  if (buffer.length >= 6) {
    const header = buffer.toString("ascii", 0, 6);
    if (header === "GIF87a" || header === "GIF89a") return ".gif";
  }
  return "";
}

async function currentUser(req: express.Request) {
  const userId = String(req.header("x-user-id") || "");
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) return user;
  }
  const first = await prisma.user.findFirst();
  if (first) return first;
  return prisma.user.create({
    data: {
      nickname: "体验用户",
      provider: "mock",
      avatarColor: "#ffd100"
    }
  });
}

function average(values: number[]) {
  const valid = values.filter((item) => Number.isFinite(item) && item > 0);
  return valid.length ? valid.reduce((sum, item) => sum + item, 0) / valid.length : 0;
}

type UserDto = {
  id: string;
  nickname: string;
  avatarUrl?: string | null;
  avatarColor: string;
};

type StoreDto = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  mealTimes: string[];
  description?: string | null;
  coverUrl?: string | null;
  rating: number;
  avgPrice: number;
  orderCount: number;
  createdBy?: UserDto;
  updatedBy?: UserDto;
};

type DishDto = {
  id: string;
  storeId: string;
  name: string;
  price: number;
  rating: number;
  disliked: boolean;
  coverUrl?: string | null;
};

function toUserDto(user: any): UserDto | undefined {
  if (!user) return undefined;
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    avatarColor: user.avatarColor
  };
}

function toStoreDto(store: any): StoreDto {
  const orderRatings = (store.orders || []).map((order: any) => order.rating);
  const reviewRatings = (store.reviews || []).map((review: any) => review.rating);
  const dishRatings = (store.dishes || []).flatMap((dish: any) => (dish.reviews || []).map((review: any) => review.rating));
  const spend = (store.orders || []).reduce((sum: number, order: any) => sum + Number(order.total || 0), 0);
  const orderCount = store.orders?.length || 0;
  return {
    id: store.id,
    name: store.name,
    category: store.category,
    tags: asArray(store.tags),
    mealTimes: asArray(store.mealTimes),
    description: store.description,
    coverUrl: store.coverUrl,
    rating: average([...orderRatings, ...reviewRatings, ...dishRatings]) || 4.2,
    avgPrice: orderCount ? spend / orderCount : average((store.dishes || []).map((dish: any) => dish.price)),
    orderCount,
    createdBy: toUserDto(store.createdBy),
    updatedBy: toUserDto(store.updatedBy)
  };
}

function toDishDto(dish: any, storeCoverUrl?: string | null): DishDto {
  return {
    id: dish.id,
    storeId: dish.storeId,
    name: dish.name,
    price: dish.price,
    rating: average((dish.reviews || []).map((review: any) => review.rating)) || 4.2,
    disliked: dish.disliked,
    coverUrl: dish.coverUrl || storeCoverUrl || dish.store?.coverUrl
  };
}

function toOrderDto(order: any) {
  return {
    id: order.id,
    user: toUserDto(order.user),
    store: toStoreDto(order.store),
    orderTime: order.orderTime.toISOString().slice(0, 16),
    mealTime: order.mealTime,
    category: order.category,
    total: order.total,
    deliveryFee: order.deliveryFee,
    rating: order.rating,
    disliked: order.disliked,
    note: order.note,
    dishes: (order.items || []).map((item: any) => ({
      dishId: item.dishId,
      name: item.nameSnapshot,
      price: item.priceSnapshot,
      rating: item.rating,
      disliked: item.disliked,
      note: item.note
    }))
  };
}

function toReviewDto(review: any) {
  return {
    id: review.id,
    user: toUserDto(review.user),
    targetType: review.targetType,
    targetName: review.dish?.name || review.store?.name || "订单评价",
    rating: review.rating,
    disliked: review.disliked,
    content: review.content,
    createdAt: review.createdAt.toISOString(),
    orderId: review.orderId
  };
}

function toRandomPickDto(pick: any) {
  return {
    id: pick.id,
    store: pick.store ? toStoreDto(pick.store) : {
      id: pick.storeId,
      name: pick.storeName,
      category: pick.storeType,
      rating: pick.rating,
      avgPrice: 0,
      orderCount: 0,
      tags: [],
      mealTimes: []
    },
    user: toUserDto(pick.user),
    category: pick.category,
    mealTime: pick.mealTime,
    rating: pick.rating,
    storeType: pick.storeType,
    createdAt: pick.createdAt.toISOString()
  };
}

const storeListInclude = {
  createdBy: true,
  updatedBy: true,
  orders: true,
  reviews: true,
  dishes: { include: { reviews: true } }
} as const;

async function ensureStore(data: any, userId: string) {
  const storeName = String(data.storeName || "").trim();
  if (!storeName) throw new Error("store_name_required");

  const existing = await prisma.store.findUnique({
    where: { name: storeName },
    include: storeListInclude
  });
  if (existing) return { store: existing, created: false };

  const category = data.category || "快餐";
  const mealTime = data.mealTime || mealTimeFromDate(new Date(data.orderTime || Date.now()));
  const tags = data.tags || [category, mealTime].filter(Boolean);
  const mealTimes = data.mealTimes || [mealTime];

  try {
    const store = await prisma.store.create({
      data: {
        name: storeName,
        category,
        tags: toJsonText(tags),
        mealTimes: toJsonText(mealTimes),
        description: data.description || "由用户上传订单自动加入共建店铺库。",
        coverUrl: data.coverUrl || covers[category] || covers["快餐"],
        createdById: userId,
        updatedById: userId
      },
      include: storeListInclude
    });

    await prisma.storeRevision.create({
      data: {
        storeId: store.id,
        userId,
        note: data.revisionNote || "上传订单时同步维护店铺库。",
        snapshot: toJsonText({
          name: store.name,
          category: store.category,
          tags,
          mealTimes
        })
      }
    });

    return { store, created: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      const store = await prisma.store.findUniqueOrThrow({
        where: { name: storeName },
        include: storeListInclude
      });
      return { store, created: false };
    }
    throw error;
  }
}

async function ensureDish(storeId: string, item: any) {
  const name = String(item.name || "").trim();
  if (!name) return { dish: null, created: false };

  const existing = await prisma.dish.findUnique({
    where: { storeId_name: { storeId, name } },
    include: { reviews: true }
  });
  if (existing) return { dish: existing, created: false };

  try {
    const dish = await prisma.dish.create({
      data: {
        storeId,
        name,
        price: Number(item.price || 0),
        coverUrl: item.coverUrl,
        disliked: Boolean(item.disliked)
      },
      include: { reviews: true }
    });
    return { dish, created: true };
  } catch (error: any) {
    if (error?.code === "P2002") {
      const dish = await prisma.dish.findUniqueOrThrow({
        where: { storeId_name: { storeId, name } },
        include: { reviews: true }
      });
      return { dish, created: false };
    }
    throw error;
  }
}
async function markStoreMaintainedByDishUpload(storeId: string, userId: string, dishNames: string[]) {
  if (!dishNames.length) return;
  await prisma.store.update({
    where: { id: storeId },
    data: {
      updatedById: userId,
      revisions: {
        create: {
          userId,
          note: "上传订单时新增菜品。",
          snapshot: toJsonText({ createdDishes: dishNames })
        }
      }
    }
  });
}
app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  const provider = req.body.provider || "mock";
  const providerOpenId = req.body.openId || (req.body.code ? `${provider}:${req.body.code}` : undefined);
  const nickname = req.body.nickname || "体验用户";
  const user = providerOpenId
    ? await prisma.user.upsert({
        where: { providerOpenId },
        update: { nickname },
        create: { provider, providerOpenId, nickname }
      })
    : await prisma.user.create({ data: { provider, nickname } });
  res.json({ user: toUserDto(user) });
});

app.get("/api/users", async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  res.json({ users: users.map(toUserDto) });
});

app.get("/api/stores", async (req, res) => {
  const keyword = String(req.query.keyword || "").trim();
  const category = String(req.query.category || "全部");
  const mealTime = String(req.query.mealTime || "全部");
  const maintainedBy = String(req.query.maintainedBy || "").trim();
  const maintainedUser = maintainedBy === "me" ? await currentUser(req) : undefined;
  const stores = await prisma.store.findMany({
    where: {
      AND: [
        category && category !== "全部" ? { category } : {},
        maintainedUser ? { OR: [{ createdById: maintainedUser.id }, { updatedById: maintainedUser.id }] } : {},
        keyword
          ? {
              OR: [
                { name: { contains: keyword } },
                { category: { contains: keyword } },
                { description: { contains: keyword } },
                { createdBy: { is: { nickname: { contains: keyword } } } },
                { updatedBy: { is: { nickname: { contains: keyword } } } }
              ]
            }
          : {}
      ]
    },
    include: storeListInclude,
    orderBy: { updatedAt: "desc" }
  });
  const storeDtos = stores
    .map(toStoreDto)
    .filter((store) => mealTime === "全部" || store.mealTimes.includes(mealTime));
  res.json({ stores: storeDtos });
});

app.get("/api/stores/:id", async (req, res) => {
  const store = await prisma.store.findUnique({
    where: { id: req.params.id },
    include: {
      createdBy: true,
      updatedBy: true,
      orders: true,
      reviews: { include: { user: true, dish: true, store: true } },
      dishes: { include: { reviews: true } }
    }
  });
  if (!store) return res.status(404).json({ error: "store_not_found" });
  res.json({
    store: toStoreDto(store),
    dishes: store.dishes.map((dish: any) => toDishDto(dish, store.coverUrl)),
    reviews: store.reviews.map(toReviewDto)
  });
});

app.put("/api/stores/:id", async (req, res) => {
  const user = await currentUser(req);
  const hasField = (field: string) => Object.prototype.hasOwnProperty.call(req.body, field);
  const updateData: any = { updatedById: user.id };

  if (hasField("name")) updateData.name = req.body.name;
  if (hasField("category")) updateData.category = req.body.category;
  if (hasField("tags")) updateData.tags = toJsonText(req.body.tags || []);
  if (hasField("mealTimes")) updateData.mealTimes = toJsonText(req.body.mealTimes || []);
  if (hasField("description")) updateData.description = req.body.description;
  if (hasField("coverUrl")) updateData.coverUrl = req.body.coverUrl;

  updateData.revisions = {
    create: {
      userId: user.id,
      note: req.body.note || "更新了店铺信息。",
      snapshot: toJsonText(req.body)
    }
  };

  const store = await prisma.store.update({
    where: { id: req.params.id },
    data: updateData,
    include: { createdBy: true, updatedBy: true, orders: true, reviews: true, dishes: { include: { reviews: true } } }
  });
  res.json({ store: toStoreDto(store) });
});
app.get("/api/dishes/:id", async (req, res) => {
  const dish = await prisma.dish.findUnique({
    where: { id: req.params.id },
    include: { store: true, reviews: { include: { user: true, dish: true, store: true } } }
  });
  if (!dish) return res.status(404).json({ error: "dish_not_found" });
  res.json({
    dish: toDishDto(dish),
    reviews: dish.reviews.map(toReviewDto)
  });
});

app.put("/api/dishes/:id", async (req, res) => {
  await currentUser(req);
  const hasField = (field: string) => Object.prototype.hasOwnProperty.call(req.body, field);
  const updateData: any = {};

  if (hasField("name")) updateData.name = req.body.name;
  if (hasField("price")) updateData.price = Number(req.body.price || 0);
  if (hasField("disliked")) updateData.disliked = Boolean(req.body.disliked);
  if (hasField("coverUrl")) updateData.coverUrl = req.body.coverUrl;

  const dish = await prisma.dish.update({
    where: { id: req.params.id },
    data: updateData,
    include: { store: true, reviews: { include: { user: true, dish: true, store: true } } }
  });
  res.json({ dish: toDishDto(dish), reviews: dish.reviews.map(toReviewDto) });
});
app.get("/api/orders", async (req, res) => {
  const user = await currentUser(req);
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      user: true,
      store: { include: { createdBy: true, updatedBy: true, orders: true, reviews: true, dishes: { include: { reviews: true } } } },
      items: true
    },
    orderBy: { orderTime: "desc" }
  });
  res.json({ orders: orders.map(toOrderDto) });
});

app.post("/api/orders", async (req, res) => {
  const user = await currentUser(req);
  const { store, created: storeCreated } = await ensureStore(req.body, user.id);
  const orderTime = new Date(req.body.orderTime || Date.now());
  const order = await prisma.order.create({
    data: {
      userId: user.id,
      storeId: store.id,
      orderTime,
      mealTime: req.body.mealTime || mealTimeFromDate(orderTime),
      category: req.body.category,
      total: Number(req.body.total || 0),
      deliveryFee: Number(req.body.deliveryFee || 0),
      rating: Number(req.body.rating || 4),
      disliked: Boolean(req.body.disliked),
      note: req.body.note,
      rawText: req.body.rawText
    }
  });

  const createdDishes: DishDto[] = [];
  for (const item of req.body.dishes || []) {
    const itemName = String(item.name || "").trim();
    if (!itemName) continue;
    const { dish, created } = await ensureDish(store.id, { ...item, name: itemName });
    if (!dish) continue;
    if (created) createdDishes.push(toDishDto(dish, store.coverUrl));
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        dishId: dish.id,
        nameSnapshot: itemName,
        priceSnapshot: Number(item.price || 0),
        rating: item.rating,
        disliked: Boolean(item.disliked),
        note: item.note
      }
    });
    if (item.note || item.disliked) {
      await prisma.review.create({
        data: {
          userId: user.id,
          storeId: store.id,
          dishId: dish.id,
          orderId: order.id,
          targetType: "dish",
          rating: Number(item.rating || 4),
          disliked: Boolean(item.disliked),
          content: item.note || "标注了不喜欢"
        }
      });
    }
  }

  if (!storeCreated && createdDishes.length) await markStoreMaintainedByDishUpload(store.id, user.id, createdDishes.map((dish) => dish.name));

  if (req.body.note || req.body.disliked) {
    await prisma.review.create({
      data: {
        userId: user.id,
        storeId: store.id,
        orderId: order.id,
        targetType: "order",
        rating: Number(req.body.rating || 4),
        disliked: Boolean(req.body.disliked),
        content: req.body.note || "标注了不喜欢"
      }
    });
  }

  res.status(201).json({
    orderId: order.id,
    storeId: store.id,
    createdStore: storeCreated ? toStoreDto(store) : null,
    createdDishes,
    createdSummary: {
      storeCreated,
      dishCount: createdDishes.length,
      dishNames: createdDishes.map((dish) => dish.name)
    }
  });
});
app.put("/api/orders/:id", async (req, res) => {
  const user = await currentUser(req);
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: user.id } });
  if (!order) return res.status(404).json({ error: "order_not_found" });

  const storeResult = req.body.storeName ? await ensureStore(req.body, user.id) : undefined;
  const store = storeResult?.store;
  const orderTime = req.body.orderTime ? new Date(req.body.orderTime) : undefined;
  const rating = req.body.rating === undefined ? undefined : Number(req.body.rating);
  const createdDishes: DishDto[] = [];

  await prisma.order.update({
    where: { id: order.id },
    data: {
      storeId: store?.id,
      orderTime,
      mealTime: req.body.mealTime,
      category: req.body.category,
      total: req.body.total === undefined ? undefined : Number(req.body.total),
      deliveryFee: req.body.deliveryFee === undefined ? undefined : Number(req.body.deliveryFee || 0),
      rating,
      disliked: req.body.disliked === undefined ? undefined : Boolean(req.body.disliked),
      note: req.body.note
    }
  });

  if (Array.isArray(req.body.dishes)) {
    const storeId = store?.id || order.storeId;
    await prisma.review.deleteMany({ where: { orderId: order.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: order.id } });

    for (const item of req.body.dishes) {
      const itemName = String(item.name || "").trim();
      if (!itemName) continue;
      const { dish, created } = await ensureDish(storeId, { ...item, name: itemName });
      if (!dish) continue;
      if (created) createdDishes.push(toDishDto(dish, store?.coverUrl));
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          dishId: dish.id,
          nameSnapshot: itemName,
          priceSnapshot: Number(item.price || 0),
          rating: item.rating,
          disliked: Boolean(item.disliked),
          note: item.note
        }
      });
      if (item.note || item.disliked) {
        await prisma.review.create({
          data: {
            userId: user.id,
            storeId,
            dishId: dish.id,
            orderId: order.id,
            targetType: "dish",
            rating: Number(item.rating || rating || 4),
            disliked: Boolean(item.disliked),
            content: item.note || "标注了不喜欢"
          }
        });
      }
    }

    if (req.body.note || req.body.disliked) {
      await prisma.review.create({
        data: {
          userId: user.id,
          storeId,
          orderId: order.id,
          targetType: "order",
          rating: Number(rating || order.rating || 4),
          disliked: Boolean(req.body.disliked),
          content: req.body.note || "标注了不喜欢"
        }
      });
    }
  }

  if (!storeResult?.created && createdDishes.length) await markStoreMaintainedByDishUpload(store?.id || order.storeId, user.id, createdDishes.map((dish) => dish.name));

  const updated = await prisma.order.findUnique({
    where: { id: order.id },
    include: {
      user: true,
      store: { include: storeListInclude },
      items: true
    }
  });
  res.json({
    order: toOrderDto(updated),
    createdStore: storeResult?.created && store ? toStoreDto(store) : null,
    createdDishes,
    createdSummary: {
      storeCreated: Boolean(storeResult?.created),
      dishCount: createdDishes.length,
      dishNames: createdDishes.map((dish) => dish.name)
    }
  });
});
app.delete("/api/orders/:id", async (req, res) => {
  const user = await currentUser(req);
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: user.id } });
  if (!order) return res.status(404).json({ error: "order_not_found" });
  await prisma.order.delete({ where: { id: order.id } });
  res.status(204).end();
});

app.get("/api/reviews", async (req, res) => {
  const user = await currentUser(req);
  const reviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { user: true, store: true, dish: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ reviews: reviews.map(toReviewDto) });
});

app.delete("/api/reviews/:id", async (req, res) => {
  const user = await currentUser(req);
  const review = await prisma.review.findFirst({ where: { id: req.params.id, userId: user.id } });
  if (!review) return res.status(404).json({ error: "review_not_found" });
  await prisma.review.delete({ where: { id: review.id } });
  res.status(204).end();
});

app.get("/api/random", async (req, res) => {
  const user = await currentUser(req);
  const category = String(req.query.category || "全部");
  const mealTime = String(req.query.mealTime || "全部");
  const excludeDisliked = String(req.query.excludeDisliked || "true") === "true";
  const peek = String(req.query.peek || "false") === "true";
  const stores = await prisma.store.findMany({
    where: category !== "全部" ? { category } : {},
    include: {
      createdBy: true,
      updatedBy: true,
      orders: true,
      reviews: true,
      dishes: { include: { reviews: true } }
    }
  });
  const candidates = stores
    .map(toStoreDto)
    .filter((store) => mealTime === "全部" || store.mealTimes.includes(mealTime))
    .filter((store) => !excludeDisliked || store.rating >= 3);
  const total = candidates.reduce((sum, store) => sum + Math.max(store.rating, 1), 0);
  let cursor = Math.random() * total;
  const winner = candidates.find((store) => {
    cursor -= Math.max(store.rating, 1);
    return cursor <= 0;
  });
  const store = winner || candidates[0] || null;
  if (!peek && store) {
    await prisma.randomPick.create({
      data: {
        storeId: store.id,
        userId: user.id,
        category,
        mealTime,
        storeName: store.name,
        rating: store.rating,
        storeType: store.category
      }
    });
  }
  res.json({ store: peek ? null : store, candidateCount: candidates.length });
});

app.get("/api/random-picks", async (req, res) => {
  const take = Math.min(Number(req.query.take || 10), 30);
  const skip = Math.max(Number(req.query.skip || 0), 0);
  const [records, total] = await Promise.all([
    prisma.randomPick.findMany({
      skip,
      take,
      include: {
        user: true,
        store: {
          include: {
            createdBy: true,
            updatedBy: true,
            orders: true,
            reviews: true,
            dishes: { include: { reviews: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    }),
    prisma.randomPick.count()
  ]);
  res.json({ records: records.map(toRandomPickDto), total, nextSkip: skip + records.length });
});

app.get("/api/stats", async (req, res) => {
  const requestedRange = Number(req.query.range || 30);
  const rangeDays = requestedRange === 7 ? 7 : 30;
  const requestedEnd = req.query.to ? new Date(String(req.query.to)) : new Date();
  const periodEnd = Number.isNaN(requestedEnd.getTime()) ? new Date() : requestedEnd;
  const periodStart = new Date(periodEnd);
  periodStart.setDate(periodStart.getDate() - rangeDays + 1);
  periodStart.setHours(0, 0, 0, 0);
  const orders = await prisma.order.findMany({
    where: { orderTime: { gte: periodStart, lte: periodEnd } },
    include: { store: true, user: true },
    orderBy: { orderTime: "asc" }
  });
  const byDay = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const byStoreCount = new Map<string, number>();
  const byMealTime = new Map<string, number>();
  const byRating = new Map<string, number>();
  const byUser = new Map<string, number>();
  for (const order of orders) {
    const day = order.orderTime.toISOString().slice(5, 10);
    byDay.set(day, (byDay.get(day) || 0) + order.total);
    byCategory.set(order.category, (byCategory.get(order.category) || 0) + order.total);
    byStoreCount.set(order.store.name, (byStoreCount.get(order.store.name) || 0) + 1);
    byMealTime.set(order.mealTime, (byMealTime.get(order.mealTime) || 0) + order.total);
    byRating.set(`${order.rating}分`, (byRating.get(`${order.rating}分`) || 0) + 1);
    byUser.set(order.user.nickname, (byUser.get(order.user.nickname) || 0) + order.total);
  }
  const mapToSeries = (map: Map<string, number>) =>
    [...map.entries()].map(([name, value]) => ({ name, value: Number(value.toFixed(1)) }));
  const totalSpend = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const favoriteStore = [...byStoreCount.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0]?.[0] || "暂无";
  const ratings = Array.from({ length: 5 }, (_, index) => {
    const name = `${5 - index}分`;
    return { name, value: byRating.get(name) || 0 };
  });
  const trend = mapToSeries(byDay).sort((a, b) => a.name.localeCompare(b.name));
  const categories = mapToSeries(byCategory).sort((a, b) => b.value - a.value);
  const mealTimes = mapToSeries(byMealTime).sort((a, b) => b.value - a.value);
  const stores = mapToSeries(byStoreCount).sort((a, b) => b.value - a.value).slice(0, 5);
  const users = mapToSeries(byUser).sort((a, b) => b.value - a.value);
  res.json({
    summary: {
      totalSpend: Number(totalSpend.toFixed(1)),
      orderCount: orders.length,
      averageOrderValue: Number((orders.length ? totalSpend / orders.length : 0).toFixed(1)),
      favoriteStore
    },
    rangeDays,
    period: { from: periodStart.toISOString(), to: periodEnd.toISOString() },
    trend,
    categories,
    mealTimes,
    stores,
    ratings,
    users,
    line: trend,
    pie: categories,
    donut: mealTimes,
    bars: stores
  });
});

app.post("/api/uploads/images", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "image_required" });
  const extension = detectImageExtension(req.file);
  if (!extension || !Object.values(imageMimeExtensions).includes(extension)) {
    return res.status(400).json({ error: "unsupported_image_type" });
  }

  await mkdir(uploadsDir, { recursive: true });
  const fileName = `${Date.now()}-${randomUUID()}${extension}`;
  await writeFile(resolve(uploadsDir, fileName), req.file.buffer);
  res.status(201).json({ url: publicUploadUrl(req, fileName) });
});

app.post("/api/ocr/extract", upload.single("image"), async (_req, res) => {
  res.json({
    status: "todo",
    message: "这里预留 OCR 接口，可接微信云托管、阿里云 OCR、百度 OCR 或自建 PaddleOCR。"
  });
});

app.use((error: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({ error: "image_too_large", maxSizeMb: 12 });
  }
  next(error);
});
app.listen(port, () => {
  console.log(`Waimai Picker API listening on http://127.0.0.1:${port}`);
});
