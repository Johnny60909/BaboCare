/**
 * 管理員帳號 Service - 封裝所有帳號管理相關 API 呼叫
 */

import apiClient from '../../lib/apiClient';
import type { UserListItem, UserDetailDto, CreateUserRequest, UpdateUserRequest } from '../dtos/user.dto';

export const adminUserService = {
  /**
   * 取得所有帳號列表
   */
  getUsers: async (): Promise<UserListItem[]> => {
    const response = await apiClient.get<UserListItem[]>('/api/admin/users');
    return response.data;
  },

  /**
   * 取得單一帳號詳情
   */
  getUserDetail: async (id: string): Promise<UserDetailDto> => {
    const response = await apiClient.get<UserDetailDto>(`/api/admin/users/${id}`);
    return response.data;
  },

  /**
   * 建立新帳號
   */
  createUser: async (data: CreateUserRequest): Promise<UserDetailDto> => {
    const response = await apiClient.post<UserDetailDto>('/api/admin/users', data);
    return response.data;
  },

  /**
   * 更新帳號
   */
  updateUser: async (id: string, data: UpdateUserRequest): Promise<void> => {
    await apiClient.put(`/api/admin/users/${id}`, data);
  },

  /**
   * 更新帳號狀態（啟用/停用）
   */
  toggleUserStatus: async (id: string, isActive: boolean): Promise<void> => {
    await apiClient.patch(`/api/admin/users/${id}/status`, { isActive });
  },

  /**
   * 刪除帳號
   */
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${id}`);
  },
};
