import { Inject, Injectable } from '@nestjs/common'

import { Config } from '../models/config.model'
import { CONFIG } from '../providers/config.provider'

function* getPort(min = 7880) {
    let i = min
    while (true) yield ++i
}

@Injectable()
export class PortService {
    private ports = new Map<string, number>()
    private getNewPort!: Generator<number>

    constructor(@Inject(CONFIG) private config: Config) {
        this.getNewPort = getPort(config.minPort)
    }

    public getPort(name: string) {
        const env = this.getPortEnv(name)
        let port = this.ports.get(env)

        if (!port) {
            port = this.getNewPort.next().value
            this.ports.set(env, port)
        }

        return port
    }

    public getPortEnv(name: string): `${Uppercase<typeof name>}_SERVICE_PORT` {
        return `${name.toUpperCase()}_SERVICE_PORT`
    }

    public listPorts(): Record<string, number> {
        return Array.from(this.ports.entries()).reduce((acc, p) => {
            acc[p[0]] = p[1]
            return acc
        }, {})
    }

    public resetPorts(): void {
        this.ports.clear()
        this.getNewPort = getPort()
    }
}
