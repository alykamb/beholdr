import { Box, Text, useInput } from 'ink'
import React, { useCallback, useContext, useMemo, useState } from 'react'

import { RunnerConfig } from '../../models/runnerConfig.model'
import { AppsContext } from '../contexts/apps.context'
import { useAppStatus } from '../hooks/useAppStatus.hook'
import { colors } from '../theme/colors'

interface ScriptsProps {
    scripts: Array<{
        script: string
        name: string
        hover: boolean
        selected: boolean
    }>
}

export const Scripts = ({ scripts }: ScriptsProps) => {
    return (
        <Box>
            {scripts.map((script, i) => (
                <Box key={i} marginX={1}>
                    <Text color={script.hover ? colors.primaryBright : colors.base}>
                        {`<${i + 1}>`}
                        {script.selected ? '▣ ' : '▢ '}
                        {script.name}
                    </Text>
                </Box>
            ))}
        </Box>
    )
}

interface AppScriptsProps {
    run: (text: string, app: RunnerConfig) => void
}

export const AppScripts = ({ run }: AppScriptsProps) => {
    const { apps, selected: app } = useContext(AppsContext)
    const status = useAppStatus(app)

    const initialValue = useMemo(
        () =>
            apps.reduce((acc, item) => {
                acc[item.id] = 0
                return acc
            }, {}),
        [],
    )

    const [selected, setSelected] = useState<Record<string, number>>(initialValue)
    const [hover, setHover] = useState<Record<string, number>>(initialValue)

    const scripts = app?.scripts
        ? Object.keys(app.scripts).map((key, i) => ({
              script: app.scripts[key],
              name: key,
              hover: hover[app.id] === i,
              selected: selected[app.id] === i,
          }))
        : []

    const changeHover = useCallback(
        (v: number, set = false) => {
            const newValue = (set ? v : hover[app.id] + v) % scripts.length
            setHover({ ...hover, [app.id]: newValue })
            return newValue
        },
        [app, hover],
    )
    const changeSelected = useCallback(
        (n = hover[app.id]) => {
            setSelected((h) => ({ ...h, [app.id]: n }))
        },
        [app, hover],
    )

    const inputs = useMemo(() => {
        return {
            '.': () => changeHover(1),
            '>': () => changeHover(1),
            ',': () => changeHover(-1),
            '<': () => changeHover(-1),
            ' ': () => changeSelected(),
        }
    }, [hover])

    useInput((input, key) => {
        if (status !== 'running') {
            if (key.return) {
                run(scripts[hover[app.id]].name, app)
            }

            if (inputs[input]) {
                return inputs[input]()
            }
            const n = parseInt(input)
            if (!isNaN(n)) {
                changeSelected(changeHover(n - 1, true))
            }
        } else {
            if (input === 'd') {
                app.stop$.next()
            } else if (input === 'r') {
                app.restart$.next()
            }
        }
    })

    return (
        <Box justifyContent="space-between">
            <Box>
                {status === 'running' ? (
                    <Text>Running on port {app.port}</Text>
                ) : (
                    <Box>
                        <Scripts scripts={scripts} />
                    </Box>
                )}
            </Box>
            <Box>
                {status !== 'running' ? (
                    <Text>
                        Use {'< or >'} to change script. {'<Enter>'} or numbers to run
                    </Text>
                ) : (
                    <Text>
                        Use {'<d>'} to stop. {'<r>'} to restart
                    </Text>
                )}
            </Box>
        </Box>
    )
}
