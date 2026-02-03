import {
    profileApi,
    updateDateOfBirth,
    updateEmail,
    updateGender,
    updateJob,
    updateMonthlyIncome,
    updateName,
    updatePhoneNumber,
    updateProfile
} from '@/src/api';
import { queryKeys } from '@/src/api/queryKeys';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useUserProfile = () => {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: profileApi.getMe,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
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
    mutationFn: updateName,
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
    mutationFn: updateDateOfBirth,
    onMutate: async (dob: string) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, birthDate: dob } };
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
    mutationFn: (gender: string) => updateGender(gender as 'M' | 'F' | 'O'),
    onMutate: async (gender: string) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        // 새 API 형식에 맞게 gender 매핑
        const genderMap: Record<string, string> = { 'M': 'MAN', 'F': 'WOMAN', 'O': 'OTHER' };
        const newGender = genderMap[gender] || gender;
        return { ...old, data: { ...old.data, gender: newGender } };
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
    mutationFn: async (phone: string) => {
      // 새로운 API 명세에서는 전화번호 인증이 통합 API를 통해 처리됨
      // 여기서는 단순히 성공으로 처리 (실제로는 서버 구현 필요)
      return { success: true, message: '인증 코드가 발송되었습니다.' };
    },
  });
};

export const useConfirmPhoneVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { verificationId: string; code: string; phone: string }) =>
      updatePhoneNumber(data.phone),
    onMutate: async (vars: { verificationId: string; code: string; phone: string }) => {
      const key = queryKeys.user.profile();
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return { ...old, data: { ...old.data, phoneNumber: vars.phone } };
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
    mutationFn: updateEmail,
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
    mutationFn: async (email: string) => {
      // 새로운 API 명세에서는 이메일 인증이 통합 API를 통해 처리됨
      // 여기서는 단순히 성공으로 처리 (실제로는 서버 구현 필요)
      return { success: true, message: '인증 코드가 발송되었습니다.' };
    },
  });
};

export const useConfirmEmailVerification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { verificationId: string; code: string; email: string }) =>
      updateEmail(data.email),
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
    mutationFn: updateJob,
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
    mutationFn: updateMonthlyIncome,
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
    mutationFn: async (avatarPayload: any) => {
      // 새로운 API 명세에서는 아바타 관리가 없음
      // 통합 API를 통해 처리하거나 별도 구현 필요
      console.warn('Avatar update not implemented in new API spec');
      return { success: true, message: '아바타 업데이트 기능은 구현 예정입니다.' };
    },
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
    mutationFn: async () => {
      // 새로운 API 명세에서는 아바타 관리가 없음
      console.warn('Avatar removal not implemented in new API spec');
      return { success: true, message: '아바타 제거 기능은 구현 예정입니다.' };
    },
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