<template>
  <view class="page tab-page stores-page">
    <view class="app-nav">
      <view class="app-nav-left" />
      <text class="app-nav-title">店铺</text>
      <view class="app-nav-right" />
    </view>
    <view class="top-panel">
      <view class="top-copy">
        <text class="eyebrow">SPRING MENU MAP</text>
        <text class="top-title">今天想吃点什么？</text>
      </view>
      <view class="search-shell">
        <u-search
          v-model="keyword"
          placeholder="搜索店铺、菜品、种类"
          :show-action="false"
          :animation="false"
          shape="round"
          bg-color="#fff7fb"
          border-color="rgba(216, 102, 147, 0.12)"
          color="#513d4a"
          placeholder-color="#9b8994"
          search-icon-color="#d86693"
          height="44"
          @change="queueLoad"
          @search="load"
          @clear="queueLoad"
        />
      </view>
    </view>

    <view class="tabs-panel">
      <u-tabs
        :list="categoryTabs"
        :current="categoryIndex"
        line-color="#d86693"
        :line-width="28"
        :line-height="5"
        :active-style="activeTabStyle"
        :inactive-style="inactiveTabStyle"
        item-style="height: 42px; min-width: 68px; padding: 0 12px; flex-shrink: 0;"
        @click="setCategoryByTab"
        @change="setCategoryByTab"
      />
    </view>

    <view class="store-list-block">
      <view class="section-head">
      <view class="section-title-wrap">
        <text class="section-title">店铺列表</text>
        <text class="count-pill">总共 {{ stores.length }} 家</text>
      </view>
      <text class="section-tip">{{ category === "全部" ? "全部种类" : category }}</text>
    </view>

      <u-list v-if="stores.length" class="list spring-list stable-list" :scrollable="false" custom-style="height: auto;">
      <u-list-item v-for="store in stores" :key="store.id">
        <StoreCard :store="store" />
      </u-list-item>
    </u-list>
      <view v-else-if="loading" class="store-skeleton-list">
      <view v-for="item in 3" :key="item" class="store-skeleton-card">
        <view class="skeleton-cover" />
        <view class="skeleton-lines">
          <view class="skeleton-line strong" />
          <view class="skeleton-line" />
          <view class="skeleton-tags"><view /><view /><view /></view>
        </view>
      </view>
    </view>
      <view v-else class="empty-panel">
      <text class="empty-title">没有找到匹配店铺</text>
      <text class="empty-copy">换个关键词或回到全部分类看看。</text>
    </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onShow, onTabItemTap } from "@dcloudio/uni-app";
import { computed, ref } from "vue";
import { api } from "@/api/client";
import StoreCard from "@/components/StoreCard.vue";
import type { Store } from "@/types";

const keyword = ref("");
const category = ref("全部");
const categoryIndex = ref(0);
const categories = ref(["全部", "快餐", "奶茶", "烧烤", "火锅", "轻食", "粉面"]);
const stores = ref<Store[]>([]);
const loading = ref(false);
let loadVersion = 0;
const activeTabStyle = { color: "#d86693", fontWeight: "900", fontSize: "14px" };
const inactiveTabStyle = { color: "#7e978b", fontWeight: "900", fontSize: "14px" };
let loadTimer: ReturnType<typeof setTimeout> | undefined;

const categoryTabs = computed(() => categories.value.map((name) => ({ name })));

function setCategoryByTab(item: { name?: string; index?: number } = {}, index?: number) {
  const nextIndex = typeof item.index === "number"
    ? item.index
    : typeof index === "number"
      ? index
      : categories.value.indexOf(item.name || "全部");
  categoryIndex.value = Math.max(0, nextIndex);
  category.value = categories.value[categoryIndex.value] || "全部";
  load();
}

function queueLoad() {
  if (loadTimer) clearTimeout(loadTimer);
  loadTimer = setTimeout(load, 160);
}

function resetFilters() {
  keyword.value = "";
  setCategoryByTab({ index: 0, name: "全部" });
}

async function load() {
  const version = ++loadVersion;
  loading.value = true;
  try {
    const query = `?keyword=${encodeURIComponent(keyword.value)}&category=${encodeURIComponent(category.value)}`;
    const result = await api.stores(query) as { stores: Store[] };
    if (version === loadVersion) stores.value = result.stores;
  } finally {
    if (version === loadVersion) loading.value = false;
  }
}

onTabItemTap(resetFilters);
onShow(load);
</script>

<style scoped>
.stores-page {
  display: grid;
  gap: 14rpx;
  padding-bottom: 36rpx;
  align-content: flex-start;
}

.top-panel,
.tabs-panel,
.empty-panel {
  border: 1rpx solid rgba(216, 102, 147, 0.16);
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 18rpx 42rpx rgba(216, 102, 147, 0.12);
}

.top-panel {
  display: grid;
  gap: 22rpx;
  position: relative;
  overflow: hidden;
  padding: 30rpx;
  background: linear-gradient(135deg, #ffd8e6 0%, #fff8fb 46%, #caf7dc 100%);
}

.top-panel::after {
  content: "";
  position: absolute;
  right: -22rpx;
  top: -34rpx;
  width: 166rpx;
  height: 166rpx;
  border: 18rpx solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
}

.top-copy {
  position: relative;
  z-index: 1;
}

.eyebrow {
  display: block;
  color: #8d7281;
  font-size: 22rpx;
  font-weight: 900;
  letter-spacing: 0;
}

.top-title {
  display: block;
  margin-top: 8rpx;
  color: #513d4a;
  font-size: 44rpx;
  font-weight: 950;
}

.search-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 88rpx;
  overflow: hidden;
  border: 1rpx solid rgba(216, 102, 147, 0.12);
  border-radius: 999rpx;
  background: #fff7fb;
  box-shadow: 0 12rpx 26rpx rgba(216, 102, 147, 0.12);
}

.tabs-panel {
  height: 96rpx;
  overflow: hidden;
  padding: 8rpx 10rpx;
  background: linear-gradient(135deg, #fff3f8 0%, #f0fff6 100%);
}

.store-list-block {
  display: grid;
  gap: 12rpx;
  margin-top: -2rpx;
}

.section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16rpx;
  margin: 0;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12rpx;
}

.section-title {
  color: #513d4a;
  font-size: 40rpx;
  font-weight: 950;
}

.count-pill,
.section-tip {
  display: inline-flex;
  align-items: center;
  border-radius: 999rpx;
  font-size: 23rpx;
  font-weight: 900;
}

.count-pill {
  background: #e4faee;
  color: #3f7d5e;
  padding: 8rpx 16rpx;
}

.section-tip {
  flex: 0 0 auto;
  background: #fff1f7;
  color: #d86693;
  padding: 8rpx 14rpx;
}

.list {
  display: grid;
  gap: 16rpx;
}

.spring-list :deep(.u-list),
.spring-list :deep(.u-list-item) {
  background: transparent !important;
}

.stable-list {
  display: block;
  min-height: 0;
}

.stable-list :deep(.u-list),
.stable-list :deep(.u-list > view),
.stable-list :deep(.uni-scroll-view),
.stable-list :deep(.uni-scroll-view-content) {
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
}

.store-skeleton-list {
  display: grid;
  gap: 16rpx;
}

.store-skeleton-card {
  display: grid;
  grid-template-columns: 168rpx minmax(0, 1fr);
  gap: 18rpx;
  overflow: hidden;
  border: 1rpx solid rgba(172, 225, 196, 0.78);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.8);
  padding: 18rpx;
  box-shadow: 0 12rpx 30rpx rgba(95, 159, 124, 0.08);
}

.skeleton-cover,
.skeleton-line,
.skeleton-tags view {
  overflow: hidden;
  background: linear-gradient(90deg, rgba(255, 232, 241, 0.92), rgba(229, 255, 239, 0.92), rgba(255, 232, 241, 0.92));
  background-size: 260% 100%;
  animation: skeleton-shimmer 1.2s ease-in-out infinite;
}

.skeleton-cover {
  height: 150rpx;
  border-radius: 24rpx;
}

.skeleton-lines {
  display: grid;
  align-content: center;
  gap: 16rpx;
}

.skeleton-line {
  width: 76%;
  height: 22rpx;
  border-radius: 999rpx;
}

.skeleton-line.strong {
  width: 52%;
  height: 30rpx;
}

.skeleton-tags {
  display: flex;
  gap: 10rpx;
}

.skeleton-tags view {
  width: 88rpx;
  height: 34rpx;
  border-radius: 999rpx;
}

@keyframes skeleton-shimmer {
  0% { background-position: 120% 0; }
  100% { background-position: -120% 0; }
}

.empty-panel {
  display: grid;
  place-items: center;
  padding: 54rpx 34rpx;
  text-align: center;
}

.empty-title {
  color: #513d4a;
  font-size: 32rpx;
  font-weight: 950;
}

.empty-copy {
  margin-top: 8rpx;
  color: #8d7281;
  font-size: 24rpx;
}

:deep(.u-search) {
  width: 100%;
  height: 88rpx;
  min-width: 0;
}

:deep(.u-search__content) {
  width: 100%;
  height: 88rpx;
  min-width: 0;
  border: 0 !important;
  background: transparent !important;
}

:deep(.u-search__content__input) {
  height: 88rpx;
  min-height: 88rpx;
  line-height: 88rpx;
}

:deep(.u-search__action) {
  display: none !important;
  width: 0 !important;
  min-width: 0 !important;
  margin: 0 !important;
}

:deep(.u-tabs),
:deep(.u-tabs__wrapper),
:deep(.u-tabs__wrapper__scroll-view-wrapper),
:deep(.u-tabs__wrapper__scroll-view) {
  height: 80rpx;
  max-width: 100%;
  overflow: hidden;
}

:deep(.u-tabs__wrapper__nav) {
  align-items: center;
  height: 80rpx;
  min-width: max-content;
}

:deep(.u-tabs__wrapper__nav__item) {
  height: 68rpx !important;
  min-width: 136rpx !important;
  border-radius: 999rpx;
  background: transparent !important;
}

:deep(.u-tabs__wrapper__nav__item-active) {
  background: #ffe4ef !important;
}

:deep(.u-tabs__wrapper__nav__line) {
  bottom: 4rpx !important;
}
</style>
