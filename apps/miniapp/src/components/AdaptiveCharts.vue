<template>
  <view class="charts card">
    <view class="head">
      <text>统计图表</text>
      <text class="muted">折线 / 饼图 / 环图 / 条形</text>
    </view>
    <canvas canvas-id="lineChart" id="lineChart" class="canvas" />
    <canvas canvas-id="pieChart" id="pieChart" class="canvas pie" />
    <canvas canvas-id="donutChart" id="donutChart" class="canvas pie" />
    <view class="bars">
      <text class="chart-label">店铺复购</text>
      <view v-for="item in bars" :key="item.name" class="bar-row">
        <text>{{ item.name }}</text>
        <view class="track"><view class="fill" :style="{ width: `${barPercent(item.value)}%` }" /></view>
        <text>¥{{ item.value }}</text>
      </view>
    </view>
    <view class="bars">
      <text class="chart-label">评分分布</text>
      <view v-for="item in ratings" :key="item.name" class="bar-row">
        <text>{{ item.name }}</text>
        <view class="track"><view class="fill green" :style="{ width: `${ratingPercent(item.value)}%` }" /></view>
        <text>{{ item.value }}单</text>
      </view>
    </view>
    <view class="bars">
      <text class="chart-label">用户贡献</text>
      <view v-for="item in users" :key="item.name" class="bar-row">
        <text>{{ item.name }}</text>
        <view class="track"><view class="fill blue" :style="{ width: `${userPercent(item.value)}%` }" /></view>
        <text>¥{{ item.value }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, watch } from "vue";

const props = defineProps<{
  line: Array<{ name: string; value: number }>;
  pie: Array<{ name: string; value: number }>;
  donut?: Array<{ name: string; value: number }>;
  bars: Array<{ name: string; value: number }>;
  ratings?: Array<{ name: string; value: number }>;
  users?: Array<{ name: string; value: number }>;
}>();

const instance = getCurrentInstance();
const colors = ["#ffb8d0", "#8ee6b8", "#cbb7ff", "#ffd6a5", "#9ee7d4"];

function percent(value: number, items: Array<{ value: number }>) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return Math.round((value / max) * 100);
}

function barPercent(value: number) {
  return percent(value, props.bars);
}

function ratingPercent(value: number) {
  return percent(value, props.ratings || []);
}

function userPercent(value: number) {
  return percent(value, props.users || []);
}

function drawLine() {
  const ctx = uni.createCanvasContext("lineChart", instance);
  const width = 330;
  const height = 120;
  const pad = 20;
  const data = props.line.length ? props.line : [{ name: "暂无", value: 0 }];
  const max = Math.max(...data.map((item) => item.value), 1);
  ctx.clearRect(0, 0, width, height);
  ctx.setStrokeStyle("#d86693");
  ctx.setLineWidth(4);
  data.forEach((item, index) => {
    const x = data.length === 1 ? width / 2 : pad + (index * (width - pad * 2)) / (data.length - 1);
    const y = height - pad - (item.value / max) * (height - pad * 2);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();
  data.forEach((item, index) => {
    const x = data.length === 1 ? width / 2 : pad + (index * (width - pad * 2)) / (data.length - 1);
    const y = height - pad - (item.value / max) * (height - pad * 2);
    ctx.beginPath();
    ctx.setFillStyle("#8ee6b8");
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.draw();
}

function drawPieById(canvasId: string, source: Array<{ name: string; value: number }>, donut = false) {
  const ctx = uni.createCanvasContext(canvasId, instance);
  const data = source.length ? source : [{ name: "暂无", value: 1 }];
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;
  let start = -Math.PI / 2;
  ctx.clearRect(0, 0, 330, 160);
  data.forEach((item, index) => {
    const angle = (item.value / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(82, 78);
    ctx.setFillStyle(colors[index % colors.length]);
    ctx.arc(82, 78, 58, start, start + angle);
    ctx.closePath();
    ctx.fill();
    start += angle;
    ctx.setFillStyle("#5b7569");
    ctx.fillText(`${item.name} ${Math.round((item.value / total) * 100)}%`, 165, 36 + index * 24);
  });
  if (donut) {
    ctx.beginPath();
    ctx.setFillStyle("#fff7fb");
    ctx.arc(82, 78, 32, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.draw();
}

function draw() {
  nextTick(() => {
    drawLine();
    drawPieById("pieChart", props.pie);
    drawPieById("donutChart", props.donut || [], true);
  });
}

onMounted(draw);
watch(() => [props.line, props.pie, props.donut, props.ratings, props.users], draw, { deep: true });
</script>

<style scoped>
.charts {
  display: grid;
  gap: 18rpx;
  min-width: 0;
}

.head {
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
  font-weight: 900;
}

.canvas {
  width: 100%;
  height: 240rpx;
  border-radius: 16rpx;
  background: #fff7fb;
}

.pie {
  height: 320rpx;
  background: #f5fff8;
}

.bars {
  display: grid;
  min-width: 0;
}

.chart-label {
  margin: 4rpx 0 8rpx;
  font-weight: 900;
}

.bar-row {
  display: grid;
  grid-template-columns: 120rpx 1fr 96rpx;
  gap: 12rpx;
  align-items: center;
  margin-top: 12rpx;
  color: #5b7569;
  font-size: 24rpx;
}

.bar-row text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track {
  height: 18rpx;
  overflow: hidden;
  border-radius: 999rpx;
  background: #eeeeee;
}

.fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ffb8d0, #d86693);
}

.fill.green {
  background: linear-gradient(90deg, #8ee6b8, #4f9c72);
}

.fill.blue {
  background: linear-gradient(90deg, #cbb7ff, #8a6fe8);
}
</style>
