import { Box, Text, useInput } from 'ink'
import React from 'react'
import { useState } from 'react'

import { colors } from '../theme/colors'

export interface LogProps {
    messages: string[]
    appId: string
    height: number
}

const scrolls = new Map<string, { offset: number; follow: boolean }>()

export const Log = ({ messages, appId, height }: LogProps) => {
    const [followNew, setFollowNew] = useState<Record<string, boolean>>({
        [appId]: scrolls.get(appId)?.follow ?? true,
    })
    const numberOfLines = messages.length

    const [offset, setOffset] = useState<Record<string, number>>({
        [appId]: messages.length,
    })

    useInput((input, key) => {
        const value = +key.upArrow * -1 + +key.downArrow + +key.pageDown * 10 + +key.pageUp * +10
        setOffset((off) => {
            let o = off[appId] || numberOfLines
            if (followNew[appId] ?? true) {
                o = numberOfLines
            }

            let newOffset = o + value
            let follow = false
            if (newOffset >= numberOfLines) {
                follow = true
                newOffset = numberOfLines
            } else if (newOffset - height < 0) {
                newOffset = height
            }

            scrolls.set(appId, { offset: newOffset, follow })
            setFollowNew((f) => ({ ...f, [appId]: follow }))
            return { ...off, [appId]: newOffset }
        })
    })

    const result =
        followNew[appId] ?? true
            ? messages.slice(-height).join('\n')
            : messages
                  .slice(
                      -(height - (offset[appId] || numberOfLines)),
                      offset[appId] || numberOfLines,
                  )
                  .join('\n')

    return (
        <Box
            flexDirection="column"
            borderStyle="single"
            borderColor={colors.base}
            height={height + 2}
        >
            <Text>{result}</Text>
        </Box>
    )
}
