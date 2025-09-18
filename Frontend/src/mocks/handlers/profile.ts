/*
 * 사용자 프로필 관련 MSW 핸들러
 */

import {
    BaseResponse,
    UpdateProfileRequest,
    UserProfile
} from '@/src/types';
import { faker } from '@faker-js/faker';
import { http, HttpResponse } from 'msw';

// 고정된 샘플 사용자 프로필 데이터
const SAMPLE_USER_PROFILE: UserProfile = {
  name: '김싸피',
  phone: '010-1234-5678',
  gender: 'M',
  dateOfBirth: '1995-03-15',
  email: 'kim.ssafy@example.com',
  job: '개발자',
  monthlyIncome: 4500000,
  avatar: null,
};

export const profileHandlers = [
  // 프로필 정보 조회
  http.get('/api/users/me', () => {
    console.log('[MSW] GET /api/users/me - 프로필 정보 조회');
    
    const response: BaseResponse<UserProfile> = {
      success: true,
      data: SAMPLE_USER_PROFILE,
      message: '프로필 정보를 성공적으로 조회했습니다.',
    };

    console.log('[MSW] 응답 데이터:', JSON.stringify(response, null, 2));
    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),

  // 여러 필드 동시 수정
  http.patch('/api/users/me', async ({ request }) => {
    console.log('[MSW] PATCH /api/users/me - 프로필 정보 수정');
    
    const body = await request.json() as UpdateProfileRequest;
    console.log('[MSW] 수정 요청 데이터:', body);

    // 실제로는 서버에서 업데이트된 정보를 반환
    const updatedProfile: UserProfile = {
      ...SAMPLE_USER_PROFILE,
      ...body,
    };

    const response: BaseResponse<UserProfile> = {
      success: true,
      data: updatedProfile,
      message: '프로필이 성공적으로 업데이트되었습니다.',
    };

    return HttpResponse.json(response);
  }),

  // 이름 수정
  http.patch('/api/users/me/name', async ({ request }) => {
    console.log('[MSW] PATCH /api/users/me/name - 이름 수정');
    
    const body = await request.json() as { name: string };
    
    const response: BaseResponse<{ name: string }> = {
      success: true,
      data: { name: body.name },
      message: '이름이 성공적으로 변경되었습니다.',
    };

    return HttpResponse.json(response);
  }),

  // 생년월일 수정
  http.patch('/api/users/me/birth', async ({ request }) => {
    console.log('[MSW] PATCH /api/users/me/birth - 생년월일 수정');
    
    const body = await request.json() as { dateOfBirth: string };
    
    const response: BaseResponse<{ dateOfBirth: string }> = {
      success: true,
      data: { dateOfBirth: body.dateOfBirth },
      message: '생년월일이 성공적으로 변경되었습니다.',
    };

    return HttpResponse.json(response);
  }),

  // 성별 수정
  http.patch('/api/users/me/gender', async ({ request }) => {
    console.log('[MSW] PATCH /api/users/me/gender - 성별 수정');
    
    const body = await request.json() as { gender: 'M' | 'F' | 'O' };
    
    const response: BaseResponse<{ gender: string }> = {
      success: true,
      data: { gender: body.gender },
      message: '성별이 성공적으로 변경되었습니다.',
    };

    return HttpResponse.json(response);
  }),

  // 휴대폰 번호 인증 코드 발송
  http.post('/api/users/me/phone-number/verification', async ({ request }) => {
    console.log('[MSW] POST /api/users/me/phone-number/verification - 휴대폰 인증 코드 발송');
    
    const body = await request.json() as { phone: string };
    console.log('[MSW] 인증 코드 발송 대상:', body.phone);
    
    const response: BaseResponse<{ verificationId: string }> = {
      success: true,
      data: { 
        verificationId: faker.string.uuid() 
      },
      message: `${body.phone}로 인증 코드를 발송했습니다.`,
    };

    return HttpResponse.json(response);
  }),

  // 휴대폰 번호 인증 코드 확인
  http.post('/api/users/me/phone-number/verification/confirm', async ({ request }) => {
    console.log('[MSW] POST /api/users/me/phone-number/verification/confirm - 휴대폰 인증 코드 확인');
    
    const body = await request.json() as { verificationId: string; code: string; phone: string };
    console.log('[MSW] 인증 코드 확인:', body);
    
    // Mock에서는 항상 성공으로 처리
    const response: BaseResponse<{ phone: string }> = {
      success: true,
      data: { phone: body.phone },
      message: '휴대폰 번호가 성공적으로 변경되었습니다.',
    };

    return HttpResponse.json(response);
  }),

  // 이메일 주소 수정
  http.patch('/api/users/me/email', async ({ request }) => {
    console.log('[MSW] PATCH /api/users/me/email - 이메일 수정');
    
    const body = await request.json() as { email: string };
    
    const response: BaseResponse<{ email: string }> = {
      success: true,
      data: { email: body.email },
      message: '이메일이 성공적으로 변경되었습니다.',
    };

    return HttpResponse.json(response);
  }),

  // 이메일 인증 코드 발송
  http.post('/api/users/me/email/verification', async ({ request }) => {
    console.log('[MSW] POST /api/users/me/email/verification - 이메일 인증 코드 발송');
    
    const body = await request.json() as { email: string };
    console.log('[MSW] 이메일 인증 코드 발송 대상:', body.email);
    
    const response: BaseResponse<{ verificationId: string }> = {
      success: true,
      data: { 
        verificationId: faker.string.uuid() 
      },
      message: `${body.email}로 인증 코드를 발송했습니다.`,
    };

    return HttpResponse.json(response);
  }),

  // 이메일 인증 코드 확인
  http.post('/api/users/me/email/verification/confirm', async ({ request }) => {
    console.log('[MSW] POST /api/users/me/email/verification/confirm - 이메일 인증 코드 확인');
    
    const body = await request.json() as { verificationId: string; code: string; email: string };
    console.log('[MSW] 이메일 인증 코드 확인:', body);
    
    // Mock에서는 항상 성공으로 처리
    const response: BaseResponse<{ email: string }> = {
      success: true,
      data: { email: body.email },
      message: '이메일이 성공적으로 변경되었습니다.',
    };

    return HttpResponse.json(response);
  }),
  
  // 직업 수정
  http.patch('/api/users/me/job', async ({ request }) => {
    console.log('[MSW] PATCH /api/users/me/job - 직업 수정');
    
    const body = await request.json() as { job: string };
    
    const response: BaseResponse<{ job: string }> = {
      success: true,
      data: { job: body.job },
      message: '직업이 성공적으로 변경되었습니다.',
    };

    return HttpResponse.json(response);
  }),
  
  // 기준일 수정
  http.patch('/api/users/me/base-day', async ({ request }) => {
    console.log('[MSW] PATCH /api/users/me/base-day - 기준일 수정');
    
    const body = await request.json() as { baseDay: number };
    
    const response: BaseResponse<{ baseDay: number }> = {
      success: true,
      data: { baseDay: body.baseDay },
      message: '기준일이 성공적으로 변경되었습니다.',
    };

    return HttpResponse.json(response);
  }),
  
  // 월 수입 수정
  http.patch('/api/users/me/monthly-income', async ({ request }) => {
    console.log('[MSW] PATCH /api/users/me/monthly-income - 월 수입 수정');
    
    const body = await request.json() as { monthlyIncome: number };
    
    const response: BaseResponse<{ monthlyIncome: number }> = {
      success: true,
      data: { monthlyIncome: body.monthlyIncome },
      message: '월 수입이 성공적으로 변경되었습니다.',
    };

    return HttpResponse.json(response);
  }),
  
  // 프로필 이미지 업로드/교체
  http.patch('/api/users/me/avatar', async ({ request }) => {
    console.log('[MSW] PATCH /api/users/me/avatar - 프로필 이미지 업로드');
    
    const body = await request.json() as { avatar: string };
    
    const response: BaseResponse<{ avatar: string }> = {
      success: true,
      data: { avatar: body.avatar },
      message: '프로필 이미지가 성공적으로 업로드되었습니다.',
    };

    return HttpResponse.json(response);
  }),
  
  // 프로필 이미지 제거
  http.delete('/api/users/me/avatar', () => {
    console.log('[MSW] DELETE /api/users/me/avatar - 프로필 이미지 제거');
    
    const response: BaseResponse<null> = {
      success: true,
      data: null,
      message: '프로필 이미지가 성공적으로 제거되었습니다.',
    };

    return HttpResponse.json(response);
  }),
];