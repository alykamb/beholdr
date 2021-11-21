import { ChildProcess } from 'child_process'
import { Box, Text, useInput } from 'ink'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import kill from 'tree-kill'

import { AppsContext } from '../contexts/apps.context'
import { useSize } from '../hooks/useSize.hook'
import { colors } from '../theme/colors'

export const LogViewer = (props: { processes: Record<string, ChildProcess> }) => {
    const { selected } = useContext(AppsContext)
    const [output, setOutput] = useState<Record<string, string[]>>({})
    const [followNew, setFollowNew] = useState(true)

    const scripts = Object.keys(selected.scripts).map((key) => [key, selected.scripts[key]])
    const lines = output[selected.id] || []
    const numberOfLines = lines.length

    const [offset, setOffset] = useState(lines.length)

    const streaming = useRef(new WeakMap())
    const size = useSize()
    const height = size.height - 7

    const stop = useCallback(() => {
        const pid = props.processes[selected.id]?.pid

        if (pid) {
            kill(pid)
        }
    }, [selected, props.processes])

    useInput((input, key) => {
        if (input === 's') {
            stop()
            return
        }

        const value = +key.upArrow * -1 + +key.downArrow + +key.pageDown * -10 + +key.pageUp * 10
        setOffset((o) => {
            const newOffset = o + value

            if (newOffset > numberOfLines) {
                setFollowNew(true)
                return numberOfLines
            }

            if (newOffset - height < 0) {
                return height
            }

            setFollowNew(false)
            return newOffset
        })
    })

    useEffect(() => {
        for (const key of Object.keys(props.processes)) {
            const p = props.processes[key]
            if (!streaming.current.has(p)) {
                const pushMessage = (chunk: Buffer) => {
                    const message = chunk.toString()
                    setOutput((value) => {
                        const newValue = (value?.[key] || []).concat(
                            ...message
                                .replace(/(\r\n|\n|\r)/gm, '\n')
                                .split('\n')
                                .filter((str) => !!str),
                        )
                        return {
                            ...value,
                            [key]: newValue,
                        }
                    })
                }

                streaming.current.set(p, pushMessage)

                p.stdout.on('data', pushMessage)
                p.stderr.on('data', pushMessage)

                p.once('exit', (code) => {
                    if (code > 0) {
                        //
                    }
                    p.stdout.off('data', pushMessage)
                    p.stderr.off('data', pushMessage)
                })
            }
        }

        return () => {
            for (const key of Object.keys(props.processes)) {
                const p = props.processes[key]
                p.stdout.off('data', streaming.current.get(p))
                p.stderr.off('data', streaming.current.get(p))
            }
        }
    }, [props.processes, setOutput])

    const result = followNew
        ? lines.slice(-height).join('\n')
        : lines.slice(-(height - offset), offset).join('\n')

    return (
        <Box flexDirection="column">
            <Box
                flexDirection="column"
                borderStyle="single"
                borderColor={colors.base}
                height={height + 2}
            >
                <Text>{result}</Text>
            </Box>
            <Box justifyContent="space-between">
                <Box>
                    {scripts.map((script, i) => (
                        <Text key={i}>
                            {`<${i}>`}
                            {script[0]}
                        </Text>
                    ))}
                </Box>
                <Text>
                    {followNew ? numberOfLines - height : -(height - offset)}-
                    {followNew ? numberOfLines : offset}/{numberOfLines}
                </Text>
            </Box>
        </Box>
    )
}
