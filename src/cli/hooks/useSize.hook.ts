import { useStdout } from 'ink'
import { useEffect, useState } from 'react'

export interface Size {
    width: number
    height: number
}

const getSize = (): Size => ({ width: process.stdout.columns, height: process.stdout.rows })

export const useSize = () => {
    const [size, setSize] = useState(getSize())
    const { stdout } = useStdout()

    useEffect(() => {
        const update = () => {
            setSize(getSize())
        }
        stdout.on('resize', update)

        return () => {
            stdout.off('resize', update)
        }
    }, [])

    return size
}
