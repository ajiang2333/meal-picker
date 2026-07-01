<template>
  <view class="page tab-page detail-page">
    <view class="app-nav">
      <view class="app-nav-left"><view class="app-nav-back" @tap="goBack"><uni-icons type="left" size="22" color="#d86693" /></view></view>
      <text class="app-nav-title">店铺详情</text>
      <view class="app-nav-right" />
    </view>
    <view v-if="loading && !store" class="detail-skeleton">
      <view class="detail-skeleton-hero">
        <u-loading-icon color="#d86693" size="28" />
        <view class="detail-skeleton-cover" />
        <view class="detail-skeleton-lines">
          <view class="detail-skeleton-line strong" />
          <view class="detail-skeleton-line" />
        </view>
      </view>
      <view class="detail-skeleton-grid">
        <view v-for="item in 3" :key="item" class="detail-skeleton-metric" />
      </view>
      <view class="detail-skeleton-list">
        <view v-for="item in 3" :key="item" class="detail-skeleton-row" />
      </view>
    </view>
    <view v-if="store" class="store-hero">
            <view class="hero-cover-shell">
        <image
          v-if="!coverError"
          v-show="coverLoaded"
          class="hero-cover"
          :src="coverSrc"
          mode="aspectFill"
          @load="handleCoverLoad"
          @error="handleCoverError"
        />
        <view v-if="!coverLoaded && !coverError" class="hero-cover-loading">
          <u-loading-icon color="#d86693" size="28" />
          <text>图片加载中</text>
        </view>
        <view v-if="coverError" class="hero-cover-fallback">
          <text>图片暂时没有加载出来</text>
        </view>
      </view>
      <view class="hero-content">
        <view class="tag-row">
          <text class="spring-tag">{{ store.category }}</text>
          <text class="score">{{ store.rating.toFixed(1) }}分</text>
        </view>
        <text class="title">{{ store.name }}</text>
        <text class="description">{{ store.description }}</text>
      </view>
    </view>

    <view v-if="store" class="metric-grid">
      <view class="metric">
        <text>{{ store.orderCount }}</text>
        <text>累计订单</text>
      </view>
      <view class="metric">
        <text>¥{{ store.avgPrice.toFixed(0) }}</text>
        <text>人均</text>
      </view>
      <view class="metric">
        <text>{{ store.tags.length }}</text>
        <text>标签</text>
      </view>
    </view>

    <view v-if="store" class="tag-cloud">
      <text v-for="tag in store.tags" :key="tag" class="soft-chip">{{ tag }}</text>
      <text v-for="time in store.mealTimes" :key="time" class="soft-chip mint">{{ time }}</text>
    </view>

    <u-button
      v-if="store"
      class="edit-toggle"
      :text="editing ? '收起编辑面板' : '更新店铺信息'"
      shape="circle"
      color="linear-gradient(135deg, #ff98bd, #8ee6b8)"
      custom-style="height: 44px; color: #ffffff; font-weight: 900; margin: 20rpx 0 0;"
      @click="editing = !editing"
    />

    <view v-if="store && editing" class="edit-panel">
      <u-form :model="editForm" label-position="top" label-width="100%">
        <u-form-item label="店铺名称">
          <u-input v-model="editForm.name" border="none" clearable placeholder="店铺名称" />
        </u-form-item>
        <u-form-item label="外卖种类">
          <u-input v-model="editForm.category" border="none" clearable placeholder="例如：快餐 / 奶茶 / 烧烤" />
        </u-form-item>
        <u-form-item label="标签">
          <u-input v-model="editForm.tagsText" border="none" clearable placeholder="标签，逗号分隔" />
        </u-form-item>
        <u-form-item label="用餐时间">
          <u-input v-model="editForm.mealTimesText" border="none" clearable placeholder="午餐，晚餐，夜宵" />
        </u-form-item>
        <u-form-item label="店铺备注">
          <u-textarea v-model="editForm.description" border="none" height="112" placeholder="店铺备注" maxlength="200" count />
        </u-form-item>
        <u-form-item label="本次更新说明">
          <u-textarea v-model="editForm.note" border="none" height="96" placeholder="这次修改了什么？" maxlength="120" count />
        </u-form-item>
      </u-form>
      <u-button
        text="保存到共建店铺库"
        shape="circle"
        color="linear-gradient(135deg, #d86693 0%, #8ee6b8 100%)"
        :loading="saving"
        custom-style="height: 46px; margin-top: 4px; color: #ffffff; font-weight: 900; box-shadow: 0 14px 30px rgba(216, 102, 147, 0.22);"
        @click="save"
      />
    </view>

    <view v-if="store" class="section-head">
      <view>
        <text class="section-title">菜品列表</text>
        <text class="section-note">点进菜品看看大家怎么说</text>
      </view>
      <text class="count">{{ dishes.length }} 款</text>
    </view>
    <u-list v-if="store" class="dish-list spring-list fixed-scroll-list dish-scroll-list" custom-style="height: auto; max-height: 430rpx;">
      <u-list-item v-for="dish in dishes" :key="dish.id">
        <view class="dish-card" @tap="openDish(dish.id)">
          <view class="dish-mark">{{ dish.name.slice(0, 1) }}</view>
          <view class="dish-main">
            <text class="strong">{{ dish.name }}</text>
            <text class="muted">¥{{ dish.price }} · {{ dish.rating.toFixed(1) }}分</text>
          </view>
          <uni-icons type="arrowright" size="15" color="#d86693" />
        </view>
      </u-list-item>
    </u-list>

    <view v-if="store" class="section-head">
      <view>
        <text class="section-title">具体用户评价</text>
        <text class="section-note">春日口味留言板</text>
      </view>
      <text class="count">{{ reviews.length }} 条</text>
    </view>
    <u-list v-if="store" class="review-list spring-list fixed-scroll-list review-scroll-list" custom-style="height: auto; max-height: 520rpx;">
      <u-list-item v-for="review in reviews" :key="review.id">
        <view class="review-card">
          <view class="review-card-head">
            <UserBadge :user="review.user" />
            <text class="review-time">{{ formatDisplayTime(review.createdAt) }}</text>
          </view>
          <text class="strong">{{ review.targetName }} · {{ review.rating }}分</text>
          <text class="review-text">{{ review.content }}</text>
        </view>
      </u-list-item>
      <u-list-item v-if="!reviews.length">
        <view class="empty-card">
          <text>还没有评价</text>
          <text>等第一条粉绿口味笔记出现</text>
        </view>
      </u-list-item>
    </u-list>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { computed, reactive, ref } from "vue";
import { api } from "@/api/client";
import UserBadge from "@/components/UserBadge.vue";
import type { Dish, Review, Store } from "@/types";

const id = ref("");
const store = ref<Store | null>(null);
const dishes = ref<Dish[]>([]);
const reviews = ref<Review[]>([]);
const editing = ref(false);
const saving = ref(false);
const loading = ref(true);
const coverLoaded = ref(false);
const coverError = ref(false);
const defaultCover = "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80";
const coverSrc = computed(() => store.value?.coverUrl || defaultCover);
const editForm = reactive({
  name: "",
  category: "",
  tagsText: "",
  mealTimesText: "",
  description: "",
  note: ""
});

onLoad((query) => {
  id.value = String(query?.id || "");
  load();
});

async function load() {
  if (!store.value) loading.value = true;
  coverLoaded.value = false;
  coverError.value = false;
  try {
    const result = await api.store(id.value) as { store: Store; dishes: Dish[]; reviews: Review[] };
    store.value = result.store;
    dishes.value = result.dishes;
    reviews.value = result.reviews;
    Object.assign(editForm, {
      name: result.store.name,
      category: result.store.category,
      tagsText: result.store.tags.join("，"),
      mealTimesText: result.store.mealTimes.join("，"),
      description: result.store.description || "",
      note: ""
    });
  } finally {
    loading.value = false;
  }
}

function formatDisplayTime(value?: string) {
  return String(value || "")
    .replace("T", " ")
    .replace(/\.\d+Z$/, "")
    .replace(/([+-]\d{2}:?\d{2}|Z)$/, "")
    .slice(0, 16);
}

function handleCoverLoad() {
  coverLoaded.value = true;
  coverError.value = false;
}

function handleCoverError() {
  coverLoaded.value = false;
  coverError.value = true;
}

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }
  uni.switchTab({ url: "/pages/stores/index" });
}

async function save() {
  if (!editForm.name.trim()) {
    uni.showToast({ title: "请填写店铺名称", icon: "none" });
    return;
  }
  if (saving.value) return;
  saving.value = true;
  try {
    await api.updateStore(id.value, {
      name: editForm.name.trim(),
      category: editForm.category.trim() || "快餐",
      tags: editForm.tagsText.split(/[，,、\s]+/).map((item) => item.trim()).filter(Boolean),
      mealTimes: editForm.mealTimesText.split(/[，,、\s]+/).map((item) => item.trim()).filter(Boolean),
      description: editForm.description.trim(),
      note: editForm.note.trim()
    });
    editing.value = false;
    uni.showToast({ title: "已更新店铺" });
    await load();
  } finally {
    saving.value = false;
  }
}

function openDish(dishId: string) {
  uni.navigateTo({ url: `/pages/dish-detail/index?id=${dishId}` });
}
</script>

<style scoped>
.detail-page {
  background:
    radial-gradient(circle at 10% 6%, rgba(255, 194, 218, 0.5), transparent 180rpx),
    radial-gradient(circle at 94% 18%, rgba(178, 239, 202, 0.72), transparent 220rpx),
    linear-gradient(180deg, #fff7fb 0%, #f5fff8 62%, #fff9fb 100%);
  color: #24352d;
}

.detail-skeleton {
  display: grid;
  gap: 18rpx;
}

.detail-skeleton-hero,
.detail-skeleton-metric,
.detail-skeleton-row {
  overflow: hidden;
  border: 1rpx solid rgba(172, 225, 196, 0.78);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 12rpx 30rpx rgba(95, 159, 124, 0.08);
}

.detail-skeleton-hero {
  position: relative;
  display: grid;
  gap: 18rpx;
  padding: 18rpx;
}

.detail-skeleton-cover,
.detail-skeleton-line,
.detail-skeleton-metric,
.detail-skeleton-row {
  background: linear-gradient(90deg, rgba(255, 232, 241, 0.92), rgba(229, 255, 239, 0.92), rgba(255, 232, 241, 0.92));
  background-size: 260% 100%;
  animation: detail-skeleton-shimmer 1.2s ease-in-out infinite;
}

.detail-skeleton-cover {
  height: 310rpx;
  border-radius: 24rpx;
}

.detail-skeleton-lines {
  display: grid;
  gap: 14rpx;
  padding: 6rpx 8rpx 10rpx;
}

.detail-skeleton-line {
  width: 78%;
  height: 24rpx;
  border-radius: 999rpx;
}

.detail-skeleton-line.strong {
  width: 48%;
  height: 34rpx;
}

.detail-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
}

.detail-skeleton-metric {
  height: 116rpx;
}

.detail-skeleton-list {
  display: grid;
  gap: 16rpx;
}

.detail-skeleton-row {
  height: 112rpx;
}

@keyframes detail-skeleton-shimmer {
  0% { background-position: 120% 0; }
  100% { background-position: -120% 0; }
}

.store-hero {
  overflow: hidden;
  border: 1rpx solid rgba(172, 225, 196, 0.85);
  border-radius: 36rpx;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 18rpx 44rpx rgba(95, 159, 124, 0.1);
}

.hero-cover-shell {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 310rpx;
  background: linear-gradient(135deg, #fff0f6 0%, #eafff2 100%);
}

.hero-cover {
  display: block;
  width: 100%;
  height: 100%;
  background: #f3edf1;
}

.hero-cover-loading,
.hero-cover-fallback {
  position: absolute;
  inset: 0;
  display: grid;
  gap: 12rpx;
  place-items: center;
  align-content: center;
  color: #8d7281;
  font-size: 24rpx;
  font-weight: 900;
}

.hero-cover-loading::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(255, 232, 241, 0.4), rgba(229, 255, 239, 0.85), rgba(255, 232, 241, 0.4));
  background-size: 260% 100%;
  animation: cover-shimmer 1.25s ease-in-out infinite;
}

.hero-cover-loading :deep(.u-loading-icon),
.hero-cover-loading text {
  position: relative;
  z-index: 1;
}

.hero-cover-fallback {
  background: linear-gradient(135deg, rgba(255, 232, 241, 0.95), rgba(229, 255, 239, 0.95));
}

@keyframes cover-shimmer {
  0% { background-position: 120% 0; }
  100% { background-position: -120% 0; }
}

.hero-content {
  display: grid;
  gap: 12rpx;
  padding: 24rpx;
}

.tag-row,
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.spring-tag,
.soft-chip,
.count {
  border-radius: 999rpx;
  background: #ffe4ef;
  padding: 8rpx 16rpx;
  color: #d86693;
  font-size: 22rpx;
  font-weight: 900;
}

.score {
  color: #d86693;
  font-size: 28rpx;
  font-weight: 950;
}

.title {
  color: #24352d;
  font-size: 46rpx;
  font-weight: 950;
}

.review-time {
  display: inline-flex;
  width: fit-content;
  min-height: 40rpx;
  flex-shrink: 0;
  align-items: center;
  border-radius: 999rpx;
  background: #eefcf4;
  color: #4f7b67;
  padding: 0 14rpx;
  font-size: 22rpx;
  font-weight: 900;
}

.description,
.section-note,
.review-text {
  color: #5b7569;
  font-size: 25rpx;
  line-height: 1.6;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  margin-top: 18rpx;
}

.metric {
  display: grid;
  gap: 6rpx;
  place-items: center;
  border: 1rpx solid rgba(172, 225, 196, 0.8);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.8);
  padding: 18rpx 6rpx;
}

.metric text:first-child {
  color: #d86693;
  font-size: 34rpx;
  font-weight: 950;
}

.metric text:last-child {
  color: #7e978b;
  font-size: 22rpx;
  font-weight: 800;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 18rpx;
}

.soft-chip.mint {
  background: #e2fbe9;
  color: #4f7b67;
}

.edit-toggle {
  margin-top: 20rpx;
}

.edit-panel {
  display: grid;
  gap: 18rpx;
  margin-top: 18rpx;
  border: 1rpx solid rgba(172, 225, 196, 0.85);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.86);
  padding: 22rpx;
}

:deep(.u-form-item) {
  width: 100%;
}

:deep(.u-form-item__body) {
  width: 100%;
  padding: 4rpx 0 18rpx;
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

.section-head {
  margin: 30rpx 0 16rpx;
}

.section-title,
.strong {
  display: block;
  color: #24352d;
  font-weight: 950;
}

.section-title {
  font-size: 32rpx;
}

.dish-list,
.review-list {
  display: grid;
  gap: 16rpx;
}

.spring-list :deep(.u-list) {
  background: transparent !important;
}

.spring-list :deep(.u-list-item) {
  background: transparent !important;
}

.fixed-scroll-list,
:deep(.fixed-scroll-list.u-list),
:deep(.u-list.fixed-scroll-list),
.fixed-scroll-list :deep(.u-list) {
  height: auto !important;
  overflow-y: auto !important;
}

.dish-scroll-list,
:deep(.dish-scroll-list.u-list),
.dish-scroll-list :deep(.u-list) {
  max-height: 430rpx !important;
}

.review-scroll-list,
:deep(.review-scroll-list.u-list),
.review-scroll-list :deep(.u-list) {
  max-height: 520rpx !important;
}

.dish-card,
.review-card,
.empty-card {
  border: 1rpx solid rgba(172, 225, 196, 0.85);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.86);
  padding: 20rpx;
  box-shadow: 0 12rpx 30rpx rgba(95, 159, 124, 0.08);
}

.dish-card {
  display: grid;
  grid-template-columns: 78rpx 1fr auto;
  align-items: center;
  gap: 16rpx;
}

.dish-mark {
  display: grid;
  place-items: center;
  width: 78rpx;
  height: 78rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #ffb8d0, #8ee6b8);
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 950;
}

.dish-main {
  min-width: 0;
}

.muted {
  color: #7e978b;
  font-size: 23rpx;
}

.review-card,
.empty-card {
  display: grid;
  gap: 12rpx;
}

.review-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12rpx;
}

.review-card-head .review-time {
  margin-left: auto;
}

.empty-card {
  place-items: center;
  border-style: dashed;
  color: #7e978b;
}
</style>
