/**
 * 授權相關 DTO
 */

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginParams {
  username: string;
  password: string;
}
