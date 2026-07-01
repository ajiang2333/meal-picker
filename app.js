const STORAGE_KEY = "waimai-picker-state-v2";

const STORE_COVERS = {
  "奶茶": "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=500&q=80",
  "烧烤": "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=500&q=80",
  "火锅": "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?auto=format&fit=crop&w=500&q=80",
  "快餐": "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80",
  "轻食": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=80",
  "粉面": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80",
  "默认": "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=500&q=80"
};

const MEAL_TIMES = ["早餐", "午餐", "下午茶", "晚餐", "夜宵"];
const BASE_CATEGORIES = ["全部", "快餐", "奶茶", "烧烤", "火锅", "轻食", "粉面"];

const seedState = {
  users: [
    {
      id: "user_chen",
      nickname: "陈小满",
      role: "重口味探索者",
      avatarColor: "#ffd100"
    },
    {
      id: "user_li",
      nickname: "李青柠",
      role: "轻食和奶茶记录员",
      avatarColor: "#8ee6b8"
    },
    {
      id: "user_wang",
      nickname: "王夜宵",
      role: "烧烤火锅情报员",
      avatarColor: "#ffb36b"
    }
  ],
  currentUserId: "user_chen",
  stores: [
    {
      id: "store_milk_tea",
      name: "甜橙茶事",
      category: "奶茶",
      tags: ["奶茶", "下午茶", "少糖可选"],
      mealTimes: ["下午茶", "晚餐"],
      disliked: false,
      cover: STORE_COVERS["奶茶"],
      description: "清爽果茶和厚乳奶茶，适合下午犯困时来一杯。",
      createdBy: "user_li",
      updatedBy: "user_li",
      updates: [{ userId: "user_li", time: "2026-06-17T15:42", note: "补充少糖和下午茶标签。" }]
    },
    {
      id: "store_bbq",
      name: "老街把把烧",
      category: "烧烤",
      tags: ["烧烤", "夜宵", "重口"],
      mealTimes: ["晚餐", "夜宵"],
      disliked: false,
      cover: STORE_COVERS["烧烤"],
      description: "串类选择多，辣度稳定，夜宵局比较靠谱。",
      createdBy: "user_wang",
      updatedBy: "user_wang",
      updates: [{ userId: "user_wang", time: "2026-06-15T22:30", note: "标记夜宵可选，掌中宝偏油。" }]
    },
    {
      id: "store_hotpot",
      name: "沸腾小火锅",
      category: "火锅",
      tags: ["火锅", "冒菜", "多人餐"],
      mealTimes: ["午餐", "晚餐"],
      disliked: false,
      cover: STORE_COVERS["火锅"],
      description: "一人食小火锅，锅底香，菜品分量扎实。",
      createdBy: "user_chen",
      updatedBy: "user_chen",
      updates: [{ userId: "user_chen", time: "2026-06-16T19:10", note: "补充多人餐标签。" }]
    },
    {
      id: "store_fast",
      name: "金牌鸡腿饭",
      category: "快餐",
      tags: ["快餐", "午餐", "高性价比"],
      mealTimes: ["午餐", "晚餐"],
      disliked: false,
      cover: STORE_COVERS["快餐"],
      description: "工作日午餐常备选项，出餐快，价格稳定。",
      createdBy: "user_chen",
      updatedBy: "user_chen",
      updates: [{ userId: "user_chen", time: "2026-06-18T12:35", note: "午餐出餐快，适合工作日。" }]
    },
    {
      id: "store_salad",
      name: "青柠轻食碗",
      category: "轻食",
      tags: ["轻食", "低脂", "早餐"],
      mealTimes: ["早餐", "午餐"],
      disliked: false,
      cover: STORE_COVERS["轻食"],
      description: "沙拉和谷物碗，适合想吃轻一点的时候。",
      createdBy: "user_li",
      updatedBy: "user_li",
      updates: [{ userId: "user_li", time: "2026-06-14T09:05", note: "早餐也可点，酱料建议少放。" }]
    }
  ],
  dishes: [
    { id: "dish_tea_1", storeId: "store_milk_tea", name: "满杯甜橙", price: 16, rating: 4.6, disliked: false, reviews: ["三分糖刚好，橙香很足。"] },
    { id: "dish_tea_2", storeId: "store_milk_tea", name: "厚乳茉莉", price: 18, rating: 4.2, disliked: false, reviews: ["奶味厚，喝完有点饱。"] },
    { id: "dish_bbq_1", storeId: "store_bbq", name: "牛肉小串", price: 24, rating: 4.8, disliked: false, reviews: ["火候好，孜然香。"] },
    { id: "dish_bbq_2", storeId: "store_bbq", name: "烤掌中宝", price: 22, rating: 3.7, disliked: true, reviews: ["偶尔偏油，下次少点。"] },
    { id: "dish_hotpot_1", storeId: "store_hotpot", name: "番茄牛肉小火锅", price: 38, rating: 4.4, disliked: false, reviews: ["番茄锅底浓，牛肉不少。"] },
    { id: "dish_fast_1", storeId: "store_fast", name: "招牌鸡腿饭", price: 25, rating: 4.5, disliked: false, reviews: ["鸡腿很大，饭量够。"] },
    { id: "dish_salad_1", storeId: "store_salad", name: "牛油果鸡胸碗", price: 32, rating: 4.1, disliked: false, reviews: ["清爽，但酱可以少一点。"] }
  ],
  orders: [
    {
      id: "order_1",
      userId: "user_chen",
      storeId: "store_fast",
      orderTime: "2026-06-18T12:22",
      mealTime: "午餐",
      category: "快餐",
      total: 29,
      deliveryFee: 4,
      rating: 4,
      disliked: false,
      note: "出餐很快，午餐不想纠结时可以再点。",
      imageData: "",
      imageName: "",
      dishes: [
        { dishId: "dish_fast_1", name: "招牌鸡腿饭", price: 25, rating: 4, disliked: false, note: "鸡腿够香。" }
      ]
    },
    {
      id: "order_2",
      userId: "user_li",
      storeId: "store_milk_tea",
      orderTime: "2026-06-17T15:36",
      mealTime: "下午茶",
      category: "奶茶",
      total: 34,
      deliveryFee: 0,
      rating: 5,
      disliked: false,
      note: "适合下午茶，甜度稳定。",
      imageData: "",
      imageName: "",
      dishes: [
        { dishId: "dish_tea_1", name: "满杯甜橙", price: 16, rating: 5, disliked: false, note: "三分糖好喝。" },
        { dishId: "dish_tea_2", name: "厚乳茉莉", price: 18, rating: 4, disliked: false, note: "奶味重。" }
      ]
    },
    {
      id: "order_3",
      userId: "user_wang",
      storeId: "store_bbq",
      orderTime: "2026-06-15T22:18",
      mealTime: "夜宵",
      category: "烧烤",
      total: 52,
      deliveryFee: 5,
      rating: 3,
      disliked: false,
      note: "牛肉串不错，掌中宝偏油。",
      imageData: "",
      imageName: "",
      dishes: [
        { dishId: "dish_bbq_1", name: "牛肉小串", price: 24, rating: 5, disliked: false, note: "会复购。" },
        { dishId: "dish_bbq_2", name: "烤掌中宝", price: 22, rating: 2, disliked: true, note: "太油了。" }
      ]
    }
  ],
  randomHistory: []
};

const extractionTemplates = [
  {
    storeName: "金牌鸡腿饭",
    category: "快餐",
    dishes: [
      { name: "招牌鸡腿饭", price: 25 },
      { name: "卤蛋", price: 3 }
    ]
  },
  {
    storeName: "甜橙茶事",
    category: "奶茶",
    dishes: [
      { name: "满杯甜橙", price: 16 },
      { name: "厚乳茉莉", price: 18 }
    ]
  },
  {
    storeName: "沸腾小火锅",
    category: "火锅",
    dishes: [
      { name: "番茄牛肉小火锅", price: 38 },
      { name: "冻豆腐", price: 6 }
    ]
  },
  {
    storeName: "老街把把烧",
    category: "烧烤",
    dishes: [
      { name: "牛肉小串", price: 24 },
      { name: "烤土豆片", price: 8 }
    ]
  }
];

const ui = {
  view: "random",
  previousView: "home",
  search: "",
  category: "全部",
  storeId: null,
  dishId: null,
  draft: null,
  ocrText: "",
  myTab: "menu",
  lazyLimits: {
    orders: 5,
    reviews: 5,
    stores: 5,
    randoms: 5
  },
  storeEditing: false,
  toast: "",
  random: {
    category: "全部",
    mealTime: "全部",
    excludeDisliked: true,
    winnerId: null,
    spinning: false
  }
};

let state = loadState();
let toastTimer;
let spinTimer;
let searchTimer;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && saved.stores && saved.orders && saved.dishes) {
      return saved;
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
  return clone(seedState);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function money(value) {
  return `¥${Number(value || 0).toFixed(1)}`;
}

function displayTime(value) {
  if (!value) return "未记录";
  return value.replace("T", " ");
}

function hourOf(value) {
  const hour = Number((value || "").slice(11, 13));
  return Number.isFinite(hour) ? hour : new Date().getHours();
}

function mealTimeFromHour(hour) {
  if (hour < 10) return "早餐";
  if (hour < 14) return "午餐";
  if (hour < 17) return "下午茶";
  if (hour < 21) return "晚餐";
  return "夜宵";
}

function nowForInput() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function inferCategory(text) {
  const source = text || "";
  if (/奶茶|果茶|咖啡|甜品|茶/.test(source)) return "奶茶";
  if (/烧烤|烤|串|炸串/.test(source)) return "烧烤";
  if (/火锅|冒菜|麻辣烫|串串/.test(source)) return "火锅";
  if (/沙拉|轻食|鸡胸|低脂|谷物/.test(source)) return "轻食";
  if (/面|粉|米线|螺蛳粉|拉面/.test(source)) return "粉面";
  return "快餐";
}

function avg(numbers) {
  const valid = numbers.map(Number).filter((item) => Number.isFinite(item) && item > 0);
  if (!valid.length) return 0;
  return valid.reduce((sum, item) => sum + item, 0) / valid.length;
}

function getStore(storeId) {
  return state.stores.find((store) => store.id === storeId);
}

function getDish(dishId) {
  return state.dishes.find((dish) => dish.id === dishId);
}

function getUser(userId) {
  return state.users?.find((user) => user.id === userId) || state.users?.[0];
}

function currentUser() {
  return getUser(state.currentUserId);
}

function userInitial(user) {
  return (user?.nickname || "用").slice(0, 1);
}

function userBadge(userId) {
  const user = getUser(userId);
  return `
    <span class="user-badge">
      <span class="mini-avatar" style="background:${escapeAttr(user?.avatarColor || "#ffd100")}">${escapeHtml(userInitial(user))}</span>
      <span>${escapeHtml(user?.nickname || "未知用户")}</span>
    </span>
  `;
}

function storeOrders(storeId) {
  return state.orders.filter((order) => order.storeId === storeId);
}

function storeDishes(storeId) {
  return state.dishes.filter((dish) => dish.storeId === storeId);
}

function storeMetrics(store) {
  const orders = storeOrders(store.id);
  const dishes = storeDishes(store.id);
  const dishRatings = dishes.map((dish) => dish.rating);
  const orderRatings = orders.map((order) => order.rating);
  const rating = avg([...dishRatings, ...orderRatings]) || 4.2;
  const spend = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const avgPrice = orders.length ? spend / orders.length : avg(dishes.map((dish) => dish.price));
  const dislikedCount =
    orders.filter((order) => order.disliked).length +
    dishes.filter((dish) => dish.disliked).length +
    orders.flatMap((order) => order.dishes || []).filter((dish) => dish.disliked).length;
  const sortedTimes = orders.map((order) => order.orderTime).sort();
  return {
    orders,
    dishes,
    rating,
    avgPrice,
    dislikedCount,
    lastTime: sortedTimes[sortedTimes.length - 1] || ""
  };
}

function categories() {
  const found = new Set(BASE_CATEGORIES);
  state.stores.forEach((store) => found.add(store.category));
  state.orders.forEach((order) => found.add(order.category));
  return [...found].filter(Boolean);
}

function filteredStores() {
  const keyword = ui.search.trim().toLowerCase();
  return state.stores
    .filter((store) => ui.category === "全部" || store.category === ui.category)
    .filter((store) => {
      if (!keyword) return true;
      const haystack = [store.name, store.category, ...(store.tags || [])].join(" ").toLowerCase();
      return haystack.includes(keyword);
    })
    .sort((a, b) => storeMetrics(b).rating - storeMetrics(a).rating);
}

function stats() {
  const totalSpend = state.orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const categorySpend = groupSum(state.orders, "category", "total");
  const topCategory = Object.entries(categorySpend).sort((a, b) => b[1] - a[1])[0]?.[0] || "暂无";
  const favoriteStore =
    state.stores
      .map((store) => ({ store, count: storeOrders(store.id).length, rating: storeMetrics(store).rating }))
      .sort((a, b) => b.count - a.count || b.rating - a.rating)[0]?.store.name || "暂无";
  return {
    totalSpend,
    orderCount: state.orders.length,
    avgSpend: state.orders.length ? totalSpend / state.orders.length : 0,
    topCategory,
    favoriteStore,
    categorySpend
  };
}

function userOrders(userId = state.currentUserId) {
  return state.orders.filter((order) => order.userId === userId);
}

function userReviews(userId = state.currentUserId) {
  return state.orders
    .filter((order) => order.userId === userId)
    .flatMap((order) => {
      const store = getStore(order.storeId);
      const orderReview = order.note
        ? [
            {
              id: `${order.id}_order`,
              orderId: order.id,
              storeId: order.storeId,
              target: store?.name || "未知店铺",
              targetType: "订单",
              rating: order.rating,
              disliked: order.disliked,
              note: order.note,
              time: order.orderTime,
              userId: order.userId
            }
          ]
        : [];
      const dishReviews = (order.dishes || [])
        .filter((dish) => dish.note || dish.disliked)
        .map((dish, index) => ({
          id: `${order.id}_dish_${index}`,
          orderId: order.id,
          dishId: dish.dishId,
          storeId: order.storeId,
          target: dish.name,
          targetType: "菜品",
          rating: dish.rating,
          disliked: dish.disliked,
          note: dish.note || "标注了这道菜",
          time: order.orderTime,
          userId: order.userId
        }));
      return [...orderReview, ...dishReviews];
    });
}

function timelineSpend() {
  const grouped = state.orders.reduce((result, order) => {
    const day = (order.orderTime || "").slice(5, 10) || "未知";
    result[day] = (result[day] || 0) + Number(order.total || 0);
    return result;
  }, {});
  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function groupCount(items, key) {
  return items.reduce((result, item) => {
    const name = item[key] || "未分类";
    result[name] = (result[name] || 0) + 1;
    return result;
  }, {});
}

function groupSum(items, key, valueKey) {
  return items.reduce((result, item) => {
    const name = item[key] || "未分类";
    result[name] = (result[name] || 0) + Number(item[valueKey] || 0);
    return result;
  }, {});
}

function showToast(message) {
  ui.toast = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    ui.toast = "";
    render();
  }, 2200);
  render();
}

function resetLazyLimit(tab) {
  if (ui.lazyLimits[tab] !== undefined) ui.lazyLimits[tab] = 5;
}

function loadMoreList(tab) {
  if (ui.lazyLimits[tab] === undefined) return;
  ui.lazyLimits[tab] += 5;
  render();
}

function renderLazyFooter(tab, total) {
  const shown = ui.lazyLimits[tab] || 5;
  if (shown >= total) {
    return total > 5 ? `<div class="list-end">已显示全部，总共 ${total} 条</div>` : "";
  }
  return `
    <div class="lazy-sentinel" data-lazy-list="${escapeAttr(tab)}">
      <span>继续下滑加载更多</span>
      <button class="mini-btn" data-action="load-more" data-tab="${escapeAttr(tab)}">加载更多</button>
    </div>
  `;
}

function setupLazyLoading() {
  if (typeof IntersectionObserver === "undefined") return;
  const sentinels = document.querySelectorAll?.("[data-lazy-list]") || [];
  sentinels.forEach((node) => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        const tab = node.dataset.lazyList;
        observer.disconnect();
        loadMoreList(tab);
      }
    }, { rootMargin: "80px" });
    observer.observe(node);
  });
}

function setView(view, options = {}) {
  ui.previousView = ui.view;
  ui.view = view;
  Object.assign(ui, options);
  render();
}

function goBack() {
  if (ui.view === "dishDetail") {
    setView("storeDetail", { dishId: null });
  } else if (ui.view === "storeDetail") {
    setView("home", { storeId: null });
  } else {
    setView(ui.previousView || "home");
  }
}

function createBlankDraft() {
  const orderTime = nowForInput();
  return {
    id: "",
    userId: state.currentUserId,
    storeName: "",
    category: "快餐",
    mealTime: mealTimeFromHour(hourOf(orderTime)),
    orderTime,
    total: 0,
    deliveryFee: 0,
    rating: 4,
    disliked: false,
    note: "",
    imageData: "",
    imageName: "",
    dishes: [{ name: "", price: 0, rating: 4, disliked: false, note: "" }]
  };
}

function draftFromOrder(order) {
  const store = getStore(order.storeId);
  return {
    id: order.id,
    userId: order.userId || state.currentUserId,
    storeName: store?.name || "",
    category: order.category || store?.category || "快餐",
    mealTime: order.mealTime || "午餐",
    orderTime: order.orderTime || nowForInput(),
    total: order.total || 0,
    deliveryFee: order.deliveryFee || 0,
    rating: order.rating || 4,
    disliked: Boolean(order.disliked),
    note: order.note || "",
    imageData: order.imageData || "",
    imageName: order.imageName || "",
    dishes: (order.dishes || []).map((dish) => ({ ...dish }))
  };
}

function syncDraftFromForm() {
  const form = document.querySelector("[data-order-form]");
  if (!form || !ui.draft) return;

  const data = new FormData(form);
  const names = [...form.querySelectorAll("[data-dish-name]")].map((input) => input.value.trim());
  const prices = [...form.querySelectorAll("[data-dish-price]")].map((input) => Number(input.value || 0));
  const ratings = [...form.querySelectorAll("[data-dish-rating]")].map((input) => Number(input.value || 0));
  const disliked = [...form.querySelectorAll("[data-dish-disliked]")].map((input) => input.checked);
  const notes = [...form.querySelectorAll("[data-dish-note]")].map((input) => input.value.trim());

  ui.draft = {
    ...ui.draft,
    storeName: String(data.get("storeName") || "").trim(),
    category: String(data.get("category") || "快餐"),
    mealTime: String(data.get("mealTime") || "午餐"),
    orderTime: String(data.get("orderTime") || nowForInput()),
    total: Number(data.get("total") || 0),
    deliveryFee: Number(data.get("deliveryFee") || 0),
    rating: Number(data.get("rating") || 0),
    disliked: data.get("disliked") === "on",
    note: String(data.get("note") || "").trim(),
    dishes: names.map((name, index) => ({
      dishId: ui.draft.dishes[index]?.dishId || "",
      name,
      price: prices[index] || 0,
      rating: ratings[index] || 0,
      disliked: disliked[index],
      note: notes[index] || ""
    }))
  };
}

function parseOrderText(text, base = createBlankDraft()) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) return base;

  const timeMatch = text.match(/20\d{2}[-/.年]\d{1,2}[-/.月]\d{1,2}[日\sT]*\d{1,2}[:：]\d{2}/);
  const normalizedTime = timeMatch
    ? timeMatch[0]
        .replace(/[年月/.]/g, "-")
        .replace("日", "")
        .replace(/\s+/, "T")
        .replace("：", ":")
        .slice(0, 16)
    : base.orderTime;

  const explicitStore = lines
    .map((line) => line.match(/(?:店铺|商家|门店|店名)[:：\s]*(.+)$/)?.[1])
    .find(Boolean);
  const firstTextLine = lines.find((line) => !/[¥￥]\s*\d|合计|实付|配送|优惠|订单|时间/.test(line));
  const storeName = explicitStore || firstTextLine || base.storeName;

  const dishLines = lines.filter((line) => {
    if (!/([¥￥]?\s*\d+(?:\.\d{1,2})?)/.test(line)) return false;
    return !/合计|实付|总计|配送|包装|优惠|红包|订单|电话|地址/.test(line);
  });

  const dishes = dishLines
    .map((line) => {
      const priceMatch = line.match(/([¥￥]?\s*\d+(?:\.\d{1,2})?)(?!.*\d)/);
      const price = priceMatch ? Number(priceMatch[1].replace(/[¥￥\s]/g, "")) : 0;
      const name = line
        .replace(priceMatch?.[0] || "", "")
        .replace(/[xX×]\s*\d+/, "")
        .replace(/[¥￥]/g, "")
        .replace(/[:：]/g, "")
        .trim();
      return { name, price, rating: 4, disliked: false, note: "" };
    })
    .filter((dish) => dish.name && dish.price > 0);

  const totalMatch = text.match(/(?:实付|合计|总计|支付)\D*([0-9]+(?:\.[0-9]{1,2})?)/);
  const total =
    totalMatch?.[1] ||
    dishes.reduce((sum, dish) => sum + Number(dish.price || 0), Number(base.deliveryFee || 0));
  const sourceForCategory = [storeName, ...dishes.map((dish) => dish.name)].join(" ");
  const orderTime = normalizedTime.includes("T") ? normalizedTime : normalizedTime.replace(/\s+/, "T");

  return {
    ...base,
    storeName,
    orderTime,
    mealTime: mealTimeFromHour(hourOf(orderTime)),
    category: inferCategory(sourceForCategory),
    total: Number(total),
    dishes: dishes.length ? dishes : base.dishes
  };
}

function mockExtractFromFile(file) {
  const key = (file.name || "").toLowerCase();
  const template =
    extractionTemplates.find((item) => key.includes(item.category.toLowerCase()) || key.includes(item.storeName)) ||
    extractionTemplates[Math.abs(hashCode(file.name || String(Date.now()))) % extractionTemplates.length];
  const orderTime = nowForInput();
  const deliveryFee = template.category === "奶茶" ? 0 : 4;
  const total = template.dishes.reduce((sum, dish) => sum + dish.price, deliveryFee);
  return {
    ...createBlankDraft(),
    storeName: template.storeName,
    category: template.category,
    mealTime: mealTimeFromHour(hourOf(orderTime)),
    orderTime,
    total,
    deliveryFee,
    rating: 4,
    imageName: file.name,
    dishes: template.dishes.map((dish) => ({ ...dish, rating: 4, disliked: false, note: "" }))
  };
}

function hashCode(text) {
  return [...text].reduce((hash, char) => (hash << 5) - hash + char.charCodeAt(0), 0);
}

function ensureStore(draft) {
  const existing = state.stores.find((store) => store.name === draft.storeName);
  if (existing) {
    existing.category = draft.category || existing.category;
    existing.mealTimes = [...new Set([...(existing.mealTimes || []), draft.mealTime])];
    existing.tags = [...new Set([...(existing.tags || []), draft.category, draft.mealTime])].filter(Boolean);
    existing.updatedBy = state.currentUserId;
    existing.updates = [
      {
        userId: state.currentUserId,
        time: nowForInput(),
        note: "上传订单时同步更新了店铺分类和用餐时间。"
      },
      ...(existing.updates || [])
    ].slice(0, 8);
    return existing;
  }

  const store = {
    id: uid("store"),
    name: draft.storeName,
    category: draft.category,
    tags: [draft.category, draft.mealTime].filter(Boolean),
    mealTimes: [draft.mealTime].filter(Boolean),
    disliked: false,
    cover: STORE_COVERS[draft.category] || STORE_COVERS["默认"],
    description: "由上传订单自动整理进店铺库。",
    createdBy: state.currentUserId,
    updatedBy: state.currentUserId,
    updates: [
      {
        userId: state.currentUserId,
        time: nowForInput(),
        note: "上传订单时新增到多人共建店铺库。"
      }
    ]
  };
  state.stores.unshift(store);
  return store;
}

function ensureDish(storeId, item) {
  const existing = state.dishes.find((dish) => dish.storeId === storeId && dish.name === item.name);
  if (existing) {
    existing.price = Number(item.price || existing.price || 0);
    existing.rating = avg([existing.rating, item.rating || 0]) || existing.rating;
    existing.disliked = Boolean(existing.disliked || item.disliked);
    existing.reviews = (existing.reviews || []).map((review) =>
      typeof review === "string"
        ? { userId: state.currentUserId, note: review, time: nowForInput(), rating: existing.rating }
        : review
    );
    if (item.note && !existing.reviews.some((review) => review.note === item.note)) {
      existing.reviews.unshift({
        userId: state.currentUserId,
        note: item.note,
        time: nowForInput(),
        rating: item.rating || existing.rating,
        disliked: Boolean(item.disliked)
      });
    }
    return existing;
  }

  const dish = {
    id: uid("dish"),
    storeId,
    name: item.name,
    price: Number(item.price || 0),
    rating: Number(item.rating || 0) || 4,
    disliked: Boolean(item.disliked),
    reviews: item.note
      ? [
          {
            userId: state.currentUserId,
            note: item.note,
            time: nowForInput(),
            rating: item.rating || 4,
            disliked: Boolean(item.disliked)
          }
        ]
      : []
  };
  state.dishes.unshift(dish);
  return dish;
}

function saveOrderFromDraft() {
  syncDraftFromForm();
  const draft = ui.draft;
  if (!draft.storeName) {
    showToast("先填一下店铺名称");
    return;
  }
  const validDishes = (draft.dishes || []).filter((dish) => dish.name && Number(dish.price) >= 0);
  if (!validDishes.length) {
    showToast("至少保留一个菜品");
    return;
  }

  const store = ensureStore(draft);
  const orderDishes = validDishes.map((item) => {
    const dish = ensureDish(store.id, item);
    return {
      dishId: dish.id,
      name: item.name,
      price: Number(item.price || 0),
      rating: Number(item.rating || 0),
      disliked: Boolean(item.disliked),
      note: item.note || ""
    };
  });

  const order = {
    id: draft.id || uid("order"),
    userId: draft.userId || state.currentUserId,
    storeId: store.id,
    orderTime: draft.orderTime || nowForInput(),
    mealTime: draft.mealTime || mealTimeFromHour(hourOf(draft.orderTime)),
    category: draft.category || store.category,
    total: Number(draft.total || orderDishes.reduce((sum, dish) => sum + dish.price, 0)),
    deliveryFee: Number(draft.deliveryFee || 0),
    rating: Number(draft.rating || 0),
    disliked: Boolean(draft.disliked),
    note: draft.note || "",
    imageData: draft.imageData || "",
    imageName: draft.imageName || "",
    dishes: orderDishes
  };

  const index = state.orders.findIndex((item) => item.id === order.id);
  if (index >= 0) {
    state.orders[index] = order;
  } else {
    state.orders.unshift(order);
  }

  saveState();
  ui.draft = null;
  ui.myTab = "orders";
  setView("my");
  showToast(index >= 0 ? "订单已更新" : "订单已保存，店铺库同步完成");
}

function deleteOrder(orderId) {
  if (!confirm("确定删除这条订单记录吗？")) return;
  state.orders = state.orders.filter((order) => order.id !== orderId);
  saveState();
  render();
  showToast("已删除订单");
}

function deleteReview(reviewId) {
  if (!confirm("确定删除这条评价吗？订单本身会保留。")) return;
  const [orderId, type, index] = reviewId.split("_dish_").length > 1
    ? [reviewId.split("_dish_")[0], "dish", Number(reviewId.split("_dish_")[1])]
    : [reviewId.replace("_order", ""), "order", -1];
  const order = state.orders.find((item) => item.id === orderId);
  if (!order || order.userId !== state.currentUserId) return;
  if (type === "dish") {
    if (order.dishes[index]) {
      order.dishes[index].note = "";
      order.dishes[index].disliked = false;
    }
  } else {
    order.note = "";
    order.disliked = false;
  }
  saveState();
  render();
  showToast("评价已删除");
}

function splitTags(value) {
  return String(value || "")
    .split(/[,，、\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function saveStoreFromForm() {
  const store = getStore(ui.storeId);
  const form = document.querySelector("[data-store-form]");
  if (!store || !form) return;
  const data = new FormData(form);
  store.name = String(data.get("name") || store.name).trim();
  store.category = String(data.get("category") || store.category);
  store.tags = splitTags(data.get("tags"));
  store.mealTimes = splitTags(data.get("mealTimes"));
  store.description = String(data.get("description") || "").trim();
  store.updatedBy = state.currentUserId;
  store.updates = [
    {
      userId: state.currentUserId,
      time: nowForInput(),
      note: String(data.get("note") || "更新了店铺资料。").trim()
    },
    ...(store.updates || [])
  ].slice(0, 12);
  saveState();
  ui.storeEditing = false;
  render();
  showToast("店铺库已更新");
}

function resetDemoData() {
  if (!confirm("重置会清空当前本地记录，恢复示例数据。继续吗？")) return;
  state = clone(seedState);
  saveState();
  render();
  showToast("已恢复示例数据");
}

function randomCandidates() {
  return state.stores.filter((store) => {
    const metrics = storeMetrics(store);
    const categoryOk = ui.random.category === "全部" || store.category === ui.random.category;
    const mealOk = ui.random.mealTime === "全部" || (store.mealTimes || []).includes(ui.random.mealTime);
    const dislikedOk = !ui.random.excludeDisliked || (!store.disliked && metrics.dislikedCount === 0);
    return categoryOk && mealOk && dislikedOk;
  });
}

function weightedPick(items) {
  const weights = items.map((store) => Math.max(storeMetrics(store).rating, 1));
  const total = weights.reduce((sum, item) => sum + item, 0);
  let cursor = Math.random() * total;
  for (let index = 0; index < items.length; index += 1) {
    cursor -= weights[index];
    if (cursor <= 0) return items[index];
  }
  return items[items.length - 1];
}

function spinRandom() {
  const candidates = randomCandidates();
  if (!candidates.length) {
    showToast("这个筛选条件下没有可抽选店铺");
    return;
  }
  ui.random.spinning = true;
  clearInterval(spinTimer);
  spinTimer = setInterval(() => {
    ui.random.winnerId = candidates[Math.floor(Math.random() * candidates.length)].id;
    render();
  }, 90);

  setTimeout(() => {
    clearInterval(spinTimer);
    const winner = weightedPick(candidates);
    ui.random.winnerId = winner.id;
    ui.random.spinning = false;
    state.randomHistory.unshift({
      id: uid("random"),
      storeId: winner.id,
      storeName: winner.name,
      storeRating: storeMetrics(winner).rating,
      storeCategory: winner.category,
      userId: state.currentUserId,
      time: nowForInput(),
      category: ui.random.category,
      mealTime: ui.random.mealTime
    });
    state.randomHistory = state.randomHistory.slice(0, 80);
    saveState();
    render();
  }, 1400);
}

function render() {
  document.querySelector("#app").innerHTML = `
    <div class="app-shell">
      ${renderTopbar()}
      <main>${renderView()}</main>
      ${renderTabbar()}
      ${ui.toast ? `<div class="toast">${escapeHtml(ui.toast)}</div>` : ""}
    </div>
  `;
  hydrateIcons();
  setupActiveCategoryScroll();
  setupLazyLoading();
}

function icon(name, className = "") {
  return `<i data-lucide="${escapeAttr(name)}" class="app-icon ${escapeAttr(className)}" aria-hidden="true"></i>`;
}

function hydrateIcons() {
  window.lucide?.createIcons();
}

function myTabTitle() {
  return {
    orders: "我的订单",
    reviews: "我的评价",
    stats: "外卖统计",
    randoms: "抽选记录",
    stores: "我维护的店铺"
  }[ui.myTab] || "详情";
}

function detailTopbarTitle() {
  if (ui.view === "my" && ui.myTab !== "menu") return myTabTitle();
  if (ui.view === "storeDetail") return getStore(ui.storeId)?.name || "店铺详情";
  if (ui.view === "dishDetail") return getDish(ui.dishId)?.name || "菜品详情";
  return "";
}

function setupActiveCategoryScroll() {
  const active = document.querySelector("[data-category-chip][data-active='true']");
  if (!active) return;
  requestAnimationFrame(() => {
    active.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  });
}

function renderTopbar() {
  const detailTitle = detailTopbarTitle();

  if (detailTitle) {
    const backAttrs = ui.view === "my"
      ? `data-action="set-my-tab" data-tab="menu"`
      : `data-action="back"`;
    return `
      <header class="topbar">
        <div class="topbar-row topbar-detail">
          <button class="back-btn" ${backAttrs} aria-label="返回">${icon("chevron-left")}</button>
          <div class="page-title">${escapeHtml(detailTitle)}</div>
          <div class="topbar-spacer"></div>
        </div>
      </header>
    `;
  }

  return `
    <header class="topbar">
      <div class="topbar-row topbar-main">
        <div class="brand">肥宅随机投喂器</div>
        ${ui.view === "my" ? `<button class="user-pill" data-action="nav" data-view="my">${escapeHtml(userInitial(currentUser()))}</button>` : ""}
      </div>
    </header>
  `;
}

function renderView() {
  if (ui.view === "upload") return renderUpload();
  if (ui.view === "random") return renderRandom();
  if (ui.view === "my") return renderMine();
  if (ui.view === "storeDetail") return renderStoreDetail();
  if (ui.view === "dishDetail") return renderDishDetail();
  return renderHome();
}

function renderHome() {
  const stores = filteredStores();
  return `
    <section class="store-search-section">
      <label class="search-wrap">
        ${icon("search", "search-icon")}
        <input data-search value="${escapeAttr(ui.search)}" placeholder="搜索店铺、菜品、种类" />
      </label>
    </section>
    <section class="category-section">
      <h2>猜你喜欢</h2>
      ${renderCategoryChips()}
    </section>
    <div class="section-head">
      <h2>店铺库</h2>
      <span>总共 ${stores.length} 家可选</span>
    </div>
    <section class="store-list">
      ${
        stores.length
          ? stores.map(renderStoreCard).join("")
          : `<div class="empty">没有匹配店铺，试试换个关键词。</div>`
      }
    </section>
  `;
}

function renderInsightPanel() {
  const summary = stats();
  const categoryData = Object.entries(summary.categorySpend)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  return `
    <section class="panel insight-panel">
      <div class="section-head">
        <h2>外卖统计洞察</h2>
        <span>折线 / 饼图 / 柱图</span>
      </div>
      ${renderLineChart(timelineSpend())}
      ${renderPieChart(categoryData)}
      ${renderBarChart(
        state.stores
          .map((store) => ({ name: store.name, value: storeOrders(store.id).length }))
          .filter((item) => item.value > 0)
          .sort((a, b) => b.value - a.value)
          .slice(0, 4),
        "count"
      )}
    </section>
  `;
}

function renderCategoryChips() {
  return `
    <nav class="chips" aria-label="店铺类型" data-category-tabs>
      ${categories()
        .map(
          (category) => `
            <button class="chip ${ui.category === category ? "active" : ""}" data-action="set-category" data-category="${escapeAttr(category)}" data-category-chip data-active="${ui.category === category ? "true" : "false"}">
              ${escapeHtml(category)}
            </button>
          `
        )
        .join("")}
    </nav>
  `;
}

function renderStoreCard(store) {
  const metrics = storeMetrics(store);
  return `
    <button class="store-card" data-action="open-store" data-store-id="${store.id}">
      <img class="cover" src="${escapeAttr(store.cover || STORE_COVERS["默认"])}" alt="${escapeAttr(store.name)}" />
      <span class="store-meta">
        <span class="store-title-row">
          <span class="tag yellow">${escapeHtml(store.category)}</span>
          <span class="store-name">${escapeHtml(store.name)}</span>
          <span class="rating">${metrics.rating.toFixed(1)}分</span>
        </span>
        <span class="subline">
          <span>${metrics.orders.length} 单</span>
          <span>人均 ${money(metrics.avgPrice)}</span>
          <span>由 ${escapeHtml(getUser(store.updatedBy || store.createdBy)?.nickname || "用户")} 更新</span>
        </span>
        <span class="subline">
          ${(store.tags || []).slice(0, 3).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}
          ${metrics.dislikedCount ? `<span class="tag red">${metrics.dislikedCount} 个不喜欢</span>` : ""}
        </span>
      </span>
    </button>
  `;
}

function renderUpload() {
  if (!ui.draft) ui.draft = createBlankDraft();
  const draft = ui.draft;
  return `
    <section class="upload-panel">
      <div class="section-head">
        <h2>${draft.id ? "编辑订单" : "上传订单截图"}</h2>
        <span>截图识别结果可手动校正</span>
      </div>
      <label class="file-drop">
        <input type="file" accept="image/*" data-action="upload-image" />
        <strong>选择订单截图</strong>
        <span class="note">选择后会生成一份可编辑提取结果；也可以粘贴订单文字增强识别。</span>
      </label>
      ${draft.imageData ? `<img class="preview-image" src="${draft.imageData}" alt="订单截图预览" />` : ""}
      <div class="field" style="margin-top: 12px;">
        <label>可选：粘贴订单文字</label>
        <textarea data-ocr-text placeholder="例如：店铺名称、菜品 ¥价格、实付、订单时间">${escapeHtml(ui.ocrText)}</textarea>
      </div>
      <div class="actions">
        <button class="primary-btn" data-action="parse-text">智能提取文字</button>
        <button class="ghost-btn" data-action="mock-extract">生成一条示例提取</button>
      </div>
    </section>

    <form class="upload-panel form-grid" data-order-form>
      <div class="two-col">
        <div class="field">
          <label>店铺名称</label>
          <input name="storeName" value="${escapeAttr(draft.storeName)}" placeholder="例：金牌鸡腿饭" />
        </div>
        <div class="field">
          <label>外卖种类</label>
          <select name="category">
            ${categories()
              .filter((category) => category !== "全部")
              .map((category) => `<option ${draft.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`)
              .join("")}
          </select>
        </div>
      </div>
      <div class="two-col">
        <div class="field">
          <label>订单时间</label>
          <input type="datetime-local" name="orderTime" value="${escapeAttr(draft.orderTime)}" />
        </div>
        <div class="field">
          <label>用餐时间</label>
          <select name="mealTime">
            ${MEAL_TIMES.map((time) => `<option ${draft.mealTime === time ? "selected" : ""}>${time}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="two-col">
        <div class="field">
          <label>实付金额</label>
          <input type="number" step="0.1" min="0" name="total" value="${escapeAttr(draft.total)}" />
        </div>
        <div class="field">
          <label>配送费</label>
          <input type="number" step="0.1" min="0" name="deliveryFee" value="${escapeAttr(draft.deliveryFee)}" />
        </div>
      </div>
      <div class="two-col">
        <div class="field">
          <label>订单评分</label>
          <select name="rating">
            ${[5, 4, 3, 2, 1].map((rating) => `<option value="${rating}" ${Number(draft.rating) === rating ? "selected" : ""}>${rating} 分</option>`).join("")}
          </select>
        </div>
        <label class="checkline" style="align-self: end;">
          <input type="checkbox" name="disliked" ${draft.disliked ? "checked" : ""} />
          标注这单不喜欢
        </label>
      </div>
      <div class="field">
        <label>订单评价</label>
        <textarea name="note" placeholder="例：出餐快，口味偏咸，下次少辣">${escapeHtml(draft.note)}</textarea>
      </div>
      <section>
        <div class="section-head">
          <h2>菜品明细</h2>
          <button type="button" class="mini-btn" data-action="add-dish">添加菜品</button>
        </div>
        <div class="form-grid">
          ${draft.dishes.map(renderDishEditor).join("")}
        </div>
      </section>
      <div class="actions">
        <button type="button" class="primary-btn" data-action="save-order">${draft.id ? "更新订单" : "保存记录"}</button>
        <button type="button" class="ghost-btn" data-action="new-draft">清空重填</button>
      </div>
    </form>
  `;
}

function renderDishEditor(dish, index) {
  return `
    <div class="dish-row" data-dish-row="${index}">
      <input data-dish-name value="${escapeAttr(dish.name)}" placeholder="菜品名称" />
      <input data-dish-price type="number" step="0.1" min="0" value="${escapeAttr(dish.price)}" placeholder="价格" />
      <select data-dish-rating>
        ${[5, 4, 3, 2, 1].map((rating) => `<option value="${rating}" ${Number(dish.rating) === rating ? "selected" : ""}>${rating}分</option>`).join("")}
      </select>
      <button type="button" data-action="remove-dish" data-index="${index}" aria-label="删除菜品">×</button>
      <input data-dish-note value="${escapeAttr(dish.note || "")}" placeholder="菜品评价" style="grid-column: 1 / span 3;" />
      <label class="checkline">
        <input data-dish-disliked type="checkbox" ${dish.disliked ? "checked" : ""} />
        不喜欢
      </label>
    </div>
  `;
}

function renderRandom() {
  const candidates = randomCandidates();
  const winner = ui.random.winnerId ? getStore(ui.random.winnerId) : null;
  const stageImage = winner?.cover || "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";
  return `
    <section class="random-card">
      <h3>今天选哪家？</h3>
      <p class="note">可以按外卖种类、用餐时间筛选；默认排除你标注过不喜欢的店和菜。</p>
      <div class="two-col">
        <div class="field">
          <label>外卖种类</label>
          <select data-random-category>
            ${categories().map((category) => `<option ${ui.random.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>用餐时间</label>
          <select data-random-meal>
            ${["全部", ...MEAL_TIMES].map((time) => `<option ${ui.random.mealTime === time ? "selected" : ""}>${time}</option>`).join("")}
          </select>
        </div>
      </div>
      <label class="checkline" style="margin-top: 10px;">
        <input type="checkbox" data-random-exclude ${ui.random.excludeDisliked ? "checked" : ""} />
        排除不喜欢
      </label>
      <div class="random-stage ${ui.random.spinning ? "spinning" : ""} ${winner ? "clickable" : ""}" style="background-image: linear-gradient(135deg, rgba(255, 225, 106, 0.78), rgba(255, 191, 0, 0.78)), url('${escapeAttr(stageImage)}');" ${winner ? `data-action="open-store" data-store-id="${winner.id}"` : ""}>
        <div class="winner-card">
          <span class="tag yellow">${ui.random.spinning ? "抽选中" : winner ? "今天吃这家" : "先设置筛选"}</span>
          <div class="winner-name">${winner ? escapeHtml(winner.name) : "今天选哪家？"}</div>
          <div class="subline" style="justify-content: center;">
            ${winner ? `<span>${escapeHtml(winner.category)}</span><span>${storeMetrics(winner).rating.toFixed(1)}分</span><span>点击查看店铺</span>` : `<span>点击开始抽选后显示结果</span>`}
          </div>
        </div>
      </div>
      <div class="random-actions">
        <span class="candidate-count">候选 ${candidates.length} 家</span>
        <button class="primary-btn" data-action="spin-random" ${ui.random.spinning ? "disabled" : ""}>${ui.random.spinning ? "抽选中" : "开始抽选"}</button>
        <span></span>
      </div>
    </section>
    <section class="panel">
      <div class="section-head">
        <h2>最近抽选</h2>
        <div class="head-actions">
          <span>总共 ${state.randomHistory.length} 条</span>
          ${state.randomHistory.length > 5 ? `<button class="text-btn with-icon" data-action="open-random-history">更多记录 ${icon("chevron-right")}</button>` : ""}
        </div>
      </div>
      <p class="list-hint">最多只显示5条记录哦~</p>
      <div class="order-list">
        ${
          state.randomHistory.length
            ? state.randomHistory
                .slice(0, 5)
                .map(renderRandomHistoryCard)
                .join("")
            : `<div class="empty">还没有抽选记录。</div>`
        }
      </div>
    </section>
  `;
}

function randomHistoryDetail(item) {
  const store = getStore(item.storeId);
  const metrics = store ? storeMetrics(store) : null;
  return {
    store,
    name: store?.name || item.storeName || "已删除店铺",
    rating: Number(metrics?.rating || item.storeRating || 0),
    category: store?.category || item.storeCategory || item.category || "未分类",
    user: getUser(item.userId) || currentUser(),
    time: item.time || ""
  };
}

function renderRandomHistoryCard(item) {
  const detail = randomHistoryDetail(item);
  return `
    <article class="order-card random-history-card">
      <img class="random-history-thumb" src="${escapeAttr(detail.store?.cover || STORE_COVERS[detail.category] || STORE_COVERS["默认"])}" alt="${escapeAttr(detail.name)}" />
      <div class="random-history-main">
      <div class="row-between">
        <strong>${escapeHtml(detail.name)}</strong>
        <span class="rating">${detail.rating ? `${detail.rating.toFixed(1)}分` : "暂无评分"}</span>
      </div>
      <div class="subline">
        <span class="tag yellow">${escapeHtml(detail.category)}</span>
        ${userBadge(detail.user?.id)}
        <span>${displayTime(detail.time)}</span>
      </div>
      </div>
    </article>
  `;
}

function renderMine() {
  const user = currentUser();
  return `
    ${
      ui.myTab === "menu"
        ? `<section class="profile-card">
            <div class="avatar" style="background:${escapeAttr(user?.avatarColor || "#ffd100")}">${escapeHtml(userInitial(user))}</div>
            <div class="profile-main">
              <strong>${escapeHtml(user?.nickname || "未登录用户")}</strong>
              <span>${escapeHtml(user?.role || "外卖记录员")}</span>
            </div>
          </section>`
        : ""
    }
    ${ui.myTab === "menu" ? renderMyMenu() : renderMyDetail()}
  `;
}

function renderMyMenu() {
  const maintainedStores = state.stores.filter((store) => store.updatedBy === state.currentUserId || store.createdBy === state.currentUserId).length;
  return `
    <section class="setting-list">
      <button class="setting-row" data-action="set-my-tab" data-tab="orders">
        <span class="setting-label">${icon("receipt-text")} 我的订单</span><strong>${icon("chevron-right")}</strong>
      </button>
      <button class="setting-row" data-action="set-my-tab" data-tab="reviews">
        <span class="setting-label">${icon("message-square-text")} 我的评价</span><strong>${icon("chevron-right")}</strong>
      </button>
      <button class="setting-row" data-action="set-my-tab" data-tab="stats">
        <span class="setting-label">${icon("chart-pie")} 外卖统计</span><strong>${icon("chevron-right")}</strong>
      </button>
      <button class="setting-row" data-action="set-my-tab" data-tab="randoms">
        <span class="setting-label">${icon("shuffle")} 抽选记录</span><strong>${icon("chevron-right")}</strong>
      </button>
      <button class="setting-row" data-action="set-my-tab" data-tab="stores">
        <span class="setting-label">${icon("store")} 我维护的店铺</span><strong>${icon("chevron-right")}</strong>
      </button>
    </section>
  `;
}

function renderMyDetail() {
  return `
    ${ui.myTab === "reviews" ? renderMyReviews() : ui.myTab === "stats" ? renderStats() : ui.myTab === "randoms" ? renderMyRandoms() : ui.myTab === "stores" ? renderMyStores() : renderMyOrders()}
  `;
}

function renderMyOrders() {
  const orders = userOrders();
  const visible = orders.slice(0, ui.lazyLimits.orders);
  return `
    <section class="panel">
      <div class="section-head">
        <h2>我的订单记录</h2>
        <button class="mini-btn" data-action="new-draft">新增</button>
      </div>
      <div class="order-list">
        ${visible.length ? visible.map(renderOrderCard).join("") : `<div class="empty">这个用户还没有订单。</div>`}
        ${renderLazyFooter("orders", orders.length)}
      </div>
    </section>
  `;
}

function renderMyReviews() {
  const reviews = userReviews();
  const visible = reviews.slice(0, ui.lazyLimits.reviews);
  return `
    <section class="panel">
      <div class="section-head">
        <h2>我的评价记录</h2>
        <span>可编辑、删除</span>
      </div>
      <div class="order-list">
        ${
          visible.length
            ? visible
                .map(
                  (review) => `
                    <article class="order-card">
                      <div class="row-between">
                        <h3>${escapeHtml(review.target)}</h3>
                        <span class="rating">${review.rating || 0}分</span>
                      </div>
                      <div class="subline">
                        <span class="tag yellow">${escapeHtml(review.targetType)}</span>
                        <span>${displayTime(review.time)}</span>
                        ${review.disliked ? `<span class="tag red">不喜欢</span>` : ""}
                      </div>
                      <p class="note">${escapeHtml(review.note)}</p>
                      <div class="actions">
                        <button class="mini-btn" data-action="edit-order" data-order-id="${review.orderId}">编辑</button>
                        <button class="mini-btn" data-action="delete-review" data-review-id="${review.id}">删除评价</button>
                      </div>
                    </article>
                  `
                )
                .join("")
            : `<div class="empty">这个用户还没有评价。</div>`
        }
        ${renderLazyFooter("reviews", reviews.length)}
      </div>
    </section>
  `;
}

function renderMyStores() {
  const stores = state.stores.filter((store) => store.updatedBy === state.currentUserId || store.createdBy === state.currentUserId);
  const visible = stores.slice(0, ui.lazyLimits.stores);
  return `
    <section class="panel">
      <div class="section-head">
        <h2>我维护的店铺</h2>
        <span>总共 ${stores.length} 家</span>
      </div>
      <div class="store-list">
        ${visible.length ? visible.map(renderStoreCard).join("") : `<div class="empty">还没有维护记录，上传订单会自动加入店铺库。</div>`}
        ${renderLazyFooter("stores", stores.length)}
      </div>
    </section>
  `;
}

function renderMyRandoms() {
  const records = state.randomHistory || [];
  const visible = records.slice(0, ui.lazyLimits.randoms);
  return `
    <section class="panel">
      <div class="section-head">
        <h2>抽选记录详情</h2>
        <span>总共 ${records.length} 条</span>
      </div>
      <div class="order-list">
        ${visible.length ? visible.map(renderRandomHistoryCard).join("") : `<div class="empty">还没有抽选记录。</div>`}
        ${renderLazyFooter("randoms", records.length)}
      </div>
    </section>
  `;
}

function renderStats() {
  const summary = stats();
  const categoryData = Object.entries(summary.categorySpend)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const ratingData = [5, 4, 3, 2, 1].map((rating) => ({
    name: `${rating}分`,
    value: state.orders.filter((order) => Number(order.rating) === rating).length
  }));
  const mealTimeData = Object.entries(groupSum(state.orders, "mealTime", "total"))
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const storeData = state.stores
    .map((store) => ({ name: store.name, value: storeOrders(store.id).length }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  const userData = (state.users || [])
    .map((user) => ({
      name: user.nickname,
      value: userOrders(user.id).reduce((sum, order) => sum + Number(order.total || 0), 0)
    }))
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return `
    <section class="metric-grid">
      <div class="metric"><strong>${money(summary.avgSpend)}</strong><span>客单价</span></div>
      <div class="metric"><strong>${summary.favoriteStore}</strong><span>常点店铺</span></div>
      <div class="metric"><strong>${state.stores.length}</strong><span>店铺库</span></div>
    </section>
    <section class="stats-dashboard">
      ${renderLineChart(timelineSpend(), "消费趋势", "按日期汇总实付金额")}
      ${renderPieChart(categoryData, "类型占比", `${money(summary.totalSpend)} 累计`)}
      ${renderDonutChart(mealTimeData, "用餐时段", "按实付金额")}
      ${renderBarChart(storeData, "count", "店铺复购", "Top 5")}
      ${renderBarChart(ratingData, "count", "评分分布", `${state.orders.length} 单`)}
      ${renderBarChart(userData, "money", "用户贡献", "按消费金额")}
    </section>
    <section class="panel">
      <div class="section-head"><h2>数据管理</h2><span>本地存储</span></div>
      <p class="note">当前记录保存在浏览器 localStorage，适合原型实时预览。后续可以接数据库和真实 OCR。</p>
      <div class="actions">
        <button class="danger-btn" data-action="reset-demo">恢复示例数据</button>
      </div>
    </section>
  `;
}

function renderBarChart(items, type, title = "", subtitle = "") {
  if (!items.length) return `<div class="empty">暂无统计数据。</div>`;
  const max = Math.max(...items.map((item) => Number(item.value || 0)), 1);
  return `
    <div class="chart-card">
      ${
        title
          ? `<div class="chart-head"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(subtitle)}</span></div>`
          : ""
      }
      <div class="chart">
      ${items
        .map(
          (item) => `
          <div class="bar-row">
            <span>${escapeHtml(item.name)}</span>
            <span class="bar-track"><span class="bar-fill" style="width: ${(Number(item.value || 0) / max) * 100}%"></span></span>
            <strong>${type === "money" ? money(item.value) : item.value}</strong>
          </div>
        `
        )
        .join("")}
      </div>
    </div>
  `;
}

function renderLineChart(items, title = "消费趋势", subtitle = "") {
  if (!items.length) return `<div class="empty">暂无趋势数据。</div>`;
  const width = 320;
  const height = 116;
  const pad = 20;
  const max = Math.max(...items.map((item) => Number(item.value || 0)), 1);
  const points = items.map((item, index) => {
    const x = items.length === 1 ? width / 2 : pad + (index * (width - pad * 2)) / (items.length - 1);
    const y = height - pad - (Number(item.value || 0) / max) * (height - pad * 2);
    return { ...item, x, y };
  });
  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  return `
    <div class="chart-card chart-wide">
      <div class="chart-head"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(subtitle)}</span></div>
      <svg class="line-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="消费趋势折线图">
        <defs>
          <linearGradient id="lineArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="#ffd100" stop-opacity="0.42"></stop>
            <stop offset="100%" stop-color="#ffd100" stop-opacity="0"></stop>
          </linearGradient>
        </defs>
        <polygon points="${points[0].x},${height - pad} ${line} ${points[points.length - 1].x},${height - pad}" fill="url(#lineArea)"></polygon>
        <polyline points="${line}" fill="none" stroke="#ff9d00" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></polyline>
        ${points
          .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4.5" fill="#ffd100" stroke="#1f1f1f" stroke-width="1"></circle>`)
          .join("")}
      </svg>
      <div class="axis-labels">
        ${points.map((point) => `<span>${escapeHtml(point.name)}</span>`).join("")}
      </div>
    </div>
  `;
}

function renderPieChart(items, title = "类型占比", subtitle = "") {
  if (!items.length) return `<div class="empty">暂无分类数据。</div>`;
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
  const colors = ["#ffd100", "#ff9d00", "#5fd3a5", "#7bb7ff", "#ff7b7b", "#c6a8ff"];
  let offset = 25;
  const circles = items
    .map((item, index) => {
      const value = (Number(item.value || 0) / total) * 100;
      const circle = `<circle r="15.9" cx="18" cy="18" fill="transparent" stroke="${colors[index % colors.length]}" stroke-width="10" stroke-dasharray="${value} ${100 - value}" stroke-dashoffset="${offset}"></circle>`;
      offset -= value;
      return circle;
    })
    .join("");
  return `
    <div class="chart-card pie-card">
      <div class="chart-head"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(subtitle)}</span></div>
      <svg class="pie-chart" viewBox="0 0 36 36" role="img" aria-label="类型占比饼图">
        <circle r="15.9" cx="18" cy="18" fill="transparent" stroke="#eeeeee" stroke-width="10"></circle>
        ${circles}
      </svg>
      <div class="legend">
        ${items
          .map(
            (item, index) => `
              <span><i style="background:${colors[index % colors.length]}"></i>${escapeHtml(item.name)} ${Math.round((Number(item.value || 0) / total) * 100)}%</span>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderDonutChart(items, title = "环形图", subtitle = "") {
  if (!items.length) return `<div class="empty">暂无时段数据。</div>`;
  const total = items.reduce((sum, item) => sum + Number(item.value || 0), 0) || 1;
  const colors = ["#ffd100", "#5fd3a5", "#7bb7ff", "#ff9d00", "#ff7b7b", "#c6a8ff"];
  let offset = 25;
  const circles = items
    .map((item, index) => {
      const value = (Number(item.value || 0) / total) * 100;
      const circle = `<circle r="15.9" cx="18" cy="18" fill="transparent" stroke="${colors[index % colors.length]}" stroke-width="7" stroke-dasharray="${value} ${100 - value}" stroke-dashoffset="${offset}"></circle>`;
      offset -= value;
      return circle;
    })
    .join("");
  return `
    <div class="chart-card pie-card">
      <div class="chart-head"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(subtitle)}</span></div>
      <div class="donut-wrap">
        <svg class="pie-chart donut-chart" viewBox="0 0 36 36" role="img" aria-label="${escapeAttr(title)}环形图">
          <circle r="15.9" cx="18" cy="18" fill="transparent" stroke="#eeeeee" stroke-width="7"></circle>
          ${circles}
          <circle r="9" cx="18" cy="18" fill="#fafafa"></circle>
        </svg>
        <strong>${money(total)}</strong>
      </div>
      <div class="legend">
        ${items
          .map(
            (item, index) => `
              <span><i style="background:${colors[index % colors.length]}"></i>${escapeHtml(item.name)} ${Math.round((Number(item.value || 0) / total) * 100)}%</span>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function renderOrderRecords() {
  return `
    <section class="panel">
      <div class="section-head">
        <h2>订单记录</h2>
        <button class="mini-btn" data-action="new-draft">新增</button>
      </div>
      <div class="order-list">
        ${
          state.orders.length
            ? state.orders.map(renderOrderCard).join("")
            : `<div class="empty">还没有订单，先上传一张截图吧。</div>`
        }
      </div>
    </section>
  `;
}

function renderOrderCard(order) {
  const store = getStore(order.storeId);
  return `
    <article class="order-card">
      <div class="row-between">
        <h3>${escapeHtml(store?.name || "未知店铺")}</h3>
        <span class="rating">${order.rating || 0}分</span>
      </div>
      <div class="subline">
        ${userBadge(order.userId)}
        <span class="tag yellow">${escapeHtml(order.category)}</span>
        <span>${displayTime(order.orderTime)}</span>
        <span>${money(order.total)}</span>
        ${order.disliked ? `<span class="tag red">不喜欢</span>` : ""}
      </div>
      <div class="order-items">
        ${(order.dishes || []).map((dish) => `${escapeHtml(dish.name)} ${money(dish.price)}`).join(" / ")}
      </div>
      ${order.note ? `<p class="note">${escapeHtml(order.note)}</p>` : ""}
      <div class="actions">
        <button class="mini-btn" data-action="edit-order" data-order-id="${order.id}">编辑</button>
        <button class="mini-btn" data-action="open-store" data-store-id="${order.storeId}">店铺</button>
        <button class="mini-btn" data-action="delete-order" data-order-id="${order.id}">删除</button>
      </div>
    </article>
  `;
}

function renderStoreLibrary() {
  return `
    <section class="panel">
      <div class="section-head">
        <h2>整理出的店铺库</h2>
        <span>总共 ${state.stores.length} 家</span>
      </div>
      <div class="store-list">
        ${state.stores.map(renderStoreCard).join("")}
      </div>
    </section>
  `;
}

function renderStoreDetail() {
  const store = getStore(ui.storeId);
  if (!store) return `<div class="empty">店铺不存在。</div>`;
  const metrics = storeMetrics(store);
  return `
    <img class="detail-cover" src="${escapeAttr(store.cover || STORE_COVERS["默认"])}" alt="${escapeAttr(store.name)}" />
    <section class="panel" style="margin-top: 12px;">
      <div class="row-between">
        <div class="detail-name-row">
          <span class="tag yellow">${escapeHtml(store.category)}</span>
          <h1 class="detail-title">${escapeHtml(store.name)}</h1>
        </div>
        <span class="rating">${metrics.rating.toFixed(1)}分</span>
      </div>
      <div class="subline">
        <span>${metrics.orders.length} 单记录</span>
        <span>人均 ${money(metrics.avgPrice)}</span>
        <span>创建：${escapeHtml(getUser(store.createdBy)?.nickname || "未知")}</span>
        <span>更新：${escapeHtml(getUser(store.updatedBy)?.nickname || "未知")}</span>
        ${metrics.dislikedCount ? `<span class="tag red">${metrics.dislikedCount} 个不喜欢</span>` : `<span class="tag green">暂无明显雷点</span>`}
      </div>
      <p class="note">${escapeHtml(store.description || "暂无店铺备注。")}</p>
      <div class="actions">
        <button class="mini-btn" data-action="toggle-store-edit">${ui.storeEditing ? "收起编辑" : "更新店铺信息"}</button>
      </div>
    </section>
    ${ui.storeEditing ? renderStoreEditForm(store) : ""}
    <section class="panel">
      <div class="section-head">
        <h2>菜品列表</h2>
        <span>总共 ${metrics.dishes.length} 个菜品</span>
      </div>
      <div class="dish-list">
        ${
          metrics.dishes.length
            ? metrics.dishes.map(renderDishCard).join("")
            : `<div class="empty">还没有菜品记录。</div>`
        }
      </div>
    </section>
    <section class="panel">
      <div class="section-head">
        <h2>用户评价</h2>
        <span>总共 ${metrics.orders.length} 条</span>
      </div>
      <div class="order-list">
        ${
          metrics.orders.length
            ? metrics.orders.map(renderOrderCard).join("")
            : `<div class="empty">暂无订单评价。</div>`
        }
      </div>
    </section>
    <section class="panel">
      <div class="section-head">
        <h2>维护日志</h2>
        <span>总共 ${(store.updates || []).length} 条</span>
      </div>
      <div class="order-list">
        ${
          (store.updates || []).length
            ? store.updates
                .map(
                  (item) => `
                    <article class="order-card">
                      <div class="row-between">
                        ${userBadge(item.userId)}
                        <span class="tag">${displayTime(item.time)}</span>
                      </div>
                      <p class="note">${escapeHtml(item.note || "更新了店铺信息。")}</p>
                    </article>
                  `
                )
                .join("")
            : `<div class="empty">暂无维护记录。</div>`
        }
      </div>
    </section>
  `;
}

function renderStoreEditForm(store) {
  return `
    <form class="panel form-grid" data-store-form>
      <div class="two-col">
        <div class="field">
          <label>店铺名称</label>
          <input name="name" value="${escapeAttr(store.name)}" />
        </div>
        <div class="field">
          <label>外卖种类</label>
          <select name="category">
            ${categories()
              .filter((category) => category !== "全部")
              .map((category) => `<option ${store.category === category ? "selected" : ""}>${escapeHtml(category)}</option>`)
              .join("")}
          </select>
        </div>
      </div>
      <div class="field">
        <label>店铺标签，用逗号分隔</label>
        <input name="tags" value="${escapeAttr((store.tags || []).join("，"))}" />
      </div>
      <div class="field">
        <label>适合用餐时间，用逗号分隔</label>
        <input name="mealTimes" value="${escapeAttr((store.mealTimes || []).join("，"))}" />
      </div>
      <div class="field">
        <label>店铺备注</label>
        <textarea name="description">${escapeHtml(store.description || "")}</textarea>
      </div>
      <div class="field">
        <label>本次更新说明</label>
        <input name="note" placeholder="例：补充夜宵标签，修改人均价格备注" />
      </div>
      <div class="actions">
        <button type="button" class="primary-btn" data-action="save-store">保存到共建店铺库</button>
      </div>
    </form>
  `;
}

function renderDishCard(dish) {
  return `
    <button class="dish-card" data-action="open-dish" data-dish-id="${dish.id}">
      <span class="row-between">
        <span class="dish-name">${escapeHtml(dish.name)}</span>
        <span class="rating">${Number(dish.rating || 0).toFixed(1)}分</span>
      </span>
      <span class="subline">
        <span>${money(dish.price)}</span>
        ${dish.disliked ? `<span class="tag red">不喜欢</span>` : `<span class="tag green">可复点</span>`}
      </span>
    </button>
  `;
}

function renderDishDetail() {
  const dish = getDish(ui.dishId);
  if (!dish) return `<div class="empty">菜品不存在。</div>`;
  const store = getStore(dish.storeId);
  const relatedOrders = state.orders
    .filter((order) => order.dishes?.some((item) => item.dishId === dish.id || item.name === dish.name))
    .map((order) => ({
      order,
      item: order.dishes.find((dishItem) => dishItem.dishId === dish.id || dishItem.name === dish.name)
    }));

  return `
    <section class="panel">
      <div class="row-between">
        <h1 class="detail-title">${escapeHtml(dish.name)}</h1>
        <span class="rating">${Number(dish.rating || 0).toFixed(1)}分</span>
      </div>
      <div class="subline">
        <span class="tag yellow">${escapeHtml(store?.name || "未知店铺")}</span>
        <span>${money(dish.price)}</span>
        ${dish.disliked ? `<span class="tag red">不喜欢</span>` : `<span class="tag green">可复点</span>`}
      </div>
    </section>
    <section class="panel">
      <div class="section-head">
        <h2>具体用户评价</h2>
        <span>总共 ${relatedOrders.length} 条订单关联</span>
      </div>
      <div class="order-list">
        ${
          relatedOrders.length
            ? relatedOrders
                .map(
                  ({ order, item }) => `
                  <article class="order-card">
                    <div class="row-between">
                      ${userBadge(order.userId)}
                      <span class="rating">${item?.rating || order.rating || 0}分</span>
                    </div>
                    <div class="subline"><span>${displayTime(order.orderTime)}</span></div>
                    <p class="note">${escapeHtml(item?.note || order.note || "这次没有写具体评价。")}</p>
                    ${item?.disliked ? `<span class="tag red">这次标注不喜欢</span>` : ""}
                  </article>
                `
                )
                .join("")
            : `<div class="empty">还没有评价。</div>`
        }
      </div>
    </section>
  `;
}

function renderTabbar() {
  const tabs = [
    ["random", "随机", "shuffle"],
    ["upload", "上传", "upload"],
    ["home", "店铺", "store"],
    ["my", "我的", "user-round"]
  ];
  const active = ["storeDetail", "dishDetail"].includes(ui.view) ? "home" : ui.view;
  return `
    <nav class="tabbar" aria-label="底部导航">
      ${tabs
        .map(
          ([view, label, iconName]) => `
          <button class="tab-btn ${active === view ? "active" : ""}" data-action="nav" data-view="${view}">
            <strong>${icon(iconName)}</strong>
            <span>${label}</span>
          </button>
        `
        )
        .join("")}
    </nav>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;

  if (action === "back") goBack();
  if (action === "nav") {
    if (target.dataset.view === "upload" && !ui.draft) ui.draft = createBlankDraft();
    if (target.dataset.view === "my") ui.myTab = "menu";
    setView(target.dataset.view);
  }
  if (action === "set-category") {
    ui.category = target.dataset.category;
    render();
  }
  if (action === "open-store") setView("storeDetail", { storeId: target.dataset.storeId, storeEditing: false });
  if (action === "open-dish") setView("dishDetail", { dishId: target.dataset.dishId });
  if (action === "parse-text") {
    ui.ocrText = document.querySelector("[data-ocr-text]")?.value || "";
    ui.draft = parseOrderText(ui.ocrText, ui.draft || createBlankDraft());
    render();
    showToast("已根据文字更新提取结果");
  }
  if (action === "mock-extract") {
    ui.draft = {
      ...mockExtractFromFile({ name: "示例订单截图.png" }),
      imageData: ui.draft?.imageData || "",
      imageName: ui.draft?.imageName || "示例订单截图.png"
    };
    render();
    showToast("已生成示例提取结果");
  }
  if (action === "add-dish") {
    syncDraftFromForm();
    ui.draft.dishes.push({ name: "", price: 0, rating: 4, disliked: false, note: "" });
    render();
  }
  if (action === "remove-dish") {
    syncDraftFromForm();
    ui.draft.dishes.splice(Number(target.dataset.index), 1);
    if (!ui.draft.dishes.length) ui.draft.dishes.push({ name: "", price: 0, rating: 4, disliked: false, note: "" });
    render();
  }
  if (action === "save-order") saveOrderFromDraft();
  if (action === "new-draft") {
    ui.draft = createBlankDraft();
    setView("upload");
  }
  if (action === "edit-order") {
    const order = state.orders.find((item) => item.id === target.dataset.orderId);
    if (order) {
      ui.draft = draftFromOrder(order);
      setView("upload");
    }
  }
  if (action === "delete-order") deleteOrder(target.dataset.orderId);
  if (action === "delete-review") deleteReview(target.dataset.reviewId);
  if (action === "toggle-store-edit") {
    ui.storeEditing = !ui.storeEditing;
    render();
  }
  if (action === "save-store") saveStoreFromForm();
  if (action === "set-my-tab") {
    if (target.dataset.tab !== "menu" && target.dataset.tab !== ui.myTab) {
      resetLazyLimit(target.dataset.tab);
    }
    ui.myTab = target.dataset.tab;
    render();
  }
  if (action === "open-random-history") {
    resetLazyLimit("randoms");
    ui.myTab = "randoms";
    setView("my");
  }
  if (action === "load-more") loadMoreList(target.dataset.tab);
  if (action === "spin-random") spinRandom();
  if (action === "reset-demo") resetDemoData();
});

document.addEventListener("input", (event) => {
  if (event.target.matches("[data-search]")) {
    ui.search = event.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (ui.view !== "home") {
        ui.previousView = ui.view;
        ui.view = "home";
        ui.storeId = null;
        ui.dishId = null;
      }
      render();
      const input = document.querySelector("[data-search]");
      if (input) {
        input.focus();
        input.setSelectionRange(ui.search.length, ui.search.length);
      }
    }, 80);
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-action='upload-image']")) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const extracted = mockExtractFromFile(file);
      ui.draft = {
        ...extracted,
        imageData: String(reader.result || ""),
        imageName: file.name
      };
      render();
      showToast("截图已上传，提取结果可继续校正");
    };
    reader.readAsDataURL(file);
  }

  if (event.target.matches("[data-random-category]")) {
    ui.random.category = event.target.value;
    ui.random.winnerId = null;
    render();
  }

  if (event.target.matches("[data-random-meal]")) {
    ui.random.mealTime = event.target.value;
    ui.random.winnerId = null;
    render();
  }

  if (event.target.matches("[data-random-exclude]")) {
    ui.random.excludeDisliked = event.target.checked;
    ui.random.winnerId = null;
    render();
  }

});

render();
