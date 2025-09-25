import { SettingCard } from '@/components/SettingCard'
import { SettingRow } from '@/components/SettingRow'
import React, { useEffect, useState } from 'react'
import { View } from 'react-native'

type Connection = {
  accountId: string
  institution: string
  status: string
}

const MyDataSettings = () => {
  const [connections, setConnections] = useState<Connection[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/users/me/mydata/connections')
        if (!res.ok) return
        const json = await res.json()
        if (mounted) setConnections(json.data || [])
      } catch {
        // 무시
      }
    })()
    return () => { mounted = false }
  }, [])

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/users/me/mydata/connections', { method: 'POST', body: JSON.stringify({ institutionId: '새은행' }) })
      if (!res.ok) return
      const json = await res.json()
      setConnections((s) => [json.data, ...s])
    } catch {
      // ignore
    }
  }

  const handleRemove = async (accountId: string) => {
    try {
      const res = await fetch(`/api/users/me/mydata/connections/${accountId}`, { method: 'DELETE' })
      if (!res.ok) return
      setConnections((s) => s.filter(c => c.accountId !== accountId))
    } catch {
      // ignore
    }
  }

  return (
    <View>
      <SettingCard>
        <SettingRow title="연결 금융사 관리" subtitle="연결된 금융사를 관리합니다" onPress={handleAdd} />
        {connections.map((c) => (
          <SettingRow key={c.accountId} title={c.institution} subtitle={c.status} onPress={() => handleRemove(c.accountId)} />
        ))}
      </SettingCard>
    </View>
  )
}

export default MyDataSettings
