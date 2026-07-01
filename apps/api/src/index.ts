import cors from "cors";
import express from "express";
import multer from "multer";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = Number(process.env.PORT || 8787);

app.use(cors());
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
  return Array.isArray(value) ? value.map(String) : [];
}

function mealTimeFromDate(date: Date) {
  const hour = date.getHours();
  if (hour < 10) return "早餐";
  if (hour < 14) return "午餐";
  if (hour < 17) return "下午茶";
  if (hour < 21) return "晚餐";
  return "夜宵";
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

function toUserDto(user: any) {
  if (!user) return undefined;
  return {
    id: user.id,
    nickname: user.nickname,
    avatarUrl: user.avatarUrl,
    avatarColor: user.avatarColor
  };
}

function toStoreDto(store: any) {
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

async function upsertStore(data: any, userId: string) {
  const tags = data.tags || [data.category, data.mealTime].filter(Boolean);
  const mealTimes = data.mealTimes || [data.mealTime || mealTimeFromDate(new Date(data.orderTime || Date.now()))];
  const store = await prisma.store.upsert({
    where: { name: data.storeName },
    update: {
      category: data.category,
      tags,
      mealTimes,
      description: data.description,
      updatedById: userId
    },
    create: {
      name: data.storeName,
      category: data.category,
      tags,
      mealTimes,
      description: data.description || "由用户上传订单自动加入共建店铺库。",
      coverUrl: covers[data.category] || covers["快餐"],
      createdById: userId,
      updatedById: userId
    }
  });
  await prisma.storeRevision.create({
    data: {
      storeId: store.id,
      userId,
      note: data.revisionNote || "上传订单时同步维护店铺库。",
      snapshot: {
        name: store.name,
        category: store.category,
        tags,
        mealTimes
      }
    }
  });
  return store;
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
  const stores = await prisma.store.findMany({
    where: {
      AND: [
        category && category !== "全部" ? { category } : {},
        keyword
          ? {
              OR: [
                { name: { contains: keyword } },
                { category: { contains: keyword } },
                { description: { contains: keyword } }
              ]
            }
          : {}
      ]
    },
    include: {
      createdBy: true,
      updatedBy: true,
      orders: true,
      reviews: true,
      dishes: { include: { reviews: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
  res.json({ stores: stores.map(toStoreDto) });
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
    dishes: store.dishes.map((dish: any) => ({
      id: dish.id,
      storeId: dish.storeId,
      name: dish.name,
      price: dish.price,
      rating: average((dish.reviews || []).map((review: any) => review.rating)) || 4.2,
      disliked: dish.disliked
    })),
    reviews: store.reviews.map(toReviewDto)
  });
});

app.put("/api/stores/:id", async (req, res) => {
  const user = await currentUser(req);
  const store = await prisma.store.update({
    where: { id: req.params.id },
    data: {
      name: req.body.name,
      category: req.body.category,
      tags: req.body.tags || [],
      mealTimes: req.body.mealTimes || [],
      description: req.body.description,
      updatedById: user.id,
      revisions: {
        create: {
          userId: user.id,
          note: req.body.note || "更新了店铺信息。",
          snapshot: req.body
        }
      }
    },
    include: { createdBy: true, updatedBy: true, orders: true, reviews: true, dishes: { include: { reviews: true } } }
  });
  res.json({ store: toStoreDto(store) });
});

app.get("/api/dishes/:id", async (req, res) => {
  const dish = await prisma.dish.findUnique({
    where: { id: req.params.id },
    include: { reviews: { include: { user: true, dish: true, store: true } } }
  });
  if (!dish) return res.status(404).json({ error: "dish_not_found" });
  res.json({
    dish: {
      id: dish.id,
      storeId: dish.storeId,
      name: dish.name,
      price: dish.price,
      rating: average(dish.reviews.map((review: any) => review.rating)) || 4.2,
      disliked: dish.disliked
    },
    reviews: dish.reviews.map(toReviewDto)
  });
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
  const store = await upsertStore(req.body, user.id);
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

  for (const item of req.body.dishes || []) {
    const dish = await prisma.dish.upsert({
      where: { storeId_name: { storeId: store.id, name: item.name } },
      update: { price: Number(item.price || 0), disliked: Boolean(item.disliked) },
      create: {
        storeId: store.id,
        name: item.name,
        price: Number(item.price || 0),
        disliked: Boolean(item.disliked)
      }
    });
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        dishId: dish.id,
        nameSnapshot: item.name,
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

  res.status(201).json({ orderId: order.id, storeId: store.id });
});

app.put("/api/orders/:id", async (req, res) => {
  const user = await currentUser(req);
  const order = await prisma.order.findFirst({ where: { id: req.params.id, userId: user.id } });
  if (!order) return res.status(404).json({ error: "order_not_found" });
  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      orderTime: req.body.orderTime ? new Date(req.body.orderTime) : undefined,
      mealTime: req.body.mealTime,
      total: req.body.total,
      rating: req.body.rating,
      disliked: req.body.disliked,
      note: req.body.note
    }
  });
  res.json({ order: updated });
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

app.get("/api/stats", async (_req, res) => {
  const orders = await prisma.order.findMany({ include: { store: true, user: true } });
  const byDay = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const byStore = new Map<string, number>();
  const byMealTime = new Map<string, number>();
  const byRating = new Map<string, number>();
  const byUser = new Map<string, number>();
  for (const order of orders) {
    const day = order.orderTime.toISOString().slice(5, 10);
    byDay.set(day, (byDay.get(day) || 0) + order.total);
    byCategory.set(order.category, (byCategory.get(order.category) || 0) + order.total);
    byStore.set(order.store.name, (byStore.get(order.store.name) || 0) + order.total);
    byMealTime.set(order.mealTime, (byMealTime.get(order.mealTime) || 0) + order.total);
    byRating.set(`${order.rating}分`, (byRating.get(`${order.rating}分`) || 0) + 1);
    byUser.set(order.user.nickname, (byUser.get(order.user.nickname) || 0) + order.total);
  }
  const mapToSeries = (map: Map<string, number>) =>
    [...map.entries()].map(([name, value]) => ({ name, value: Number(value.toFixed(1)) }));
  res.json({
    line: mapToSeries(byDay).sort((a, b) => a.name.localeCompare(b.name)),
    pie: mapToSeries(byCategory).sort((a, b) => b.value - a.value),
    donut: mapToSeries(byMealTime).sort((a, b) => b.value - a.value),
    bars: mapToSeries(byStore).sort((a, b) => b.value - a.value).slice(0, 5),
    ratings: mapToSeries(byRating).sort((a, b) => b.name.localeCompare(a.name)),
    users: mapToSeries(byUser).sort((a, b) => b.value - a.value)
  });
});

app.post("/api/ocr/extract", upload.single("image"), async (_req, res) => {
  res.json({
    status: "todo",
    message: "这里预留 OCR 接口，可接微信云托管、阿里云 OCR、百度 OCR 或自建 PaddleOCR。"
  });
});

app.listen(port, () => {
  console.log(`Waimai Picker API listening on http://127.0.0.1:${port}`);
});
