import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { setRefreshToken, setToken } from '../lib/auth';

interface LoginParams {
  username: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

const login = async ({ username, password }: LoginParams): Promise<TokenResponse> => {
  const params = new URLSearchParams();
  params.append('grant_type', 'password');
  params.append('username', username);
  params.append('password', password);
  params.append('scope', 'openid offline_access');

  const { data } = await axios.post<TokenResponse>(
    `${import.meta.env.VITE_IDENTITY_URL ?? 'http://localhost:5080'}/connect/token`,
    params,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );
  return data;
};

/// <summary>
/// 使用 login Hook - 管理登入操作的狀態和副作用
/// </summary>
export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setToken(data.access_token);
      setRefreshToken(data.refresh_token);
    },
  });
};
