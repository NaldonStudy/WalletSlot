import { SettingCard } from '@/components/SettingCard'
import { SettingRow } from '@/components/SettingRow'
import { mydataApi } from '@/src/api/mydata'
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
          const list = await mydataApi.getConnections()
          if (mounted) setConnections(list as Connection[])
        } catch {
          // ignore
        }
      })()
    return () => { mounted = false }
  }, [])

  const handleAdd = async () => {
    try {
      const added = await mydataApi.addConnection({ institutionId: '새은행' })
      if (added) setConnections((s) => [added as Connection, ...s])
    } catch {
      // ignore
    }
  }

  const handleRemove = async (accountId: string) => {
    try {
      const ok = await mydataApi.deleteConnection(accountId)
      if (ok) setConnections((s) => s.filter(c => c.accountId !== accountId))
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
