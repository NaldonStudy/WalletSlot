import { API_ENDPOINTS } from '@/src/constants/api';
import { http, HttpResponse } from 'msw';

// Mock 데이터
const mockDevices = [
  {
    deviceId: 'device-001',
    platform: 'ANDROID',
    status: 'ACTIVE',
    pushEnabled: true,
    tokenPresent: true,
  },
  {
    deviceId: 'device-002', 
    platform: 'IOS',
    status: 'ACTIVE',
    pushEnabled: false,
    tokenPresent: true,
  },
];

const mockLinkedAccounts = [
  {
    accountId: 'account-001',
    bankCode: '088',
    bankName: '신한은행',
    accountNo: '110-123-456789',
    alias: '내 주계좌',
    accountBalance: '1500000',
  },
  {
    accountId: 'account-002',
    bankCode: '004',
    bankName: 'KB국민은행',
    accountNo: '123-45-678901',
    alias: '적금통장',
    accountBalance: '5000000',
  },
  {
    accountId: 'account-003',
    bankCode: '020',
    bankName: '우리은행',
    accountNo: '456-78-901234',
    alias: '비상금통장',
    accountBalance: '750000',
  },
  {
    accountId: 'account-004',
    bankCode: '081',
    bankName: '하나은행',
    accountNo: '789-01-234567',
    alias: '투자계좌',
    accountBalance: '12500000',
  },
  {
    accountId: 'account-005',
    bankCode: '011',
    bankName: 'NH농협은행',
    accountNo: '234-567-890123',
    alias: '생활비통장',
    accountBalance: '320000',
  },
];

export const settingsHandlers = [
  // 디바이스 목록 조회
  http.get(`*${API_ENDPOINTS.DEVICES}`, () => {
    return HttpResponse.json({
      success: true,
      message: '디바이스 목록 조회 성공',
      data: {
        devices: mockDevices,
      },
    });
  }),

  // 디바이스 설정 업데이트
  http.patch(`*${API_ENDPOINTS.DEVICE_BY_ID(':deviceId')}`, async ({ request, params }) => {
    const deviceId = params.deviceId as string;
    const body = await request.json() as any;
    
    const deviceIndex = mockDevices.findIndex(d => d.deviceId === deviceId);
    if (deviceIndex === -1) {
      return HttpResponse.json(
        { success: false, message: '디바이스를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 업데이트 적용
    Object.assign(mockDevices[deviceIndex], body);

    return HttpResponse.json({
      success: true,
      message: '디바이스 설정 업데이트 성공',
      data: {
        device: mockDevices[deviceIndex],
      },
    });
  }),

  // 디바이스 삭제
  http.delete(`*${API_ENDPOINTS.DEVICE_BY_ID(':deviceId')}`, ({ params }) => {
    const deviceId = params.deviceId as string;
    const deviceIndex = mockDevices.findIndex(d => d.deviceId === deviceId);
    
    if (deviceIndex === -1) {
      return HttpResponse.json(
        { success: false, message: '디바이스를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const deletedDevice = mockDevices.splice(deviceIndex, 1)[0];

    return HttpResponse.json({
      success: true,
      message: '디바이스 삭제 성공',
      data: {
        device: deletedDevice,
      },
    });
  }),

  // PIN 변경
  http.patch(`*${API_ENDPOINTS.PIN_CHANGE}`, async ({ request }) => {
    const body = await request.json() as any;
    const { currentPin, newPin } = body;

    // 간단한 검증 (실제로는 서버에서 처리)
    if (!currentPin || !newPin) {
      return HttpResponse.json(
        { success: false, message: '현재 PIN과 새 PIN을 모두 입력해주세요.' },
        { status: 400 }
      );
    }

    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return HttpResponse.json(
        { success: false, message: 'PIN은 4자리 숫자여야 합니다.' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'PIN 변경 성공',
      data: {},
    });
  }),
];