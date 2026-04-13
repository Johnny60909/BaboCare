/**
 * 登出 React Query 自定義 Hook
 */

import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { clearTokens } from '../../lib/auth';

/**
 * 登出 Mutation Hook
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // 清除 Token
      clearTokens();
      // 清除 Query 快取
      await queryClient.clear();
      return Promise.resolve();
    },
    onSuccess: () => {
      // 重定向到登入頁面
      navigate('/login', { replace: true });
    },
    onError: (error) => {
      console.error('登出失敗:', error);
      // 即使出錯也進行重定向，確保使用者退出
      navigate('/login', { replace: true });
    },
  });
};
