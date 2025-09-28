import { useQuery } from '@tanstack/react-query';
import { notificationApi } from '@/src/api/notification';

export const useUncategorizedNotificationCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const result = await notificationApi.getUnreadCount();
      return result;
    },
    staleTime: 30 * 1000, // 30초간 fresh 상태 유지
    refetchInterval: 60 * 1000, // 1분마다 자동 갱신
  });
};
