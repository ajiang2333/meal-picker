<template>
  <view class="page tab-page upload-page">
    <view class="app-nav">
      <view class="app-nav-left">
        <view v-if="editingOrderId" class="app-nav-back" @tap="cancelEditing">
          <uni-icons type="left" size="22" color="#d86693" />
        </view>
      </view>
      <text class="app-nav-title">{{ pageTitle }}</text>
      <view class="app-nav-right" />
    </view>
    <view class="hero-panel">
      <view>
        <text class="eyebrow">ORDER CAPTURE</text>
        <text class="hero-title">{{ pageTitle }}</text>
        <text class="hero-copy">用组件库表单录入订单，截图或文字都能补全店铺库。</text>
      </view>
      <view class="hero-badge">
        <text>春日</text>
        <text>共建</text>
      </view>
    </view>

    <view class="panel upload-panel">
      <view class="panel-head">
        <view>
          <text class="panel-title">订单截图</text>
          <text class="panel-subtitle">可上传截图，也可以直接粘贴订单文字。</text>
        </view>
      </view>
      <u-upload
        :file-list="uploadFiles"
        :auto-upload="false"
        :max-count="1"
        accept="image"
        upload-text="上传截图"
        upload-icon-color="#d86693"
        width="148"
        height="148"
        :preview-full-image="true"
        @afterRead="handleAfterRead"
        @delete="removeUpload"
      />
      <view class="raw-input-card">
        <view class="raw-input-head">
          <text class="raw-input-title">粘贴订单文字</text>
          <text class="raw-input-hint">店铺名一定要先写；时间支持 18:45、2026-07-18 18:45、7月18日 晚上6点45、下午6:45</text>
        </view>
        <u-textarea
          :placeholder-style="fieldPlaceholderStyle"
          v-model="rawText"
          class="soft-control text-area"
          placeholder="第一项必须是店铺名；后面可写时间、菜品、金额，例如：兰州牛肉面；2026-07-18 18:45；招牌牛肉面 18"
          border="none"
          height="188"
          maxlength="800"
          count
        />
      </view>
      <view class="text-order-example">
        <text class="example-label">示例</text>
        <text class="example-copy">店铺名在最前：兰州牛肉面；2026-07-18 18:45 / 下午6:45 / 7月18日 晚上6点45；招牌牛肉面 18；红油小菜 6；冰粉 8</text>
      </view>
      <u-button
        text="从文字提取"
        shape="circle"
        color="linear-gradient(135deg, #ffbad2 0%, #97ecc1 100%)"
        custom-style="height: 44px; color: #5d3753; font-weight: 800;"
        @click="extract"
      />
    </view>

    <view class="panel form-panel">
      <view class="panel-head">
        <view>
          <text class="panel-title">订单信息</text>
          <text class="panel-subtitle">选择器、评分和金额均使用组件库控件。</text>
        </view>
      </view>

      <u-form :model="form" label-position="top" label-width="100%" :label-style="formLabelStyle">
        <u-form-item label="店铺名称">
          <u-input :color="fieldTextColor" :placeholder-style="fieldPlaceholderStyle" v-model="form.storeName" border="none" clearable placeholder="例如：春日便当研究所" />
        </u-form-item>

        <view class="form-grid">
          <u-form-item label="外卖种类">
            <u-cell class="picker-cell" :title="form.category" :title-style="pickerTitleStyle" :border="false" is-link @click="picker.category = true" />
          </u-form-item>
          <u-form-item label="用餐时间">
            <u-cell class="picker-cell" :title="form.mealTime" :title-style="pickerTitleStyle" :border="false" is-link @click="picker.mealTime = true" />
          </u-form-item>
        </view>

        <u-form-item label="订单时间">
          <u-cell class="time-cell" :title="orderTimeText" :title-style="pickerTitleStyle" :border="false" is-link @click="picker.orderTime = true" />
        </u-form-item>

        <view class="form-grid">
          <u-form-item label="实付金额">
            <u-input :color="fieldTextColor" :placeholder-style="fieldPlaceholderStyle" v-model="form.total" border="none" type="digit" prefix-icon="rmb-circle" placeholder="0.00" />
          </u-form-item>
          <u-form-item label="订单评分">
            <view class="rate-field">
              <u-rate v-model="form.rating" active-color="#d86693" inactive-color="#dff8eb" :count="5" allow-half />
              <text class="rate-text">{{ formatRating(form.rating) }} 分</text>
            </view>
          </u-form-item>
        </view>

        <u-form-item label="是否不再推荐">
          <view class="switch-field">
            <text>{{ form.disliked ? "已标记不喜欢" : "仍可进入抽选池" }}</text>
            <u-switch v-model="form.disliked" active-color="#ff9fbe" inactive-color="#d5d8d6" />
          </view>
        </u-form-item>

        <u-form-item label="订单评价">
          <u-textarea :placeholder-style="fieldPlaceholderStyle" v-model="form.note" border="none" height="120" placeholder="这单有什么值得记住的？" maxlength="240" count />
        </u-form-item>
      </u-form>
    </view>

    <view class="panel dishes-panel">
      <view class="panel-head">
        <view>
          <text class="panel-title">菜品明细</text>
          <text class="panel-subtitle">菜品会同步到订单记录里。</text>
        </view>
        <u-button
          text="添加"
          size="small"
          shape="circle"
          class="dish-action-btn dish-add-btn"
          color="linear-gradient(135deg, #9fecc8 0%, #ffbad2 100%)"
          custom-style="width: 72px; height: 32px; margin: 0; color: #315244; font-weight: 900; padding: 0;"
          @click="addDish"
        />
      </view>

      <view v-for="(dish, index) in form.dishes" :key="index" class="dish-card">
        <view class="dish-title">
          <text>菜品 {{ index + 1 }}</text>
          <u-button
            v-if="form.dishes.length > 1"
            text="移除"
            size="mini"
            shape="circle"
            class="dish-action-btn dish-remove-btn"
            color="#ffe1ed"
            custom-style="width: 58px; height: 28px; margin: 0; color: #9b4268; font-weight: 900; padding: 0; box-shadow: inset 0 0 0 1px rgba(216, 102, 147, 0.16);"
            @click="removeDish(index)"
          />
        </view>
        <view class="dish-grid">
          <view class="dish-form-item">
            <text class="dish-form-label">菜品名称</text>
            <u-input :color="fieldTextColor" :placeholder-style="fieldPlaceholderStyle" v-model="dish.name" border="none" clearable placeholder="菜品名" />
          </view>
          <view class="dish-form-item">
            <text class="dish-form-label">菜品价格</text>
            <u-input :color="fieldTextColor" :placeholder-style="fieldPlaceholderStyle" v-model="dish.price" border="none" type="digit" placeholder="价格" />
          </view>
          <view class="dish-form-item">
            <text class="dish-form-label">菜品评分</text>
            <view class="rate-field dish-rate-field">
              <u-rate v-model="dish.rating" active-color="#d86693" inactive-color="#dff8eb" :count="5" allow-half />
              <text class="rate-text">{{ formatRating(dish.rating) }} 分</text>
            </view>
          </view>
        </view>
        <view class="dish-form-item dish-note-item">
          <text class="dish-form-label">菜品评价</text>
          <u-textarea
            :placeholder-style="fieldPlaceholderStyle"
            v-model="dish.note"
            border="none"
            height="104"
            placeholder="比如口味、分量、下次是否还点"
            maxlength="160"
            count
          />
        </view>
      </view>

      <u-button
        :text="saveButtonText"
        shape="circle"
        color="linear-gradient(135deg, #d86693 0%, #8ee6b8 100%)"
        custom-style="height: 48px; margin-top: 12px; color: #ffffff; font-weight: 900; box-shadow: 0 14px 30px rgba(216, 102, 147, 0.24);"
        @click="save"
      />
    </view>


    <u-picker
      :show="picker.category"
      :columns="categoryColumns"
      title="选择外卖种类"
      confirm-color="#d86693"
      @confirm="confirmCategory"
      @cancel="picker.category = false"
      @close="picker.category = false"
    />
    <u-picker
      :show="picker.mealTime"
      :columns="mealTimeColumns"
      title="选择用餐时间"
      confirm-color="#d86693"
      @confirm="confirmMealTime"
      @cancel="picker.mealTime = false"
      @close="picker.mealTime = false"
    />
    <u-modal
      :show="deleteDialog.show"
      title="确认删除"
      :content="deleteDialog.content"
      show-cancel-button
      confirm-text="删除"
      cancel-text="取消"
      confirm-color="#d86693"
      @confirm="confirmDeleteAction"
      @cancel="closeDeleteDialog"
      @close="closeDeleteDialog"
    />
    <u-datetime-picker
      v-model="orderTimeValue"
      :show="picker.orderTime"
      mode="datetime"
      title="选择订单时间"
      confirm-color="#d86693"
      :close-on-click-overlay="true"
      @confirm="confirmOrderTime"
      @cancel="picker.orderTime = false"
      @close="picker.orderTime = false"
    />
  </view>
</template>

<script setup lang="ts">
import { onShow, onTabItemTap } from "@dcloudio/uni-app";
import { computed, reactive, ref } from "vue";
import { api } from "@/api/client";
import type { Order, OrderCreateResult } from "@/types";

type DishForm = {
  name: string;
  price: number | string;
  rating: number;
  disliked: boolean;
  note: string;
};

type UploadFile = {
  url?: string;
  thumb?: string;
  path?: string;
  tempFilePath?: string;
  status?: string;
  message?: string;
  [key: string]: unknown;
};

const categories = ["快餐", "奶茶", "烧烤", "火锅", "轻食", "粉面", "咖啡", "甜品"];
const mealTimes = ["早餐", "午餐", "下午茶", "晚餐", "夜宵"];
const categoryColumns = [categories];
const mealTimeColumns = [mealTimes];

const image = ref("");
const rawText = ref("");
const fieldTextColor = "#24352d";
const fieldPlaceholderStyle = "color: #8d7281; -webkit-text-fill-color: #8d7281; opacity: 1;";
const formLabelStyle = {
  color: "#4b3544",
  fontSize: "25rpx",
  fontWeight: 900,
  WebkitTextFillColor: "#4b3544",
  opacity: 1
};
const pickerTitleStyle = {
  color: fieldTextColor,
  fontWeight: 900,
  WebkitTextFillColor: fieldTextColor,
  opacity: 1
};
const uploadFiles = ref<UploadFile[]>([]);
const orderTimeValue = ref(Date.now());
const picker = reactive({ category: false, mealTime: false, orderTime: false });
const defaultRating = 4.5;
const editingOrderId = ref("");
const deleteDialog = reactive({
  show: false,
  content: "",
  action: null as null | (() => void | Promise<void>)
});

const form = reactive({
  storeName: "",
  category: "快餐",
  mealTime: "午餐",
  orderTime: formatDateTime(orderTimeValue.value),
  total: 0 as number | string,
  rating: defaultRating,
  disliked: false,
  note: "",
  dishes: [{ name: "", price: 0, rating: defaultRating, disliked: false, note: "" }] as DishForm[]
});

const pageTitle = computed(() => editingOrderId.value ? "编辑订单" : "上传订单");
const saveButtonText = computed(() => editingOrderId.value ? "保存订单修改" : "保存订单并同步店铺库");
const orderTimeText = computed(() => form.orderTime.replace("T", " "));

function createEmptyDish(): DishForm {
  return { name: "", price: 0, rating: defaultRating, disliked: false, note: "" };
}

function resetForm() {
  image.value = "";
  rawText.value = "";
  uploadFiles.value = [];
  orderTimeValue.value = Date.now();
  Object.assign(form, {
    storeName: "",
    category: categories[0],
    mealTime: mealTimes[1] || mealTimes[0],
    orderTime: formatDateTime(orderTimeValue.value),
    total: 0,
    rating: defaultRating,
    disliked: false,
    note: ""
  });
  form.dishes = [createEmptyDish()];
}

function fillFormFromOrder(order: Order) {
  const parsedTime = new Date(order.orderTime).getTime();
  orderTimeValue.value = Number.isFinite(parsedTime) ? parsedTime : Date.now();
  Object.assign(form, {
    storeName: order.store?.name || "",
    category: order.category || order.store?.category || categories[0],
    mealTime: order.mealTime || mealTimes[1] || mealTimes[0],
    orderTime: formatDateTime(orderTimeValue.value),
    total: Number(order.total || 0),
    rating: normalizeRating(order.rating, defaultRating),
    disliked: Boolean(order.disliked),
    note: order.note || ""
  });
  const dishes = order.dishes?.length ? order.dishes : [{ name: "", price: order.total || 0, rating: order.rating || 4, disliked: false, note: "" }];
  form.dishes = dishes.map((dish) => ({
    name: dish.name || "",
    price: Number(dish.price || 0),
    rating: normalizeRating(dish.rating ?? order.rating, defaultRating),
    disliked: Boolean(dish.disliked),
    note: dish.note || ""
  }));
  image.value = order.imageUrl || "";
  rawText.value = order.rawText || "";
  uploadFiles.value = image.value ? [{ url: image.value, status: "success", message: "已选择" }] : [];
}

async function loadEditingOrder(id: string) {
  const result = await api.orders() as { orders: Order[] };
  const order = result.orders.find((item) => item.id === id);
  if (!order) {
    editingOrderId.value = "";
    uni.removeStorageSync("editingOrderId");
    resetForm();
    uni.showToast({ title: "订单不存在", icon: "none" });
    return;
  }
  editingOrderId.value = id;
  fillFormFromOrder(order);
}

async function syncEditingOrder() {
  const id = String(uni.getStorageSync("editingOrderId") || "");
  if (!id) {
    if (editingOrderId.value) {
      editingOrderId.value = "";
      resetForm();
    }
    return;
  }
  if (id !== editingOrderId.value) await loadEditingOrder(id);
}

function requestDelete(content: string, action: () => void | Promise<void>) {
  deleteDialog.content = content;
  deleteDialog.action = action;
  deleteDialog.show = true;
}

function closeDeleteDialog() {
  deleteDialog.show = false;
  deleteDialog.content = "";
  deleteDialog.action = null;
}

async function confirmDeleteAction() {
  const action = deleteDialog.action;
  closeDeleteDialog();
  if (action) await action();
}

function cancelEditing() {
  uni.removeStorageSync("editingOrderId");
  editingOrderId.value = "";
  resetForm();
  closeUploadOverlays();
  uni.setStorageSync("openMyTab", "orders");
  uni.switchTab({ url: "/pages/me/index" });
}

function resetUploadTab() {
  uni.removeStorageSync("editingOrderId");
  editingOrderId.value = "";
  resetForm();
  closeUploadOverlays();
}
function handleAfterRead(event: { file?: UploadFile | UploadFile[] }) {
  const file = Array.isArray(event.file) ? event.file[0] : event.file;
  const url = file?.url || file?.thumb || file?.path || file?.tempFilePath || "";
  if (!url) return;
  image.value = url;
  uploadFiles.value = [{ ...file, url, status: "success", message: "已选择" }];
}

function removeUpload() {
  requestDelete("确定删除已选择的订单截图吗？", () => {
    image.value = "";
    uploadFiles.value = [];
  });
}

function closeUploadOverlays() {
  picker.category = false;
  picker.mealTime = false;
  picker.orderTime = false;
  uni.pageScrollTo({ scrollTop: 0, duration: 0 });
}

function extract() {
  const parsed = parseOrderText(rawText.value);
  if (!parsed.storeName && !parsed.dishLines.length && !parsed.orderTime) {
    uni.showToast({ title: "先粘贴订单文字", icon: "none" });
    return;
  }

  if (parsed.storeName) form.storeName = parsed.storeName;
  if (parsed.orderTime) setOrderTimeFromValue(parsed.orderTime, true);
  else if (parsed.mealTime) form.mealTime = parsed.mealTime;
  if (parsed.rating) form.rating = normalizeRating(parsed.rating, form.rating);
  if (parsed.note) form.note = parsed.note;

  const dishes = parsed.dishLines.map(parseDishLine).filter((dish) => dish.name || Number(dish.price || 0) > 0);
  if (dishes.length) form.dishes = dishes;
  form.total = parsed.total ?? form.dishes.reduce((sum, item) => sum + Number(item.price || 0), 0);
  uni.showToast({ title: parsed.orderTime ? "已提取订单和时间" : "已提取订单文字", icon: "none" });
}

type ParsedOrderText = {
  storeName: string;
  dishLines: string[];
  orderTime?: string;
  mealTime?: string;
  total?: number;
  rating?: number;
  note?: string;
};

function parseOrderText(value: string): ParsedOrderText {
  const normalized = value.replace(/\r/g, "\n");
  const orderTime = extractOrderDateTime(normalized);
  const mealTime = orderTime ? inferMealTimeFromDate(new Date(orderTime).getTime()) : extractMealTime(normalized);
  const total = extractAmount(normalized);
  const rating = extractRating(normalized);
  const note = extractNote(normalized);
  const parts = normalized
    .replace(/[；;｜|]/g, "\n")
    .replace(/[，,、](?=\s*[^，,、；;｜|\n]+?\s*[¥￥]?\s*\d)/g, "\n")
    .split(/\n+/)
    .map((item) => item.trim().replace(/^[-*•]+\s*/, ""))
    .filter(Boolean);

  let storeName = "";
  const dishLines: string[] = [];
  for (const part of parts) {
    const store = extractStoreName(part);
    if (store) {
      storeName = store;
      continue;
    }
    if (isOrderMetaLine(part)) continue;
    dishLines.push(part);
  }

  if (!storeName && dishLines.length) storeName = dishLines.shift() || "";
  return { storeName, dishLines, orderTime, mealTime, total, rating, note };
}

function parseDishLine(line: string): DishForm {
  const rating = extractRating(line) || defaultRating;
  const clean = line
    .replace(/(?:评分|打分)\s*[:：]?\s*[1-5](?:\.\d)?\s*分?/g, "")
    .replace(/\s+x\s*\d+\s*$/i, "")
    .trim();
  const match = clean.match(/(.+?)\s*(?:[xX*]\s*\d+)?\s*[¥￥]?\s*(\d+(?:\.\d+)?)(?:\s*元)?\s*$/);
  return {
    name: (match?.[1] || clean).trim(),
    price: Number(match?.[2] || 0),
    rating: normalizeRating(rating, defaultRating),
    disliked: false,
    note: ""
  };
}

function extractStoreName(line: string) {
  const match = line.match(/^(?:店铺|商家|门店|店名)\s*[:：]\s*(.+)$/);
  return match?.[1]?.trim() || "";
}

function isOrderMetaLine(line: string) {
  if (/^(?:订单时间|下单时间|下单|时间|送达|取餐|用餐|时段|合计|总计|实付|金额|评分|打分|备注|评价|口味)\s*[:：]/.test(line)) return true;
  if (extractStoreName(line)) return true;
  if (extractOrderDateTime(line)) return true;
  return false;
}

function extractAmount(value: string) {
  const match = value.match(/(?:实付|合计|总计|总额|金额|支付)\s*[:：]?\s*[¥￥]?\s*(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : undefined;
}

function extractRating(value: string) {
  const match = value.match(/(?:评分|打分)\s*[:：]?\s*([1-5](?:\.\d)?)/);
  return match ? normalizeRating(match[1], defaultRating) : undefined;
}

function extractNote(value: string) {
  const match = value.match(/(?:备注|评价|口味)\s*[:：]\s*([^\n；;]+)/);
  return match?.[1]?.trim() || "";
}

function extractMealTime(value: string) {
  const match = value.match(/(早餐|午餐|下午茶|晚餐|夜宵)/);
  return match?.[1] || "";
}

function extractOrderDateTime(value: string) {
  const normalized = value.replace(/\s+/g, " ");
  const full = normalized.match(/(20\d{2})[年\/.\-](\d{1,2})[月\/.\-](\d{1,2})日?.{0,10}?(凌晨|早上|上午|中午|下午|晚上|夜宵)?\s*(\d{1,2})(?:[:：点时]\s*(\d{1,2}))?/);
  if (full) return composeDateTime(Number(full[1]), Number(full[2]), Number(full[3]), Number(full[5]), Number(full[6] || 0), full[4]);

  const now = new Date();
  const monthDay = normalized.match(/(\d{1,2})[月\/.\-](\d{1,2})日?.{0,10}?(凌晨|早上|上午|中午|下午|晚上|夜宵)?\s*(\d{1,2})(?:[:：点时]\s*(\d{1,2}))?/);
  if (monthDay) return composeDateTime(now.getFullYear(), Number(monthDay[1]), Number(monthDay[2]), Number(monthDay[4]), Number(monthDay[5] || 0), monthDay[3]);

  const timeOnly = normalized.match(/(?:订单时间|下单时间|下单|时间|送达|取餐|用餐)?\s*(凌晨|早上|上午|中午|下午|晚上|夜宵)?\s*(\d{1,2})\s*[:：点时]\s*(\d{1,2})?/);
  if (timeOnly) return composeDateTime(now.getFullYear(), now.getMonth() + 1, now.getDate(), Number(timeOnly[2]), Number(timeOnly[3] || 0), timeOnly[1]);

  return "";
}

function composeDateTime(year: number, month: number, day: number, hour: number, minute: number, period?: string) {
  let nextHour = hour;
  if ((period === "下午" || period === "晚上" || period === "夜宵") && nextHour < 12) nextHour += 12;
  if (period === "中午" && nextHour < 11) nextHour += 12;
  if (period === "凌晨" && nextHour === 12) nextHour = 0;
  const date = new Date(year, month - 1, day, nextHour, minute || 0);
  return formatDateTime(date.getTime());
}

function addDish() {
  form.dishes.push(createEmptyDish());
}

function removeDish(index: number) {
  requestDelete("确定移除这个菜品吗？", () => {
    form.dishes.splice(index, 1);
  });
}

function confirmCategory(event: { value?: string[]; indexs?: number[] }) {
  form.category = getPickerValue(event, categories);
  picker.category = false;
}

function confirmMealTime(event: { value?: string[]; indexs?: number[] }) {
  form.mealTime = getPickerValue(event, mealTimes);
  picker.mealTime = false;
}
function confirmOrderTime(event: { value?: number | string }) {
  const value = Number(event.value || orderTimeValue.value || Date.now());
  setOrderTimeFromValue(value, true);
  picker.orderTime = false;
}

function getPickerValue(event: { value?: unknown[]; indexs?: number[] }, fallback: string[]) {
  const selected = event.value?.[0];
  if (typeof selected === "string") return selected;
  const index = event.indexs?.[0] || 0;
  return fallback[index] || fallback[0];
}
function normalizeRating(value: number | string | undefined, fallback = defaultRating) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(5, Math.max(0.5, Math.round(parsed * 2) / 2));
}

function formatRating(value: number | string | undefined) {
  return normalizeRating(value).toFixed(1);
}

function inferMealTimeFromDate(value: number | string) {
  const date = coerceDate(value);
  const hour = date.getHours();
  if (hour >= 5 && hour < 10) return mealTimes[0];
  if (hour >= 10 && hour < 14) return mealTimes[1];
  if (hour >= 14 && hour < 17) return mealTimes[2];
  if (hour >= 17 && hour < 22) return mealTimes[3];
  return mealTimes[4];
}

function setOrderTimeFromValue(value: number | string, syncMealTime = true) {
  const date = coerceDate(value);
  const time = date.getTime();
  if (!Number.isFinite(time)) return;
  orderTimeValue.value = time;
  form.orderTime = formatDateTime(time);
  if (syncMealTime) form.mealTime = inferMealTimeFromDate(time);
}

function coerceDate(value: number | string) {
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isFinite(numeric)) return new Date(numeric);
  return new Date(String(value).replace(/\//g, "-").replace(" ", "T"));
}

function formatDateTime(value: number | string) {
  const date = coerceDate(value);
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
  const pad = (item: number) => String(item).padStart(2, "0");
  return safeDate.getFullYear() + "-" + pad(safeDate.getMonth() + 1) + "-" + pad(safeDate.getDate()) + "T" + pad(safeDate.getHours()) + ":" + pad(safeDate.getMinutes());
}

function buildPayload() {
  const dishes = form.dishes
    .map((dish) => ({
      name: dish.name.trim(),
      price: Number(dish.price || 0),
      rating: normalizeRating(dish.rating, form.rating),
      disliked: Boolean(dish.disliked),
      note: dish.note
    }))
    .filter((dish) => dish.name || dish.price > 0);

  return {
    storeName: form.storeName.trim(),
    category: form.category,
    mealTime: form.mealTime,
    orderTime: form.orderTime,
    total: Number(form.total || 0),
    rating: normalizeRating(form.rating, defaultRating),
    disliked: Boolean(form.disliked),
    note: form.note.trim(),
    rawText: rawText.value.trim(),
    imageUrl: image.value,
    dishes: dishes.length ? dishes : [{ name: "未命名菜品", price: Number(form.total || 0), rating: normalizeRating(form.rating, defaultRating), disliked: false, note: "" }]
  };
}

function orderCreateToast(result: OrderCreateResult) {
  const storeCreated = Boolean(result.createdSummary?.storeCreated || result.createdStore);
  const dishCount = result.createdSummary?.dishCount ?? result.createdDishes?.length ?? 0;
  if (storeCreated && dishCount > 0) return "新增店铺和" + dishCount + "个菜品";
  if (storeCreated) return "新增店铺";
  if (dishCount > 0) return "新增" + dishCount + "个菜品";
  return "已保存订单";
}
function createdCatalogItems(result: OrderCreateResult) {
  const dishCount = result.createdSummary?.dishCount ?? result.createdDishes?.length ?? 0;
  return Boolean(result.createdSummary?.storeCreated || result.createdStore || dishCount > 0);
}
async function save() {
  const payload = buildPayload();
  if (!payload.storeName) {
    uni.showToast({ title: "请填写店铺名称", icon: "none" });
    return;
  }
  let targetTab = "orders";
  if (editingOrderId.value) {
    const result = await api.updateOrder(editingOrderId.value, payload) as OrderCreateResult;
    uni.removeStorageSync("editingOrderId");
    editingOrderId.value = "";
    uni.showToast({ title: orderCreateToast(result) || "已更新" });
    if (createdCatalogItems(result)) targetTab = "stores";
  } else {
    const result = await api.createOrder(payload);
    uni.showToast({ title: orderCreateToast(result) });
    if (createdCatalogItems(result)) targetTab = "stores";
  }
  resetForm();
  uni.setStorageSync("openMyTab", targetTab);
  uni.switchTab({ url: "/pages/me/index" });
}
onShow(syncEditingOrder);
onTabItemTap(resetUploadTab);
</script>

<style scoped>
.upload-page {
  display: grid;
  gap: 22rpx;
  padding-bottom: 42rpx;
}

.hero-panel,
.panel {
  border: 1rpx solid rgba(216, 102, 147, 0.16);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18rpx 42rpx rgba(216, 102, 147, 0.12);
}

.hero-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  position: relative;
  padding: 30rpx;
  background: linear-gradient(135deg, #ffd8e6 0%, #f8fffb 52%, #caf7dc 100%);
}

.hero-panel::after {
  content: "";
  position: absolute;
  right: 130rpx;
  top: 28rpx;
  width: 54rpx;
  height: 54rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 50%;
}

.eyebrow,
.panel-subtitle {
  display: block;
  color: #8d7281;
  font-size: 22rpx;
  font-weight: 800;
}

.hero-title {
  display: block;
  margin-top: 8rpx;
  color: #513d4a;
  font-size: 48rpx;
  font-weight: 950;
}

.hero-copy {
  display: block;
  margin-top: 10rpx;
  color: #7b6874;
  font-size: 25rpx;
  line-height: 1.5;
}

.hero-badge {
  display: grid;
  place-items: center;
  flex: 0 0 120rpx;
  width: 120rpx;
  height: 120rpx;
  border: 6rpx solid #ffffff;
  border-radius: 44rpx;
  background: #8ee6b8;
  color: #ffffff;
  font-size: 24rpx;
  font-weight: 950;
  transform: rotate(8deg);
}

.panel {
  padding: 26rpx;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-bottom: 20rpx;
}

.panel-title {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 64rpx;
  border-radius: 999rpx;
  background: linear-gradient(135deg, rgba(255, 228, 239, 0.96), rgba(226, 251, 233, 0.96));
  padding: 0 24rpx 0 68rpx;
  color: #513d4a;
  font-size: 36rpx;
  font-weight: 950;
  box-shadow: 0 10rpx 24rpx rgba(216, 102, 147, 0.12);
}

.panel-title::before {
  content: "";
  position: absolute;
  left: 22rpx;
  top: 50%;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: #d86693;
  box-shadow: 24rpx 0 0 #8ee6b8;
  transform: translateY(-50%);
}

.upload-panel {
  display: grid;
  gap: 18rpx;
}

.raw-input-card {
  display: grid;
  gap: 14rpx;
  border: 1rpx solid rgba(216, 102, 147, 0.22);
  border-radius: 26rpx;
  background: linear-gradient(135deg, rgba(255, 247, 251, 0.98), rgba(242, 255, 247, 0.9));
  padding: 18rpx;
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.76), 0 12rpx 28rpx rgba(216, 102, 147, 0.08);
}

.raw-input-head {
  display: grid;
  gap: 6rpx;
}

.raw-input-title {
  color: #513d4a;
  font-size: 28rpx;
  font-weight: 950;
}

.raw-input-hint {
  color: #7e978b;
  font-size: 22rpx;
  font-weight: 800;
  line-height: 1.45;
}

.raw-input-card :deep(.u-textarea) {
  border: 2rpx solid rgba(216, 102, 147, 0.24) !important;
  background: rgba(255, 252, 254, 0.98) !important;
  box-shadow: 0 8rpx 22rpx rgba(216, 102, 147, 0.08), inset 0 0 0 1rpx rgba(255, 255, 255, 0.84) !important;
}

.dish-note-item {
  margin-top: 18rpx;
}


.text-order-example {
  display: flex;
  align-items: flex-start;
  gap: 12rpx;
  border: 1rpx dashed rgba(216, 102, 147, 0.22);
  border-radius: 22rpx;
  background: linear-gradient(135deg, rgba(255, 242, 248, 0.92), rgba(237, 255, 245, 0.9));
  padding: 16rpx 18rpx;
}

.example-label {
  flex: 0 0 auto;
  border-radius: 999rpx;
  background: rgba(216, 102, 147, 0.1);
  padding: 3rpx 10rpx;
  color: #d86693;
  font-size: 19rpx;
  font-weight: 700;
  line-height: 1.35;
}

.example-copy {
  min-width: 0;
  color: #6f5e6b;
  font-size: 21rpx;
  font-weight: 500;
  line-height: 1.55;
}

.form-grid,
.dish-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0;
  width: 100%;
}

.dish-grid {
  gap: 18rpx;
}

.dish-form-item {
  display: grid;
  gap: 10rpx;
  width: 100%;
}

.dish-form-label {
  color: #715869;
  font-size: 25rpx;
  font-weight: 900;
}

.dish-rate-field {
  justify-content: space-between;
}

.dish-action-btn {
  flex: 0 0 auto;
}

.dish-add-btn,
.dish-remove-btn {
  box-shadow: 0 8rpx 20rpx rgba(216, 102, 147, 0.14);
}

.rate-field,
.switch-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  width: 100%;
  height: 92rpx;
  min-height: 92rpx;
  box-sizing: border-box;
  border-radius: 24rpx;
  background: #fff9fc;
  padding: 0 22rpx;
  box-shadow: inset 0 0 0 1rpx rgba(216, 102, 147, 0.1);
}

.rate-text,
.switch-field text {
  color: #7e6c7a;
  font-size: 24rpx;
  font-weight: 800;
}

.dishes-panel {
  display: grid;
  gap: 18rpx;
}

.dish-card {
  border: 1rpx solid rgba(172, 225, 196, 0.72);
  border-radius: 28rpx;
  background: linear-gradient(135deg, #fff7fb 0%, #f2fff7 100%);
  padding: 18rpx;
  box-shadow: 0 12rpx 30rpx rgba(95, 159, 124, 0.08), inset 0 0 0 1rpx rgba(255, 255, 255, 0.72);
}

.dish-title {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12rpx;
  min-height: 58rpx;
  margin-bottom: 16rpx;
  padding: 4rpx 0;
}

.dish-title::before {
  content: "";
  flex: 0 0 auto;
  width: 10rpx;
  height: 34rpx;
  border-radius: 999rpx;
  background: linear-gradient(180deg, #d86693, #8ee6b8);
}

.dish-title > text,
.dish-title > uni-text {
  display: inline-flex;
  flex: 1 1 auto;
  min-width: 0;
  align-items: center;
  background: transparent;
  padding: 0;
  color: #5d3753;
  font-size: 32rpx;
  font-weight: 950;
}

.picker-cell,
.time-cell {
  width: 100%;
  height: 92rpx;
  min-height: 92rpx;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 24rpx;
  background: #fff9fc;
  box-shadow: inset 0 0 0 1rpx rgba(216, 102, 147, 0.1);
}

:deep(.picker-cell .u-cell__body),
:deep(.time-cell .u-cell__body) {
  width: 100%;
  height: 92rpx;
  min-height: 92rpx;
  box-sizing: border-box;
  padding: 0 22rpx;
}

:deep(.picker-cell .u-cell__title-text),
:deep(.time-cell .u-cell__title-text) {
  color: #513d4a;
  font-weight: 800;
}
:deep(.u-form-item) {
  width: 100%;
}

:deep(.u-form-item__body) {
  width: 100%;
  padding: 6rpx 0 20rpx;
}

:deep(.u-form-item__body__left) {
  width: 100%;
  margin-bottom: 10rpx;
}

:deep(.u-form-item__body__right),
:deep(.u-form-item__body__right__content),
:deep(.u-form-item__body__right__content__slot) {
  width: 100%;
  min-width: 0;
}

:deep(.u-form-item__body__left__content__label),
:deep(.u-form-item__body__left__content) {
  color: #715869;
  font-size: 25rpx;
  font-weight: 900;
}

:deep(.u-input),
:deep(.u-textarea) {
  width: 100% !important;
  box-sizing: border-box;
  border-radius: 24rpx !important;
  background: #fff9fc !important;
  box-shadow: inset 0 0 0 1rpx rgba(216, 102, 147, 0.1);
}

:deep(.u-input) {
  height: 92rpx !important;
  min-height: 92rpx;
}

:deep(.u-input__content),
:deep(.u-input__content__field-wrapper),
:deep(.u-input__content__field-wrapper__field) {
  height: 92rpx !important;
  min-height: 92rpx;
  line-height: 92rpx !important;
}

.upload-page :deep(.u-form-item__body__left),
.upload-page :deep(.u-form-item__body__left__content),
.upload-page :deep(.u-form-item__body__left__content__label),
.upload-page :deep(.u-form-item__body__left text),
.upload-page :deep(.u-form-item__body__left uni-text) {
  color: #4b3544 !important;
  -webkit-text-fill-color: #4b3544 !important;
  opacity: 1 !important;
}

.upload-page :deep(.u-input),
.upload-page :deep(.u-textarea),
.upload-page :deep(.u-input__content),
.upload-page :deep(.u-input__content__field-wrapper),
.upload-page :deep(.u-input__content__field-wrapper__field),
.upload-page :deep(.u-textarea__field),
.upload-page :deep(input),
.upload-page :deep(textarea) {
  color: #24352d !important;
  -webkit-text-fill-color: #24352d !important;
  opacity: 1 !important;
  caret-color: #d86693;
}

.upload-page :deep(.input-placeholder),
.upload-page :deep(.textarea-placeholder),
.upload-page :deep(input::placeholder),
.upload-page :deep(textarea::placeholder) {
  color: #8d7281 !important;
  -webkit-text-fill-color: #8d7281 !important;
  opacity: 1 !important;
}

.upload-page :deep(.picker-cell .u-cell__title-text),
.upload-page :deep(.time-cell .u-cell__title-text),
.upload-page :deep(.picker-cell .u-cell__title text),
.upload-page :deep(.time-cell .u-cell__title text) {
  color: #24352d !important;
  -webkit-text-fill-color: #24352d !important;
  opacity: 1 !important;
  font-weight: 900 !important;
}

.upload-page :deep(.u-upload__button__text),
.upload-page :deep(.u-upload__button text),
.upload-page :deep(.u-upload uni-text) {
  color: #5d3753 !important;
  -webkit-text-fill-color: #5d3753 !important;
  opacity: 1 !important;
  font-weight: 900 !important;
}

.panel-head :deep(.u-button),
.dish-title :deep(.u-button) {
  flex: 0 0 auto;
  min-width: 0 !important;
}

:deep(.u-upload__button) {
  border-radius: 28rpx !important;
  background: linear-gradient(135deg, #fff2f8 0%, #edfff5 100%) !important;
}

:deep(.u-upload__wrap__preview) {
  border-radius: 28rpx !important;
  overflow: hidden;
}
</style>
