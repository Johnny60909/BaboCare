/**
 * 將相對URL轉換為完整的後端API URL
 * @param url - 圖片URL（可能是相對路徑或完整URL）
 * @param cacheBust - 是否加入快取破壞參數（防止快取）
 * @returns 完整的URL
 */
export const getImageUrl = (
  url: string | undefined | null,
  cacheBust: boolean = false
): string | undefined => {
  if (!url) return undefined;
  
  const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:5181';
  
  // 如果已經是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return cacheBust ? `${url}?t=${Date.now()}` : url;
  }
  
  // 相對路徑，使用後端API的host拼接
  const fullUrl = `${apiBase}${url}`;
  return cacheBust ? `${fullUrl}?t=${Date.now()}` : fullUrl;
};

/**
 * 取得頭像URL，支援fallback
 * @param url - 頭像URL
 * @param fallbackOrCacheBust - 當url不存在時的fallback內容，或是否開啟快取破壞
 * @param cacheBust - 是否加入快取破壞參數
 * @returns 完整的URL或fallback
 */
export const getAvatarUrl = (
  url: string | undefined | null,
  fallbackOrCacheBust?: string | boolean,
  cacheBust?: boolean
): string | undefined => {
  // 相容舊的使用方式：getAvatarUrl(url, fallback)
  const fallback = typeof fallbackOrCacheBust === 'string' ? fallbackOrCacheBust : undefined;
  const shouldBust = typeof fallbackOrCacheBust === 'boolean' ? fallbackOrCacheBust : cacheBust ?? false;
  
  const fullUrl = getImageUrl(url, shouldBust);
  return fullUrl || fallback;
};

/**
 * 取得照片URL
 * @param url - 照片URL
 * @param cacheBust - 是否加入快取破壞參數
 * @returns 完整的URL
 */
export const getPhotoUrl = (
  url: string | undefined | null,
  cacheBust: boolean = false
): string | undefined => {
  return getImageUrl(url, cacheBust);
};
