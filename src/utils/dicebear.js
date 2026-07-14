/**
 * DiceBear pixel-art 關主產生器
 * 預先定義 100 個 seed，每題對應一個固定關主
 */

const BASE_URL = 'https://api.dicebear.com/9.x/pixel-art/svg';

// 產生 100 個 boss seed
export const BOSS_SEEDS = Array.from({ length: 100 }, (_, i) => `boss-stage-${i}`);

/**
 * 取得指定 index 的關主 SVG URL
 * @param {number} index - 題目 index（0-based）
 * @param {object} options - DiceBear 額外參數
 */
export function getBossUrl(index, options = {}) {
  const seed = BOSS_SEEDS[index % 100];
  const params = new URLSearchParams({
    seed,
    backgroundColor: '0a0a1a',
    ...options,
  });
  return `${BASE_URL}?${params.toString()}`;
}

/**
 * 預載所有 100 張關主圖片（建立 Image 物件觸發瀏覽器快取）
 */
export function preloadAllBosses() {
  return BOSS_SEEDS.map((_, i) => {
    const url = getBossUrl(i);
    // SVG 用 fetch 預載比 Image 有效
    return fetch(url).catch(() => null);
  });
}
