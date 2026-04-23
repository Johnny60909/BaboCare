import apiClient, { handleApiResponse } from '../../../lib/apiClient';
import type { JsonResponse, JsonTableResponse } from '../../../lib/apiClient';
import type {
  IActivity,
  IBabyActivitySummary,
  ICreateActivityRequest,
} from '../../dtos/Activities/activityDtos';

const BASE_URL = '/api/activities';

export const activityService = {
  // Upload activity photo (call before createActivity)
  async uploadPhoto(file: File, signal?: AbortSignal, onProgress?: (percent: number) => void): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<JsonResponse<string>>(`${BASE_URL}/photo`, formData, {
      signal,
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          onProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
        }
      },
    });
    return handleApiResponse(response);
  },

  // Create activity
  async createActivity(request: ICreateActivityRequest, signal?: AbortSignal): Promise<IActivity> {
    const response = await apiClient.post<JsonResponse<IActivity>>(BASE_URL, request, { signal });
    return handleApiResponse(response);
  },

  // Get activity feed (infinite scroll)
  async getFeed(skip: number, limit: number, signal?: AbortSignal): Promise<{ items: IActivity[]; total: number }> {
    const response = await apiClient.get<JsonTableResponse<IActivity>>(BASE_URL, {
      params: { skip, limit },
      signal,
    });
    const { state, result, total, message } = response.data;
    if (state !== 111) throw new Error(message || 'API Error');
    return { items: result ?? [], total: total ?? 0 };
  },

  // Get baby activity summaries (for avatar carousel header)
  async getSummaries(signal?: AbortSignal): Promise<IBabyActivitySummary[]> {
    const response = await apiClient.get<JsonResponse<IBabyActivitySummary[]>>(`${BASE_URL}/summaries`, { signal });
    return handleApiResponse(response);
  },

  // Get activities for a specific baby (for carousel viewer)
  async getBabyActivities(babyId: string, limit = 20, signal?: AbortSignal): Promise<IActivity[]> {
    const response = await apiClient.get<JsonResponse<IActivity[]>>(`/api/babies/${babyId}/activities`, {
      params: { limit },
      signal,
    });
    return handleApiResponse(response);
  },
};
