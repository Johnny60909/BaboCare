import { useInfiniteQuery, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activityService } from '../../../api/services/Activities/activityService';
import type { ICreateActivityRequest } from '../../../api/dtos/Activities/activityDtos';

const ACTIVITIES_QUERY_KEY = ['activities'];
const ACTIVITY_SUMMARIES_KEY = ['activity-summaries'];

const PAGE_LIMIT = 20;

/**
 * 動態牆無限滾動 hook
 * @returns TanStack Query `useInfiniteQuery` 結果，含 `data.pages[]` 每頁 `{ items, total }`
 */
export function useActivityFeed() {
  return useInfiniteQuery({
    queryKey: [...ACTIVITIES_QUERY_KEY, 'feed'],
    queryFn: ({ pageParam = 0, signal }) =>
      activityService.getFeed(pageParam as number, PAGE_LIMIT, signal),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total ? loaded : undefined;
    },
    staleTime: 30_000,
  });
}

/**
 * 取得各寶寶最新活動摘要，供首頁頭像列排序使用（依最新活動 DESC）
 */
export function useActivitySummaries() {
  return useQuery({
    queryKey: ACTIVITY_SUMMARIES_KEY,
    queryFn: ({ signal }) => activityService.getSummaries(signal),
    staleTime: 30_000,
  });
}

/**
 * 取得指定寶寶的活動清單，用於 CarouselModal 轉盤展示（最多 `limit` 筆，依 CreatedAt DESC）
 * @param babyId - 寶寶 ID；傳入 null 時查詢暫停
 * @param limit - 最大筆數，預設 20
 */
export function useBabyActivities(babyId: string | null, limit = 20) {
  return useQuery({
    queryKey: [...ACTIVITIES_QUERY_KEY, 'baby', babyId, limit],
    queryFn: ({ signal }) => activityService.getBabyActivities(babyId!, limit, signal),
    enabled: !!babyId,
    staleTime: 30_000,
  });
}

/**
 * 建立活動 mutation hook
 * 成功後自動 invalidate `activities` 與 `activity-summaries` 快取，觸發動態牆及頭像列重新整理
 */
export function useCreateActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ICreateActivityRequest) => activityService.createActivity(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVITIES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ACTIVITY_SUMMARIES_KEY });
    },
  });
}
