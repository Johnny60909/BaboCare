import apiClient, { handleApiResponse } from '../../../lib/apiClient';
import type { AdminStatsDto } from '../../dtos/Admin/adminStatsDtos';

export const adminStatsService = {
  getStats: async (): Promise<AdminStatsDto> => {
    const res = await apiClient.get('/api/admin/stats');
    return handleApiResponse<AdminStatsDto>(res);
  },
};
