import { reactive } from "vue";
import { api } from "@/api/client";

export const session = reactive({
  userId: "",
  nickname: "未登录",
  users: [] as Array<{ id: string; nickname: string }>
});

export function restoreSession() {
  session.userId = uni.getStorageSync("currentUserId") || "";
  session.nickname = uni.getStorageSync("currentNickname") || "未登录";
}

export async function mockLogin(nickname = "体验用户") {
  const result = await api.login({ provider: "mock", nickname });
  session.userId = result.user.id;
  session.nickname = result.user.nickname;
  uni.setStorageSync("currentUserId", session.userId);
  uni.setStorageSync("currentNickname", session.nickname);
}

export function switchUser(user: { id: string; nickname: string }) {
  session.userId = user.id;
  session.nickname = user.nickname;
  uni.setStorageSync("currentUserId", user.id);
  uni.setStorageSync("currentNickname", user.nickname);
}
