/**
 * 帳號管理相關 DTO
 */

export interface UserListItem {
  id: string;
  displayName: string;
  gender: string;
  roles: string[];
  loginMethods: string[];
  isActive: boolean;
  isDeleted: boolean;
}

export interface UserDetailDto {
  id: string;
  email: string;
  displayName: string;
  gender?: string;
  phoneNumber?: string;
  userName?: string;
  roles: string[];
  loginMethods: string[];
  isActive: boolean;
  isDeleted: boolean;
}

export interface CreateUserRequest {
  email: string;
  displayName: string;
  gender?: string;
  phoneNumber?: string;
  userName?: string;
  password: string;
  roles?: string[];
  isActive?: boolean;
}

export interface UpdateUserRequest {
  email: string;
  displayName: string;
  gender?: string;
  phoneNumber?: string;
  roles?: string[];
  isActive?: boolean;
}
