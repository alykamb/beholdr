import { RunnerPort } from './runnerPort.model'

export class App {
    public id?: string
    public src = './'
    public name?: string
    public subdomain?: string
    public port?: number
    public ports?: Record<string, RunnerPort>
    public scripts?: Record<string, string>
    public env?: Record<string, string>
    public envMappings?: Record<string, string>
    public dependencies?: Array<Record<string, { silent?: boolean; src: string }>>
}
