/**
 * 待匹配帳號相關 React Query 自定義 Hook
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pendingAccountService } from '../../../api/services/PendingUsers/pending-account.service';
import type { PendingRegisterRequest, PendingActivateRequest } from '../../api/dtos/pending-user.dto';

const PENDING_USERS_QUERY_KEY = ['pending-users'];

/**
 * 取得待匹配帳號列表 Query Hook
 */
export const usePendingUsers = () => {
  return useQuery({
    queryKey: PENDING_USERS_QUERY_KEY,
    queryFn: () => pendingAccountService.getPendingUsers(),
  });
};

/**
 * 家長自助申請 Mutation Hook
 */
export const useRegisterPendingMutation = () => {
  return useMutation({
    mutationFn: (data: PendingRegisterRequest) => pendingAccountService.registerPending(data),
  });
};

/**
 * 啟用待匹配帳號 Mutation Hook
 */
export const useActivatePendingMutation = () => {
  return useMutation({
    mutationFn: (data: PendingActivateRequest) => pendingAccountService.activatePending(data),
  });
};

/**
 * 產生邀請碼 Mutation Hook
 */
export const useGenerateInviteCodeMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pendingUserId: string) => pendingAccountService.generateInviteCode(pendingUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_USERS_QUERY_KEY });
    },
  });
};

/**
 * 移除待匹配帳號 Mutation Hook
 */
export const useRemovePendingUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pendingUserId: string) => pendingAccountService.removePendingUser(pendingUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_USERS_QUERY_KEY });
    },
  });
};
