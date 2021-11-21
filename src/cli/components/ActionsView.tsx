import { Box, Text, useFocus, useFocusManager, useInput } from 'ink'
import React, { useContext } from 'react'

import { RunnerConfig } from '../../models/runnerConfig.model'
import { AppsContext } from '../contexts/apps.context'
import { colors } from '../theme/colors'

export const ActionItem = (props: { text: string; run: (text: string) => void }) => {
    const { isFocused } = useFocus({ autoFocus: true, id: props.text })
    const { setActionsView } = useContext(AppsContext)
    useInput((_input, key) => {
        if (key.return) {
            props.run(props.text)
        }
        if (key.escape) {
            setActionsView(null)
        }
    })

    return (
        <Box>
            <Text inverse={isFocused} color={isFocused ? colors.primary : colors.base}>
                {props.text}
            </Text>
        </Box>
    )
}

export const ActionsView = (props: {
    app: RunnerConfig
    run: (text: string, app: RunnerConfig) => void
}) => {
    const { focusNext, focusPrevious } = useFocusManager()

    useInput((_input, key) => {
        if (key.upArrow) {
            focusPrevious()
        }
        if (key.downArrow) {
            focusNext()
        }
    })
    return (
        <Box borderColor="#23cdde" flexDirection="column">
            <Text>
                {props.app.name}({props.app.id})
            </Text>
            {Object.keys(props.app.scripts).map((key) => (
                <ActionItem key={key} text={key} run={(text) => props.run(text, props.app)} />
            ))}
        </Box>
    )
}
