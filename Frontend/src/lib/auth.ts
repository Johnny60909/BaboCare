const ACCESS_TOKEN_KEY = 'babocare_access_token';
const REFRESH_TOKEN_KEY = 'babocare_refresh_token';

export const getToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const setToken = (token: string): void =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);

export const removeToken = (): void =>
  localStorage.removeItem(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string): void =>
  localStorage.setItem(REFRESH_TOKEN_KEY, token);

/// <summary>
/// 清除所有認證令牌
/// </summary>
export const clearTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
