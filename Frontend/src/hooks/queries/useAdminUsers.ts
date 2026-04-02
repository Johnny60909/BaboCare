/**
 * 帳號管理相關 React Query 自定義 Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserService } from '../../api/services/admin-user.service';
import type { CreateUserRequest, UpdateUserRequest } from '../../api/dtos/user.dto';

const USERS_QUERY_KEY = ['admin-users'];
const USER_DETAIL_QUERY_KEY = (id: string) => ['admin-user', id];

/**
 * 取得帳號列表 Query Hook
 */
export const useAdminUsers = () => {
  return useQuery({
    queryKey: USERS_QUERY_KEY,
    queryFn: () => adminUserService.getUsers(),
  });
};

/**
 * 取得帳號詳情 Query Hook
 */
export const useAdminUserDetail = (id: string | undefined) => {
  return useQuery({
    queryKey: USER_DETAIL_QUERY_KEY(id || ''),
    queryFn: () => adminUserService.getUserDetail(id!),
    enabled: !!id,
  });
};

/**
 * 建立帳號 Mutation Hook
 */
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) => adminUserService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

/**
 * 更新帳號 Mutation Hook
 */
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      adminUserService.updateUser(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: USER_DETAIL_QUERY_KEY(id) });
    },
  });
};

/**
 * 切換帳號狀態 Mutation Hook
 */
export const useToggleUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUserService.toggleUserStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};

/**
 * 刪除帳號 Mutation Hook
 */
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminUserService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
    },
  });
};
