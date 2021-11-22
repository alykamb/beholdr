import { useEffect, useState } from 'react'

import { RunnerConfig } from '../../models/runnerConfig.model'

export const useAppStatus = (app: RunnerConfig) => {
    const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle')

    useEffect(() => {
        const sub = app.status$.subscribe((status) => {
            setStatus(status)
        })

        return () => sub.unsubscribe()
    }, [app])

    return status
}
