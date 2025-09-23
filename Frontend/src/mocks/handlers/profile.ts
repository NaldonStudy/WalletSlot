/*
 * 사용자 프로필 관련 MSW 핸들러
 * API 명세에 맞춰 /api/users/me 엔드포인트만 사용
 */

import {
    BaseResponse,
    MePatchRequestDto,
    MeResponseDto,
    UserProfile
} from '@/src/types';
import { http, HttpResponse } from 'msw';

// 고정된 샘플 사용자 프로필 데이터 (API 명세에 맞춘 형태)
const SAMPLE_USER_PROFILE: UserProfile = {
  id: 1,
  uuid: 'sample-uuid-12345',
  name: '김싸피',
  phoneNumber: '010-1234-5678',
  gender: 'MAN',
  birthDate: '1995-03-15',
  baseDay: 10,
  job: 'OFFICE_WORKER',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  email: 'kim.ssafy@example.com',
  monthlyIncome: 4500000,
};

export const profileHandlers = [
  // 사용자 프로필 조회 (GET /api/users/me)
  http.get('*/api/users/me', () => {
    console.log('[MSW] GET /api/users/me - 사용자 프로필 조회');
    
    const response: MeResponseDto = {
      success: true,
      data: SAMPLE_USER_PROFILE,
      message: '사용자 프로필 조회 성공',
    };

    console.log('[MSW] 응답 데이터:', JSON.stringify(response, null, 2));
    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),

  // 사용자 프로필 수정 (PATCH /api/users/me)
  http.patch('*/api/users/me', async ({ request }) => {
    console.log('[MSW] PATCH /api/users/me - 사용자 프로필 수정');
    
    const body = await request.json() as MePatchRequestDto;
    console.log('[MSW] 수정 요청 데이터:', body);

    // 요청 필드 검증
    if (body.name !== undefined && (!body.name || body.name.trim().length === 0)) {
      const response: BaseResponse<null> = {
        success: false,
        data: null,
        message: '이름은 빈 값일 수 없습니다.',
      };
      return HttpResponse.json(response, { status: 400 });
    }

    if (body.phoneNumber !== undefined) {
      const phoneRegex = /^010-\d{4}-\d{4}$/;
      if (!phoneRegex.test(body.phoneNumber)) {
        const response: BaseResponse<null> = {
          success: false,
          data: null,
          message: '올바른 전화번호 형식(010-0000-0000)이 아닙니다.',
        };
        return HttpResponse.json(response, { status: 400 });
      }
    }

    if (body.birthDate !== undefined) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(body.birthDate)) {
        const response: BaseResponse<null> = {
          success: false,
          data: null,
          message: '올바른 날짜 형식(YYYY-MM-DD)이 아닙니다.',
        };
        return HttpResponse.json(response, { status: 400 });
      }
    }

    if (body.gender !== undefined && !['MAN', 'WOMAN'].includes(body.gender)) {
      const response: BaseResponse<null> = {
        success: false,
        data: null,
        message: '올바른 성별(MAN, WOMAN) 값이 필요합니다.',
      };
      return HttpResponse.json(response, { status: 400 });
    }

    if (body.baseDay !== undefined && (body.baseDay < 1 || body.baseDay > 31)) {
      const response: BaseResponse<null> = {
        success: false,
        data: null,
        message: '기준일은 1-31 사이의 값이어야 합니다.',
      };
      return HttpResponse.json(response, { status: 400 });
    }

    const validJobs = [
      'OFFICE_WORKER', 'STUDENT', 'SELF_EMPLOYED', 'UNEMPLOYED', 'OTHER',
      'DEVELOPER', 'DESIGNER', 'PLANNER', 'MARKETER', 'SALES', 
      'TEACHER', 'MEDICAL', 'CIVIL_SERVANT', 'RESEARCHER', 'ARTIST', 
      'SERVICE', 'MANUFACTURING', 'FINANCE', 'MEDIA', 'LEGAL', 'FREELANCER'
    ];
    
    if (body.job !== undefined && !validJobs.includes(body.job)) {
      const response: BaseResponse<null> = {
        success: false,
        data: null,
        message: '올바른 직업 카테고리가 필요합니다.',
      };
      return HttpResponse.json(response, { status: 400 });
    }

    // 유효한 필드만 업데이트
    if (body.name !== undefined) SAMPLE_USER_PROFILE.name = body.name;
    if (body.phoneNumber !== undefined) SAMPLE_USER_PROFILE.phoneNumber = body.phoneNumber;
    if (body.gender !== undefined) SAMPLE_USER_PROFILE.gender = body.gender;
    if (body.birthDate !== undefined) SAMPLE_USER_PROFILE.birthDate = body.birthDate;
    if (body.baseDay !== undefined) SAMPLE_USER_PROFILE.baseDay = body.baseDay;
    if (body.job !== undefined) SAMPLE_USER_PROFILE.job = body.job;
    if (body.monthlyIncome !== undefined) SAMPLE_USER_PROFILE.monthlyIncome = body.monthlyIncome;

    // updatedAt 시간 업데이트
    SAMPLE_USER_PROFILE.updatedAt = new Date().toISOString();

    const response: MeResponseDto = {
      success: true,
      data: SAMPLE_USER_PROFILE,
      message: '사용자 프로필이 성공적으로 수정되었습니다.',
    };

    console.log('[MSW] 수정 완료, 응답 데이터:', JSON.stringify(response, null, 2));
    return HttpResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }),
];