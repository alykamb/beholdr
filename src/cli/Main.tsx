import { Box, render, Text } from 'ink'
import React, { useCallback, useState } from 'react'

import { RunnerConfig } from '../models/runnerConfig.model'
import { AppList } from './components/AppList'
import { LogViewer } from './components/LogViewer'
import { AppScripts } from './components/Scripts'
import { AppsContext } from './contexts/apps.context'
import { useRetryTimer } from './hooks/useRetryTimer.hook'
import { useSize } from './hooks/useSize.hook'

export const Main = (props: {
    getApps: () => Promise<RunnerConfig[]>
    run: (text: string, app: RunnerConfig) => void
}) => {
    const [selected, setSelected] = useState<RunnerConfig>(null)
    const [actionsView, setActionsView] = useState<RunnerConfig>(null)

    const size = useSize()

    const { time, data: apps } = useRetryTimer<RunnerConfig[]>(
        () =>
            props
                .getApps()
                .then((apps) => {
                    setSelected(apps?.[0])
                    return apps
                })
                .catch((err) => {
                    throw err
                }),
        3000,
    )

    const run = useCallback((text: string, app: RunnerConfig) => {
        props.run(text, app)
    }, [])

    if (!apps) {
        return (
            <Box
                width={size.width}
                height={size.height}
                justifyContent="center"
                alignItems="center"
            >
                <Text>
                    It was not possible to reach the proxy server, trying again in{' '}
                    {((3000 - time) / 1000).toFixed(0)} seconds
                </Text>
            </Box>
        )
    }
    return (
        <AppsContext.Provider value={{ apps, selected, setSelected, actionsView, setActionsView }}>
            <AppList />
            <LogViewer />
            <AppScripts run={run} />
        </AppsContext.Provider>
    )
}

export const renderOutput = (
    getApps: () => Promise<RunnerConfig[]>,
    run: (text: string, app: RunnerConfig) => void,
) => {
    render(<Main getApps={getApps} run={run} />)
}
