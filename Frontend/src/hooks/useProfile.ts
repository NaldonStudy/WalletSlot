import { profileApi } from '@/src/api';
import { queryKeys } from '@/src/api/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: profileApi.getUserProfile,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateDateOfBirth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateDateOfBirth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateGender = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateGender,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useSendPhoneVerification = () => {
  return useMutation({
    mutationFn: profileApi.sendPhoneVerification,
  });
};

export const useConfirmPhoneVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { verificationId: string; code: string; phone: string }) =>
      profileApi.confirmPhoneVerification(data.verificationId, data.code, data.phone),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useSendEmailVerification = () => {
  return useMutation({
    mutationFn: profileApi.sendEmailVerification,
  });
};

export const useConfirmEmailVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { verificationId: string; code: string; email: string }) =>
      profileApi.confirmEmailVerification(data.verificationId, data.code, data.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateJob,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateMonthlyIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateMonthlyIncome,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.removeAvatar,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};