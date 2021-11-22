import { Box, useFocusManager, useInput } from 'ink'
import React, { useContext, useMemo } from 'react'

import { RunnerConfig } from '../../models/runnerConfig.model'
import { AppsContext } from '../contexts/apps.context'
import { useSize } from '../hooks/useSize.hook'
import { colors } from '../theme/colors'
import { AppItem } from './AppItem'

export const AppList = () => {
    const size = useSize()
    const { apps } = useContext(AppsContext)
    const { focusNext, focusPrevious } = useFocusManager()

    useInput((_input, key) => {
        if (key.leftArrow) {
            focusPrevious()
        }
        if (key.rightArrow) {
            focusNext()
        }
    })

    const appsGroups: RunnerConfig[][] = useMemo(
        () =>
            apps.reduce((groups, app) => {
                if (!groups.length) {
                    groups.push([])
                }

                const i = groups.length - 1
                let group = groups[i]
                const groupSize = group.reduce((acc, a) => acc + a.id.length + 4, 0)
                if (groupSize + app.id.length + 4 >= size.width) {
                    group = [app]
                    groups.push(group)
                } else {
                    group.push(app)
                }
                return groups
            }, []),
        [apps, size],
    )

    return (
        <Box width={size.width} flexDirection="column">
            <Box
                borderStyle="single"
                borderColor={colors.primary}
                height={6}
                flexDirection="column"
            >
                {appsGroups.map((a, i) => (
                    <Box key={i}>
                        {a.map((app) => (
                            <AppItem key={app.id} app={app} />
                        ))}
                    </Box>
                ))}
            </Box>
        </Box>
    )
}
