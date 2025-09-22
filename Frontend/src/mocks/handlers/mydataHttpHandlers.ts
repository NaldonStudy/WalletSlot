import { faker } from '@faker-js/faker'
import { http, HttpResponse } from 'msw'

// 은행 목록 데이터
const bankList = [
  { code: 'SH', name: '신한은행', color: '#0066CC' },
  { code: 'KB', name: 'KB국민은행', color: '#FFB800' },
  { code: 'WR', name: '우리은행', color: '#004B9C' },
  { code: 'NH', name: 'NH농협은행', color: '#00A651' },
  { code: 'HN', name: '하나은행', color: '#008375' }
]

// 계좌 타입
const accountTypes = [
  '자유입출금통장',
  '정기예금',
  '적금',
  '대출',
  '카드대금',
  '투자상품'
]

// 연결 정보 타입 정의
type BankConnection = {
  accountId: string
  bankCode: string
  bankName: string
  bankColor: string
  accountNumber: string
  accountType: string
  accountName: string
  connectionDate: string
  expiryDate: string
  status: 'active' | 'expired' | 'suspended'
  balance: number
}

// 모킹 데이터 생성
const generateMockConnections = (): BankConnection[] => {
  const connections: BankConnection[] = []
  
  // 각 은행마다 1-3개의 계좌 생성
  bankList.forEach(bank => {
    const accountCount = faker.number.int({ min: 1, max: 3 })
    
    for (let i = 0; i < accountCount; i++) {
      const connection = {
        accountId: faker.string.uuid(),
        bankCode: bank.code,
        bankName: bank.name,
        bankColor: bank.color,
        accountNumber: faker.finance.accountNumber(12),
        accountType: faker.helpers.arrayElement(accountTypes),
        accountName: `${bank.name} ${faker.helpers.arrayElement(accountTypes)}`,
        connectionDate: faker.date.past({ years: 1 }).toISOString().split('T')[0],
        expiryDate: faker.date.future({ years: 1 }).toISOString().split('T')[0],
        status: faker.helpers.arrayElement(['active', 'expired', 'suspended']),
        balance: faker.number.int({ min: 0, max: 10000000 })
      }
      connections.push(connection)
    }
  })
  
  return connections
}

// 연결된 금융사 목록 조회 (10-4-1)
export const getMyDataConnections = http.get('/api/users/me/mydata/connections', () => {
  // 실제 은행 로고와 함께 Mock 데이터
  const mockConnections: BankConnection[] = [
    {
      accountId: '1',
      bankCode: 'SH',
      bankName: '신한은행',
      bankColor: '#0066CC',
      accountNumber: '1234567890123',
      accountType: '자유입출금통장',
      accountName: '신한은행 자유입출금통장',
      connectionDate: '2024-08-15',
      expiryDate: '2025-12-31',
      status: 'active',
      balance: 1500000
    },
    {
      accountId: '2',
      bankCode: 'SH',
      bankName: '신한은행',
      bankColor: '#0066CC',
      accountNumber: '1234567890124',
      accountType: '정기예금',
      accountName: '신한은행 정기예금',
      connectionDate: '2024-09-01',
      expiryDate: '2025-10-15',
      status: 'active',
      balance: 5000000
    },
    {
      accountId: '3',
      bankCode: 'KB',
      bankName: '국민은행',
      bankColor: '#FFB800',
      accountNumber: '9876543210987',
      accountType: '적금',
      accountName: '국민은행 적금',
      connectionDate: '2024-07-20',
      expiryDate: '2025-11-30',
      status: 'active',
      balance: 800000
    },
    {
      accountId: '4',
      bankCode: 'WR',
      bankName: '우리은행',
      bankColor: '#004B9C',
      accountNumber: '5555666677778',
      accountType: '자유입출금통장',
      accountName: '우리은행 자유입출금통장',
      connectionDate: '2024-06-10',
      expiryDate: '2025-09-25',
      status: 'expired',
      balance: 250000
    },
    {
      accountId: '5',
      bankCode: 'KAO',
      bankName: '카카오뱅크',
      bankColor: '#FFEB00',
      accountNumber: '3333444455556',
      accountType: '자유입출금통장',
      accountName: '카카오뱅크 자유입출금통장',
      connectionDate: '2024-07-01',
      expiryDate: '2026-01-15',
      status: 'active',
      balance: 750000
    },
    {
      accountId: '6',
      bankCode: 'HN',
      bankName: '하나은행',
      bankColor: '#008375',
      accountNumber: '7777888899990',
      accountType: '정기예금',
      accountName: '하나은행 정기예금',
      connectionDate: '2024-05-20',
      expiryDate: '2025-11-10',
      status: 'active',
      balance: 3200000
    }
  ]
  
  console.log('[MSW] 🏦 연결된 금융사 목록 조회 요청 받음')
  console.log('[MSW] 🏦 반환할 데이터:', {
    총연결수: mockConnections.length,
    활성계좌: mockConnections.filter(c => c.status === 'active').length,
    데이터샘플: mockConnections.slice(0, 2)
  })
  
  const responseData = {
    success: true,
    data: {
      connections: mockConnections,
      totalCount: mockConnections.length,
      activeCount: mockConnections.filter(c => c.status === 'active').length
    }
  }
  
  console.log('[MSW] 🏦 최종 응답 데이터:', responseData)
  
  return HttpResponse.json(responseData)
})

// 특정 계좌 연결 상세 조회 (10-4-2)
export const getConnectionDetail = http.get('/api/users/me/mydata/connections/:accountId', ({ params }) => {
  const { accountId } = params
  const connections = generateMockConnections()
  const connection = connections.find(c => c.accountId === accountId)
  
  if (!connection) {
    return HttpResponse.json(
      { success: false, error: 'Connection not found' },
      { status: 404 }
    )
  }
  
  return HttpResponse.json({
    success: true,
    data: {
      ...connection,
      lastSyncDate: faker.date.recent().toISOString(),
      permissions: ['balance', 'transactions', 'account_info'],
      consentExpiryDate: connection.expiryDate
    }
  })
})

// 연결 가능한 금융사 목록 조회 (10-4-3)
export const getAvailableInstitutions = http.get('/api/mydata/institutions', () => {
  return HttpResponse.json({
    success: true,
    data: {
      institutions: bankList.map(bank => ({
        code: bank.code,
        name: bank.name,
        type: 'bank',
        logoUrl: `https://example.com/logos/${bank.code.toLowerCase()}.png`,
        supportedServices: ['account', 'card', 'loan'],
        available: true
      }))
    }
  })
})

// 특정 금융사 연결 추가 (10-4-4)
export const addConnection = http.post('/api/users/me/mydata/connections', async ({ request }) => {
  const body = await request.json() as {
    bankCode: string
    accountNumber: string
    accountType: string
  }
  
  const bank = bankList.find(b => b.code === body.bankCode)
  if (!bank) {
    return HttpResponse.json(
      { success: false, error: 'Invalid bank code' },
      { status: 400 }
    )
  }
  
  const newConnection = {
    accountId: faker.string.uuid(),
    bankCode: body.bankCode,
    bankName: bank.name,
    bankColor: bank.color,
    accountNumber: body.accountNumber,
    accountType: body.accountType,
    accountName: `${bank.name} ${body.accountType}`,
    connectionDate: new Date().toISOString().split('T')[0],
    expiryDate: faker.date.future({ years: 1 }).toISOString().split('T')[0],
    status: 'active',
    balance: faker.number.int({ min: 0, max: 10000000 })
  }
  
  return HttpResponse.json({
    success: true,
    data: newConnection
  }, { status: 201 })
})

// 특정 계좌 연결 해제 (10-4-5)
export const deleteConnection = http.delete('/api/users/me/mydata/connections/:accountId', ({ params }) => {
  const { accountId } = params
  
  return HttpResponse.json({
    success: true,
    message: 'Connection deleted successfully'
  })
})

export const mydataHttpHandlers = [
  getMyDataConnections,
  getConnectionDetail,
  getAvailableInstitutions,
  addConnection,
  deleteConnection
]