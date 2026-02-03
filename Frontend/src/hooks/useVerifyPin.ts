import { authApi } from '@/src/api/auth'
import { API_ENDPOINTS } from '@/src/constants/api'
import { monitoringService } from '@/src/services/monitoringService'
import { useCallback, useState } from 'react'

type VerifyResult = { success: boolean; valid?: boolean; data?: any }

export function useVerifyPin() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verify = useCallback(async (pin: string): Promise<VerifyResult> => {
    if (!/^[0-9]{6}$/.test(pin)) {
      setError('PIN은 6자리 숫자여야 합니다.')
      return { success: false }
    }
    setLoading(true)
    setError(null)
    try {
      const res = await authApi.verifyPin({ pin })
      if (!res || !res.success) {
        setError('PIN이 일치하지 않습니다.')
        return { success: false }
      }
      return { success: true, valid: !!res.data?.valid, data: res.data }
    } catch (e) {
      setError('서버와 통신 중 오류가 발생했습니다.')
      monitoringService.logApiCall(`${API_ENDPOINTS.PIN_CHANGE}/verify`, 'POST', 'error', { errorMessage: (e as Error).message })
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  return { verify, loading, error, setError }
}
