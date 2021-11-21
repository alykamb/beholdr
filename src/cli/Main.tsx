import { ChildProcess } from 'child_process'
import { render } from 'ink'
import React, { Fragment, useCallback, useEffect, useState } from 'react'

import { RunnerConfig } from '../models/runnerConfig.model'
import { ActionsView } from './components/ActionsView'
import { AppList } from './components/AppList'
import { LogViewer } from './components/LogViewer'
import { AppsContext } from './contexts/apps.context'

export const Main = (props: {
    apps: RunnerConfig[]
    run: (text: string, app: RunnerConfig) => ChildProcess
}) => {
    const [selected, setSelected] = useState<RunnerConfig>(props.apps?.[0] || null)
    const [actionsView, setActionsView] = useState<RunnerConfig>(null)
    const [processes, setProcesses] = useState<Record<string, ChildProcess>>({})

    useEffect(() => {
        return console.clear
    }, [])

    const run = useCallback(
        (text: string, app: RunnerConfig) => {
            const process = props.run(text, app)
            setProcesses((p) => ({ ...p, [app.id]: process }))
            setActionsView(null)
        },
        [setProcesses],
    )

    return (
        <AppsContext.Provider
            value={{ apps: props.apps, selected, setSelected, actionsView, setActionsView }}
        >
            {!actionsView ? (
                <Fragment>
                    <AppList />
                    <LogViewer processes={processes} />
                </Fragment>
            ) : (
                <ActionsView app={actionsView} run={run} />
            )}
        </AppsContext.Provider>
    )
}

export const renderOutput = (
    apps: RunnerConfig[],
    run: (text: string, app: RunnerConfig) => ChildProcess,
) => {
    render(<Main apps={apps} run={run} />)
}
