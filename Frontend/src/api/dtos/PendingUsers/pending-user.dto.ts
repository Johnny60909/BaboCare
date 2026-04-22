/**
 * 待匹配帳號相關 DTO
 */

export interface PendingUserListItem {
  id: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  avatarUrl?: string;
  source: string;
  inviteCode?: string;
  isInviteCodeValid: boolean;
}

export interface PendingRegisterRequest {
  email?: string;
  phoneNumber?: string;
  password: string;
  displayName: string;
  userName?: string;
}

export interface PendingRegisterResponse {
  pendingUserId: string;
  userName?: string;
}

export interface PendingActivateRequest {
  pendingUserId?: string;
  inviteCode: string;
}

export interface PendingActivateResponse {
  userName: string;
}
