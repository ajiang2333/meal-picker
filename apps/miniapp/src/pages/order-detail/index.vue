<template>
  <view class="page tab-page order-detail-page">
    <view class="app-nav">
      <view class="app-nav-left">
        <view class="app-nav-back" @tap="goBack">
          <uni-icons type="left" size="22" color="#d86693" />
        </view>
      </view>
      <text class="app-nav-title">订单详情</text>
      <view class="app-nav-right" />
    </view>

    <view v-if="loading && !order" class="detail-skeleton">
      <view class="skeleton-hero card">
        <u-loading-icon color="#d86693" size="28" />
        <view class="skeleton-lines">
          <view class="skeleton-line strong" />
          <view class="skeleton-line" />
        </view>
      </view>
      <view class="skeleton-grid">
        <view v-for="item in 4" :key="item" class="skeleton-metric" />
      </view>
      <view class="skeleton-list">
        <view v-for="item in 3" :key="item" class="skeleton-row" />
      </view>
    </view>

    <view v-else-if="!order" class="empty-panel card">
      <u-empty mode="data" text="订单不存在或已被删除" />
      <text class="empty-hint">返回我的订单后，可以查看最新订单记录。</text>
      <u-button text="返回我的订单" shape="circle" color="linear-gradient(135deg, #ff98bd, #8ee6b8)" custom-style="width: 260rpx; height: 76rpx; margin: 20rpx auto 0; font-weight: 900;" @click="goBackToOrders" />
    </view>

    <template v-else>
      <view class="order-hero card">
        <view class="hero-topline">
          <text class="hero-kicker">READ ONLY ORDER</text>
          <text class="hero-time">{{ formatDisplayTime(order.orderTime) }}</text>
        </view>
        <view class="hero-main">
          <view>
            <text class="store-name">{{ order.store.name }}</text>
            <text class="hero-note">{{ order.note || '这单还没有写订单评价' }}</text>
          </view>
          <view class="total-badge">
            <text>实付</text>
            <text>¥{{ formatAmount(order.total) }}</text>
          </view>
        </view>
      </view>

      <view class="metric-grid">
        <view class="metric">
          <text>{{ order.category || '未分类' }}</text>
          <text>外卖种类</text>
        </view>
        <view class="metric">
          <text>{{ order.mealTime || '未标记' }}</text>
          <text>用餐时段</text>
        </view>
        <view class="metric">
          <text>{{ formatRating(order.rating) }}分</text>
          <text>订单评分</text>
        </view>
        <view :class="['metric', { warning: order.disliked }]">
          <text>{{ order.disliked ? '是' : '否' }}</text>
          <text>是否不再推荐</text>
        </view>
      </view>

      <view v-if="order.imageUrl" class="panel card image-panel">
        <view class="panel-head">
          <text class="panel-title">订单截图</text>
          <text class="panel-subtitle">点击可预览原图</text>
        </view>
        <image class="order-image" :src="order.imageUrl" mode="aspectFill" @tap="previewImage(order.imageUrl)" />
      </view>

      <view class="panel card">
        <view class="panel-head">
          <text class="panel-title">订单信息</text>
          <text class="panel-subtitle">只读查看，编辑需二次确认</text>
        </view>
        <view class="info-list">
          <view class="info-row">
            <text>店铺名称</text>
            <text>{{ order.store.name }}</text>
          </view>
          <view class="info-row">
            <text>订单时间</text>
            <text>{{ formatDisplayTime(order.orderTime) }}</text>
          </view>
          <view class="info-row">
            <text>外卖种类</text>
            <text>{{ order.category || '-' }}</text>
          </view>
          <view class="info-row">
            <text>用餐时段</text>
            <text>{{ order.mealTime || '-' }}</text>
          </view>
          <view class="info-row">
            <text>实付金额</text>
            <text class="amount">¥{{ formatAmount(order.total) }}</text>
          </view>
          <view v-if="hasDeliveryFee" class="info-row">
            <text>配送费</text>
            <text>¥{{ formatAmount(order.deliveryFee || 0) }}</text>
          </view>
          <view class="info-row">
            <text>订单评分</text>
            <text>{{ formatRating(order.rating) }}分</text>
          </view>
          <view class="info-row">
            <text>是否不再推荐</text>
            <text :class="order.disliked ? 'danger-text' : 'safe-text'">{{ order.disliked ? '是' : '否' }}</text>
          </view>
        </view>
        <view class="readonly-note">
          <text class="readonly-label">订单评价</text>
          <text>{{ order.note || '暂无订单评价' }}</text>
        </view>
      </view>

      <view class="panel card">
        <view class="panel-head">
          <text class="panel-title">菜品明细</text>
          <text class="panel-subtitle">共 {{ order.dishes.length }} 个菜品</text>
        </view>
        <u-list v-if="order.dishes.length" class="spring-list dish-list" :scrollable="false" custom-style="height: auto;">
          <u-list-item v-for="(dish, index) in order.dishes" :key="dish.name + index">
            <view class="dish-card">
              <view class="dish-head">
                <view class="dish-index">{{ index + 1 }}</view>
                <view class="dish-title-block">
                  <text class="dish-name">{{ dish.name || '未命名菜品' }}</text>
                  <text class="dish-note">{{ dish.note || '暂无菜品评价' }}</text>
                </view>
                <text class="dish-price">¥{{ formatAmount(dish.price) }}</text>
              </view>
              <view class="dish-meta">
                <text>{{ formatRating(dish.rating ?? order.rating) }}分</text>
                <text :class="dish.disliked ? 'danger-chip' : 'safe-chip'">{{ dish.disliked ? '不再推荐' : '可继续推荐' }}</text>
              </view>
            </view>
          </u-list-item>
        </u-list>
        <view v-else class="empty-inline">暂无菜品明细</view>
      </view>

      <view v-if="order.rawText" class="panel card raw-panel">
        <view class="panel-head">
          <text class="panel-title">原始订单文字</text>
          <text class="panel-subtitle">用于回看当时粘贴的内容</text>
        </view>
        <text class="raw-text">{{ order.rawText }}</text>
      </view>

      <view class="edit-panel card">
        <view>
          <text class="edit-title">需要修改历史订单？</text>
          <text class="edit-copy">编辑会影响统计、复购、评分和推荐结果，请确认后再继续。</text>
        </view>
        <u-button text="谨慎编辑订单" shape="circle" color="#ffe4ef" custom-style="width: 240rpx; height: 72rpx; margin: 0; color: #d86693; font-weight: 950;" @click="confirmEdit.show = true" />
      </view>
    </template>

    <u-modal
      :show="confirmEdit.show"
      title="确认编辑历史订单？"
      content="编辑历史订单会影响消费统计、复购、评分和推荐结果，确认继续吗？"
      show-cancel-button
      confirm-text="继续编辑"
      cancel-text="先不改"
      confirm-color="#d86693"
      @confirm="editOrder"
      @cancel="confirmEdit.show = false"
      @close="confirmEdit.show = false"
    />
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { computed, reactive, ref } from "vue";
import { api } from "@/api/client";
import type { Order } from "@/types";

const orderId = ref("");
const order = ref<Order | null>(null);
const loading = ref(true);
const confirmEdit = reactive({ show: false });

const hasDeliveryFee = computed(() => {
  const value = Number(order.value?.deliveryFee || 0);
  return Number.isFinite(value) && value > 0;
});

onLoad(async (query) => {
  orderId.value = String(query?.id || "");
  await loadOrder();
});

async function loadOrder() {
  if (!orderId.value) {
    order.value = null;
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const result = await api.orders() as { orders: Order[] };
    order.value = result.orders.find((item) => item.id === orderId.value) || null;
  } finally {
    loading.value = false;
  }
}

function formatDisplayTime(value?: string) {
  return String(value || "")
    .replace("T", " ")
    .replace(/.d+Z$/, "")
    .replace(/([+-]d{2}:?d{2}|Z)$/, "")
    .slice(0, 16) || "-";
}

function formatAmount(value: number | string | undefined) {
  return Number(value || 0).toFixed(2).replace(/.00$/, "");
}

function formatRating(value: number | string | undefined) {
  const parsed = Number(value || 0);
  if (!Number.isFinite(parsed)) return "0.0";
  return parsed.toFixed(1);
}

function previewImage(url?: string) {
  if (!url) return;
  uni.previewImage({ urls: [url], current: url });
}

function goBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    uni.navigateBack();
    return;
  }
  goBackToOrders();
}

function goBackToOrders() {
  uni.setStorageSync("openMyTab", "orders");
  uni.switchTab({ url: "/pages/me/index" });
}

function editOrder() {
  confirmEdit.show = false;
  if (!order.value) return;
  uni.setStorageSync("editingOrderId", order.value.id);
  uni.switchTab({ url: "/pages/upload/index" });
}
</script>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  padding-bottom: calc(40rpx + env(safe-area-inset-bottom));
  background: linear-gradient(180deg, #fff2f8 0%, #f1fff7 48%, #fff9fc 100%);
}

.detail-skeleton,
.empty-panel,
.order-hero,
.metric-grid,
.panel,
.edit-panel {
  margin: 0 24rpx 22rpx;
}

.detail-skeleton {
  display: grid;
  gap: 20rpx;
}

.skeleton-hero {
  display: flex;
  align-items: center;
  gap: 22rpx;
  min-height: 170rpx;
  border-color: rgba(255, 190, 214, 0.72);
  background: rgba(255, 255, 255, 0.76);
}

.skeleton-lines {
  flex: 1;
  display: grid;
  gap: 18rpx;
}

.skeleton-line,
.skeleton-metric,
.skeleton-row {
  overflow: hidden;
  border-radius: 999rpx;
  background: linear-gradient(90deg, rgba(255, 228, 239, 0.72), rgba(226, 251, 233, 0.86), rgba(255, 228, 239, 0.72));
  background-size: 220% 100%;
  animation: shimmer 1.35s linear infinite;
}

.skeleton-line {
  width: 72%;
  height: 28rpx;
}

.skeleton-line.strong {
  width: 46%;
  height: 36rpx;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.skeleton-metric {
  height: 112rpx;
  border-radius: 24rpx;
}

.skeleton-list {
  display: grid;
  gap: 16rpx;
}

.skeleton-row {
  height: 126rpx;
  border-radius: 26rpx;
}

.empty-panel {
  display: grid;
  place-items: center;
  min-height: 520rpx;
  border-color: rgba(255, 190, 214, 0.72);
  background: rgba(255, 255, 255, 0.82);
}

.empty-hint {
  color: #7e978b;
  font-size: 24rpx;
  font-weight: 700;
}

.order-hero {
  position: relative;
  overflow: hidden;
  border-color: rgba(255, 190, 214, 0.82);
  border-radius: 32rpx;
  background: linear-gradient(135deg, rgba(255, 228, 239, 0.95), rgba(237, 255, 245, 0.95));
  box-shadow: 0 20rpx 45rpx rgba(216, 102, 147, 0.14);
}

.order-hero::after {
  position: absolute;
  right: -70rpx;
  top: -80rpx;
  width: 220rpx;
  height: 220rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.48);
  content: "";
}

.hero-topline,
.hero-main,
.panel-head,
.info-row,
.dish-head,
.edit-panel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.hero-kicker,
.panel-subtitle,
.edit-copy {
  color: #7e978b;
  font-size: 22rpx;
  font-weight: 800;
}

.hero-time {
  position: relative;
  z-index: 1;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  color: #4f7b67;
  font-size: 23rpx;
  font-weight: 900;
  padding: 8rpx 14rpx;
}

.hero-main {
  position: relative;
  z-index: 1;
  align-items: flex-end;
  margin-top: 24rpx;
}

.store-name {
  display: block;
  color: #24352d;
  font-size: 42rpx;
  font-weight: 950;
  line-height: 1.25;
}

.hero-note {
  display: block;
  margin-top: 12rpx;
  color: #5b7569;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 1.5;
}

.total-badge {
  display: grid;
  place-items: center;
  min-width: 150rpx;
  min-height: 132rpx;
  border: 2rpx solid rgba(255, 255, 255, 0.72);
  border-radius: 34rpx;
  background: rgba(255, 255, 255, 0.76);
  color: #d86693;
  box-shadow: inset 0 0 0 1rpx rgba(216, 102, 147, 0.08);
}

.total-badge text:first-child {
  color: #7e978b;
  font-size: 22rpx;
  font-weight: 800;
}

.total-badge text:last-child {
  font-size: 34rpx;
  font-weight: 950;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.metric {
  display: grid;
  gap: 8rpx;
  min-height: 118rpx;
  place-items: center;
  border: 1rpx solid rgba(172, 225, 196, 0.82);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 12rpx 30rpx rgba(95, 159, 124, 0.08);
}

.metric.warning {
  border-color: rgba(255, 190, 214, 0.9);
  background: rgba(255, 241, 247, 0.9);
}

.metric text:first-child {
  max-width: 260rpx;
  overflow: hidden;
  color: #24352d;
  font-size: 30rpx;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metric text:last-child {
  color: #7e978b;
  font-size: 22rpx;
  font-weight: 800;
}

.panel {
  border-color: rgba(172, 225, 196, 0.82);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 14rpx 35rpx rgba(95, 159, 124, 0.08);
}

.panel-head {
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.panel-title,
.edit-title {
  color: #24352d;
  font-size: 30rpx;
  font-weight: 950;
}

.panel-subtitle,
.edit-copy {
  display: block;
  margin-top: 6rpx;
}

.order-image {
  width: 100%;
  height: 340rpx;
  border-radius: 24rpx;
  background: #fff2f8;
}

.info-list {
  display: grid;
  gap: 2rpx;
  overflow: hidden;
  border: 1rpx solid rgba(226, 251, 233, 0.9);
  border-radius: 24rpx;
}

.info-row {
  min-height: 74rpx;
  padding: 0 18rpx;
  background: rgba(241, 255, 247, 0.56);
}

.info-row:nth-child(even) {
  background: rgba(255, 242, 248, 0.58);
}

.info-row text:first-child {
  flex-shrink: 0;
  color: #7e978b;
  font-size: 24rpx;
  font-weight: 800;
}

.info-row text:last-child {
  min-width: 0;
  color: #24352d;
  font-size: 25rpx;
  font-weight: 900;
  text-align: right;
  overflow-wrap: anywhere;
}

.info-row .amount,
.danger-text {
  color: #d86693 !important;
}

.safe-text {
  color: #4f9c72 !important;
}

.readonly-note {
  display: grid;
  gap: 10rpx;
  margin-top: 18rpx;
  border-radius: 24rpx;
  background: #fff7fb;
  color: #5b7569;
  font-size: 25rpx;
  font-weight: 700;
  line-height: 1.55;
  padding: 18rpx;
}

.readonly-label {
  color: #d86693;
  font-size: 24rpx;
  font-weight: 950;
}

.spring-list :deep(.u-list),
.spring-list :deep(.u-list-item) {
  background: transparent !important;
}

.dish-list {
  display: block !important;
  height: auto !important;
}

.dish-card {
  margin-bottom: 16rpx;
  border: 1rpx solid rgba(255, 190, 214, 0.65);
  border-radius: 26rpx;
  background: linear-gradient(135deg, #fff7fb, #f4fff8);
  padding: 18rpx;
}

.dish-head {
  align-items: flex-start;
}

.dish-index {
  display: grid;
  place-items: center;
  width: 54rpx;
  height: 54rpx;
  flex-shrink: 0;
  border-radius: 18rpx;
  background: #ffe4ef;
  color: #d86693;
  font-size: 26rpx;
  font-weight: 950;
}

.dish-title-block {
  flex: 1;
  min-width: 0;
}

.dish-name {
  display: block;
  color: #24352d;
  font-size: 28rpx;
  font-weight: 950;
  line-height: 1.35;
}

.dish-note {
  display: block;
  margin-top: 8rpx;
  color: #5b7569;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.45;
}

.dish-price {
  color: #d86693;
  font-size: 27rpx;
  font-weight: 950;
}

.dish-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 14rpx;
  padding-left: 70rpx;
}

.dish-meta text,
.safe-chip,
.danger-chip {
  display: inline-flex;
  align-items: center;
  min-height: 40rpx;
  border-radius: 999rpx;
  background: #e2fbe9;
  color: #4f7b67;
  font-size: 22rpx;
  font-weight: 900;
  padding: 0 14rpx;
}

.danger-chip {
  background: #ffe4ef;
  color: #d86693;
}

.empty-inline {
  display: grid;
  place-items: center;
  min-height: 120rpx;
  border: 1rpx dashed rgba(172, 225, 196, 0.9);
  border-radius: 24rpx;
  color: #7e978b;
  font-size: 24rpx;
  font-weight: 800;
}

.raw-text {
  display: block;
  max-height: 360rpx;
  overflow: auto;
  border-radius: 24rpx;
  background: #f6fff9;
  color: #4e685c;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.65;
  padding: 18rpx;
  white-space: pre-wrap;
}

.edit-panel {
  border-color: rgba(255, 190, 214, 0.82);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.88);
}

.edit-panel > view {
  flex: 1;
  min-width: 0;
}

@keyframes shimmer {
  0% { background-position: 0% 50%; }
  100% { background-position: 220% 50%; }
}
</style>
