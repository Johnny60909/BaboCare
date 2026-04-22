// DTO Types for Baby management

export interface IBaby {
  id: string;
  name: string;
  dateOfBirth: string;
  gender?: string;
  nannyId?: string;
  avatarUrl?: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  parentIds: string[];
}

export interface ICreateBabyRequest {
  name: string;
  dateOfBirth: string;
  gender?: string;
  nannyId?: string;
  parentIds?: string[];
}

export interface IUpdateBabyRequest {
  name: string;
  dateOfBirth: string;
  gender?: string;
  nannyId?: string;
  parentIds?: string[];
}

export interface IBabyResponseDto extends IBaby {}

export interface IAvatarUploadResponse {
  avatarUrl: string;
  message: string;
}

export interface IBabyCountResponse {
  count: number;
}

export interface INanny {
  id: string;
  displayName: string;
  userName: string;
}

export interface IParent {
  id: string;
  displayName: string;
  userName: string;
}
