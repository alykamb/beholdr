import { BehaviorSubject, Subject } from 'rxjs'

import { App } from './app.model'

export class RunnerConfig extends App {
    public output$: BehaviorSubject<string[]>
    public stop$: Subject<void>
    public restart$: Subject<void>
    public status$: BehaviorSubject<'idle' | 'running' | 'error'>
    public apps?: Array<RunnerConfig | string>
}
