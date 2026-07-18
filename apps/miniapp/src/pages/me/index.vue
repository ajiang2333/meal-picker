<template>
  <view :class="['page', 'tab-page', 'my-page', { 'my-page--detail': tab !== 'menu' }]">
    <view class="app-nav">
      <view class="app-nav-left">
        <view v-if="tab !== 'menu'" class="app-nav-back" @tap="tab = 'menu'">
          <uni-icons type="left" size="22" color="#d86693" />
        </view>
      </view>
      <text class="app-nav-title">{{ tab === 'menu' ? '我的' : tabTitle }}</text>
      <view class="app-nav-right" />
    </view>
    <view v-if="tab === 'menu'" class="profile">
      <view class="avatar">{{ session.nickname.slice(0, 1) || "用" }}</view>
      <view class="profile-main">
        <text class="profile-kicker">SPRING USER FILE</text>
        <text class="name">{{ session.nickname }}</text>
        <text class="muted">当前登录用户 · 粉绿外卖宇宙观察员</text>
      </view>
      <view class="profile-orb" />
    </view>
    <view v-if="tab === 'menu'" class="profile-stats">
      <view class="stat-card">
        <text>{{ orders.length }}</text>
        <text>订单</text>
      </view>
      <view class="stat-card">
        <text>{{ reviews.length }}</text>
        <text>评价</text>
      </view>
      <view class="stat-card">
        <text>¥{{ totalSpent.toFixed(0) }}</text>
        <text>本期投喂</text>
      </view>
    </view>
    <u-list v-if="tab === 'menu'" class="menu-list spring-list page-flow-list" :scrollable="false" custom-style="height: auto;">
      <u-list-item>
        <view class="menu-row" @tap="tab = 'orders'">
          <view class="menu-left"><view class="icon-bubble"><uni-icons type="list" size="20" color="#d86693" /></view><view><text>我的订单</text><text class="menu-sub">看看最近吃了什么</text></view></view>
          <view class="menu-right"><text>{{ orders.length }} 条</text><uni-icons type="arrowright" size="16" color="#d86693" /></view>
        </view>
      </u-list-item>
      <u-list-item>
        <view class="menu-row" @tap="tab = 'reviews'">
          <view class="menu-left"><view class="icon-bubble mint"><uni-icons type="chat" size="20" color="#4f9c72" /></view><view><text>我的评价</text><text class="menu-sub">留下你的口味星标</text></view></view>
          <view class="menu-right"><text>{{ reviews.length }} 条</text><uni-icons type="arrowright" size="16" color="#d86693" /></view>
        </view>
      </u-list-item>
      <u-list-item>
        <view class="menu-row" @tap="tab = 'stats'">
          <view class="menu-left"><view class="icon-bubble"><uni-icons type="bars" size="20" color="#d86693" /></view><view><text>外卖统计</text><text class="menu-sub">投喂轨迹和偏好</text></view></view>
          <view class="menu-right"><text>图表</text><uni-icons type="arrowright" size="16" color="#d86693" /></view>
        </view>
      </u-list-item>
      <u-list-item>
        <view class="menu-row" @tap="openTab('randoms')">
          <view class="menu-left"><view class="icon-bubble mint"><uni-icons type="refresh" size="20" color="#4f9c72" /></view><view><text>抽选记录</text><text class="menu-sub">星盘抽中过谁</text></view></view>
          <view class="menu-right"><text>{{ randomTotal }} 条</text><uni-icons type="arrowright" size="16" color="#d86693" /></view>
        </view>
      </u-list-item>
      <u-list-item>
        <view class="menu-row" @tap="openTab('stores')">
          <view class="menu-left"><view class="icon-bubble"><uni-icons type="home" size="20" color="#d86693" /></view><view><text>我维护的店铺</text><text class="menu-sub">共建店铺资料</text></view></view>
          <view class="menu-right"><text>{{ maintainedStores.length }} 家</text><uni-icons type="arrowright" size="16" color="#d86693" /></view>
        </view>
      </u-list-item>
    </u-list>
    <view v-if="tab === 'orders' && loading && !orders.length" class="list-loading-panel">
      <view v-for="item in 3" :key="item" class="list-skeleton-card">
        <view class="skeleton-line strong" />
        <view class="skeleton-chip-row"><view /><view /></view>
        <view class="skeleton-line" />
      </view>
    </view>
    <view v-else-if="tab === 'orders' && !visibleOrders.length" class="empty-panel">
      <u-empty mode="data" text="还没有订单记录" />
      <text class="empty-hint">上传订单后，这里会记录你的外卖足迹。</text>
    </view>
    <u-list v-else-if="tab === 'orders'" class="detail-scroll spring-list page-flow-list" :scrollable="false" custom-style="height: auto;">
      <u-list-item v-for="order in visibleOrders" :key="order.id">
        <view class="card list-card clickable-card" @tap="openOrder(order.id)">
          <view class="row"><text class="strong">{{ order.store.name }}</text><text class="score">{{ order.rating }}分</text></view>
          <view class="order-meta">
            <text class="time-pill">{{ formatDisplayTime(order.orderTime) }}</text>
            <text class="amount-pill">¥{{ formatAmount(order.total) }}</text>
          </view>
          <text class="order-note">{{ order.note || '这单还没有备注' }}</text>
          <view class="actions single-action">
            <view class="action-hit" @tap.stop="deleteOrder(order.id)"><u-button text="删除" size="mini" shape="circle" color="#ffe4ef" custom-style="width: 58px; height: 28px; margin: 0; color: #d86693; font-weight: 900; padding: 0; pointer-events: none;" /></view>
          </view>
        </view>
      </u-list-item>
    </u-list>
    <view v-else-if="tab === 'reviews' && loading && !reviews.length" class="list-loading-panel">
      <view v-for="item in 3" :key="item" class="list-skeleton-card">
        <view class="skeleton-user-row"><view /><view /></view>
        <view class="skeleton-line strong" />
        <view class="skeleton-line" />
      </view>
    </view>
    <view v-else-if="tab === 'reviews' && !visibleReviews.length" class="empty-panel">
      <u-empty mode="data" text="还没有评价记录" />
      <text class="empty-hint">给店铺或菜品写下第一条评价吧。</text>
    </view>
    <u-list v-else-if="tab === 'reviews'" class="detail-scroll spring-list page-flow-list" :scrollable="false" custom-style="height: auto;">
      <u-list-item v-for="review in visibleReviews" :key="review.id">
        <view class="card list-card">
          <view class="review-card-head">
            <UserBadge :user="review.user" />
            <text class="review-time">{{ formatDisplayTime(review.createdAt) }}</text>
          </view>
          <view class="row"><text class="strong">{{ review.targetName }}</text><text class="score">{{ formatReviewRating(review.rating) }}分</text></view>
          <text class="review-content">{{ review.content }}</text>
          <view class="actions">
            <view class="action-hit" @tap.stop="editReview(review)"><u-button text="编辑评价" size="mini" shape="circle" color="#e2fbe9" custom-style="width: 82px; height: 28px; margin: 0; color: #4f7b67; font-weight: 900; padding: 0; pointer-events: none;" /></view>
            <view class="action-hit" @tap.stop="deleteReview(review.id)"><u-button text="删除评价" size="mini" shape="circle" color="#ffe4ef" custom-style="width: 82px; height: 28px; margin: 0; color: #d86693; font-weight: 900; padding: 0; pointer-events: none;" /></view>
          </view>
        </view>
      </u-list-item>
    </u-list>
    <StatsDashboard
      v-else-if="tab === 'stats'"
      :dashboard="statsDashboard"
      :loading="statsLoading"
      @range-change="changeStatsRange"
    />
    <view v-else-if="tab === 'randoms' && randomLoading && !randomRecords.length" class="list-loading-panel random-loading-panel">
      <view v-for="item in 3" :key="item" class="random-skeleton-row">
        <view class="skeleton-thumb" />
        <view class="skeleton-main"><view class="skeleton-line strong" /><view class="skeleton-line" /></view>
      </view>
    </view>
    <view v-else-if="tab === 'randoms' && !randomRecords.length" class="empty-panel">
      <u-empty mode="data" text="还没有抽选记录" />
      <text class="empty-hint">去随机页扭一次，幸运结果会出现在这里。</text>
    </view>
    <u-list v-else-if="tab === 'randoms'" class="detail-scroll spring-list random-record-list page-flow-list" :scrollable="false" custom-style="height: auto;">
      <u-list-item v-for="item in randomRecords" :key="item.id">
        <view class="record-row" @tap="openStore(item.store.id)">
          <image class="record-thumb" :src="item.store.coverUrl || defaultCover" mode="aspectFill" />
          <view class="record-main">
            <text class="record-name">{{ item.store.name }}</text>
            <text class="record-meta">{{ item.store.category }} · {{ item.rating.toFixed(1) }}分 · {{ item.category }} / {{ item.mealTime }}</text>
          </view>
          <view class="record-side">
            <text>{{ item.user.nickname }}</text>
            <text class="record-time">{{ item.createdAt.slice(5, 16).replace('T', ' ') }}</text>
          </view>
        </view>
      </u-list-item>
    </u-list>
    <view v-else-if="tab === 'stores' && loading && !visibleStores.length" class="list-loading-panel">
      <view v-for="item in 3" :key="item" class="list-skeleton-card">
        <view class="skeleton-line strong" />
        <view class="skeleton-line" />
      </view>
    </view>
    <view v-else-if="tab === 'stores' && !visibleStores.length" class="empty-panel">
      <u-empty mode="data" text="还没有维护的店铺" />
      <text class="empty-hint">创建或编辑店铺后，会在这里集中管理。</text>
    </view>
    <u-list v-else-if="tab === 'stores'" class="detail-scroll spring-list page-flow-list" :scrollable="false" custom-style="height: auto;">
      <u-list-item v-for="store in visibleStores" :key="store.id">
        <view class="card list-card clickable-card" @tap="openStore(store.id)">
          <view class="row"><text class="strong">{{ store.name }}</text><text class="score">{{ store.rating.toFixed(1) }}分</text></view>
          <view class="store-summary-row">
            <view class="store-summary-pill">{{ store.category }}</view>
            <view class="store-summary-pill">{{ store.orderCount }} 单</view>
            <view class="store-summary-pill accent">点击编辑资料</view>
          </view>
          <view class="store-maintainer-line">
            <text>创建：{{ store.createdBy?.nickname || "系统导入" }}</text>
            <text>维护：{{ store.updatedBy?.nickname || "暂无维护人" }}</text>
          </view>
        </view>
      </u-list-item>
    </u-list>
    <u-popup
      :show="reviewEditor.show"
      mode="center"
      round="28"
      closeable
      :safe-area-inset-bottom="false"
      @close="closeReviewEditor"
    >
      <view class="review-editor-panel">
        <view class="review-editor-head">
          <text class="review-editor-kicker">EDIT REVIEW</text>
          <text class="review-editor-title">编辑评价</text>
          <text class="review-editor-target">{{ reviewEditor.targetName }}</text>
        </view>
        <view class="review-editor-rate">
          <u-rate v-model="reviewEditor.rating" active-color="#d86693" inactive-color="#dff8eb" :count="5" allow-half />
          <text>{{ formatReviewRating(reviewEditor.rating) }}分</text>
        </view>
        <u-textarea
          v-model="reviewEditor.content"
          border="none"
          height="132"
          placeholder="写下这次评价"
          maxlength="240"
          count
        />
        <view class="review-editor-switch">
          <view>
            <text>是否不再推荐</text>
            <text>{{ reviewEditor.disliked ? "已标记不喜欢" : "仍然推荐" }}</text>
          </view>
          <u-switch v-model="reviewEditor.disliked" active-color="#ff9fbe" inactive-color="#d5d8d6" />
        </view>
        <view class="review-editor-actions">
          <u-button text="取消" shape="circle" color="#eefcf4" custom-style="height: 38px; margin: 0; color: #4f7b67; font-weight: 900;" @click="closeReviewEditor" />
          <u-button text="保存" shape="circle" color="linear-gradient(135deg, #d86693 0%, #8ee6b8 100%)" :loading="reviewSaving" custom-style="height: 38px; margin: 0; color: #ffffff; font-weight: 900;" @click="saveReviewEdit" />
        </view>
      </view>
    </u-popup>

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
  </view>
</template>

<script setup lang="ts">
import { onShow, onTabItemTap } from "@dcloudio/uni-app";
import { computed, reactive, ref } from "vue";
import { api } from "@/api/client";
import { session, switchUser } from "@/state/session";
import StatsDashboard from "@/components/StatsDashboard.vue";
import UserBadge from "@/components/UserBadge.vue";
import type { Order, RandomPick, Review, StatsDashboard as StatsDashboardData, Store, User } from "@/types";

const tab = ref<"menu" | "orders" | "reviews" | "stats" | "randoms" | "stores">("menu");
const orders = ref<Order[]>([]);
const reviews = ref<Review[]>([]);
const stores = ref<Store[]>([]);
const randomRecords = ref<RandomPick[]>([]);
const randomTotal = ref(0);
const loading = ref(false);
const statsLoading = ref(false);
const randomLoading = ref(false);
const myDataReloginTried = ref(false);
const reviewSaving = ref(false);
const reviewEditor = reactive({
  show: false,
  id: "",
  targetName: "",
  rating: 4.5,
  disliked: false,
  content: ""
});
const deleteDialog = reactive({
  show: false,
  content: "",
  action: null as null | (() => Promise<void>)
});
const defaultCover = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";
const statsDashboard = reactive<StatsDashboardData>({
  summary: { totalSpend: 0, orderCount: 0, averageOrderValue: 0, favoriteStore: "暂无" },
  rangeDays: 30,
  period: { from: "", to: "" },
  trend: [],
  categories: [],
  mealTimes: [],
  stores: [],
  ratings: [],
  users: []
});
const tabTitle = computed(() => {
  if (tab.value === "orders") return "我的订单";
  if (tab.value === "reviews") return "我的评价";
  if (tab.value === "stats") return "外卖统计";
  if (tab.value === "randoms") return "抽选记录";
  return "我维护的店铺";
});
const visibleOrders = computed(() => orders.value);
const visibleReviews = computed(() => reviews.value);
const maintainedStores = computed(() => stores.value);
const visibleStores = computed(() => maintainedStores.value);
const totalSpent = computed(() => orders.value.reduce((sum, order) => sum + Number(order.total || 0), 0));

function formatDisplayTime(value?: string) {
  return String(value || "")
    .replace("T", " ")
    .replace(/\.\d+Z$/, "")
    .replace(/([+-]\d{2}:?\d{2}|Z)$/, "")
    .slice(0, 16);
}

function formatAmount(value: number | string) {
  return Number(value || 0).toFixed(2).replace(/\.00$/, "");
}

function normalizeReviewRating(value: number | string | undefined, fallback = 4.5) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(5, Math.max(0.5, Math.round(parsed * 2) / 2));
}

function formatReviewRating(value: number | string | undefined) {
  return normalizeReviewRating(value).toFixed(1);
}

function requestDelete(content: string, action: () => Promise<void>) {
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

function resetToMenu() {
  tab.value = "menu";
  randomRecords.value = [];
  uni.removeStorageSync("openMyTab");
  uni.pageScrollTo({ scrollTop: 0, duration: 0 });
}

function openTab(next: typeof tab.value) {
  tab.value = next;
  if (next === "randoms" && !randomRecords.value.length) loadRandoms();
}

async function loadStats(range: 7 | 30 = statsDashboard.rangeDays) {
  statsLoading.value = true;
  try {
    const result = await api.stats(range) as StatsDashboardData;
    Object.assign(statsDashboard, result);
  } finally {
    statsLoading.value = false;
  }
}

function changeStatsRange(range: 7 | 30) {
  if (range !== statsDashboard.rangeDays) loadStats(range);
}

async function loadMyCollections() {
  orders.value = ((await api.orders()) as { orders: Order[] }).orders;
  reviews.value = ((await api.reviews()) as { reviews: Review[] }).reviews;
  stores.value = ((await api.stores("?maintainedBy=me")) as { stores: Store[] }).stores;
}

function hasMyCollections() {
  return Boolean(orders.value.length || reviews.value.length || stores.value.length);
}

function resolveCollectionUser() {
  return orders.value[0]?.user
    || reviews.value[0]?.user
    || stores.value.find((store) => store.updatedBy)?.updatedBy
    || stores.value.find((store) => store.createdBy)?.createdBy;
}

function clearStoredUser() {
  session.userId = "";
  session.nickname = "体验用户";
  uni.removeStorageSync("currentUserId");
  uni.removeStorageSync("currentNickname");
}

function syncCollectionUser(user?: User) {
  if (user?.id) switchUser(user);
}

async function load() {
  loading.value = true;
  try {
    await loadMyCollections();
    syncCollectionUser(resolveCollectionUser());
    if (!hasMyCollections() && !myDataReloginTried.value) {
      myDataReloginTried.value = true;
      clearStoredUser();
      await loadMyCollections();
      syncCollectionUser(resolveCollectionUser());
    }
    const randomResult = await api.randomPicks("?take=0&skip=0") as { records: RandomPick[]; total: number };
    randomTotal.value = randomResult.total;
    await loadStats();
  } finally {
    loading.value = false;
  }
}

async function loadRandoms() {
  randomLoading.value = true;
  try {
    const take = Math.max(randomTotal.value || 0, 20);
    const result = await api.randomPicks(`?take=${take}&skip=0`) as { records: RandomPick[]; total: number };
    randomRecords.value = result.records;
    randomTotal.value = result.total;
  } finally {
    randomLoading.value = false;
  }
}


function openOrder(id: string) {
  uni.navigateTo({ url: "/pages/order-detail/index?id=" + id });
}

function openStore(id: string) {
  uni.navigateTo({ url: `/pages/store-detail/index?id=${id}` });
}

function editReview(review: Review) {
  reviewEditor.id = review.id;
  reviewEditor.targetName = review.targetName;
  reviewEditor.rating = normalizeReviewRating(review.rating);
  reviewEditor.disliked = Boolean(review.disliked);
  reviewEditor.content = review.content || "";
  reviewEditor.show = true;
}

function closeReviewEditor() {
  if (reviewSaving.value) return;
  reviewEditor.show = false;
}

async function saveReviewEdit() {
  if (!reviewEditor.content.trim()) {
    uni.showToast({ title: "先写评价内容", icon: "none" });
    return;
  }
  reviewSaving.value = true;
  try {
    const result = await api.updateReview(reviewEditor.id, {
      rating: normalizeReviewRating(reviewEditor.rating),
      disliked: Boolean(reviewEditor.disliked),
      content: reviewEditor.content.trim()
    }) as { review?: Review };
    const nextReview = result.review;
    if (nextReview) {
      const index = reviews.value.findIndex((review) => review.id === nextReview.id);
      if (index >= 0) reviews.value.splice(index, 1, nextReview);
      else await loadMyCollections();
    } else {
      await loadMyCollections();
    }
    reviewEditor.show = false;
    uni.showToast({ title: "已保存评价" });
  } finally {
    reviewSaving.value = false;
  }
}

function deleteOrder(id: string) {
  requestDelete("确定删除这条订单吗？", async () => {
    await api.deleteOrder(id);
    uni.showToast({ title: "已删除" });
    await load();
  });
}

function deleteReview(id: string) {
  requestDelete("确定删除这条评价吗？", async () => {
    await api.deleteReview(id);
    uni.showToast({ title: "已删除" });
    await load();
  });
}

onTabItemTap(() => {
  resetToMenu();
});

onShow(async () => {
  const targetTab = uni.getStorageSync("openMyTab");
  if (targetTab) {
    tab.value = targetTab;
    uni.removeStorageSync("openMyTab");
  }
  await load();
  if (tab.value === "randoms") await loadRandoms();
});
</script>

<style scoped>
.my-page {
  min-height: 0;
  padding-bottom: calc(24rpx + constant(safe-area-inset-bottom));
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background:
    radial-gradient(circle at 10% 4%, rgba(255, 194, 218, 0.5), transparent 180rpx),
    radial-gradient(circle at 92% 18%, rgba(178, 239, 202, 0.7), transparent 220rpx),
    linear-gradient(180deg, #fff7fb 0%, #f5fff8 60%, #fff9fb 100%);
  color: #24352d;
}

.my-page--detail {
  min-height: auto;
}


.profile {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 104rpx 1fr;
  gap: 18rpx;
  align-items: center;
  border: 1rpx solid rgba(172, 225, 196, 0.85);
  border-radius: 34rpx;
  background:
    linear-gradient(135deg, rgba(255, 235, 244, 0.95), rgba(229, 255, 239, 0.95)),
    #ffffff;
  padding: 26rpx;
  box-shadow: 0 18rpx 44rpx rgba(95, 159, 124, 0.1);
}

.avatar {
  z-index: 2;
  display: grid;
  place-items: center;
  width: 104rpx;
  height: 104rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #ffb8d0, #8ee6b8);
  color: #ffffff;
  font-size: 40rpx;
  font-weight: 950;
  box-shadow: 0 14rpx 26rpx rgba(216, 102, 147, 0.18);
}

.profile-main {
  z-index: 2;
  min-width: 0;
}

.profile-kicker {
  display: inline-flex;
  width: fit-content;
  margin-bottom: 8rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.7);
  padding: 6rpx 14rpx;
  color: #d86693;
  font-size: 20rpx;
  font-weight: 900;
}

.name,
.strong {
  font-weight: 900;
}

.name {
  display: block;
  font-size: 36rpx;
  color: #24352d;
}

.profile-orb {
  position: absolute;
  right: -24rpx;
  bottom: -30rpx;
  width: 150rpx;
  height: 150rpx;
  border-radius: 50%;
  background: rgba(255, 184, 208, 0.36);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 18rpx;
}

.stat-card {
  display: grid;
  gap: 6rpx;
  place-items: center;
  border: 1rpx solid rgba(172, 225, 196, 0.8);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.78);
  padding: 18rpx 8rpx;
}

.stat-card text:first-child {
  color: #d86693;
  font-size: 34rpx;
  font-weight: 950;
}

.stat-card text:last-child {
  color: #7e978b;
  font-size: 22rpx;
  font-weight: 800;
}

.menu-list {
  overflow: hidden;
  margin: 20rpx 0 0;
  border: 1rpx solid rgba(172, 225, 196, 0.85);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 16rpx 40rpx rgba(95, 159, 124, 0.09);
}

.menu-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 26rpx 24rpx;
  border-bottom: 1rpx solid rgba(172, 225, 196, 0.5);
}

.menu-left,
.menu-right {
  display: flex;
  align-items: center;
}

.menu-left {
  gap: 12rpx;
  min-width: 0;
  font-weight: 900;
  color: #24352d;
}

.menu-right {
  gap: 6rpx;
  flex-shrink: 0;
  color: #d86693;
  font-size: 24rpx;
  font-weight: 900;
}

.menu-row:last-child {
  border-bottom: 0;
}

.detail-scroll {
  height: auto;
}

.empty-panel {
  display: grid;
  place-items: center;
  gap: 14rpx;
  min-height: 420rpx;
  margin-top: 20rpx;
  border: 1rpx solid rgba(172, 225, 196, 0.85);
  border-radius: 30rpx;
  background:
    radial-gradient(circle at 22% 16%, rgba(255, 228, 239, 0.72), transparent 160rpx),
    radial-gradient(circle at 82% 78%, rgba(226, 251, 233, 0.74), transparent 180rpx),
    rgba(255, 255, 255, 0.84);
  padding: 56rpx 28rpx;
  text-align: center;
  box-shadow: 0 16rpx 40rpx rgba(95, 159, 124, 0.09);
}

.empty-panel :deep(.u-empty) {
  padding: 0 !important;
}

.empty-panel :deep(.u-empty__text) {
  color: #4f7b67 !important;
  font-size: 28rpx !important;
  font-weight: 900 !important;
}

.empty-hint {
  display: block;
  max-width: 520rpx;
  color: #7e978b;
  font-size: 24rpx;
  font-weight: 700;
  line-height: 1.55;
}

.list-card {
  border-color: rgba(172, 225, 196, 0.85);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.86);
  margin-bottom: 18rpx;
  box-shadow: 0 12rpx 30rpx rgba(95, 159, 124, 0.08);
}

.order-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin: 10rpx 0 12rpx;
}

.time-pill,
.amount-pill,
.review-time {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 42rpx;
  border-radius: 999rpx;
  padding: 0 14rpx;
  font-size: 22rpx;
  font-weight: 900;
}

.time-pill,
.review-time {
  background: #eefcf4;
  color: #4f7b67;
}

.amount-pill {
  background: #fff1f7;
  color: #d86693;
}

.order-note,
.review-content {
  color: #5b7569;
  font-size: 25rpx;
  line-height: 1.55;
}

.store-summary-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin: 8rpx 0 14rpx;
}

.store-summary-pill {
  display: inline-flex;
  align-items: center;
  min-height: 40rpx;
  border-radius: 999rpx;
  background: #eefcf4;
  padding: 0 14rpx;
  color: #4f7b67;
  font-size: 22rpx;
  font-weight: 900;
}

.store-summary-pill.accent {
  background: #fff1f7;
  color: #d86693;
}

.store-maintainer-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
  color: #5b7569;
  font-size: 22rpx;
  font-weight: 850;
}

.store-maintainer-line text {
  display: inline-flex;
  align-items: center;
  min-height: 38rpx;
  border-radius: 999rpx;
  background: rgba(238, 252, 244, 0.92);
  padding: 0 12rpx;
}

.review-editor-panel {
  width: 640rpx;
  max-width: calc(100vw - 64rpx);
  display: grid;
  gap: 18rpx;
  border-radius: 30rpx;
  background: linear-gradient(180deg, #fff8fb 0%, #f6fff9 100%);
  padding: 32rpx 28rpx 28rpx;
  box-shadow: 0 24rpx 70rpx rgba(216, 102, 147, 0.18);
}

.review-editor-head {
  display: grid;
  gap: 6rpx;
  padding-right: 44rpx;
}

.review-editor-kicker,
.review-editor-target {
  color: #7e978b;
  font-size: 22rpx;
  font-weight: 800;
}

.review-editor-title {
  color: #24352d;
  font-size: 34rpx;
  font-weight: 950;
}

.review-editor-target {
  color: #d86693;
}

.review-editor-rate,
.review-editor-switch,
.review-editor-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.review-editor-rate {
  justify-content: space-between;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.76);
  padding: 18rpx;
  color: #d86693;
  font-size: 25rpx;
  font-weight: 950;
}

.review-editor-switch {
  justify-content: space-between;
  border-radius: 24rpx;
  background: #fff6fb;
  padding: 18rpx;
}

.review-editor-switch view {
  display: grid;
  gap: 4rpx;
}

.review-editor-switch text:first-child {
  color: #513d4a;
  font-size: 25rpx;
  font-weight: 950;
}

.review-editor-switch text:last-child {
  color: #7e978b;
  font-size: 22rpx;
  font-weight: 800;
}

.review-editor-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.review-editor-panel :deep(.u-textarea) {
  border-radius: 24rpx !important;
  background: rgba(255, 255, 255, 0.86) !important;
}

.review-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.review-card-head .review-time {
  flex-shrink: 0;
  margin-left: auto;
}

.review-time {
  margin: 0;
}

.row,
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 10rpx;
}

.icon-bubble {
  display: grid;
  place-items: center;
  width: 62rpx;
  height: 62rpx;
  flex-shrink: 0;
  border-radius: 20rpx;
  background: #ffe4ef;
}

.icon-bubble.mint {
  background: #e2fbe9;
}

.menu-sub {
  display: block;
  margin-top: 6rpx;
  color: #7e978b;
  font-size: 22rpx;
  font-weight: 600;
}

.score {
  color: #d86693;
  font-weight: 950;
}

.mini-btn {
  border: 0;
  border-radius: 999rpx;
  background: #e2fbe9;
  color: #4f7b67;
  font-weight: 900;
}

.mini-btn.danger {
  background: #ffe4ef;
  color: #d86693;
}

.single-action {
  justify-content: flex-end;
}

.action-hit {
  flex: 0 0 auto;
}

.clickable-card {
  cursor: pointer;
}

.spring-list :deep(.u-list) {
  background: transparent !important;
}

.spring-list :deep(.u-list-item) {
  background: transparent !important;
}

.page-flow-list,
:deep(.page-flow-list.u-list),
:deep(.u-list.page-flow-list) {
  display: block !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
}

.page-flow-list :deep(.u-list),
.page-flow-list :deep(.u-list > view),
.page-flow-list :deep(.uni-scroll-view),
.page-flow-list :deep(.uni-scroll-view-content),
:deep(.page-flow-list.u-list > view),
:deep(.page-flow-list.u-list .uni-scroll-view),
:deep(.page-flow-list.u-list .uni-scroll-view-content) {
  display: block !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
}

.random-record-list {
  border: 1rpx solid rgba(172, 225, 196, 0.85);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 16rpx 40rpx rgba(95, 159, 124, 0.09);
}

.record-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx 20rpx;
  border-bottom: 1rpx solid rgba(172, 225, 196, 0.55);
}

.record-thumb {
  width: 88rpx;
  height: 88rpx;
  flex-shrink: 0;
  border-radius: 22rpx;
  background: #f3edf1;
}

.record-main {
  flex: 1;
  min-width: 0;
}

.record-name {
  display: block;
  overflow: hidden;
  color: #24352d;
  font-size: 28rpx;
  font-weight: 900;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.record-meta,
.record-time {
  display: block;
  margin-top: 6rpx;
  color: #7e978b;
  font-size: 22rpx;
}

.record-side {
  max-width: 150rpx;
  flex-shrink: 0;
  color: #5b7569;
  font-size: 22rpx;
  font-weight: 800;
  text-align: right;
}

.mini-btn::after {
  border: 0;
}
</style>
