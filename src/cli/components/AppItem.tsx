import { Box, Text, useFocus, useInput } from 'ink'
import React, { useContext, useEffect } from 'react'

import { RunnerConfig } from '../../models/runnerConfig.model'
import { AppsContext } from '../contexts/apps.context'
import { colors } from '../theme/colors'

export const AppItem = (props: { app: RunnerConfig }) => {
    const { isFocused } = useFocus({ autoFocus: true, id: props.app.id })
    const { setActionsView, setSelected } = useContext(AppsContext)

    useInput((_input, key) => {
        if (key.return && isFocused) {
            setActionsView(props.app)
        }
    })

    useEffect(() => {
        if (isFocused) {
            setSelected(props.app)
        }
    }, [isFocused])

    return (
        <Box marginX={1} paddingX={1}>
            <Text
                backgroundColor={isFocused ? colors.primary : 'black'}
                color={isFocused ? '#fff' : colors.base}
            >
                {` ${props.app.name} ${props.app.id}`}
            </Text>
        </Box>
    )
}
