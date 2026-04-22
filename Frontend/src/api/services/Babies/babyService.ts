import apiClient, { handleApiResponse } from '../../../lib/apiClient';
import type { JsonResponse } from '../../../lib/apiClient';
import type {
  IBaby,
  ICreateBabyRequest,
  IUpdateBabyRequest,
  IAvatarUploadResponse,
  IBabyCountResponse,
  INanny,
  IParent,
} from '../../dtos/Babies/babyDtos';

const BASE_URL = '/api/babies';
const USERS_URL = '/api/users';

export const babyService = {
  // Get all babies
  async getBabies(signal?: AbortSignal): Promise<IBaby[]> {
    const response = await apiClient.get<JsonResponse<IBaby[]>>(`${BASE_URL}`, { signal });
    return handleApiResponse(response);
  },

  // Get baby by ID
  async getBabyById(id: string, signal?: AbortSignal): Promise<IBaby> {
    const response = await apiClient.get<JsonResponse<IBaby>>(`${BASE_URL}/${id}`, { signal });
    return handleApiResponse(response);
  },

  // Create baby
  async createBaby(request: ICreateBabyRequest, signal?: AbortSignal): Promise<IBaby> {
    const response = await apiClient.post<JsonResponse<IBaby>>(`${BASE_URL}`, request, { signal });
    return handleApiResponse(response);
  },

  // Update baby
  async updateBaby(id: string, request: IUpdateBabyRequest, signal?: AbortSignal): Promise<IBaby> {
    const response = await apiClient.put<JsonResponse<IBaby>>(`${BASE_URL}/${id}`, request, { signal });
    return handleApiResponse(response);
  },

  // Delete baby
  async deleteBaby(id: string, signal?: AbortSignal): Promise<void> {
    const response = await apiClient.delete<JsonResponse>(`${BASE_URL}/${id}`, { signal });
    handleApiResponse(response);
  },

  // Upload avatar
  async uploadAvatar(babyId: string, file: File, signal?: AbortSignal, onProgress?: (percent: number) => void): Promise<IAvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<JsonResponse<IAvatarUploadResponse>>(
      `${BASE_URL}/${babyId}/avatar`,
      formData,
      {
        signal,
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

    return handleApiResponse(response);
  },

  // Get baby count by role
  async getBabyCountByRole(signal?: AbortSignal): Promise<IBabyCountResponse> {
    const response = await apiClient.get<JsonResponse<IBabyCountResponse>>(`${BASE_URL}/stats/count`, { signal });
    return handleApiResponse(response);
  },
};

export const userService = {
  // Get nannies list
  async getNannies(signal?: AbortSignal): Promise<INanny[]> {
    const response = await apiClient.get<JsonResponse<INanny[]>>(`${USERS_URL}/nannies`, { signal });
    return handleApiResponse(response);
  },

  // Get parents list
  async getParents(signal?: AbortSignal): Promise<IParent[]> {
    const response = await apiClient.get<JsonResponse<IParent[]>>(`${USERS_URL}/parents`, { signal });
    return handleApiResponse(response);
  },
};
