<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app";
import { restoreSession } from "@/state/session";

onLaunch(() => {
  restoreSession();
});
</script>

<style>
page {
  --app-nav-content-height: 72rpx;
  --app-nav-padding-top: 20rpx;
  --app-nav-padding-bottom: 20rpx;
  --app-nav-gap: 24rpx;
  overflow-x: hidden;
  background: #fff7fb;
  color: #24352d;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
}

view,
text,
image,
scroll-view {
  box-sizing: border-box;
}
/* #ifdef H5 */
input,
textarea,
uni-input,
uni-textarea,
.uni-input-input,
.uni-textarea-textarea,
.u-input__content__field-wrapper__field,
.u-textarea__field,
.u-search__content__input {
  font-size: 16px !important;
  -webkit-text-size-adjust: 100%;
}

input::placeholder,
textarea::placeholder,
.uni-input-placeholder,
.uni-textarea-placeholder,
.input-placeholder,
.textarea-placeholder {
  font-size: 16px !important;
}
/* #endif */

.page {
  width: 100%;
  max-width: 100vw;
  min-height: 100vh;
  overflow-x: hidden;
  padding: 24rpx 24rpx calc(120rpx + constant(safe-area-inset-bottom));
  padding: 24rpx 24rpx calc(120rpx + env(safe-area-inset-bottom));
}

.tab-page {
  padding-top: calc(var(--status-bar-height) + var(--app-nav-padding-top) + var(--app-nav-content-height) + var(--app-nav-padding-bottom) + var(--app-nav-gap));
}

.app-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: grid;
  grid-template-columns: 80rpx minmax(0, 1fr) 80rpx;
  align-items: center;
  width: 100%;
  min-height: calc(var(--status-bar-height) + var(--app-nav-padding-top) + var(--app-nav-content-height) + var(--app-nav-padding-bottom));
  box-sizing: border-box;
  padding: calc(var(--status-bar-height) + var(--app-nav-padding-top)) 24rpx var(--app-nav-padding-bottom);
  padding-left: calc(24rpx + constant(safe-area-inset-left));
  padding-right: calc(24rpx + constant(safe-area-inset-right));
  padding-left: calc(24rpx + env(safe-area-inset-left));
  padding-right: calc(24rpx + env(safe-area-inset-right));
  background: linear-gradient(135deg, rgba(255, 216, 230, 0.98), rgba(196, 244, 217, 0.98));
  box-shadow: 0 10rpx 28rpx rgba(216, 102, 147, 0.12);
}

.app-nav-left,
.app-nav-right {
  display: flex;
  align-items: center;
  min-height: var(--app-nav-content-height);
}

.app-nav-right {
  justify-content: flex-end;
}

.app-nav-title {
  overflow: hidden;
  color: #24352d;
  font-size: 34rpx;
  font-weight: 950;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-nav-back {
  display: grid;
  place-items: center;
  width: 72rpx;
  height: 72rpx;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.72);
}

.card {
  border: 1rpx solid #d9f3e4;
  border-radius: 24rpx;
  background: #ffffff;
  padding: 24rpx;
}

.tag {
  display: inline-flex;
  align-items: center;
  min-height: 40rpx;
  padding: 0 14rpx;
  border-radius: 999rpx;
  background: #ffe4ef;
  color: #d86693;
  font-size: 24rpx;
  font-weight: 700;
}

.muted {
  color: #7e978b;
  font-size: 24rpx;
}

.primary-btn {
  border-radius: 999rpx;
  background: linear-gradient(135deg, #ff98bd, #8ee6b8);
  color: #ffffff;
  font-weight: 800;
}
/* #ifdef H5 */
uni-tabbar.uni-tabbar-bottom {
  pointer-events: none;
}

.uni-tabbar-bottom .uni-tabbar {
  /* left: calc(22rpx + env(safe-area-inset-left)) !important; */
  /* right: calc(22rpx + env(safe-area-inset-right)) !important; */
  /* bottom: calc(12rpx + env(safe-area-inset-bottom)) !important; */
  overflow: hidden;
  min-height: 92rpx !important;
  /* border: 1rpx solid rgba(255, 190, 214, 0.72); */
  /* border-radius: 34rpx; */
  background: rgba(255, 255, 255, 0.92) !important;
  box-shadow: 0 18rpx 42rpx rgba(216, 102, 147, 0.18);
  backdrop-filter: blur(16px);
  pointer-events: auto;
}

.uni-tabbar-bottom .uni-tabbar-border {
  display: none;
}

.uni-tabbar-bottom .uni-tabbar__item {
  min-height: 92rpx;
  padding: 10rpx 6rpx;
}

.uni-tabbar-bottom .uni-tabbar__bd {
  min-width: 118rpx;
  min-height: 64rpx;
  border-radius: 24rpx;
  padding: 10rpx 12rpx;
  transition: background-color 0.18s ease, transform 0.18s ease;
}

.uni-tabbar-bottom .uni-tabbar__item:has(.uni-tabbar__label[style*="216, 102, 147"]) .uni-tabbar__bd,
.uni-tabbar-bottom .uni-tabbar__item:has(.uni-tabbar__label[style*="#d86693"]) .uni-tabbar__bd {
  background: linear-gradient(135deg, rgba(255, 228, 239, 0.96), rgba(226, 251, 233, 0.96));
  transform: translateY(-2rpx);
}

.uni-tabbar-bottom .uni-tabbar__label {
  overflow: visible;
  font-size: 30rpx !important;
  font-weight: 950;
  line-height: 1.15;
  letter-spacing: 0;
  white-space: nowrap;
}

.uni-tabbar-bottom .uni-tabbar__icon {
  margin-top: 0 !important;
}
/* #endif */

</style>
