import { http, HttpResponse } from 'msw'

let settingsState = {
  notifications: { push: true, marketing: false },
  biometric: false,
}

// 개발용: 현재 PIN을 서버(모의) 상태로 보관
let currentPin = '123456'

export const settingsHttpHandlers = [
  http.get('/api/users/me/settings', () => {
    return HttpResponse.json(settingsState)
  }),

  http.patch('/api/users/me/settings/notifications/push', async ({ request }) => {
    try {
  const body = (await request.json()) as any
  settingsState.notifications.push = Boolean(body?.enabled)
      return HttpResponse.json({ success: true, notifications: settingsState.notifications })
    } catch (e) {
      return HttpResponse.json({ error: 'invalid_body' }, { status: 400 })
    }
  }),

  http.patch('/api/users/me/settings/notifications/marketing', async ({ request }) => {
    try {
  const body = (await request.json()) as any
  settingsState.notifications.marketing = Boolean(body?.enabled)
      return HttpResponse.json({ success: true, notifications: settingsState.notifications })
    } catch (e) {
      return HttpResponse.json({ error: 'invalid_body' }, { status: 400 })
    }
  }),

  http.patch('/api/users/me/settings/biometric', async ({ request }) => {
    try {
  const body = (await request.json()) as any
  settingsState.biometric = Boolean(body?.enabled)
      return HttpResponse.json({ success: true, biometric: settingsState.biometric })
    } catch (e) {
      return HttpResponse.json({ error: 'invalid_body' }, { status: 400 })
    }
  }),

  // ===== PIN 관련 엔드포인트 (간단 시뮬레이션) =====
  http.patch('/api/auth/pin', async ({ request }) => {
    // 현재 PIN 변경 (로그인된 사용자용) - body: { currentPin, newPin }
    const body = (await request.json()) as any
    if (!body?.currentPin || !body?.newPin) {
      return HttpResponse.json({ error: 'missing_fields' }, { status: 400 })
    }
    // 검증: 현재 PIN이 일치하는지 확인
    if (body.currentPin !== currentPin) {
      return HttpResponse.json({ success: false, message: 'current_pin_mismatch' }, { status: 403 })
    }
    // 변경 반영
    currentPin = String(body.newPin)
    return HttpResponse.json({ success: true, message: 'PIN 변경 완료', currentPin })
  }),

  http.post('/api/auth/pin/verify', async ({ request }) => {
    // PIN 확인용(예: 변경 1단계) - body: { pin }
    const body = (await request.json()) as any
    if (!body?.pin) return HttpResponse.json({ error: 'missing_pin' }, { status: 400 })
    const ok = body.pin === currentPin
    if (!ok) return HttpResponse.json({ success: false, valid: false }, { status: 403 })
    return HttpResponse.json({ success: true, valid: true })
  }),

  // 개발용: 현재 PIN을 조회할 수 있는 엔드포인트 (MSW 개발/테스트 전용)
  http.get('/__dev/pin', () => {
    return HttpResponse.json({ success: true, currentPin })
  }),

  // PIN 재설정(인증 코드 발급)
  http.post('/api/auth/pin/reset/request', async ({ request }) => {
    const body = (await request.json()) as any
    // body: { phone }
    if (!body?.phone) return HttpResponse.json({ error: 'missing_phone' }, { status: 400 })
    // mock: verificationId 반환
    return HttpResponse.json({ success: true, verificationId: `verif_${Date.now()}` })
  }),

  http.post('/api/auth/pin/reset/confirm', async ({ request }) => {
    const body = (await request.json()) as any
    // body: { verificationId, code, newPin }
    if (!body?.verificationId || !body?.code || !body?.newPin) return HttpResponse.json({ error: 'missing_fields' }, { status: 400 })
    // mock: 코드가 '000000'이면 성공
    if (body.code !== '000000') return HttpResponse.json({ success: false }, { status: 403 })
    return HttpResponse.json({ success: true, message: 'PIN 재설정 완료' })
  }),


]
