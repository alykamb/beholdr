import { Box, Text, useFocus } from 'ink'
import React, { useContext, useEffect } from 'react'

import { RunnerConfig } from '../../models/runnerConfig.model'
import { AppsContext } from '../contexts/apps.context'
import { useAppStatus } from '../hooks/useAppStatus.hook'
import { colors } from '../theme/colors'

export const AppItem = (props: { app: RunnerConfig }) => {
    const { isFocused } = useFocus({ autoFocus: true, id: props.app.id })
    const { setSelected } = useContext(AppsContext)

    useEffect(() => {
        if (isFocused) {
            setSelected(props.app)
        }
    }, [isFocused, setSelected])

    const status = useAppStatus(props.app)
    const running = status === 'running'
    const error = status === 'error'

    let color = '#fff'
    if (error) {
        color = colors.danger
    } else if (running) {
        color = colors.success
    }

    return (
        <Box marginRight={2}>
            <Text backgroundColor={isFocused ? colors.primary : 'black'} color={color}>
                {props.app.id} {error ? '.err.' : ' '}
            </Text>
        </Box>
    )
}
