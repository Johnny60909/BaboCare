import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { babyService, userService } from '../../api/services/babyService';
import type { ICreateBabyRequest, IUpdateBabyRequest } from '../../api/dtos/babyDtos';

const BABIES_QUERY_KEY = ['babies'];
const NANNIES_QUERY_KEY = ['nannies'];
const PARENTS_QUERY_KEY = ['parents'];

// Get all babies
export function useGetBabies() {
  return useQuery({
    queryKey: BABIES_QUERY_KEY,
    queryFn: () => babyService.getBabies(),
    staleTime: 0, // 立即標記為過期，確保上傳後重新取得
  });
}

// Get baby by ID
export function useGetBabyById(id: string | undefined) {
  return useQuery({
    queryKey: [...BABIES_QUERY_KEY, id],
    queryFn: () => (id ? babyService.getBabyById(id) : Promise.reject('No ID')),
    enabled: !!id,
    staleTime: 0, // 立即標記為過期，確保上傳後重新取得
  });
}

// Create baby
export function useCreateBaby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ICreateBabyRequest) => babyService.createBaby(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BABIES_QUERY_KEY });
    },
  });
}

// Update baby
export function useUpdateBaby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: IUpdateBabyRequest }) =>
      babyService.updateBaby(id, request),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: BABIES_QUERY_KEY });
      queryClient.setQueryData([...BABIES_QUERY_KEY, data.id], data);
    },
  });
}

// Delete baby
export function useDeleteBaby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => babyService.deleteBaby(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BABIES_QUERY_KEY });
    },
  });
}

// Upload baby avatar
export function useUploadBabyAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      babyId,
      file,
      onProgress,
    }: {
      babyId: string;
      file: File;
      onProgress?: (percent: number) => void;
    }) => babyService.uploadAvatar(babyId, file, onProgress),
    onSuccess: async (_data, variables) => {
      // 使用 refetchQueries 強制立即重新取得最新數據
      await queryClient.refetchQueries({ 
        queryKey: ['babies', variables.babyId]
      });
      await queryClient.refetchQueries({ 
        queryKey: ['babies']
      });
    },
  });
}

// Get nannies
export function useGetNannies() {
  return useQuery({
    queryKey: NANNIES_QUERY_KEY,
    queryFn: () => userService.getNannies(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get parents
export function useGetParents() {
  return useQuery({
    queryKey: PARENTS_QUERY_KEY,
    queryFn: () => userService.getParents(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get baby count by role
export function useGetBabyCountByRole() {
  return useQuery({
    queryKey: [...BABIES_QUERY_KEY, 'count'],
    queryFn: () => babyService.getBabyCountByRole(),
    staleTime: 60 * 1000, // 1 minute
  });
}
