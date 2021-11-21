import { createContext, Dispatch } from 'react'

import { RunnerConfig } from '../../models/runnerConfig.model'

export const AppsContext = createContext<{
    apps: RunnerConfig[]
    selected?: RunnerConfig
    setSelected?: Dispatch<React.SetStateAction<RunnerConfig>>
    actionsView?: RunnerConfig
    setActionsView?: Dispatch<React.SetStateAction<RunnerConfig>>
}>({ apps: [] })
