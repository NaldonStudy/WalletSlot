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
    onMutate: async (newProfile: any) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, ...newProfile } };
      });
      return { previous };
    },
    onError: (_err, _newProfile, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateName,
    onMutate: async (newName: string) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, name: newName } };
      });
      return { previous };
    },
    onError: (_err, _newName, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateDateOfBirth = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateDateOfBirth,
    onMutate: async (dob: string) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, dateOfBirth: dob } };
      });
      return { previous };
    },
    onError: (_err, _dob, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateGender = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (gender: string) => profileApi.updateGender(gender as 'M' | 'F' | 'O'),
    onMutate: async (gender: string) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, gender } };
      });
      return { previous };
    },
    onError: (_err, _gender, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
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
    onMutate: async (vars: { verificationId: string; code: string; phone: string }) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, phone: vars.phone } };
      });
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateEmail,
    onMutate: async (email: string) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, email } };
      });
      return { previous };
    },
    onError: (_err, _email, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
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
    onMutate: async (vars: { verificationId: string; code: string; email: string }) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, email: vars.email } };
      });
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateJob,
    onMutate: async (job: string) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, job } };
      });
      return { previous };
    },
    onError: (_err, _job, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateMonthlyIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateMonthlyIncome,
    onMutate: async (income: number) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, monthlyIncome: income } };
      });
      return { previous };
    },
    onError: (_err, _income, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useUpdateAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.updateAvatar,
    onMutate: async (avatarPayload: any) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      const preview =
        typeof avatarPayload === 'string'
          ? avatarPayload
          : avatarPayload?.uri || (avatarPayload && avatarPayload[0]?.uri);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, avatar: preview } };
      });
      return { previous };
    },
    onError: (_err, _payload, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};

export const useRemoveAvatar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: profileApi.removeAvatar,
    onMutate: async () => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, avatar: null } };
      });
      return { previous };
    },
    onError: (_err, _vars, context: any) => {
      const key = queryKeys.user.profile();
      if (context?.previous) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
};