import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/src/api/notification';

export const useUnreadNotifications = (params?: {
  type?: 'UNCATEGORIZED' | 'SYSTEM' | 'DEVICE' | 'BUDGET' | 'TRANSACTION' | 'MARKETING';
  page?: number;
  size?: number;
}) => {
  return useQuery({
    queryKey: ['notifications', 'unread', params?.type, params?.page, params?.size],
    queryFn: async () => {
      const result = await notificationApi.getUnreadNotifications(params);
      return result;
    },
    staleTime: 30 * 1000, // 30초간 fresh 상태 유지
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
  });
};
