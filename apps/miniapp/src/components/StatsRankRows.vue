<template>
  <view class="rank-list" :class="{ 'wide-name': wideName, interactive }">
    <view
      v-for="(item, index) in items"
      :key="item.name"
      class="rank-row"
      :class="{ active: isActive(item, index) }"
      @tap="toggleItem(item, index)"
    >
      <text v-if="numbered" class="rank-index">{{ index + 1 }}</text>
      <text class="rank-name">{{ item.name }}</text>
      <view class="rank-track"><view class="rank-fill" :class="`tone-${index % 3}`" :style="{ width: barWidth(item.value) }" /></view>
      <text class="rank-value">{{ valueText(item.value) }}</text>
      <view v-if="interactive && isActive(item, index)" class="rank-tooltip" :class="{ below: index === 0 }">
        <text class="tooltip-name">{{ item.name }}</text>
        <text class="tooltip-value">{{ tooltipText(item.value) }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { StatsSeriesItem } from "@/types";

const props = withDefaults(defineProps<{
  items: StatsSeriesItem[];
  numbered?: boolean;
  money?: boolean;
  interactive?: boolean;
  wideName?: boolean;
}>(), { numbered: false, money: false, interactive: false, wideName: false });

const activeKey = ref("");

const max = () => Math.max(...props.items.map((item) => item.value), 1);
const barWidth = (value: number) => `${Math.max(4, (value / max()) * 100)}%`;
const valueText = (value: number) => props.money ? `¥${value.toFixed(1)}` : String(value);
const itemKey = (item: StatsSeriesItem, index: number) => `${item.name}-${index}`;
const isActive = (item: StatsSeriesItem, index: number) => activeKey.value === itemKey(item, index);
const tooltipText = (value: number) => props.money ? `消费 ¥${value.toFixed(1)}` : props.numbered ? `复购 ${value} 次` : `${value}`;

function toggleItem(item: StatsSeriesItem, index: number) {
  if (!props.interactive) return;
  const key = itemKey(item, index);
  activeKey.value = activeKey.value === key ? "" : key;
}
</script>

<style scoped lang="scss">
.rank-list { display: flex; flex-direction: column; gap: 12rpx; overflow: visible; }
.rank-row { position: relative; display: grid; grid-template-columns: auto 142rpx minmax(0, 1fr) 78rpx; align-items: center; gap: 12rpx; font-size: 24rpx; overflow: visible; }
.rank-list.wide-name .rank-row { grid-template-columns: auto minmax(190rpx, 230rpx) minmax(0, 1fr) 84rpx; }
.rank-list.interactive .rank-row { cursor: pointer; }
.rank-index { width: 34rpx; height: 34rpx; border-radius: 50%; color: #fff; background: #ff6d91; text-align: center; line-height: 34rpx; font-size: 20rpx; }
.rank-name { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #31312f; }
.rank-track { height: 13rpx; border-radius: 99rpx; background: #edf7f2; overflow: hidden; }
.rank-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #ff879f, #ff6f96); }
.tone-1 { background: linear-gradient(90deg, #85d9bd, #9be0c9); }
.tone-2 { background: linear-gradient(90deg, #ffa3b3, #ffbdc8); }
.rank-value { text-align: right; color: #151515; font-weight: 600; }
.rank-tooltip { position: absolute; right: 68rpx; top: -58rpx; z-index: 12; display: flex; align-items: center; gap: 12rpx; max-width: 420rpx; padding: 8rpx 14rpx; border-radius: 999rpx; background: rgba(255, 255, 255, .96); border: 1px solid #ffd5df; box-shadow: 0 8rpx 22rpx rgba(255, 111, 150, .16); color: #426b5c; font-size: 21rpx; pointer-events: none; }
.rank-tooltip.below { top: 38rpx; }
.tooltip-name { max-width: 260rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 800; color: #253b33; }
.tooltip-value { flex: none; color: #f35b85; font-weight: 800; }
</style>