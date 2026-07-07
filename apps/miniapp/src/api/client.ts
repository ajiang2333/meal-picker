import type { OrderItemInput } from "@/types";

// const API_BASE = "http://127.0.0.1:8787/api";
const API_BASE = "http://122.51.38.219:8787/api";

const mockUsers = [
  { id: "mock-user-1", nickname: "春野小满", avatarColor: "#ffb8d0" },
  { id: "mock-user-2", nickname: "薄荷青柚", avatarColor: "#8ee6b8" },
  { id: "mock-user-3", nickname: "夜樱同学", avatarColor: "#cbb7ff" }
];

const mockStores = [
  {
    id: "mock-store-1",
    name: "樱花便当研究所",
    category: "快餐",
    tags: ["快餐", "午餐", "治愈系"],
    mealTimes: ["午餐", "晚餐"],
    rating: 4.7,
    avgPrice: 28,
    orderCount: 16,
    description: "粉绿春日风的便当小店，适合不想纠结的工作日午餐。",
    coverUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=700&q=80",
    createdBy: mockUsers[0],
    updatedBy: mockUsers[0]
  },
  {
    id: "mock-store-2",
    name: "薄荷奶茶星球",
    category: "奶茶",
    tags: ["奶茶", "下午茶", "少糖可选"],
    mealTimes: ["下午茶", "晚餐"],
    rating: 4.8,
    avgPrice: 18,
    orderCount: 22,
    description: "清爽果茶和奶盖，适合下午犯困时抽到一点甜。",
    coverUrl: "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=700&q=80",
    createdBy: mockUsers[1],
    updatedBy: mockUsers[1]
  },
  {
    id: "mock-store-3",
    name: "云朵火锅小队",
    category: "火锅",
    tags: ["火锅", "晚餐", "多人"],
    mealTimes: ["晚餐", "夜宵"],
    rating: 4.5,
    avgPrice: 58,
    orderCount: 9,
    description: "适合晚上一起点的暖锅，辣度稳定，配菜很全。",
    coverUrl: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?auto=format&fit=crop&w=700&q=80",
    createdBy: mockUsers[2],
    updatedBy: mockUsers[2]
  },
  {
    id: "mock-store-4",
    name: "流星烧烤社",
    category: "烧烤",
    tags: ["烧烤", "夜宵", "重口"],
    mealTimes: ["晚餐", "夜宵"],
    rating: 4.4,
    avgPrice: 42,
    orderCount: 13,
    description: "夜宵局稳定选手，串类选择多，香气很足。",
    coverUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=700&q=80",
    createdBy: mockUsers[2],
    updatedBy: mockUsers[0]
  },
  {
    id: "mock-store-5",
    name: "青柠轻食花园",
    category: "轻食",
    tags: ["轻食", "早餐", "低负担"],
    mealTimes: ["早餐", "午餐", "下午茶"],
    rating: 4.6,
    avgPrice: 32,
    orderCount: 11,
    description: "沙拉、卷饼和果昔，适合想吃清爽一点的时候。",
    coverUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=700&q=80",
    createdBy: mockUsers[1],
    updatedBy: mockUsers[1]
  },
  {
    id: "mock-store-6",
    name: "粉面月光站",
    category: "粉面",
    tags: ["粉面", "午餐", "热乎"],
    mealTimes: ["早餐", "午餐", "晚餐"],
    rating: 4.3,
    avgPrice: 24,
    orderCount: 18,
    description: "热汤粉面和拌粉都在线，适合快速解决一餐。",
    coverUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=700&q=80",
    createdBy: mockUsers[0],
    updatedBy: mockUsers[2]
  }
];

const mockDishes = [
  { id: "mock-dish-1", storeId: "mock-store-1", name: "春日鸡腿便当", price: 28, rating: 4.7, disliked: false },
  { id: "mock-dish-2", storeId: "mock-store-2", name: "薄荷青柠茶", price: 16, rating: 4.8, disliked: false },
  { id: "mock-dish-3", storeId: "mock-store-3", name: "番茄云朵锅", price: 58, rating: 4.5, disliked: false },
  { id: "mock-dish-4", storeId: "mock-store-4", name: "流星牛肉串", price: 36, rating: 4.4, disliked: false },
  { id: "mock-dish-5", storeId: "mock-store-5", name: "青柠鸡胸卷", price: 32, rating: 4.6, disliked: false },
  { id: "mock-dish-6", storeId: "mock-store-6", name: "月光牛肉粉", price: 24, rating: 4.3, disliked: false },
  { id: "mock-dish-7", storeId: "mock-store-1", name: "樱花可乐饼", price: 18, rating: 4.5, disliked: false },
  { id: "mock-dish-8", storeId: "mock-store-2", name: "草莓奶盖云", price: 19, rating: 4.7, disliked: false }
];

let mockOrders = [
  {
    id: "mock-order-1",
    user: mockUsers[0],
    store: mockStores[0],
    orderTime: "2026-06-23T12:08",
    mealTime: "午餐",
    category: "快餐",
    total: 32,
    rating: 5,
    disliked: false,
    note: "鸡腿外皮很香，午餐不纠结时可以继续点。",
    dishes: [{ name: "春日鸡腿便当", price: 28, rating: 5, disliked: false, note: "热乎，米饭也不错" }]
  },
  {
    id: "mock-order-2",
    user: mockUsers[0],
    store: mockStores[1],
    orderTime: "2026-06-22T15:34",
    mealTime: "下午茶",
    category: "奶茶",
    total: 21,
    rating: 5,
    disliked: false,
    note: "薄荷味很清爽，适合下午犯困的时候。",
    dishes: [{ name: "薄荷青柠茶", price: 16, rating: 5, disliked: false }]
  },
  {
    id: "mock-order-3",
    user: mockUsers[0],
    store: mockStores[5],
    orderTime: "2026-06-21T19:12",
    mealTime: "晚餐",
    category: "粉面",
    total: 27,
    rating: 4,
    disliked: false,
    note: "汤底舒服，适合晚上想吃热乎的时候。",
    dishes: [{ name: "月光牛肉粉", price: 24, rating: 4, disliked: false }]
  }
];

let mockReviews = [
  {
    id: "mock-review-1",
    user: mockUsers[0],
    targetType: "order" as const,
    targetName: "樱花便当研究所",
    rating: 5,
    disliked: false,
    content: "包装有春日感，鸡腿便当稳定好吃。",
    createdAt: "2026-06-23T12:40:00+08:00",
    orderId: "mock-order-1"
  },
  {
    id: "mock-review-2",
    user: mockUsers[1],
    targetType: "dish" as const,
    targetName: "春日鸡腿便当",
    rating: 5,
    disliked: false,
    content: "鸡腿外皮焦香，饭量刚好，像抽到一张午餐 SSR。",
    createdAt: "2026-06-23T12:48:00+08:00"
  },
  {
    id: "mock-review-3",
    user: mockUsers[1],
    targetType: "dish" as const,
    targetName: "薄荷青柠茶",
    rating: 5,
    disliked: false,
    content: "少糖刚好，薄荷味不会冲，下午茶很清醒。",
    createdAt: "2026-06-23T15:48:00+08:00"
  },
  {
    id: "mock-review-4",
    user: mockUsers[2],
    targetType: "dish" as const,
    targetName: "流星牛肉串",
    rating: 4,
    disliked: false,
    content: "香气足，夜宵局可以加入抽选池。",
    createdAt: "2026-06-22T22:26:00+08:00"
  },
  {
    id: "mock-review-5",
    user: mockUsers[0],
    targetType: "dish" as const,
    targetName: "月光牛肉粉",
    rating: 4,
    disliked: false,
    content: "汤热、粉软，适合不想吃太重的时候。",
    createdAt: "2026-06-21T19:38:00+08:00"
  }
];

let mockRandomPicks = [
  makePick(mockStores[0], mockUsers[0], "全部", "午餐", "2026-06-23T12:10:00+08:00"),
  makePick(mockStores[1], mockUsers[1], "奶茶", "下午茶", "2026-06-23T15:20:00+08:00"),
  makePick(mockStores[3], mockUsers[2], "烧烤", "夜宵", "2026-06-23T22:08:00+08:00")
];

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: unknown;
  userId?: string;
};

export function request<T>(url: string, options: RequestOptions = {}) {
  return new Promise<T>((resolve, reject) => {
    uni.request({
      url: `${API_BASE}${url}`,
      method: options.method || "GET",
      data: options.data,
      header: {
        "content-type": "application/json",
        "x-user-id": options.userId || uni.getStorageSync("currentUserId") || ""
      },
      success: (response) => {
        const statusCode = response.statusCode || 0;
        if (statusCode >= 200 && statusCode < 300) {
          resolve(response.data as T);
        } else {
          const fallback = mockRequest<T>(url, options);
          fallback ? resolve(fallback) : reject(response.data);
        }
      },
      fail: (error) => {
        const fallback = mockRequest<T>(url, options);
        fallback ? resolve(fallback) : reject(error);
      }
    });
  });
}

function mockRequest<T>(url: string, options: RequestOptions = {}): T | undefined {
  const { path, query } = parseUrl(url);
  const method = options.method || "GET";

  if (path === "/auth/login" && method === "POST") {
    const payload = (options.data || {}) as { nickname?: string };
    const user = { ...mockUsers[0], nickname: payload.nickname || mockUsers[0].nickname };
    mockUsers[0] = user;
    return { user } as T;
  }

  if (method === "PUT" && path.startsWith("/orders/")) {
    const id = path.split("/")[2];
    const orderIndex = mockOrders.findIndex((order) => order.id === id);
    if (orderIndex < 0) return undefined;
    const existingOrder = mockOrders[orderIndex];
    const payload = (options.data || {}) as {
      storeName?: string;
      category?: string;
      mealTime?: string;
      orderTime?: string;
      total?: number;
      rating?: number;
      disliked?: boolean;
      note?: string;
      dishes?: OrderItemInput[];
    };
    const category = payload.category || existingOrder.category;
    const mealTime = payload.mealTime || existingOrder.mealTime;
    const rating = Number(payload.rating || existingOrder.rating || 4);
    const dishes = (payload.dishes?.length ? payload.dishes : existingOrder.dishes).map((dish) => ({
      ...dish,
      name: dish.name || "未命名菜品",
      price: Number(dish.price || 0),
      rating: Number(dish.rating || rating),
      disliked: Boolean(dish.disliked)
    }));
    const total = Number(payload.total || dishes.reduce((sum, dish) => sum + Number(dish.price || 0), 0));
    let store = mockStores.find((item) => item.name === (payload.storeName || existingOrder.store.name));
    if (!store) {
      store = {
        id: `mock-store-upload-${Date.now()}`,
        name: payload.storeName || existingOrder.store.name || "未命名店铺",
        category,
        tags: [category, mealTime, "Uploaded"],
        mealTimes: [mealTime],
        rating,
        avgPrice: total || Number(dishes[0]?.price || 0),
        orderCount: 1,
        description: payload.note || existingOrder.note || "由上传订单同步生成的店铺。",
        coverUrl: existingOrder.store.coverUrl || "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=700&q=80",
        createdBy: mockUsers[0],
        updatedBy: mockUsers[0]
      };
      mockStores.unshift(store);
    }

    store.category = category;
    store.tags = Array.from(new Set([...(store.tags || []), category, mealTime]));
    store.mealTimes = Array.from(new Set([...(store.mealTimes || []), mealTime]));
    store.rating = rating;
    store.avgPrice = total || store.avgPrice;
    store.updatedBy = mockUsers[0];

    dishes.forEach((dish, index) => {
      const existingDish = mockDishes.find((item) => item.storeId === store.id && item.name === dish.name);
      if (existingDish) {
        existingDish.price = dish.price;
        existingDish.rating = dish.rating || rating;
        existingDish.disliked = Boolean(dish.disliked);
      } else {
        mockDishes.unshift({
          id: `mock-dish-upload-${Date.now()}-${index}`,
          storeId: store.id,
          name: dish.name,
          price: dish.price,
          rating: dish.rating || rating,
          disliked: Boolean(dish.disliked)
        });
      }
    });

    const order = {
      ...existingOrder,
      store,
      orderTime: payload.orderTime || existingOrder.orderTime,
      mealTime,
      category,
      total,
      rating,
      disliked: Boolean(payload.disliked),
      note: payload.note || "",
      dishes
    };
    mockOrders[orderIndex] = order;

    const reviewIndex = mockReviews.findIndex((review) => review.orderId === id);
    if (payload.note) {
      const review = {
        id: reviewIndex >= 0 ? mockReviews[reviewIndex].id : `mock-review-upload-${Date.now()}`,
        user: mockUsers[0],
        targetType: "order" as const,
        targetName: store.name,
        rating,
        disliked: Boolean(payload.disliked),
        content: payload.note,
        createdAt: new Date().toISOString(),
        orderId: id
      };
      if (reviewIndex >= 0) mockReviews[reviewIndex] = review;
      else mockReviews = [review, ...mockReviews];
    } else if (reviewIndex >= 0) {
      mockReviews.splice(reviewIndex, 1);
    }

    return { order } as T;
  }
  if (method === "DELETE" && path.startsWith("/orders/")) {
    const id = path.split("/")[2];
    mockOrders = mockOrders.filter((order) => order.id !== id);
    return {} as T;
  }

  if (method === "DELETE" && path.startsWith("/reviews/")) {
    const id = path.split("/")[2];
    mockReviews = mockReviews.filter((review) => review.id !== id);
    return {} as T;
  }

  if (method === "PUT" && path.startsWith("/stores/")) {
    const id = path.split("/")[2];
    const store = mockStores.find((item) => item.id === id);
    if (!store) return undefined;
    const payload = (options.data || {}) as Partial<typeof store>;
    Object.assign(store, {
      name: payload.name || store.name,
      category: payload.category || store.category,
      tags: payload.tags || store.tags,
      mealTimes: payload.mealTimes || store.mealTimes,
      description: payload.description || store.description,
      updatedBy: mockUsers[0]
    });
    return { store } as T;
  }

  if (method === "POST" && path === "/orders") {
    const payload = (options.data || {}) as {
      storeName?: string;
      category?: string;
      mealTime?: string;
      orderTime?: string;
      total?: number;
      rating?: number;
      disliked?: boolean;
      note?: string;
      dishes?: OrderItemInput[];
    };
    const category = payload.category || "快餐";
    const mealTime = payload.mealTime || "午餐";
    const rating = Number(payload.rating || 4);
    const dishes = (payload.dishes || []).map((dish) => ({
      ...dish,
      name: dish.name || "未命名菜品",
      price: Number(dish.price || 0),
      rating: Number(dish.rating || rating),
      disliked: Boolean(dish.disliked)
    }));
    const total = Number(payload.total || dishes.reduce((sum, dish) => sum + Number(dish.price || 0), 0));
    let store = mockStores.find((item) => item.name === payload.storeName);
    if (!store) {
      store = {
        id: `mock-store-upload-${Date.now()}`,
        name: payload.storeName || "未命名店铺",
        category,
        tags: [category, mealTime, "Uploaded"],
        mealTimes: [mealTime],
        rating,
        avgPrice: total || Number(dishes[0]?.price || 0),
        orderCount: 0,
        description: payload.note || "由上传订单同步生成的店铺。",
        coverUrl: "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=700&q=80",
        createdBy: mockUsers[0],
        updatedBy: mockUsers[0]
      };
      mockStores.unshift(store);
    }

    const previousCount = store.orderCount || 0;
    store.category = category;
    store.tags = Array.from(new Set([...store.tags, category, mealTime]));
    store.mealTimes = Array.from(new Set([...store.mealTimes, mealTime]));
    store.rating = Number(((store.rating * previousCount + rating) / (previousCount + 1)).toFixed(1));
    store.avgPrice = Number(((store.avgPrice * previousCount + (total || store.avgPrice)) / (previousCount + 1)).toFixed(1));
    store.orderCount = previousCount + 1;
    store.updatedBy = mockUsers[0];

    dishes.forEach((dish, index) => {
      const existing = mockDishes.find((item) => item.storeId === store.id && item.name === dish.name);
      if (existing) {
        existing.price = dish.price;
        existing.rating = dish.rating || rating;
        existing.disliked = Boolean(dish.disliked);
      } else {
        mockDishes.unshift({
          id: `mock-dish-upload-${Date.now()}-${index}`,
          storeId: store.id,
          name: dish.name,
          price: dish.price,
          rating: dish.rating || rating,
          disliked: Boolean(dish.disliked)
        });
      }
    });

    const order = {
      id: `mock-order-upload-${Date.now()}`,
      user: mockUsers[0],
      store,
      orderTime: payload.orderTime || new Date().toISOString().slice(0, 16),
      mealTime,
      category,
      total,
      rating,
      disliked: Boolean(payload.disliked),
      note: payload.note || "",
      dishes
    };
    mockOrders = [order, ...mockOrders];
    if (payload.note) {
      mockReviews = [{
        id: `mock-review-upload-${Date.now()}`,
        user: mockUsers[0],
        targetType: "order",
        targetName: store.name,
        rating,
        disliked: Boolean(payload.disliked),
        content: payload.note,
        createdAt: new Date().toISOString(),
        orderId: order.id
      }, ...mockReviews];
    }
    return { order } as T;
  }

  if (method !== "GET") return undefined;

  if (path === "/users") return { users: mockUsers } as T;
  if (path === "/stores") return { stores: filterStores(query) } as T;
  if (path.startsWith("/stores/")) {
    const id = path.split("/")[2];
    const store = mockStores.find((item) => item.id === id);
    if (!store) return undefined;
    return {
      store,
      dishes: mockDishes.filter((dish) => dish.storeId === id),
      reviews: mockReviews.filter((review) => review.targetName === store.name || mockDishes.some((dish) => dish.storeId === id && dish.name === review.targetName))
    } as T;
  }
  if (path.startsWith("/dishes/")) {
    const id = path.split("/")[2];
    const dish = mockDishes.find((item) => item.id === id);
    if (!dish) return undefined;
    return { dish, reviews: mockReviews.filter((review) => review.targetName === dish.name) } as T;
  }
  if (path === "/random") {
    const category = query.category || "全部";
    const mealTime = query.mealTime || "全部";
    const excludeDisliked = query.excludeDisliked !== "false";
    const peek = query.peek === "true";
    const candidates = filterStores({ category, mealTime }).filter((store) => !excludeDisliked || store.rating >= 3);
    const store = peek ? null : candidates[Math.floor(Math.random() * candidates.length)] || null;
    if (store) mockRandomPicks = [makePick(store, mockUsers[0], category, mealTime, new Date().toISOString()), ...mockRandomPicks].slice(0, 20);
    return { store, candidateCount: candidates.length } as T;
  }
  if (path === "/random-picks") {
    const take = Number(query.take || 10);
    const skip = Number(query.skip || 0);
    const records = mockRandomPicks.slice(skip, skip + take);
    return { records, total: mockRandomPicks.length, nextSkip: skip + records.length } as T;
  }
  if (path === "/orders") return { orders: mockOrders } as T;
  if (path === "/reviews") return { reviews: mockReviews } as T;
  if (path === "/stats") {
    return {
      line: [
        { name: "06-20", value: 25 },
        { name: "06-21", value: 27 },
        { name: "06-22", value: 21 },
        { name: "06-23", value: 32 }
      ],
      pie: [
        { name: "快餐", value: 32 },
        { name: "奶茶", value: 21 },
        { name: "粉面", value: 27 },
        { name: "轻食", value: 18 }
      ],
      donut: [
        { name: "午餐", value: 2 },
        { name: "下午茶", value: 1 },
        { name: "晚餐", value: 1 }
      ],
      bars: mockStores.slice(0, 5).map((store) => ({ name: store.name, value: store.orderCount })),
      ratings: [
        { name: "5分", value: 2 },
        { name: "4分", value: 2 },
        { name: "3分", value: 0 }
      ],
      users: mockUsers.map((user, index) => ({ name: user.nickname, value: [80, 42, 36][index] }))
    } as T;
  }
  return undefined;
}

function filterStores(query: Record<string, string>) {
  const keyword = query.keyword || "";
  const category = query.category || "全部";
  const mealTime = query.mealTime || "全部";
  return mockStores
    .filter((store) => category === "全部" || store.category === category)
    .filter((store) => mealTime === "全部" || store.mealTimes.includes(mealTime))
    .filter((store) => !keyword || `${store.name}${store.category}${store.description}`.includes(keyword));
}

function parseUrl(url: string) {
  const [path, search = ""] = url.split("?");
  const query: Record<string, string> = {};
  search.split("&").filter(Boolean).forEach((part) => {
    const [key, value = ""] = part.split("=");
    query[decodeURIComponent(key)] = decodeURIComponent(value);
  });
  return { path, query };
}

function makePick(store: typeof mockStores[number], user: typeof mockUsers[number], category: string, mealTime: string, createdAt: string) {
  return {
    id: `mock-pick-${store.id}-${createdAt}`,
    store,
    user,
    category,
    mealTime,
    rating: store.rating,
    storeType: store.category,
    createdAt
  };
}

export const api = {
  login: (payload: { provider: "wechat" | "alipay" | "mock"; code?: string; nickname?: string }) =>
    request<{ user: { id: string; nickname: string } }>("/auth/login", { method: "POST", data: payload }),
  users: () => request<{ users: Array<{ id: string; nickname: string }> }>("/users"),
  stores: (params = "") => request(`/stores${params}`),
  store: (id: string) => request(`/stores/${id}`),
  dish: (id: string) => request(`/dishes/${id}`),
  updateStore: (id: string, data: unknown) => request(`/stores/${id}`, { method: "PUT", data }),
  randomStore: (query: string) => request(`/random${query}`),
  randomPicks: (query = "") => request(`/random-picks${query}`),
  orders: () => request("/orders"),
  createOrder: (data: {
    storeName: string;
    category: string;
    mealTime: string;
    orderTime: string;
    total: number;
    rating: number;
    disliked: boolean;
    note?: string;
    dishes: OrderItemInput[];
  }) => request("/orders", { method: "POST", data }),
  updateOrder: (id: string, data: unknown) => request(`/orders/${id}`, { method: "PUT", data }),
  deleteOrder: (id: string) => request(`/orders/${id}`, { method: "DELETE" }),
  reviews: () => request("/reviews"),
  deleteReview: (id: string) => request(`/reviews/${id}`, { method: "DELETE" }),
  stats: () => request("/stats")
};
