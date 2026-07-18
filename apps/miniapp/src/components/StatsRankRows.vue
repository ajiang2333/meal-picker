<template>
  <view class="rank-list">
    <view v-for="(item, index) in items" :key="item.name" class="rank-row">
      <text v-if="numbered" class="rank-index">{{ index + 1 }}</text>
      <text class="rank-name">{{ item.name }}</text>
      <view class="rank-track"><view class="rank-fill" :class="`tone-${index % 3}`" :style="{ width: barWidth(item.value) }" /></view>
      <text class="rank-value">{{ valueText(item.value) }}</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { StatsSeriesItem } from "@/types";

const props = withDefaults(defineProps<{
  items: StatsSeriesItem[];
  numbered?: boolean;
  money?: boolean;
}>(), { numbered: false, money: false });

const max = () => Math.max(...props.items.map((item) => item.value), 1);
const barWidth = (value: number) => `${Math.max(4, (value / max()) * 100)}%`;
const valueText = (value: number) => props.money ? `¥${value.toFixed(1)}` : String(value);
</script>

<style scoped lang="scss">
.rank-list { display: flex; flex-direction: column; gap: 12rpx; }
.rank-row { display: grid; grid-template-columns: auto 142rpx 1fr 78rpx; align-items: center; gap: 12rpx; font-size: 24rpx; }
.rank-index { width: 34rpx; height: 34rpx; border-radius: 50%; color: #fff; background: #ff6d91; text-align: center; line-height: 34rpx; font-size: 20rpx; }
.rank-name { white-space: nowrap; color: #31312f; }
.rank-track { height: 13rpx; border-radius: 99rpx; background: #edf7f2; overflow: hidden; }
.rank-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ff879f, #ff6f96); }
.tone-1 { background: linear-gradient(90deg, #85d9bd, #9be0c9); }
.tone-2 { background: linear-gradient(90deg, #ffa3b3, #ffbdc8); }
.rank-value { text-align: right; color: #151515; font-weight: 600; }
</style>
