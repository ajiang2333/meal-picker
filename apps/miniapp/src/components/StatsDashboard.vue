<template>
  <view class="stats-shell">
    <view class="hero">
      <view class="spark spark-a">✦</view><view class="spark spark-b">✦</view>
      <view class="hero-copy">
        <text class="eyebrow">本月消费</text>
        <view class="amount"><text class="currency">¥</text>{{ dashboard.summary.totalSpend.toFixed(1) }}</view>
        <view class="swoosh" />
      </view>
      <image class="hero-sticker" src="/static/stats/magic-menu-badge.png" mode="aspectFit" />
    </view>

    <view class="summary-row">
      <view class="summary-item"><text class="summary-value">{{ dashboard.summary.orderCount }}单</text><text>订单</text></view>
      <view class="summary-item"><text class="summary-value">¥{{ dashboard.summary.averageOrderValue.toFixed(1) }}</text><text>客单价</text></view>
      <view class="summary-item"><text class="summary-value">{{ dashboard.summary.favoriteStore }}</text><text>常点店铺</text></view>
    </view>

    <view class="trend-card">
      <view class="section-head">
        <text class="section-title">消费趋势</text>
        <view class="range-switch"><text v-for="range in [7, 30]" :key="range" :class="{ active: dashboard.rangeDays === range }" @click="$emit('range-change', range)">近{{ range }}天</text></view>
      </view>
      <view class="trend-wrap" @tap="handleTrendTap">
        <canvas id="trendCanvas" canvas-id="trendCanvas" class="chart trend-chart" />
        <view
          v-if="trendTooltip.show && trendTooltip.item"
          class="chart-floating trend-floating"
          :class="trendTooltip.edge"
          :style="{ left: `${trendTooltip.left}px`, top: `${trendTooltip.top}px` }"
        >
          <text class="bubble-title">{{ trendTooltip.item.label }}</text>
          <text class="bubble-value">¥{{ formatMoney(trendTooltip.item.value) }}</text>
        </view>
        <view v-if="loading" class="chart-loading">正在加载...</view>
      </view>
    </view>

    <view class="split-grid">
      <view class="data-block category-block">
        <view class="mini-title"><text>✦ 类型占比</text></view>
        <view class="donut-area" @tap="showCategoryTooltip(selectedCategory, selectedCategoryIndex)">
          <view class="donut-wrap" :style="{ background: categoryGradient }">
            <view class="donut-hole" />
            <view class="donut-center"><text class="donut-total">¥{{ dashboard.summary.totalSpend.toFixed(1) }}</text><text>累计</text></view>
          </view>
          <view v-if="categoryTooltip.show && selectedCategory" class="chart-floating category-floating" :style="{ borderColor: categoryDetailColor }">
            <text class="bubble-title">{{ selectedCategory.name }}</text>
            <text class="bubble-value">{{ percent(selectedCategory.value, categoryTotal) }}% · ¥{{ formatMoney(selectedCategory.value) }}</text>
          </view>
        </view>
        <view class="legend legend-under">
          <view
            v-for="(item, i) in dashboard.categories"
            :key="item.name"
            class="legend-item"
            :class="{ active: selectedCategory?.name === item.name }"
            @tap.stop="showCategoryTooltip(item, i)"
          >
            <view class="dot" :style="{ background: colorFor(i) }" />
            <text class="legend-name">{{ item.name }}</text>
            <text class="legend-percent">{{ percent(item.value, categoryTotal) }}%</text>
          </view>
        </view>
        <image class="corner-sticker skewer" src="/static/stats/skewer.png" mode="aspectFit" />
      </view>
      <view class="data-block meal-block">
        <view class="mini-title title-with-note"><text>✦ 用餐时段</text><text class="title-note">按实付金额</text></view>
        <view class="meal-bars">
          <view v-if="mealTooltip.show && selectedMealTime" class="chart-floating meal-floating" :style="{ left: mealTooltipLeft(selectedMealIndex) }">
            <text class="bubble-title">{{ selectedMealTime.name }}</text>
            <text class="bubble-value">¥{{ formatMoney(selectedMealTime.value) }} · {{ percent(selectedMealTime.value) }}%</text>
          </view>
          <view v-for="(item, index) in dashboard.mealTimes" :key="item.name" class="meal-item" @tap.stop="showMealTooltip(item, index)">
            <text :class="`meal-name tone-text-${index}`">{{ item.name }}</text>
            <text class="meal-percent">{{ percent(item.value) }}%</text>
            <text class="meal-money">¥{{ item.value.toFixed(1) }}</text>
            <view class="meal-track"><view :class="`meal-fill tone-bg-${index}`" :style="{ height: mealHeight(item.value) }" /></view>
          </view>
        </view>
        <image class="corner-sticker drink" src="/static/stats/drink.png" mode="aspectFit" />
      </view>
    </view>

    <view class="details-card">
      <view class="detail-section">
        <view class="mini-title title-with-note"><text>✦ 店铺复购</text><text class="title-note">Top 5</text></view>
        <StatsRankRows :items="dashboard.stores" numbered interactive wide-name />
      </view>
      <view class="detail-section"><view class="mini-title"><text>✦ 评分分布</text></view><StatsRankRows :items="dashboard.ratings" /></view>
      <view class="detail-section contribution">
        <view class="mini-title title-with-note"><text>✦ 用户贡献</text><text class="title-note">按消费金额</text></view>
        <StatsRankRows :items="dashboard.users" money />
        <image class="detail-sticker" src="/static/stats/bento.png" mode="aspectFit" />
      </view>
      <image class="cake-sticker" src="/static/stats/cake.png" mode="aspectFit" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { Area, Axis, Canvas, Chart, Line, Point, createElement } from "@antv/f2";
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import StatsRankRows from "./StatsRankRows.vue";
import type { StatsDashboard, StatsSeriesItem } from "@/types";

type TrendPoint = StatsSeriesItem & { label: string; index: number };

const props = defineProps<{ dashboard: StatsDashboard; loading?: boolean }>();
defineEmits<{ (event: "range-change", range: 7 | 30): void }>();
const instance = getCurrentInstance();
const charts: any[] = [];
const activeCategoryName = ref("");
const activeMealTimeName = ref("");
const activeMealTimeIndex = ref(0);
const categoryTooltip = reactive({ show: false });
const mealTooltip = reactive({ show: false });
const trendTooltip = reactive<{ show: boolean; left: number; top: number; edge: "edge-left" | "edge-right" | ""; item: TrendPoint | null }>({
  show: false,
  left: 0,
  top: 0,
  edge: "",
  item: null
});
const palette = ["#ff6f96", "#83d9bd", "#ffb5c3", "#95cf72", "#ffcf7c", "#b8e4d2"];
const trendPadding = { top: 18, right: 16, bottom: 44, left: 42 };

const formatMoney = (value: number) => Number(value || 0).toFixed(1);
const colorFor = (index: number) => palette[index % palette.length];
const totalValue = (items: StatsSeriesItem[]) => items.reduce((sum, item) => sum + Number(item.value || 0), 0);
const percent = (value: number, total = props.dashboard.summary.totalSpend) => Math.round(Number(value || 0) / Math.max(total, 1) * 100);
const mealHeight = (value: number) => `${Math.max(24, value / Math.max(...props.dashboard.mealTimes.map((item) => item.value), 1) * 72)}rpx`;

const trendData = computed<TrendPoint[]>(() => props.dashboard.trend.map((item, index) => ({
  name: item.name,
  value: Number(item.value || 0),
  label: formatDateLabel(item.name),
  index
})));
const trendMax = computed(() => Math.max(...trendData.value.map((item) => item.value), 1));
const trendTickValues = computed(() => {
  const points = trendData.value;
  const length = points.length;
  if (length <= 7) return points.map((item) => item.name);
  const step = Math.max(1, Math.ceil((length - 1) / 4));
  return points.filter((item) => item.index === 0 || item.index === length - 1 || item.index % step === 0).map((item) => item.name);
});

const categoryTotal = computed(() => Math.max(totalValue(props.dashboard.categories), props.dashboard.summary.totalSpend, 1));
const categorySlices = computed(() => {
  let cursor = 0;
  const total = Math.max(totalValue(props.dashboard.categories), 1);
  return props.dashboard.categories.map((item, index) => {
    const share = Number(item.value || 0) / total * 100;
    const start = cursor;
    cursor += share;
    return { item, start, end: cursor, color: colorFor(index) };
  });
});
const categoryGradient = computed(() => categorySlices.value.length
  ? `conic-gradient(${categorySlices.value.map((slice) => `${slice.color} ${slice.start}% ${slice.end}%`).join(", ")})`
  : "#edf7f2");
const selectedCategory = computed(() => props.dashboard.categories.find((item) => item.name === activeCategoryName.value) || props.dashboard.categories[0] || null);
const selectedCategoryIndex = computed(() => Math.max(0, props.dashboard.categories.findIndex((item) => item.name === selectedCategory.value?.name)));
const categoryDetailColor = computed(() => colorFor(selectedCategoryIndex.value));
const selectedMealTime = computed(() => props.dashboard.mealTimes.find((item) => item.name === activeMealTimeName.value) || null);
const selectedMealIndex = computed(() => Math.max(0, props.dashboard.mealTimes.findIndex((item) => item.name === selectedMealTime.value?.name)) || activeMealTimeIndex.value);

function formatDateLabel(name: string) {
  const text = String(name || "");
  const isoMatch = text.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (isoMatch) return `${isoMatch[1]}/${isoMatch[2]}`;
  const shortMatch = text.match(/^(\d{2})-(\d{2})$/);
  if (shortMatch) return `${shortMatch[1]}/${shortMatch[2]}`;
  return text.replace(/-/g, "/");
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function eventClientX(event: any) {
  return event?.touches?.[0]?.clientX ?? event?.changedTouches?.[0]?.clientX ?? event?.detail?.x ?? event?.clientX;
}

function targetRect(event: any) {
  const target = event?.currentTarget || event?.target;
  return target?.getBoundingClientRect?.() || { left: 0, top: 0, width: 320, height: 180 };
}

function handleTrendTap(event: any) {
  const points = trendData.value;
  if (!points.length) return;
  const rect = targetRect(event);
  const width = Math.max(Number(rect.width) || 320, trendPadding.left + trendPadding.right + 1);
  const height = Math.max(Number(rect.height) || 180, trendPadding.top + trendPadding.bottom + 1);
  const clientX = eventClientX(event);
  const relativeX = typeof clientX === "number" ? clientX - Number(rect.left || 0) : width / 2;
  const plotLeft = trendPadding.left;
  const plotRight = width - trendPadding.right;
  const plotWidth = Math.max(plotRight - plotLeft, 1);
  const ratio = points.length === 1 ? 0 : clamp((relativeX - plotLeft) / plotWidth, 0, 1);
  const index = Math.round(ratio * (points.length - 1));
  showTrendTooltip(points[index], width, height);
}

function showTrendTooltip(item: TrendPoint, width = 320, height = 180) {
  const count = Math.max(trendData.value.length - 1, 1);
  const plotWidth = Math.max(width - trendPadding.left - trendPadding.right, 1);
  const plotHeight = Math.max(height - trendPadding.top - trendPadding.bottom, 1);
  const x = trendPadding.left + plotWidth * (trendData.value.length === 1 ? .5 : item.index / count);
  const y = trendPadding.top + plotHeight * (1 - Number(item.value || 0) / trendMax.value);
  trendTooltip.item = item;
  trendTooltip.left = clamp(x, 46, width - 46);
  trendTooltip.top = clamp(y, 34, height - 8);
  trendTooltip.edge = item.index === 0 ? "edge-left" : item.index === trendData.value.length - 1 ? "edge-right" : "";
  trendTooltip.show = true;
}

function showCategoryTooltip(item?: StatsSeriesItem | null, index = 0) {
  if (!item) return;
  activeCategoryName.value = item.name;
  categoryTooltip.show = true;
}

function showMealTooltip(item: StatsSeriesItem, index: number) {
  activeMealTimeName.value = item.name;
  activeMealTimeIndex.value = index;
  mealTooltip.show = true;
}

function mealTooltipLeft(index: number) {
  const length = Math.max(props.dashboard.mealTimes.length, 1);
  return `${(index + .5) / length * 100}%`;
}

function makeCanvas(id: string, children: any[]) {
  // #ifdef H5
  const el = instance?.proxy?.$el?.querySelector(`#${id} canvas`) as HTMLCanvasElement | null;
  if (!el) return;
  const width = el.clientWidth || 320;
  const height = el.clientHeight || 180;
  const context = el.getContext("2d");
  if (!context) return;
  el.width = width * window.devicePixelRatio;
  el.height = height * window.devicePixelRatio;
  const vnode: any = createElement(Canvas, { context, width, height, pixelRatio: window.devicePixelRatio, animate: false }, children);
  const canvas = new Canvas(vnode.props);
  canvas.render();
  charts.push(canvas);
  // #endif
}

function renderCharts() {
  charts.splice(0).forEach((chart) => chart.destroy?.());
  const trend = trendData.value.map((item) => ({ date: item.name, value: item.value }));
  makeCanvas("trendCanvas", [createElement(Chart, {
    data: trend,
    padding: [trendPadding.top, trendPadding.right, trendPadding.bottom, trendPadding.left],
    scale: {
      date: { type: "cat", values: trendData.value.map((item) => item.name), ticks: trendTickValues.value, formatter: formatDateLabel },
      value: { type: "linear", min: 0, nice: true }
    }
  }, [
    createElement(Axis, { field: "date", style: { label: { fill: "#27705c", fontSize: 10 }, line: { stroke: "#b9e3d5" }, grid: null } }),
    createElement(Axis, { field: "value", style: { label: { fill: "#27705c", fontSize: 10 }, grid: { stroke: "#cbe8de", lineDash: [4, 4] } } }),
    createElement(Area, { x: "date", y: "value", color: "l(90) 0:#92dec5 1:#effaf6", shape: "smooth" }),
    createElement(Line, { x: "date", y: "value", color: "#15966a", size: 2.2, shape: "smooth" }),
    createElement(Point, { x: "date", y: "value", color: "#ffffff", size: 4, style: { stroke: "#15966a", lineWidth: 2 } })
  ])]);
}

watch(() => props.dashboard.trend, () => {
  trendTooltip.show = false;
}, { deep: true });
watch(() => props.dashboard.categories, () => {
  activeCategoryName.value = props.dashboard.categories[0]?.name || "";
  categoryTooltip.show = false;
}, { deep: true, immediate: true });
watch(() => props.dashboard.mealTimes, () => {
  activeMealTimeName.value = "";
  mealTooltip.show = false;
}, { deep: true });
onMounted(() => nextTick(renderCharts));
watch(() => props.dashboard, () => nextTick(renderCharts), { deep: true });
onBeforeUnmount(() => charts.splice(0).forEach((chart) => chart.destroy?.()));
</script>

<style scoped lang="scss">
.stats-shell { padding: 24rpx 26rpx 44rpx; color: #20201e; background: radial-gradient(circle at 15% 6%, #fff8f9 0, transparent 25%), #fffdf9; }
.hero { min-height: 190rpx; position: relative; display: flex; align-items: center; justify-content: space-between; padding: 12rpx 24rpx 0 54rpx; }
.hero-copy { position: relative; z-index: 1; }
.eyebrow { display: block; color: #ff567f; font-size: 34rpx; font-weight: 800; }
.amount { color: #f14572; font-size: 94rpx; line-height: 1.1; font-weight: 800; letter-spacing: -4rpx; }
.currency { font-size: 55rpx; margin-right: 8rpx; }
.swoosh { position: absolute; width: 310rpx; height: 95rpx; left: -30rpx; bottom: -14rpx; border-bottom: 3rpx solid #ff5d85; border-radius: 50%; transform: rotate(-6deg); }
.hero-sticker { width: 230rpx; height: 190rpx; }
.spark { position: absolute; color: #ff7d9c; font-size: 34rpx; }
.spark-a { left: 8rpx; top: 32rpx; }
.spark-b { right: 252rpx; top: 16rpx; }
.summary-row { display: grid; grid-template-columns: repeat(3, 1fr); margin: 22rpx 0 30rpx; }
.summary-item { display: flex; flex-direction: column; align-items: center; gap: 6rpx; font-size: 25rpx; color: #595755; border-right: 1px solid #f4d5dc; }
.summary-item:last-child { border-right: 0; }
.summary-value { font-size: 31rpx; font-weight: 750; color: #171717; max-width: 190rpx; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.trend-card { border: 1px solid #a9e3d0; border-radius: 22rpx; padding: 24rpx 16rpx 16rpx; background: linear-gradient(145deg, #effbf6, #fbfffd); box-shadow: 0 10rpx 30rpx rgba(66, 180, 140, .06); }
.section-head { display: flex; justify-content: space-between; align-items: center; padding: 0 8rpx; }
.section-title { font-size: 29rpx; font-weight: 800; color: #17654e; }
.range-switch { display: flex; gap: 8rpx; padding: 4rpx; background: #e1f4ed; border-radius: 20rpx; }
.range-switch text { padding: 5rpx 10rpx; border-radius: 16rpx; font-size: 20rpx; color: #517268; }
.range-switch .active { background: #fff; color: #17885f; box-shadow: 0 2rpx 8rpx rgba(22, 120, 87, .12); }
.trend-wrap { position: relative; margin-top: 4rpx; }
.chart { width: 100%; display: block; }
.trend-chart { height: 292rpx; }
.chart-loading { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; color: #188a62; background: rgba(248, 255, 252, .72); z-index: 10; }
.chart-floating { position: absolute; z-index: 8; display: flex; align-items: center; gap: 10rpx; max-width: 330rpx; padding: 10rpx 16rpx; border-radius: 999rpx; background: rgba(255, 255, 255, .96); border: 1px solid #ffd2dc; box-shadow: 0 10rpx 28rpx rgba(255, 111, 150, .18); pointer-events: none; white-space: nowrap; }
.trend-floating { transform: translate(-50%, -118%); }
.trend-floating.edge-left { transform: translate(0, -118%); }
.trend-floating.edge-right { transform: translate(-100%, -118%); }
.bubble-title { min-width: 0; overflow: hidden; text-overflow: ellipsis; color: #355b4d; font-size: 21rpx; font-weight: 800; }
.bubble-value { flex: none; color: #f25b84; font-size: 22rpx; font-weight: 900; }
.split-grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 18rpx; margin: 28rpx 4rpx; }
.data-block { position: relative; min-width: 0; padding: 20rpx 18rpx 18rpx; border: 1px solid rgba(244, 203, 212, .82); border-radius: 22rpx; background: rgba(255, 255, 255, .62); }
.category-block { overflow: visible; }
.mini-title { display: flex; align-items: center; gap: 10rpx; min-width: 0; margin-bottom: 16rpx; color: #1f4237; font-size: 27rpx; font-weight: 800; white-space: nowrap; }
.title-with-note { justify-content: flex-start; }
.title-note { flex: none; padding: 4rpx 12rpx; border-radius: 999rpx; background: #eef8f2; color: #4f8a73; font-size: 18rpx; line-height: 1.2; font-weight: 700; }
.donut-area { position: relative; display: flex; align-items: center; justify-content: center; padding-top: 4rpx; }
.donut-wrap { width: 178rpx; height: 178rpx; position: relative; flex: none; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .72), 0 10rpx 22rpx rgba(131, 217, 189, .14); }
.donut-hole { position: absolute; inset: 36rpx; border-radius: 50%; background: #fffdf9; }
.donut-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #63736c; font-size: 20rpx; }
.donut-total { color: #1f302b; font-size: 24rpx; font-weight: 900; }
.category-floating { left: 50%; top: 8rpx; transform: translate(-50%, -48%); }
.legend-under { display: grid; grid-template-columns: 1fr; gap: 9rpx; margin-top: 18rpx; padding-bottom: 34rpx; }
.legend-item { display: grid; grid-template-columns: 18rpx minmax(0, 1fr) auto; align-items: center; gap: 8rpx; min-width: 0; padding: 7rpx 10rpx; border-radius: 999rpx; color: #36584b; font-size: 21rpx; }
.legend-item.active { background: rgba(255, 247, 250, .82); }
.legend-name { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.legend-percent { color: #f25b84; font-weight: 800; }
.dot { width: 18rpx; height: 18rpx; border-radius: 50%; }
.meal-bars { position: relative; height: 190rpx; display: flex; align-items: flex-end; justify-content: space-around; gap: 8rpx; padding-top: 34rpx; }
.meal-floating { top: 4rpx; transform: translateX(-50%); }
.meal-item { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; min-width: 0; font-size: 18rpx; }
.meal-name { font-weight: 800; white-space: nowrap; }
.meal-percent { color: #6e716f; }
.meal-money { font-weight: 650; margin: 4rpx 0; }
.meal-track { width: 42rpx; height: 78rpx; display: flex; align-items: flex-end; border-radius: 10rpx 10rpx 0 0; background: #f6f1f1; overflow: hidden; }
.meal-fill { width: 100%; border-radius: 10rpx 10rpx 0 0; }
.tone-bg-0 { background: #ff6f96; }
.tone-bg-1 { background: #83d9bd; }
.tone-bg-2 { background: #ffb5c3; }
.tone-text-0 { color: #f24e78; }
.tone-text-1 { color: #168762; }
.tone-text-2 { color: #f06f8e; }
.corner-sticker { position: absolute; z-index: 3; }
.skewer { width: 90rpx; height: 70rpx; right: 8rpx; bottom: 0; opacity: .82; pointer-events: none; }
.drink { width: 70rpx; height: 100rpx; right: -8rpx; bottom: -12rpx; pointer-events: none; }
.details-card { position: relative; border: 1px solid #f4d1d7; border-radius: 20rpx; padding: 22rpx 26rpx 18rpx; background: rgba(255, 255, 255, .78); }
.detail-section { padding: 0 0 22rpx; margin-bottom: 20rpx; border-bottom: 1px dashed #f2cad2; }
.detail-section:last-child { border-bottom: 0; margin-bottom: 0; padding-bottom: 0; }
.contribution { position: relative; }
.detail-sticker { position: absolute; width: 94rpx; height: 72rpx; right: -20rpx; bottom: -16rpx; }
.cake-sticker { position: absolute; width: 64rpx; height: 64rpx; right: 8rpx; top: 48%; }
@media (max-width: 360px) {
  .stats-shell { padding-left: 18rpx; padding-right: 18rpx; }
  .hero { padding-left: 36rpx; }
  .amount { font-size: 82rpx; }
  .hero-sticker { width: 200rpx; }
  .summary-value { font-size: 27rpx; }
  .split-grid { grid-template-columns: 1fr; }
  .data-block { padding-bottom: 22rpx; }
}
</style>