<template>
  <view class="page tab-page random-page">
    <view class="app-nav">
      <view class="app-nav-left" />
      <text class="app-nav-title">随机</text>
      <view class="app-nav-right" />
    </view>
    <view class="spring-hero">
      <view class="hero-copy">
        <text class="eyebrow">SPRING MENU DRAW</text>
        <text class="title">今天吃哪家</text>
        <text class="subtitle">让春天替你抽一口快乐</text>
      </view>
      <view class="hero-stats">
        <text class="stat-number">{{ candidateCount }}</text>
        <text class="stat-label">家可选</text>
      </view>
      <view class="float-shape shape-a" />
      <view class="float-shape shape-b" />
      <view class="float-shape shape-c" />
    </view>

    <view class="control-panel">
      <view class="filters">
        <picker :range="categories" @change="setCategory(categories[$event.detail.value])">
          <view class="picker-pill">
            <text class="picker-label">分类</text>
            <text class="picker-value">{{ category }}</text>
            <uni-icons type="bottom" size="14" color="#4f7b67" />
          </view>
        </picker>
        <picker :range="mealTimes" @change="setMealTime(mealTimes[$event.detail.value])">
          <view class="picker-pill">
            <text class="picker-label">时段</text>
            <text class="picker-value">{{ mealTime }}</text>
            <uni-icons type="bottom" size="14" color="#4f7b67" />
          </view>
        </picker>
      </view>

      <view class="switch-row" @tap="toggleExclude">
        <view :class="['spring-switch', { active: excludeDisliked }]">
          <view class="switch-dot" />
        </view>
        <view>
          <text class="switch-title">排除不喜欢</text>
          <text class="switch-hint">只把评分 3 分以上放进抽选池</text>
        </view>
      </view>
    </view>

    <view class="wheel-card">
      <view class="wheel-topline">
        <view>
          <text class="section-title">春日食物星盘</text>
          <text class="section-note">{{ feedbackText }}</text>
        </view>
        <view class="spark-badge">抽选中枢</view>
      </view>

      <view class="wheel-zone">
        <view class="orbit-ring" />
        <view class="pointer" />
        <view
          :class="['wheel', { spinning: isSpinning }]"
          :style="{ transform: `rotate(${wheelRotation}deg)` }"
        >
          <view class="wheel-core">
            <text>MENU</text>
            <text>DRAW</text>
          </view>
          <view
            v-for="(item, index) in wheelItems"
            :key="item.id"
            class="wheel-label"
            :style="wheelLabelStyle(index)"
            @tap.stop="openWheelItem(item)"
          >
            <image class="wheel-food-cover" :src="item.coverUrl || defaultCover" mode="aspectFill" />
            <text class="wheel-food-name">{{ wheelItemLabel(item) }}</text>
          </view>
        </view>
      </view>

      <button
        :class="['draw-button', { loading: isSpinning }]"
        :disabled="isSpinning || candidateCount === 0"
        @tap="spin"
      >
        {{ isSpinning ? "春风正在转..." : "开始抽选" }}
      </button>

      <view class="winner-panel" @tap="openWinner">
        <image class="winner-cover" :src="winner?.coverUrl || defaultCover" mode="aspectFill" />
        <view class="winner-copy">
          <text class="winner-kicker">{{ winner ? "今日命定" : "等待开奖" }}</text>
          <text class="winner-name">{{ winner?.name || "点一下，让星盘替你决定" }}</text>
          <text class="winner-meta">
            {{ winner ? `${winner.category} · ${winner.rating.toFixed(1)}分 · 点击查看店铺` : "筛选后点击开始抽选" }}
          </text>
        </view>
      </view>
    </view>

    <view class="recent-panel">
      <view class="recent-head">
        <view>
          <text class="section-title">最近抽选</text>
          <text class="section-note">最多展示 5 条记录</text>
        </view>
        <view v-if="randomTotal > 5" class="more-link" @tap="openMore">
          <text>更多</text>
          <uni-icons type="arrowright" size="14" color="#d86693" />
        </view>
      </view>

      <u-list v-if="recentRecords.length" class="record-list spring-list page-flow-list" :scrollable="false" custom-style="height: auto;">
        <u-list-item v-for="item in recentRecords" :key="item.id">
          <view class="record-row" @tap="openStore(item.store.id)">
            <image class="record-thumb" :src="item.store.coverUrl || defaultCover" mode="aspectFill" />
            <view class="record-main">
              <text class="record-name">{{ item.store.name }}</text>
              <text class="record-meta">{{ item.store.category }} · {{ item.rating.toFixed(1) }}分</text>
            </view>
            <view class="record-side">
              <text>{{ item.user.nickname }}</text>
              <text class="record-time">{{ item.createdAt.slice(5, 16).replace("T", " ") }}</text>
            </view>
          </view>
        </u-list-item>
      </u-list>

      <view v-else class="empty-state">
        <text>还没有抽选记录</text>
        <text>第一颗春日食物星星等你点亮</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow, onTabItemTap } from "@dcloudio/uni-app";
import { computed, ref } from "vue";
import { api } from "@/api/client";
import type { RandomPick, Store } from "@/types";

const categories = ["全部", "快餐", "奶茶", "烧烤", "火锅", "轻食", "粉面"];
const mealTimes = ["全部", "早餐", "午餐", "下午茶", "晚餐", "夜宵"];
const category = ref("全部");
const mealTime = ref("全部");
const excludeDisliked = ref(true);
const winner = ref<Store | null>(null);
const candidateCount = ref(0);
const recentRecords = ref<RandomPick[]>([]);
const randomTotal = ref(0);
const isSpinning = ref(false);
const wheelRotation = ref(12);
const feedbackText = ref("把纠结丢进粉绿星盘里");
const defaultCover = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";

type WheelItem = {
  id: string;
  name: string;
  category: string;
  coverUrl?: string;
  fallback?: boolean;
};

const fallbackWheelItems: WheelItem[] = [
  { id: "fallback-bento", name: "樱花便当研究所", category: "快餐", coverUrl: "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=500&q=80", fallback: true },
  { id: "fallback-mint-tea", name: "薄荷奶茶补给站", category: "奶茶", coverUrl: "https://images.unsplash.com/photo-1558857563-b371033873b8?auto=format&fit=crop&w=500&q=80", fallback: true },
  { id: "fallback-noodle", name: "粉面小星实验室", category: "粉面", coverUrl: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=500&q=80", fallback: true },
  { id: "fallback-salad", name: "轻食花园能量舱", category: "轻食", coverUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80", fallback: true },
  { id: "fallback-hotpot", name: "火锅云朵冒泡屋", category: "火锅", coverUrl: "https://images.unsplash.com/photo-1615361200141-f45040f367be?auto=format&fit=crop&w=500&q=80", fallback: true },
  { id: "fallback-bbq", name: "烧烤流星补完计划", category: "烧烤", coverUrl: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=500&q=80", fallback: true }
];

const wheelItems = computed<WheelItem[]>(() => {
  const recent = recentRecords.value
    .map((item) => ({
      id: item.store.id,
      name: item.store.name,
      category: item.store.category,
      coverUrl: item.store.coverUrl || defaultCover
    }))
    .filter((item) => item.name);
  const uniqueItems = new Map<string, WheelItem>();
  [...recent, ...fallbackWheelItems].forEach((item) => {
    if (!uniqueItems.has(item.name)) uniqueItems.set(item.name, item);
  });
  return [...uniqueItems.values()].slice(0, 6);
});

async function loadCandidateCount() {
  try {
    const result = await api.randomStore(query(true)) as { store: Store | null; candidateCount: number };
    candidateCount.value = result.candidateCount || 0;
    feedbackText.value = result.candidateCount ? "星盘已经准备好啦" : "当前筛选没有候选店铺";
  } catch (error) {
    candidateCount.value = 0;
    feedbackText.value = "抽选服务还没连上";
  }
}

async function loadRecent() {
  try {
    const result = await api.randomPicks("?take=5&skip=0") as { records: RandomPick[]; total: number };
    recentRecords.value = result.records;
    randomTotal.value = result.total;
  } catch (error) {
    recentRecords.value = [];
    randomTotal.value = 0;
  }
}

function query(peek = false) {
  const params = [
    ["category", category.value],
    ["mealTime", mealTime.value],
    ["excludeDisliked", String(excludeDisliked.value)],
    ["peek", String(peek)]
  ];
  return `?${params.map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join("&")}`;
}

function setCategory(value: string) {
  category.value = value;
  winner.value = null;
  loadCandidateCount();
}

function setMealTime(value: string) {
  mealTime.value = value;
  winner.value = null;
  loadCandidateCount();
}

function toggleExclude() {
  excludeDisliked.value = !excludeDisliked.value;
  winner.value = null;
  loadCandidateCount();
}

function resetRandomPage() {
  category.value = "全部";
  mealTime.value = "全部";
  excludeDisliked.value = true;
  winner.value = null;
  isSpinning.value = false;
  wheelRotation.value = 12;
  feedbackText.value = "把纠结丢进粉绿星盘里";
  uni.pageScrollTo({ scrollTop: 0, duration: 0 });
  loadCandidateCount();
  loadRecent();
}

async function spin() {
  if (isSpinning.value || candidateCount.value === 0) return;
  isSpinning.value = true;
  winner.value = null;
  feedbackText.value = "春风正在翻菜单...";
  wheelRotation.value += 900 + Math.floor(Math.random() * 360);

  try {
    const [result] = await Promise.all([
      api.randomStore(query()) as Promise<{ store: Store | null; candidateCount: number }>,
      wait(980)
    ]);
    winner.value = result.store;
    candidateCount.value = result.candidateCount || 0;
    feedbackText.value = result.store ? `${result.store.name} 被星盘选中` : "没有抽到符合条件的店铺";
    await loadRecent();
  } catch (error) {
    feedbackText.value = "暂时抽不出来，检查服务后再试";
  } finally {
    isSpinning.value = false;
  }
}

function openWinner() {
  if (winner.value) uni.navigateTo({ url: `/pages/store-detail/index?id=${winner.value.id}` });
}

function openStore(id: string) {
  uni.navigateTo({ url: `/pages/store-detail/index?id=${id}` });
}

function openWheelItem(item: WheelItem) {
  if (!item.fallback) openStore(item.id);
}

function openMore() {
  uni.setStorageSync("openMyTab", "randoms");
  uni.switchTab({ url: "/pages/me/index" });
}

function wheelLabelStyle(index: number) {
  const total = Math.max(wheelItems.value.length, 1);
  const angle = index * (360 / total);
  return {
    transform: `rotate(${angle}deg) translateY(-184rpx) rotate(${-angle}deg)`
  };
}

function wheelItemLabel(item: WheelItem) {
  return item.name.length > 14 ? `${item.name.slice(0, 14)}...` : item.name;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

onTabItemTap(resetRandomPage);

onShow(() => {
  loadCandidateCount();
  loadRecent();
});
</script>

<style scoped>
.random-page {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 12% 9%, rgba(255, 194, 218, 0.56), transparent 180rpx),
    radial-gradient(circle at 92% 18%, rgba(178, 239, 202, 0.76), transparent 220rpx),
    linear-gradient(180deg, #fff7fb 0%, #f5fff8 56%, #fff9fb 100%);
  color: #24352d;
}

.spring-hero {
  position: relative;
  min-height: 236rpx;
  overflow: hidden;
  border-radius: 36rpx;
  padding: 34rpx;
  background:
    linear-gradient(135deg, rgba(255, 216, 230, 0.96), rgba(196, 244, 217, 0.96)),
    #fce9f1;
  box-shadow: 0 18rpx 44rpx rgba(214, 102, 147, 0.15);
}

.hero-copy {
  position: relative;
  z-index: 2;
  display: grid;
  gap: 10rpx;
}

.eyebrow {
  display: inline-flex;
  justify-self: start;
  align-items: center;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.74);
  padding: 8rpx 18rpx;
  color: #d86693;
  font-size: 20rpx;
  font-weight: 900;
  letter-spacing: 1rpx;
}

.title {
  color: #24352d;
  font-size: 52rpx;
  font-weight: 950;
  line-height: 1.08;
}

.subtitle {
  color: #5b7569;
  font-size: 26rpx;
  font-weight: 700;
}

.hero-stats {
  position: absolute;
  right: 32rpx;
  bottom: 28rpx;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 150rpx;
  height: 150rpx;
  border: 5rpx solid rgba(255, 255, 255, 0.82);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: inset 0 -12rpx 24rpx rgba(169, 232, 197, 0.34);
}

.stat-number {
  margin-top: 8rpx;
  color: #d86693;
  font-size: 40rpx;
  font-weight: 950;
  line-height: 1;
}

.stat-label {
  color: #4f7b67;
  font-size: 22rpx;
  font-weight: 800;
}

.float-shape {
  position: absolute;
  z-index: 1;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.38);
}

.shape-a {
  right: 36rpx;
  top: 28rpx;
  width: 100rpx;
  height: 44rpx;
  transform: rotate(18deg);
}

.shape-b {
  right: 150rpx;
  bottom: 30rpx;
  width: 56rpx;
  height: 56rpx;
  background: rgba(255, 176, 207, 0.52);
}

.shape-c {
  left: 270rpx;
  top: 116rpx;
  width: 76rpx;
  height: 28rpx;
  background: rgba(157, 229, 188, 0.58);
  transform: rotate(-22deg);
}

.control-panel,
.wheel-card,
.recent-panel {
  margin-top: 20rpx;
  border: 1rpx solid rgba(172, 225, 196, 0.8);
  border-radius: 32rpx;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 16rpx 40rpx rgba(95, 159, 124, 0.1);
  backdrop-filter: blur(10rpx);
}

.control-panel {
  padding: 20rpx;
}

.filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.picker-pill {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-height: 76rpx;
  border: 1rpx solid rgba(178, 231, 202, 0.9);
  border-radius: 999rpx;
  background: #f6fff9;
  padding: 0 22rpx;
}

.picker-label {
  color: #8ba79a;
  font-size: 22rpx;
  font-weight: 700;
}

.picker-value {
  flex: 1;
  min-width: 0;
  color: #24352d;
  font-size: 28rpx;
  font-weight: 900;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 18rpx;
  border-radius: 26rpx;
  background: #fff6fb;
  padding: 18rpx 20rpx;
}

.spring-switch {
  position: relative;
  width: 86rpx;
  height: 48rpx;
  flex-shrink: 0;
  border-radius: 999rpx;
  background: #eadde7;
  transition: background 0.2s ease;
}

.spring-switch.active {
  background: #9ee9bf;
}

.switch-dot {
  position: absolute;
  top: 6rpx;
  left: 6rpx;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 5rpx 12rpx rgba(77, 117, 93, 0.16);
  transition: transform 0.2s ease;
}

.spring-switch.active .switch-dot {
  transform: translateX(38rpx);
}

.switch-title {
  display: block;
  color: #24352d;
  font-size: 28rpx;
  font-weight: 900;
}

.switch-hint {
  display: block;
  margin-top: 4rpx;
  color: #7e978b;
  font-size: 22rpx;
}

.wheel-card {
  padding: 24rpx;
}

.wheel-topline,
.recent-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.section-title {
  display: block;
  color: #24352d;
  font-size: 32rpx;
  font-weight: 950;
}

.section-note {
  display: block;
  margin-top: 6rpx;
  color: #7e978b;
  font-size: 23rpx;
}

.spark-badge {
  flex-shrink: 0;
  border-radius: 999rpx;
  background: #ffe4ef;
  padding: 10rpx 16rpx;
  color: #d86693;
  font-size: 22rpx;
  font-weight: 900;
}

.wheel-zone {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 690rpx;
  margin: 2rpx 0 18rpx;
}

.orbit-ring {
  position: absolute;
  width: 620rpx;
  height: 620rpx;
  border: 2rpx dashed rgba(216, 102, 147, 0.34);
  border-radius: 50%;
  background:
    radial-gradient(circle, rgba(255, 255, 255, 0.5) 0 31%, transparent 32% 100%),
    conic-gradient(from -20deg, rgba(255, 217, 231, 0.4), rgba(201, 244, 216, 0.34), rgba(255, 243, 199, 0.32), rgba(247, 217, 255, 0.34), rgba(191, 241, 227, 0.36), rgba(255, 208, 221, 0.4));
}

.pointer {
  position: absolute;
  top: 18rpx;
  z-index: 4;
  width: 0;
  height: 0;
  border-left: 28rpx solid transparent;
  border-right: 28rpx solid transparent;
  border-top: 60rpx solid #d86693;
  filter: drop-shadow(0 8rpx 8rpx rgba(216, 102, 147, 0.24));
}

.wheel {
  position: relative;
  display: grid;
  place-items: center;
  width: 560rpx;
  height: 560rpx;
  border: 10rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background:
    conic-gradient(
      from -20deg,
      #ffd9e7 0deg 60deg,
      #c9f4d8 60deg 120deg,
      #fff3c7 120deg 180deg,
      #f7d9ff 180deg 240deg,
      #bff1e3 240deg 300deg,
      #ffd0dd 300deg 360deg
    );
  box-shadow:
    0 22rpx 48rpx rgba(205, 110, 152, 0.24),
    inset 0 0 0 12rpx rgba(255, 255, 255, 0.42);
  transition: transform 0.95s cubic-bezier(0.16, 0.82, 0.26, 1);
}

.wheel.spinning {
  transition-duration: 1.05s;
}

.wheel-core {
  z-index: 2;
  display: grid;
  place-items: center;
  width: 136rpx;
  height: 136rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.88);
  color: #d86693;
  font-size: 22rpx;
  font-weight: 950;
  box-shadow: inset 0 -10rpx 18rpx rgba(176, 234, 200, 0.35);
}

.wheel-label {
  position: absolute;
  z-index: 3;
  left: 50%;
  top: 50%;
  display: grid;
  grid-template-rows: 82rpx minmax(44rpx, auto);
  gap: 8rpx;
  align-items: center;
  justify-items: center;
  width: 156rpx;
  min-height: 132rpx;
  margin-left: -78rpx;
  margin-top: -66rpx;
  padding: 0;
  color: #2f4f40;
  text-align: center;
  text-shadow: 0 2rpx 8rpx rgba(255, 255, 255, 0.95);
}

.wheel-food-cover {
  width: 82rpx;
  height: 82rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: #f3edf1;
  box-shadow: 0 8rpx 18rpx rgba(95, 159, 124, 0.16);
}

.wheel-food-name {
  display: -webkit-box;
  overflow: hidden;
  color: #2f4f40;
  font-size: 22rpx;
  font-weight: 950;
  line-height: 1.18;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.draw-button {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 92rpx;
  margin: 0 18rpx 22rpx;
  border: 0;
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff98bd, #8ee6b8);
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 950;
  line-height: 92rpx;
  box-shadow: 0 16rpx 28rpx rgba(216, 102, 147, 0.28);
}

.draw-button::after {
  border: 0;
}

.draw-button[disabled] {
  opacity: 0.58;
}

.draw-button.loading {
  background: linear-gradient(135deg, #8ee6b8, #ff98bd);
}

.winner-panel {
  display: grid;
  grid-template-columns: 116rpx 1fr;
  gap: 18rpx;
  align-items: center;
  border: 1rpx solid rgba(255, 190, 214, 0.82);
  border-radius: 28rpx;
  background: #fff8fb;
  padding: 16rpx;
}

.winner-cover {
  width: 116rpx;
  height: 116rpx;
  border-radius: 24rpx;
  background: #f3edf1;
}

.winner-copy {
  min-width: 0;
}

.winner-kicker {
  color: #d86693;
  font-size: 22rpx;
  font-weight: 900;
}

.winner-name {
  display: block;
  margin-top: 8rpx;
  overflow: hidden;
  color: #24352d;
  font-size: 32rpx;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.winner-meta {
  display: block;
  margin-top: 8rpx;
  color: #7e978b;
  font-size: 23rpx;
}

.recent-panel {
  padding: 24rpx 24rpx 0;
}

.more-link {
  display: flex;
  align-items: center;
  gap: 2rpx;
  color: #d86693;
  font-size: 24rpx;
  font-weight: 900;
}

.record-list {
  margin-top: 12rpx;
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

.spring-list :deep(.u-list),
.spring-list :deep(.u-list-item) {
  background: transparent !important;
}

.record-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx 0;
  border-bottom: 1rpx solid rgba(172, 225, 196, 0.55);
}

.record-row:last-child {
  border-bottom: 0;
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

.empty-state {
  display: grid;
  gap: 8rpx;
  place-items: center;
  margin-top: 18rpx;
  border: 1rpx dashed rgba(216, 102, 147, 0.35);
  border-radius: 26rpx;
  background: rgba(255, 247, 251, 0.72);
  padding: 34rpx;
  color: #7e978b;
  font-size: 24rpx;
}
</style>
