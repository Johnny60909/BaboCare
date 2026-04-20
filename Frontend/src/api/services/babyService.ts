import apiClient from '../../lib/apiClient';
import type {
  IBaby,
  ICreateBabyRequest,
  IUpdateBabyRequest,
  IAvatarUploadResponse,
  IBabyCountResponse,
  INanny,
  IParent,
} from '../dtos/babyDtos';

const BASE_URL = '/api/babies';
const USERS_URL = '/api/users';

export const babyService = {
  // Get all babies
  async getBabies(): Promise<IBaby[]> {
    const response = await apiClient.get(`${BASE_URL}`);
    return response.data;
  },

  // Get baby by ID
  async getBabyById(id: string): Promise<IBaby> {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response.data;
  },

  // Create baby
  async createBaby(request: ICreateBabyRequest): Promise<IBaby> {
    const response = await apiClient.post(`${BASE_URL}`, request);
    return response.data;
  },

  // Update baby
  async updateBaby(id: string, request: IUpdateBabyRequest): Promise<IBaby> {
    const response = await apiClient.put(`${BASE_URL}/${id}`, request);
    return response.data;
  },

  // Delete baby
  async deleteBaby(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  // Upload avatar
  async uploadAvatar(babyId: string, file: File, onProgress?: (percent: number) => void): Promise<IAvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(
      `${BASE_URL}/${babyId}/avatar`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent: any) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
            onProgress(percent);
          }
        },
      }
    );

    return response.data;
  },

  // Get baby count by role
  async getBabyCountByRole(): Promise<IBabyCountResponse> {
    const response = await apiClient.get(`${BASE_URL}/stats/count`);
    return response.data;
  },
};

export const userService = {
  // Get nannies list
  async getNannies(): Promise<INanny[]> {
    const response = await apiClient.get(`${USERS_URL}/nannies`);
    return response.data;
  },

  // Get parents list
  async getParents(): Promise<IParent[]> {
    const response = await apiClient.get(`${USERS_URL}/parents`);
    return response.data;
  },
};
