import { Box, useInput } from 'ink'
import React, { useContext, useEffect, useState } from 'react'

import { AppsContext } from '../contexts/apps.context'
import { useSize } from '../hooks/useSize.hook'
import { Log } from './Log'

export const LogViewer = () => {
    const { selected } = useContext(AppsContext)
    const [output, setOutput] = useState<Record<string, string[]>>({})

    const lines = output[selected.id] || []

    const size = useSize()
    const height = size.height - 10

    useEffect(() => {
        const sub = selected.output$.subscribe((o) =>
            setOutput((o2) => ({ ...o2, [selected.id]: o })),
        )

        return () => sub.unsubscribe()
    }, [selected])

    return (
        <Box flexDirection="column">
            <Log messages={lines} appId={selected.id} height={height} />
        </Box>
    )
}
