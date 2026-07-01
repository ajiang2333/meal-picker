import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.randomPick.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.dish.deleteMany();
  await prisma.storeRevision.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const [chen, li, wang] = await Promise.all([
    prisma.user.create({ data: { nickname: "陈小满", provider: "mock", avatarColor: "#ffd100" } }),
    prisma.user.create({ data: { nickname: "李青柠", provider: "mock", avatarColor: "#8ee6b8" } }),
    prisma.user.create({ data: { nickname: "王夜宵", provider: "mock", avatarColor: "#ffb36b" } })
  ]);

  const fast = await prisma.store.create({
    data: {
      name: "金牌鸡腿饭",
      category: "快餐",
      tags: ["快餐", "午餐", "高性价比"],
      mealTimes: ["午餐", "晚餐"],
      description: "工作日午餐常备选项，出餐快，价格稳定。",
      coverUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
      createdById: chen.id,
      updatedById: chen.id
    }
  });

  const tea = await prisma.store.create({
    data: {
      name: "甜橙茶事",
      category: "奶茶",
      tags: ["奶茶", "下午茶", "少糖可选"],
      mealTimes: ["下午茶", "晚餐"],
      description: "清爽果茶和厚乳奶茶，适合下午犯困时来一杯。",
      coverUrl: "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=500&q=80",
      createdById: li.id,
      updatedById: li.id
    }
  });

  const bbq = await prisma.store.create({
    data: {
      name: "老街把把烧",
      category: "烧烤",
      tags: ["烧烤", "夜宵", "重口"],
      mealTimes: ["晚餐", "夜宵"],
      description: "串类选择多，辣度稳定，夜宵局比较靠谱。",
      coverUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=500&q=80",
      createdById: wang.id,
      updatedById: wang.id
    }
  });

  const chicken = await prisma.dish.create({ data: { storeId: fast.id, name: "招牌鸡腿饭", price: 25 } });
  const orange = await prisma.dish.create({ data: { storeId: tea.id, name: "满杯甜橙", price: 16 } });
  const beef = await prisma.dish.create({ data: { storeId: bbq.id, name: "牛肉小串", price: 24 } });

  const order = await prisma.order.create({
    data: {
      userId: chen.id,
      storeId: fast.id,
      orderTime: new Date("2026-06-18T12:22:00+08:00"),
      mealTime: "午餐",
      category: "快餐",
      total: 29,
      deliveryFee: 4,
      rating: 4,
      note: "出餐很快，午餐不想纠结时可以再点。",
      items: {
        create: [{ dishId: chicken.id, nameSnapshot: "招牌鸡腿饭", priceSnapshot: 25, rating: 4, note: "鸡腿够香。" }]
      }
    }
  });

  await prisma.review.createMany({
    data: [
      { userId: chen.id, storeId: fast.id, orderId: order.id, targetType: "order", rating: 4, content: "出餐很快，午餐不想纠结时可以再点。" },
      { userId: li.id, storeId: tea.id, dishId: orange.id, targetType: "dish", rating: 5, content: "三分糖刚好，橙香很足。" },
      { userId: wang.id, storeId: bbq.id, dishId: beef.id, targetType: "dish", rating: 5, content: "火候好，孜然香。" }
    ]
  });

  await prisma.storeRevision.createMany({
    data: [
      { storeId: fast.id, userId: chen.id, note: "新增工作日午餐标签。", snapshot: { tags: ["快餐", "午餐", "高性价比"] } },
      { storeId: tea.id, userId: li.id, note: "补充少糖可选。", snapshot: { tags: ["奶茶", "下午茶", "少糖可选"] } },
      { storeId: bbq.id, userId: wang.id, note: "补充夜宵可选。", snapshot: { tags: ["烧烤", "夜宵", "重口"] } }
    ]
  });

  await prisma.randomPick.createMany({
    data: [
      { storeId: fast.id, userId: chen.id, category: "全部", mealTime: "午餐", storeName: fast.name, rating: 4.2, storeType: "快餐", createdAt: new Date("2026-06-19T12:10:00+08:00") },
      { storeId: tea.id, userId: li.id, category: "奶茶", mealTime: "下午茶", storeName: tea.name, rating: 4.8, storeType: "奶茶", createdAt: new Date("2026-06-19T15:20:00+08:00") },
      { storeId: bbq.id, userId: wang.id, category: "烧烤", mealTime: "夜宵", storeName: bbq.name, rating: 4.5, storeType: "烧烤", createdAt: new Date("2026-06-19T22:08:00+08:00") }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
