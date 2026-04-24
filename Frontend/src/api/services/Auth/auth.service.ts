/**
 * 授權 Service - 封裝所有授權相關 API 呼叫
 */

import apiClient from '../../../lib/apiClient';
import type { TokenResponse, LoginParams } from '../../dtos/Auth/auth.dto';

export const authService = {
  /**
   * 使用帳號密碼登入
   */
  login: async (params: LoginParams): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'password');
    formData.append('username', params.username);
    formData.append('password', params.password);
    formData.append('scope', 'openid offline_access');

    const response = await apiClient.post<TokenResponse>(
      `${import.meta.env.VITE_API_URL ?? 'http://localhost:5181'}/connect/token`,
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data;
  },

  /**
   * 使用 RefreshToken 重新取得 Token
   */
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append('grant_type', 'refresh_token');
    formData.append('refresh_token', refreshToken);

    const response = await apiClient.post<TokenResponse>(
      `${import.meta.env.VITE_API_URL ?? 'http://localhost:5181'}/connect/token`,
      formData,
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    return response.data;
  },
};
