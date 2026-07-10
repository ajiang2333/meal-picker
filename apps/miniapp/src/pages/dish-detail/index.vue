<template>
  <view class="page tab-page dish-page">
    <view class="app-nav">
      <view class="app-nav-left"><view class="app-nav-back" @tap="goBack"><uni-icons type="left" size="22" color="#d86693" /></view></view>
      <text class="app-nav-title">菜品详情</text>
      <view class="app-nav-right" />
    </view>
    <view v-if="dish" class="dish-hero">
      <view class="dish-cover-picker" @tap="chooseDishImage">
        <image v-if="dishCover" class="dish-cover" :src="dishCover" mode="aspectFill" />
        <view v-else class="dish-orb">{{ dish.name.slice(0, 1) }}</view>
        <view class="dish-cover-hint">
          <uni-icons type="camera" size="13" color="#ffffff" />
        </view>
      </view>
      <view class="dish-main">
        <text class="kicker">SPRING DISH NOTE</text>
        <text class="title">{{ dish.name }}</text>
        <view class="meta-row">
          <text>{{ dish.rating.toFixed(1) }}分</text>
          <text>¥{{ dish.price }}</text>
          <text>{{ dish.disliked ? "已标记不喜欢" : "可加入抽选池" }}</text>
        </view>
      </view>
    </view>

    <view class="section-head">
      <view>
        <text class="section-title">用户评价</text>
        <text class="section-note">来自大家的口味小纸条</text>
      </view>
      <text class="count">{{ reviews.length }} 条</text>
    </view>

    <u-list class="review-list spring-list page-flow-list" :scrollable="false" custom-style="height: auto;">
      <u-list-item v-for="review in reviews" :key="review.id">
        <view class="review-card">
          <UserBadge :user="review.user" />
          <view class="review-title">
            <text class="strong">{{ review.rating }}分</text>
            <text class="soft-chip">{{ review.disliked ? "不喜欢" : "推荐" }}</text>
          </view>
          <text class="review-text">{{ review.content }}</text>
        </view>
      </u-list-item>
      <u-list-item v-if="!reviews.length">
        <view class="empty-card">
          <text>还没有评价</text>
          <text>这道菜还在等待第一张春日便签</text>
        </view>
      </u-list-item>
    </u-list>
  </view>
</template>

<script setup lang="ts">
import { onLoad } from "@dcloudio/uni-app";
import { ref } from "vue";
import { api } from "@/api/client";
import UserBadge from "@/components/UserBadge.vue";
import { getCustomDishCover, setCustomDishCover } from "@/utils/customImages";
import type { Dish, Review } from "@/types";

const dish = ref<Dish | null>(null);
const reviews = ref<Review[]>([]);
const dishCover = ref("");

onLoad(async (query) => {
  const result = await api.dish(String(query?.id || "")) as { dish: Dish; reviews: Review[] };
  dish.value = result.dish;
  dishCover.value = getCustomDishCover(result.dish.id) || result.dish.coverUrl || "";
  reviews.value = result.reviews;
});

function chooseDishImage() {
  if (!dish.value) return;
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success: async (result) => {
      const localUrl = ((result.tempFilePaths || []) as string[])[0] || "";
      if (!localUrl || !dish.value) return;
      dishCover.value = localUrl;
      setCustomDishCover(dish.value.id, localUrl);
      try {
        const uploaded = await api.uploadImage(localUrl) as { url: string };
        dishCover.value = uploaded.url;
        dish.value = { ...dish.value, coverUrl: uploaded.url };
        setCustomDishCover(dish.value.id, uploaded.url);
        await api.updateDish(dish.value.id, { coverUrl: uploaded.url });
        uni.showToast({ title: "菜品图片已更新", icon: "none" });
      } catch (error) {
        uni.showToast({ title: "已在本机保存", icon: "none" });
      }
    }
  });
}

function goBack() {
  if (getCurrentPages().length > 1) {
    uni.navigateBack();
    return;
  }
  uni.switchTab({ url: "/pages/stores/index" });
}
</script>

<style scoped>
.dish-page {
  background:
    radial-gradient(circle at 12% 6%, rgba(255, 194, 218, 0.55), transparent 180rpx),
    radial-gradient(circle at 92% 22%, rgba(178, 239, 202, 0.72), transparent 220rpx),
    linear-gradient(180deg, #fff7fb 0%, #f5fff8 62%, #fff9fb 100%);
  color: #24352d;
}

.dish-hero {
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: 128rpx 1fr;
  gap: 20rpx;
  align-items: center;
  border: 1rpx solid rgba(172, 225, 196, 0.85);
  border-radius: 36rpx;
  background:
    linear-gradient(135deg, rgba(255, 235, 244, 0.94), rgba(229, 255, 239, 0.94)),
    #ffffff;
  padding: 28rpx;
  box-shadow: 0 18rpx 44rpx rgba(95, 159, 124, 0.1);
}

.dish-cover-picker {
  position: relative;
  width: 128rpx;
  height: 128rpx;
}

.dish-cover,
.dish-orb {
  width: 128rpx;
  height: 128rpx;
  border-radius: 50%;
}

.dish-cover {
  display: block;
  border: 6rpx solid rgba(255, 255, 255, 0.82);
  background: #f3edf1;
}

.dish-orb {
  display: grid;
  place-items: center;
  border: 6rpx solid rgba(255, 255, 255, 0.82);
  background: linear-gradient(135deg, #ffb8d0, #8ee6b8);
  color: #ffffff;
  font-size: 44rpx;
  font-weight: 950;
  box-shadow: inset 0 -12rpx 24rpx rgba(255, 255, 255, 0.28);
}

.dish-cover-hint {
  position: absolute;
  right: -2rpx;
  bottom: -2rpx;
  display: grid;
  place-items: center;
  width: 42rpx;
  height: 42rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.92);
  border-radius: 50%;
  background: #d86693;
  box-shadow: 0 6rpx 14rpx rgba(216, 102, 147, 0.22);
}

.dish-main {
  display: grid;
  gap: 10rpx;
  min-width: 0;
}

.kicker,
.soft-chip,
.count {
  width: fit-content;
  border-radius: 999rpx;
  background: #ffe4ef;
  padding: 8rpx 16rpx;
  color: #d86693;
  font-size: 21rpx;
  font-weight: 900;
}

.title {
  overflow: hidden;
  color: #24352d;
  font-size: 44rpx;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.meta-row text {
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.72);
  padding: 8rpx 14rpx;
  color: #4f7b67;
  font-size: 22rpx;
  font-weight: 800;
}

.section-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
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

.section-note,
.review-text {
  color: #5b7569;
  font-size: 24rpx;
  line-height: 1.6;
}

.review-list {
  display: grid;
  gap: 16rpx;
}

.spring-list :deep(.u-list),
.spring-list :deep(.u-list-item) {
  background: transparent !important;
}

.page-flow-list,
.page-flow-list :deep(.u-list),
.page-flow-list :deep(.u-list > view),
.page-flow-list :deep(.uni-scroll-view),
.page-flow-list :deep(.uni-scroll-view-content) {
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  overflow: visible !important;
}

.review-card,
.empty-card {
  display: grid;
  gap: 12rpx;
  border: 1rpx solid rgba(172, 225, 196, 0.85);
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.86);
  padding: 20rpx;
  box-shadow: 0 12rpx 30rpx rgba(95, 159, 124, 0.08);
}

.review-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.empty-card {
  place-items: center;
  border-style: dashed;
  color: #7e978b;
}
</style>
