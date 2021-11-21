import { Box, useFocusManager, useInput } from 'ink'
import React, { useContext } from 'react'

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
    // const selected
    return (
        <Box width={size.width} flexDirection="column">
            <Box borderStyle="single" borderColor={colors.primary}>
                {apps.map((app) => (
                    <AppItem key={app.id} app={app} />
                ))}
            </Box>
            <Box flexGrow={1}></Box>
        </Box>
    )
}
