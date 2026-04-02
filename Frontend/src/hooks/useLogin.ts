/**
 * @deprecated 使用 useLoginMutation 取代
 * 此檔案保留向後相容性，內部轉向新的 Query Hook
 */

import { useLoginMutation } from './queries/useAuth';

/**
 * 使用 login Hook - 管理登入操作的狀態和副作用
 * @deprecated 使用 useLoginMutation 取代
 */
export const useLogin = () => {
  return useLoginMutation();
};
