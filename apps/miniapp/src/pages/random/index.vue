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
          <text class="section-title">春日扭蛋抽选</text>
          <text class="section-note">{{ feedbackText }}</text>
        </view>
        <view class="spark-badge">扭蛋机</view>
      </view>

      <view class="gacha-zone">
        <image class="gacha-deco gacha-deco-a" :src="gachaDecorations[0]" mode="aspectFit" />
        <image class="gacha-deco gacha-deco-b" :src="gachaDecorations[1]" mode="aspectFit" />
        <view :class="['gacha-stage', { spinning: isSpinning, dropping: dropCapsuleVisible }]">
          <image class="gacha-machine" :src="gachaMachine" mode="widthFix" />
          <view class="gacha-globe">
            <view
              v-for="(item, index) in wheelItems"
              :key="item.id"
              class="gacha-capsule"
              :style="capsuleStyle(index)"
              @tap.stop="openWheelItem(item)"
            >
              <image class="capsule-shell" :src="capsuleAsset(index)" mode="aspectFit" />
              <image class="capsule-cover" :src="item.coverUrl || defaultCover" mode="aspectFill" />
              <text class="capsule-label">{{ gachaItemLabel(item) }}</text>
            </view>
          </view>
          <view :class="['gacha-knob-hit', { disabled: isSpinning }]" @tap="spin">
            <view class="gacha-knob-plate">
              <image class="gacha-knob-img" :src="gachaKnob" mode="aspectFit" />
              <text class="knob-label">{{ isSpinning ? "抽选中" : "扭一下" }}</text>
            </view>
          </view>
          <view class="gacha-outlet" @tap="openWinner">
            <view v-if="dropCapsuleVisible" class="drop-capsule" :key="dropCapsuleIndex">
              <image class="drop-capsule-shell" :src="capsuleAsset(dropCapsuleIndex)" mode="aspectFit" />
              <image v-if="winner" class="drop-capsule-cover" :src="winner.coverUrl || defaultCover" mode="aspectFill" />
            </view>
          </view>
        </view>
      </view>

      <button
        :class="['draw-button', { loading: isSpinning }]"
        :disabled="isSpinning"
        @tap="spin"
      >
        {{ isSpinning ? "春风正在转..." : "开始抽选" }}
      </button>

      <view :class="['winner-panel', { blurring: isSpinning }]" @tap="openWinner">
        <image class="winner-cover" :src="winner?.coverUrl || defaultCover" mode="aspectFill" />
        <view class="winner-copy">
          <text class="winner-kicker">{{ winner ? "今日命定" : "等待开奖" }}</text>
          <text class="winner-name">{{ winner?.name || "点一下，让星盘替你决定" }}</text>
          <text class="winner-meta">
            {{ winner ? `${winner.category} · ${winner.rating.toFixed(1)}分 · 点击查看店铺` : "筛选后点击开始抽选" }}
          </text>
        </view>
        <view v-if="isSpinning" class="winner-drawing-state">
          <view class="drawing-orb">
            <u-loading-icon color="#d86693" size="22" />
          </view>
          <view class="drawing-copy">
            <text class="drawing-title">正在摇出今天的命定</text>
            <text class="drawing-subtitle">胶囊滚动中，结果马上出舱</text>
          </view>
          <view class="drawing-dots"><view /><view /><view /></view>
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
const candidateStores = ref<Store[]>([]);
const candidateCount = ref(0);
const recentRecords = ref<RandomPick[]>([]);
const randomTotal = ref(0);
const isSpinning = ref(false);
const dropCapsuleVisible = ref(false);
const dropCapsuleIndex = ref(0);
const feedbackText = ref("把纠结丢进粉绿星盘里");
const defaultCover = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";
const gachaMachine = "/static/gachapon/gachapon-machine.png";
const gachaKnob = "/static/gachapon/gachapon-knob.png";
const capsuleAssets = [
  "/static/gachapon/gachapon-capsule-01.png",
  "/static/gachapon/gachapon-capsule-02.png",
  "/static/gachapon/gachapon-capsule-03.png",
  "/static/gachapon/gachapon-capsule-04.png",
  "/static/gachapon/gachapon-capsule-05.png",
  "/static/gachapon/gachapon-capsule-06.png"
];
const gachaDecorations = [
  "/static/gachapon/gachapon-deco-01.png",
  "/static/gachapon/gachapon-deco-02.png"
];

type WheelItem = {
  id: string;
  name: string;
  category: string;
  coverUrl?: string;
};


const wheelItems = computed<WheelItem[]>(() => candidateStores.value.slice(0, 6).map((store) => ({
  id: store.id,
  name: store.name,
  category: store.category,
  coverUrl: store.coverUrl || defaultCover
})));

async function loadCandidateCount() {
  try {
    const result = await api.stores(candidateQuery()) as { stores: Store[] };
    const candidates = result.stores.filter((store) => !excludeDisliked.value || store.rating >= 3);
    candidateStores.value = candidates;
    candidateCount.value = candidates.length;
    feedbackText.value = candidates.length ? "星盘已经准备好啦" : "当前筛选没有候选店铺";
  } catch (error) {
    candidateStores.value = [];
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

function candidateQuery() {
  const params = [
    ["category", category.value],
    ["mealTime", mealTime.value]
  ];
  return "?" + params.map(([key, value]) => key + "=" + encodeURIComponent(value)).join("&");
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
  dropCapsuleVisible.value = false;
  loadCandidateCount();
}

function setMealTime(value: string) {
  mealTime.value = value;
  winner.value = null;
  dropCapsuleVisible.value = false;
  loadCandidateCount();
}

function toggleExclude() {
  excludeDisliked.value = !excludeDisliked.value;
  winner.value = null;
  dropCapsuleVisible.value = false;
  loadCandidateCount();
}

function resetRandomPage() {
  category.value = "全部";
  mealTime.value = "全部";
  excludeDisliked.value = true;
  winner.value = null;
  dropCapsuleVisible.value = false;
  isSpinning.value = false;
  feedbackText.value = "把纠结丢进粉绿星盘里";
  uni.pageScrollTo({ scrollTop: 0, duration: 0 });
  loadCandidateCount();
  loadRecent();
}

function showNoCandidateModal() {
  uni.showModal({
    title: "暂无可抽店铺",
    content: "当前筛选条件下没有候选店铺，试试切换分类、时段，或关闭排除不喜欢。",
    showCancel: false,
    confirmText: "知道了",
    confirmColor: "#d86693"
  });
}

async function spin() {
  if (isSpinning.value) return;
  if (candidateCount.value === 0) {
    feedbackText.value = "当前筛选没有候选店铺";
    showNoCandidateModal();
    return;
  }
  isSpinning.value = true;
  dropCapsuleVisible.value = false;
  dropCapsuleIndex.value = Math.floor(Math.random() * capsuleAssets.length);
  feedbackText.value = "春风正在翻菜单...";

  try {
    const [result] = await Promise.all([
      api.randomStore(query()) as Promise<{ store: Store | null; candidateCount: number }>,
      wait(980)
    ]);
    winner.value = result.store;
    candidateCount.value = result.candidateCount || 0;
    dropCapsuleVisible.value = Boolean(result.store);
    feedbackText.value = result.store ? `${result.store.name} 被星盘选中` : "没有抽到符合条件的店铺";
    if (!result.store) showNoCandidateModal();
    await loadRecent();
  } catch (error) {
    feedbackText.value = "暂时抽不出来，检查服务后再试";
  } finally {
    isSpinning.value = false;
  }
}

function openWinner() {
  if (isSpinning.value) return;
  if (winner.value) uni.navigateTo({ url: `/pages/store-detail/index?id=${winner.value.id}` });
}

function openStore(id: string) {
  uni.navigateTo({ url: `/pages/store-detail/index?id=${id}` });
}

function openWheelItem(item: WheelItem) {
  openStore(item.id);
}

function openMore() {
  uni.setStorageSync("openMyTab", "randoms");
  uni.switchTab({ url: "/pages/me/index" });
}

function capsuleAsset(index: number) {
  return capsuleAssets[index % capsuleAssets.length];
}

const capsuleLayouts: Record<number, Array<{ left: number; top: number; rotate: number; stirXa: number; stirXb: number; stirYa: number; stirYb: number; delay: number }>> = {
  1: [
    { left: 156, top: 132, rotate: -4, stirXa: -18, stirXb: 18, stirYa: -18, stirYb: 18, delay: 0 }
  ],
  2: [
    { left: 92, top: 128, rotate: -12, stirXa: -22, stirXb: 18, stirYa: -18, stirYb: 16, delay: 0 },
    { left: 220, top: 128, rotate: 12, stirXa: 22, stirXb: -18, stirYa: 16, stirYb: -18, delay: -0.18 }
  ],
  3: [
    { left: 54, top: 120, rotate: -13, stirXa: -24, stirXb: 18, stirYa: -18, stirYb: 18, delay: 0 },
    { left: 156, top: 58, rotate: 8, stirXa: 20, stirXb: -18, stirYa: 18, stirYb: -16, delay: -0.16 },
    { left: 258, top: 132, rotate: 14, stirXa: 24, stirXb: -20, stirYa: -18, stirYb: 20, delay: -0.3 }
  ],
  4: [
    { left: 58, top: 88, rotate: -12, stirXa: -24, stirXb: 18, stirYa: -22, stirYb: 18, delay: 0 },
    { left: 226, top: 84, rotate: 13, stirXa: 24, stirXb: -20, stirYa: -18, stirYb: 22, delay: -0.16 },
    { left: 82, top: 206, rotate: 10, stirXa: -20, stirXb: 24, stirYa: 18, stirYb: -16, delay: -0.3 },
    { left: 218, top: 210, rotate: -9, stirXa: 22, stirXb: -26, stirYa: 16, stirYb: -20, delay: -0.42 }
  ],
  5: [
    { left: 38, top: 84, rotate: -12, stirXa: -24, stirXb: 18, stirYa: -22, stirYb: 18, delay: 0 },
    { left: 156, top: 38, rotate: 8, stirXa: 20, stirXb: -18, stirYa: 20, stirYb: -16, delay: -0.12 },
    { left: 258, top: 90, rotate: 14, stirXa: 26, stirXb: -20, stirYa: -18, stirYb: 22, delay: -0.24 },
    { left: 78, top: 208, rotate: 11, stirXa: -20, stirXb: 24, stirYa: 18, stirYb: -16, delay: -0.34 },
    { left: 214, top: 210, rotate: -9, stirXa: 22, stirXb: -26, stirYa: 16, stirYb: -20, delay: -0.18 }
  ],
  6: [
    { left: 38, top: 72, rotate: -12, stirXa: -24, stirXb: 18, stirYa: -22, stirYb: 18, delay: 0 },
    { left: 156, top: 36, rotate: 8, stirXa: 20, stirXb: -18, stirYa: 20, stirYb: -16, delay: -0.12 },
    { left: 274, top: 82, rotate: 14, stirXa: 26, stirXb: -20, stirYa: -18, stirYb: 22, delay: -0.24 },
    { left: 78, top: 198, rotate: 11, stirXa: -20, stirXb: 24, stirYa: 18, stirYb: -16, delay: -0.34 },
    { left: 230, top: 206, rotate: -9, stirXa: 22, stirXb: -26, stirYa: 16, stirYb: -20, delay: -0.18 },
    { left: 166, top: 144, rotate: -2, stirXa: -18, stirXb: 18, stirYa: -24, stirYb: 20, delay: -0.42 }
  ]
};

function capsuleStyle(index: number) {
  const count = Math.min(Math.max(wheelItems.value.length, 1), 6);
  const item = capsuleLayouts[count][index] || capsuleLayouts[6][index % 6];
  return {
    left: item.left + "rpx",
    top: item.top + "rpx",
    "--base-rotate": item.rotate + "deg",
    "--stir-x-a": item.stirXa + "rpx",
    "--stir-x-b": item.stirXb + "rpx",
    "--stir-y-a": item.stirYa + "rpx",
    "--stir-y-b": item.stirYb + "rpx",
    "--roll-x-c": Math.round((item.stirXa + item.stirXb) * -0.45) + "rpx",
    "--roll-y-c": Math.round(Math.abs(item.stirYa) + 18) + "rpx",
    "--roll-x-d": Math.round(item.stirXb * 0.55) + "rpx",
    "--roll-y-d": Math.round(Math.abs(item.stirYb) * -0.35) + "rpx",
    animationDelay: item.delay + "s",
    transform: "rotate(var(--base-rotate))"
  };
}

function gachaItemLabel(item: WheelItem) {
  return item.name.length > 6 ? item.name.slice(0, 6) + "..." : item.name;
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

.gacha-zone {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 760rpx;
  margin: 4rpx 0 18rpx;
  overflow: hidden;
}

.gacha-stage {
  position: relative;
  width: 100%;
  max-width: 640rpx;
  height: 748rpx;
  display: grid;
  place-items: center;
}

.gacha-machine {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 2;
  width: 560rpx;
  transform: translateX(-50%);
  filter: drop-shadow(0 22rpx 38rpx rgba(205, 110, 152, 0.2));
}

.gacha-deco {
  position: absolute;
  z-index: 1;
  pointer-events: none;
  opacity: 0.9;
}

.gacha-deco-a {
  left: 8rpx;
  top: 70rpx;
  width: 116rpx;
  height: 116rpx;
  transform: rotate(-12deg);
}

.gacha-deco-b {
  right: 4rpx;
  bottom: 128rpx;
  width: 96rpx;
  height: 96rpx;
  transform: rotate(14deg);
}

.gacha-globe {
  position: absolute;
  left: 50%;
  top: 92rpx;
  z-index: 4;
  width: 418rpx;
  height: 358rpx;
  overflow: hidden;
  border-radius: 48% 48% 42% 42% / 52% 52% 44% 44%;
  transform: translateX(-50%);
}

.gacha-capsule {
  position: absolute;
  display: grid;
  place-items: center;
  width: 106rpx;
  height: 116rpx;
  transform-origin: center;
}

.gacha-stage.spinning .gacha-globe {
  animation: gacha-globe-wobble 0.62s ease-in-out infinite;
}

.gacha-stage.spinning .gacha-capsule {
  animation: gacha-capsule-roll 0.72s linear infinite;
}


.capsule-shell {
  position: absolute;
  width: 102rpx;
  height: 102rpx;
  z-index: 1;
}

.capsule-cover {
  position: relative;
  z-index: 2;
  width: 42rpx;
  height: 42rpx;
  margin-top: -16rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: #fff8fb;
}

.capsule-label {
  position: absolute;
  left: 50%;
  bottom: 0;
  z-index: 3;
  width: 138rpx;
  max-width: 138rpx;
  min-height: 30rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.82);
  padding: 0 8rpx;
  color: #315244;
  font-size: 17rpx;
  font-weight: 950;
  line-height: 30rpx;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: translateX(-50%);
  box-shadow: 0 4rpx 10rpx rgba(95, 159, 124, 0.1);
}

.gacha-knob-hit {
  position: absolute;
  left: 50%;
  bottom: 134rpx;
  z-index: 8;
  display: grid;
  place-items: center;
  width: 188rpx;
  height: 188rpx;
  margin-left: -4rpx;
  border-radius: 50%;
  transform: translateX(-50%);
}

.gacha-knob-hit.disabled {
  opacity: 0.96;
}

.gacha-knob-plate {
  position: relative;
  display: grid;
  place-items: center;
  width: 178rpx;
  height: 178rpx;
  transform: rotate(-8deg);
  transform-origin: 50% 50%;
  filter: drop-shadow(0 10rpx 18rpx rgba(189, 91, 132, 0.2));
}

.gacha-stage.spinning .gacha-knob-plate {
  animation: gacha-key-twist 0.58s cubic-bezier(0.55, 0.04, 0.32, 1) infinite;
}

.gacha-knob-img {
  position: absolute;
  inset: 0;
  width: 178rpx;
  height: 178rpx;
  opacity: 1;
}

.knob-label {
  position: relative;
  z-index: 2;
  margin-top: -4rpx;
  max-width: 92rpx;
  color: #ffffff;
  font-size: 23rpx;
  font-weight: 950;
  line-height: 1.04;
  text-align: center;
  text-shadow: 0 3rpx 8rpx rgba(137, 52, 91, 0.36);
  transform: rotate(-14deg);
}

.gacha-outlet {
  position: absolute;
  left: 50%;
  bottom: 54rpx;
  z-index: 7;
  width: 252rpx;
  height: 156rpx;
  overflow: visible;
  transform: translateX(-50%);
}

.drop-capsule {
  position: absolute;
  left: 50%;
  top: -76rpx;
  width: 82rpx;
  height: 88rpx;
  transform-origin: 50% 50%;
  animation: gacha-capsule-drop 0.86s cubic-bezier(0.2, 0.78, 0.24, 1) forwards;
}

.drop-capsule-shell {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 82rpx;
  height: 88rpx;
}

.drop-capsule-cover {
  position: absolute;
  left: 50%;
  top: 16rpx;
  z-index: 2;
  width: 30rpx;
  height: 30rpx;
  border: 3rpx solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  background: #fff8fb;
  transform: translateX(-50%);
}

@keyframes gacha-key-twist {
  0% { transform: rotate(-8deg) scale(1); }
  18% { transform: rotate(-30deg) scale(1.03); }
  42% { transform: rotate(28deg) scale(1.04); }
  68% { transform: rotate(-20deg) scale(1.02); }
  100% { transform: rotate(-8deg) scale(1); }
}

@keyframes gacha-globe-wobble {
  0% { transform: translateX(-50%) rotate(0deg) scale(1); }
  28% { transform: translateX(-50%) rotate(-2.6deg) scale(1.012); }
  58% { transform: translateX(-50%) rotate(2.2deg) scale(1.018); }
  100% { transform: translateX(-50%) rotate(0deg) scale(1); }
}

@keyframes gacha-capsule-roll {
  0% { transform: translate3d(0, 0, 0) rotate(var(--base-rotate)) scale(1); }
  16% { transform: translate3d(var(--stir-x-a), var(--stir-y-a), 0) rotate(calc(var(--base-rotate) + 105deg)) scale(1.03); }
  36% { transform: translate3d(var(--roll-x-c), var(--roll-y-c), 0) rotate(calc(var(--base-rotate) + 196deg)) scale(0.96); }
  58% { transform: translate3d(var(--stir-x-b), var(--stir-y-b), 0) rotate(calc(var(--base-rotate) + 282deg)) scale(1.02); }
  78% { transform: translate3d(var(--roll-x-d), var(--roll-y-d), 0) rotate(calc(var(--base-rotate) + 335deg)) scale(0.99); }
  100% { transform: translate3d(0, 0, 0) rotate(calc(var(--base-rotate) + 360deg)) scale(1); }
}

@keyframes gacha-capsule-drop {
  0% { opacity: 0; transform: translateX(-50%) translateY(-24rpx) scale(0.5) rotate(-32deg); }
  24% { opacity: 1; transform: translateX(-50%) translateY(42rpx) scale(0.68) rotate(18deg); }
  58% { opacity: 1; transform: translateX(-50%) translateY(218rpx) scale(0.82) rotate(-14deg); }
  78% { transform: translateX(-50%) translateY(184rpx) scale(0.78) rotate(10deg); }
  100% { opacity: 1; transform: translateX(-50%) translateY(210rpx) scale(0.8) rotate(-6deg); }
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

.draw-button.loading {
  background: linear-gradient(135deg, #8ee6b8, #ff98bd);
}

.winner-panel {
  position: relative;
  display: grid;
  grid-template-columns: 116rpx 1fr;
  gap: 18rpx;
  align-items: center;
  overflow: hidden;
  border: 1rpx solid rgba(255, 190, 214, 0.82);
  border-radius: 28rpx;
  background: #fff8fb;
  padding: 16rpx;
}

.winner-panel.blurring .winner-cover,
.winner-panel.blurring .winner-copy {
  filter: blur(8rpx);
  opacity: 0.28;
  transform: scale(0.98);
  transition: filter 0.18s ease, opacity 0.18s ease, transform 0.18s ease;
}

.winner-cover,
.winner-copy {
  transition: filter 0.18s ease, opacity 0.18s ease, transform 0.18s ease;
}

.winner-drawing-state {
  position: absolute;
  inset: 10rpx;
  z-index: 3;
  display: grid;
  grid-template-columns: 72rpx 1fr auto;
  align-items: center;
  gap: 16rpx;
  border: 1rpx solid rgba(216, 102, 147, 0.14);
  border-radius: 24rpx;
  background:
    linear-gradient(135deg, rgba(255, 248, 251, 0.9), rgba(235, 255, 243, 0.92)),
    rgba(255, 255, 255, 0.92);
  box-shadow: inset 0 0 0 1rpx rgba(255, 255, 255, 0.72);
  pointer-events: none;
}

.drawing-orb {
  display: grid;
  place-items: center;
  width: 58rpx;
  height: 58rpx;
  margin-left: 14rpx;
  border-radius: 50%;
  background: #ffe5ef;
  box-shadow: inset 0 -8rpx 14rpx rgba(216, 102, 147, 0.1);
}

.drawing-copy {
  min-width: 0;
}

.drawing-title {
  display: block;
  color: #513d4a;
  font-size: 28rpx;
  font-weight: 950;
  line-height: 1.15;
}

.drawing-subtitle {
  display: block;
  margin-top: 6rpx;
  color: #6d8b7d;
  font-size: 21rpx;
  font-weight: 800;
}

.drawing-dots {
  display: flex;
  align-items: center;
  gap: 7rpx;
  padding-right: 18rpx;
}

.drawing-dots view {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #d86693;
  animation: drawing-dot-bounce 0.72s ease-in-out infinite;
}

.drawing-dots view:nth-child(2) { animation-delay: 0.12s; }
.drawing-dots view:nth-child(3) { animation-delay: 0.24s; }

@keyframes drawing-dot-bounce {
  0%, 100% { transform: translateY(0); opacity: 0.42; }
  50% { transform: translateY(-7rpx); opacity: 1; }
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
