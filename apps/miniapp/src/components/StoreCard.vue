<template>
  <view class="store-card" @tap="openDetail">
    <image class="cover" :src="coverSrc" mode="aspectFill" />
    <view class="meta">
      <view class="title-row">
        <text class="tag">{{ store.category }}</text>
        <text class="name">{{ store.name }}</text>
        <text class="rating">{{ store.rating.toFixed(1) }}分</text>
      </view>
      <view class="subline">
        <text>{{ store.orderCount }} 单</text>
        <text>人均 ¥{{ store.avgPrice.toFixed(1) }}</text>
        <text v-if="store.createdBy">创建：{{ store.createdBy.nickname }}</text>
      </view>
      <view class="subline">
        <text v-for="tag in store.tags.slice(0, 3)" :key="tag" class="plain-tag">{{ tag }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Store } from "@/types";

const props = defineProps<{
  store: Store;
}>();

const defaultCover = "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=500&q=80";
const coverSrc = computed(() => props.store.coverUrl || defaultCover);

function openDetail() {
  uni.navigateTo({ url: `/pages/store-detail/index?id=${props.store.id}` });
}
</script>

<style scoped>
.store-card {
  display: grid;
  grid-template-columns: 168rpx minmax(0, 1fr);
  gap: 20rpx;
  align-items: center;
  width: 100%;
  height: 208rpx;
  overflow: hidden;
  padding: 20rpx;
  border: 1rpx solid rgba(216, 102, 147, 0.12);
  border-radius: 24rpx;
  background: linear-gradient(135deg, #fff7fb 0%, #f1fff6 100%);
  box-shadow: 0 12rpx 28rpx rgba(95, 159, 124, 0.08);
}

.cover {
  width: 168rpx;
  height: 168rpx;
  border-radius: 16rpx;
  background: #eeeeee;
}

.meta {
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 900;
}

.rating {
  color: #ff8a00;
  font-weight: 900;
}

.subline {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 10rpx;
  height: 34rpx;
  min-width: 0;
  overflow: hidden;
  color: #7e978b;
  font-size: 24rpx;
}

.plain-tag {
  flex: 0 0 auto;
  max-width: 150rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #e4faee;
  padding: 4rpx 12rpx;
  color: #4f7b67;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
