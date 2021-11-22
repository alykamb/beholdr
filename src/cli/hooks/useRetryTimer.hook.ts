import { Reducer, useEffect, useReducer, useState } from 'react'

type Action = 'restart' | 'increment'
type State = {
    base: number
    delta: number
}

const newState = (): State => ({ base: Date.now(), delta: 0 })

const reducer: Reducer<State, Action> = (state, action) => {
    switch (action) {
        case 'increment':
            return { base: state.base, delta: Date.now() - state.base }
        case 'restart':
            return newState()
        default:
            throw new Error()
    }
}

export const useRetryTimer = <T = any>(callback: () => Promise<T>, timer = 3000) => {
    const [stop, setStop] = useState(false)
    const [data, setData] = useState<T | null>(null)
    const [state, dispatch] = useReducer(reducer, newState())

    useEffect(() => {
        if (stop) {
            return
        }

        const id = setTimeout(() => {
            if (state.delta <= timer) {
                dispatch('increment')
            } else {
                callback()
                    .then((res) => {
                        setStop(true)
                        setData(res)
                        dispatch('restart')
                    })
                    .catch(() => {
                        dispatch('restart')
                    })
            }
        }, 1000)
        return () => {
            clearTimeout(id)
        }
    }, [state.delta, stop, dispatch])

    useEffect(() => {
        callback()
            .then((res) => {
                setStop(true)
                setData(res)
                dispatch('restart')
            })
            .catch(() => {
                dispatch('restart')
            })
    }, [])

    return { time: state.delta, data }
}
