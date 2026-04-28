import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CurrentUserService } from "../../../api/services/CurrentUserService";
import type { UpdateMyProfileRequest } from "../../../api/dtos/Users/currentUser.dto";

const CURRENT_USER_QUERY_KEY = ["currentUser"];

/**
 * Hook: 取得當前用戶信息
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: async ({ signal }) =>
      CurrentUserService.getCurrentUser(signal),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook: 更新當前用戶個人資料（支持 error 回調）
 */
export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UpdateMyProfileRequest) => {
      return CurrentUserService.updateMyProfile(request);
    },
    onSuccess: (data) => {
      // 更新緩存
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, data);
    },
  });
};
