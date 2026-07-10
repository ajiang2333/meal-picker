const STORE_COVER_KEY = "customStoreCovers";
const DISH_COVER_KEY = "customDishCovers";

function readMap(key: string) {
  try {
    const raw = uni.getStorageSync(key);
    return raw ? JSON.parse(String(raw)) as Record<string, string> : {};
  } catch (error) {
    return {};
  }
}

function writeMap(key: string, value: Record<string, string>) {
  uni.setStorageSync(key, JSON.stringify(value));
}

function getCustomImage(key: string, id: string) {
  if (!id) return "";
  return readMap(key)[id] || "";
}

function setCustomImage(key: string, id: string, url: string) {
  if (!id || !url) return;
  const map = readMap(key);
  map[id] = url;
  writeMap(key, map);
}

export function getCustomStoreCover(id: string) {
  return getCustomImage(STORE_COVER_KEY, id);
}

export function setCustomStoreCover(id: string, url: string) {
  setCustomImage(STORE_COVER_KEY, id, url);
}

export function getCustomDishCover(id: string) {
  return getCustomImage(DISH_COVER_KEY, id);
}

export function setCustomDishCover(id: string, url: string) {
  setCustomImage(DISH_COVER_KEY, id, url);
}
