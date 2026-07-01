<template>
  <view class="user-badge">
    <image v-if="user?.avatarUrl" class="avatar" :src="user.avatarUrl" mode="aspectFill" />
    <view v-else class="avatar text" :style="{ background: user?.avatarColor || '#ffb8d0' }">
      {{ (user?.nickname || '用').slice(0, 1) }}
    </view>
    <text>{{ user?.nickname || '未知用户' }}</text>
  </view>
</template>

<script setup lang="ts">
import type { User } from "@/types";

defineProps<{
  user?: User;
}>();
</script>

<style scoped>
.user-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  color: #5b7569;
  font-size: 24rpx;
}

.avatar {
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
}

.text {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 20rpx;
  font-weight: 900;
}
</style>
