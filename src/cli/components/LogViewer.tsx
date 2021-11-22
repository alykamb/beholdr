import { Box } from 'ink'
import React, { useContext, useEffect, useMemo, useState } from 'react'

import { AppsContext } from '../contexts/apps.context'
import { useSize } from '../hooks/useSize.hook'
import { Log } from './Log'

export const LogViewer = () => {
    const { selected } = useContext(AppsContext)
    const [output, setOutput] = useState<Record<string, string[]>>({})
    const size = useSize()

    const lines = useMemo(
        () =>
            (output[selected.id] || [])
                .map((message) => {
                    const m = message.replace(/\u001Bc*\[*[0-9]*[HABCDEFGJKsu];*[0-9]*/gi, '')
                    if (m.length > size.width - 3) {
                        return m.match(new RegExp(`.{1,${size.width - 3}}`, 'g')) || []
                    }
                    return [m]
                })
                .flat(),
        [output, selected, size],
    )

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
