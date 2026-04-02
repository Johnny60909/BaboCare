/**
 * 授權相關 React Query 自定義 Hook
 */

import { useMutation } from '@tanstack/react-query';
import { authService } from '../../api/services/auth.service';
import type { LoginParams } from '../../api/dtos/auth.dto';
import { setRefreshToken, setToken } from '../../lib/auth';

/**
 * 登入 Mutation Hook
 */
export const useLoginMutation = () => {
  return useMutation({
    mutationFn: (params: LoginParams) => authService.login(params),
    onSuccess: (data) => {
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
    },
  });
};
