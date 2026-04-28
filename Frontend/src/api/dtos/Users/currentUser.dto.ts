/**
 * 當前用戶相關 DTO
 */

export interface CurrentUserDto {
  id: string;
  userName: string;
  email: string;
  displayName: string;
  gender?: string;
  phoneNumber?: string;
  roles: string[];
}

export interface UpdateMyProfileRequest {
  displayName: string;
  gender?: string;
  email?: string;
  phoneNumber?: string;
  newPassword?: string;
}
