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
      <view class="section-head"><text class="section-title">消费趋势</text><view class="range-switch"><text v-for="range in [7, 30]" :key="range" :class="{ active: dashboard.rangeDays === range }" @click="$emit('range-change', range)">近{{ range }}天</text></view></view>
      <view class="trend-wrap"><canvas id="trendCanvas" canvas-id="trendCanvas" class="chart trend-chart" /><view v-if="loading" class="chart-loading">正在加载...</view></view>
    </view>

    <view class="split-grid">
      <view class="data-block category-block">
        <view class="mini-title">✦ 类型占比</view>
        <view class="donut-row">
          <view class="donut-wrap" :style="{ background: categoryGradient }"><view class="donut-hole" /><view class="donut-center"><b>¥{{ dashboard.summary.totalSpend.toFixed(1) }}</b><span>累计</span></view></view>
          <view class="legend"><view v-for="(item, i) in dashboard.categories" :key="item.name"><i :class="`dot dot-${i}`" />{{ item.name }} <b>{{ percent(item.value) }}%</b></view></view>
        </view>
        <image class="corner-sticker skewer" src="/static/stats/skewer.png" mode="aspectFit" />
      </view>
      <view class="data-block meal-block">
        <view class="mini-title">✦ 用餐时段 <small>（按实付金额）</small></view>
        <view class="meal-bars">
          <view v-for="(item, index) in dashboard.mealTimes" :key="item.name" class="meal-item">
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
      <view class="detail-section"><view class="mini-title">✦ 店铺复购 <small>Top 5</small></view><StatsRankRows :items="dashboard.stores" numbered /></view>
      <view class="detail-section"><view class="mini-title">✦ 评分分布</view><StatsRankRows :items="dashboard.ratings" /></view>
      <view class="detail-section contribution"><view class="mini-title">✦ 用户贡献 <small>（按消费金额）</small></view><StatsRankRows :items="dashboard.users" money /><image class="detail-sticker" src="/static/stats/bento.png" mode="aspectFit" /></view>
      <image class="cake-sticker" src="/static/stats/cake.png" mode="aspectFit" />
    </view>
  </view>
</template>

<script setup lang="ts">
import { Area, Axis, Canvas, Chart, Line, Point, createElement } from "@antv/f2";
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, watch } from "vue";
import StatsRankRows from "./StatsRankRows.vue";
import type { StatsDashboard } from "@/types";

const props = defineProps<{ dashboard: StatsDashboard; loading?: boolean }>();
defineEmits<{ (event: "range-change", range: 7 | 30): void }>();
const instance = getCurrentInstance();
const charts: any[] = [];
const palette = ["#ff6f96", "#83d9bd", "#ffb5c3"];

const percent = (value: number) => Math.round(value / Math.max(props.dashboard.summary.totalSpend, 1) * 100);
const mealHeight = (value: number) => `${Math.max(24, value / Math.max(...props.dashboard.mealTimes.map((item) => item.value), 1) * 72)}rpx`;
const categoryGradient = computed(() => {
  const values = props.dashboard.categories.map((item) => percent(item.value));
  return `conic-gradient(${palette[0]} 0 ${values[0] || 0}%, ${palette[1]} ${values[0] || 0}% ${(values[0] || 0) + (values[1] || 0)}%, ${palette[2]} ${(values[0] || 0) + (values[1] || 0)}% 100%)`;
});

function makeCanvas(id: string, children: any[]) {
  // #ifdef H5
  const el = instance?.proxy?.$el?.querySelector(`#${id} canvas`) as HTMLCanvasElement | null;
  if (!el) return;
  const width = el.clientWidth || 320; const height = el.clientHeight || 180;
  const context = el.getContext("2d"); if (!context) return;
  el.width = width * window.devicePixelRatio; el.height = height * window.devicePixelRatio;
  const vnode: any = createElement(Canvas, { context, width, height, pixelRatio: window.devicePixelRatio, animate: false }, children);
  const canvas = new Canvas(vnode.props); canvas.render(); charts.push(canvas);
  // #endif
}

function renderCharts() {
  charts.splice(0).forEach((chart) => chart.destroy?.());
  const trend = props.dashboard.trend.map((item) => ({ ...item, value: Number(item.value) }));
  makeCanvas("trendCanvas", [createElement(Chart, { data: trend, padding: [14, 12, 30, 32] }, [
    createElement(Axis, { field: "name", style: { label: { fill: "#27705c", fontSize: 10 }, line: { stroke: "#b9e3d5" }, grid: null } }),
    createElement(Axis, { field: "value", style: { label: { fill: "#27705c", fontSize: 10 }, grid: { stroke: "#cbe8de", lineDash: [4, 4] } } }),
    createElement(Area, { x: "name", y: "value", color: "l(90) 0:#92dec5 1:#effaf6", shape: "smooth" }),
    createElement(Line, { x: "name", y: "value", color: "#15966a", size: 2.2, shape: "smooth" }),
    createElement(Point, { x: "name", y: "value", color: "#ffffff", size: 4, style: { stroke: "#15966a", lineWidth: 2 } })
  ])]);
}

onMounted(() => nextTick(renderCharts));
watch(() => props.dashboard, () => nextTick(renderCharts), { deep: true });
onBeforeUnmount(() => charts.splice(0).forEach((chart) => chart.destroy?.()));
</script>

<style scoped lang="scss">
.stats-shell { padding: 24rpx 26rpx 44rpx; color: #20201e; background: radial-gradient(circle at 15% 6%, #fff8f9 0, transparent 25%), #fffdf9; }
.hero { min-height: 190rpx; position: relative; display: flex; align-items: center; justify-content: space-between; padding: 12rpx 24rpx 0 54rpx; }
.hero-copy { position: relative; z-index: 1; }.eyebrow { display:block; color:#ff567f; font-size:34rpx; font-weight:800; }.amount { color:#f14572; font-size:94rpx; line-height:1.1; font-weight:800; letter-spacing:-4rpx; }.currency { font-size:55rpx; margin-right:8rpx; }.swoosh { position:absolute; width:310rpx; height:95rpx; left:-30rpx; bottom:-14rpx; border-bottom:3rpx solid #ff5d85; border-radius:50%; transform:rotate(-6deg); }.hero-sticker { width:230rpx; height:190rpx; }.spark { position:absolute; color:#ff7d9c; font-size:34rpx; }.spark-a{left:8rpx;top:32rpx}.spark-b{right:252rpx;top:16rpx}
.summary-row { display:grid; grid-template-columns:repeat(3,1fr); margin:22rpx 0 30rpx; }.summary-item { display:flex; flex-direction:column; align-items:center; gap:6rpx; font-size:25rpx; color:#595755; border-right:1px solid #f4d5dc; }.summary-item:last-child{border-right:0}.summary-value{font-size:31rpx;font-weight:750;color:#171717;max-width:190rpx;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.trend-card { border:1px solid #a9e3d0; border-radius:22rpx; padding:24rpx 16rpx 10rpx; background:linear-gradient(145deg,#effbf6,#fbfffd); box-shadow:0 10rpx 30rpx rgba(66,180,140,.06); }.section-head{display:flex;justify-content:space-between;align-items:center;padding:0 8rpx}.section-title{font-size:29rpx;font-weight:800;color:#17654e}.range-switch{display:flex;gap:8rpx;padding:4rpx;background:#e1f4ed;border-radius:20rpx}.range-switch text{padding:5rpx 10rpx;border-radius:16rpx;font-size:20rpx;color:#517268}.range-switch .active{background:#fff;color:#17885f;box-shadow:0 2rpx 8rpx rgba(22,120,87,.12)}.trend-wrap{position:relative}.chart{width:100%;display:block}.trend-chart{height:270rpx}.chart-loading{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#188a62;background:rgba(248,255,252,.72)}
.split-grid{display:grid;grid-template-columns:1fr 1fr;margin:28rpx 4rpx;}.data-block{position:relative;min-width:0;padding:0 18rpx 10rpx}.category-block{border-right:1px solid #f3cbd4}.mini-title{font-size:27rpx;font-weight:800;margin-bottom:16rpx}.mini-title small{font-size:20rpx;font-weight:400;color:#777}.donut-row{display:flex;align-items:center}.donut-wrap{width:180rpx;height:180rpx;position:relative;flex:none;border-radius:50%}.donut-hole{position:absolute;inset:36rpx;border-radius:50%;background:#fffdf9}.donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:20rpx}.donut-center b{font-size:24rpx}.legend{display:flex;flex-direction:column;gap:17rpx;font-size:22rpx;white-space:nowrap}.legend b{font-weight:500}.dot{display:inline-block;width:18rpx;height:18rpx;border-radius:50%;margin-right:8rpx}.dot-0{background:#ff6f96}.dot-1{background:#83d9bd}.dot-2{background:#ffb5c3}.meal-bars{height:190rpx;display:flex;align-items:flex-end;justify-content:space-around;gap:8rpx}.meal-item{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;min-width:0;font-size:18rpx}.meal-name{font-weight:800;white-space:nowrap}.meal-percent{color:#6e716f}.meal-money{font-weight:650;margin:4rpx 0}.meal-track{width:42rpx;height:78rpx;display:flex;align-items:flex-end;border-radius:10rpx 10rpx 0 0;background:#f6f1f1;overflow:hidden}.meal-fill{width:100%;border-radius:10rpx 10rpx 0 0}.tone-bg-0{background:#ff6f96}.tone-bg-1{background:#83d9bd}.tone-bg-2{background:#ffb5c3}.tone-text-0{color:#f24e78}.tone-text-1{color:#168762}.tone-text-2{color:#f06f8e}.corner-sticker{position:absolute;z-index:3}.skewer{width:90rpx;height:70rpx;right:4rpx;bottom:-12rpx}.drink{width:70rpx;height:100rpx;right:-8rpx;bottom:-12rpx}
.details-card{position:relative;border:1px solid #f4d1d7;border-radius:20rpx;padding:22rpx 26rpx 18rpx;background:rgba(255,255,255,.78)}.detail-section{padding:0 0 22rpx;margin-bottom:20rpx;border-bottom:1px dashed #f2cad2}.detail-section:last-child{border-bottom:0;margin-bottom:0;padding-bottom:0}.contribution{position:relative}.detail-sticker{position:absolute;width:94rpx;height:72rpx;right:-20rpx;bottom:-16rpx}.cake-sticker{position:absolute;width:64rpx;height:64rpx;right:8rpx;top:48%}
@media (max-width: 360px){.stats-shell{padding-left:18rpx;padding-right:18rpx}.hero{padding-left:36rpx}.amount{font-size:82rpx}.hero-sticker{width:200rpx}.summary-value{font-size:27rpx}.split-grid{grid-template-columns:1fr}.category-block{border-right:0;border-bottom:1px solid #f3cbd4;margin-bottom:24rpx}.data-block{padding-bottom:22rpx}.donut-row{justify-content:center}}
</style>
