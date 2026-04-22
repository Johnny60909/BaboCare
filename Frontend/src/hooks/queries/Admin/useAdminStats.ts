import { useQuery } from '@tanstack/react-query';
import { adminStatsService } from '../../../api/services/Admin/adminStatsService';

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminStatsService.getStats,
  });
};
