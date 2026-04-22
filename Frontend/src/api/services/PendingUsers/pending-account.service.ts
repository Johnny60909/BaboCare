/**
 * 待匹配帳號 Service - 封裝所有待匹配帳號相關 API 呼叫
 */

import apiClient from '../../../lib/apiClient';
import type {
  PendingUserListItem,
  PendingRegisterRequest,
  PendingRegisterResponse,
  PendingActivateRequest,
  PendingActivateResponse,
} from '../dtos/pending-user.dto';

export const pendingAccountService = {
  /**
   * 取得待匹配帳號列表
   */
  getPendingUsers: async (): Promise<PendingUserListItem[]> => {
    const response = await apiClient.get<PendingUserListItem[]>('/api/admin/pending-users');
    return response.data;
  },

  /**
   * 家長自助申請帳號
   */
  registerPending: async (data: PendingRegisterRequest): Promise<PendingRegisterResponse> => {
    const response = await apiClient.post<PendingRegisterResponse>(
      '/api/account/pending/register',
      data
    );
    return response.data;
  },

  /**
   * 啟用待匹配帳號（使用邀請碼）
   */
  activatePending: async (data: PendingActivateRequest): Promise<PendingActivateResponse> => {
    const response = await apiClient.post<PendingActivateResponse>(
      '/api/account/pending/activate',
      data
    );
    return response.data;
  },

  /**
   * 產生邀請碼
   */
  generateInviteCode: async (pendingUserId: string): Promise<{ inviteCode: string }> => {
    const response = await apiClient.post<{ inviteCode: string }>(
      `/api/admin/pending-users/${pendingUserId}/generate-invite`
    );
    return response.data;
  },

  /**
   * 移除待匹配帳號
   */
  removePendingUser: async (pendingUserId: string): Promise<void> => {
    await apiClient.delete(`/api/admin/pending-users/${pendingUserId}`);
  },
};
