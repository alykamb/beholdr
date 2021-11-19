import { Injectable } from '@nestjs/common'

function* getPort(min = 8000) {
    let i = min
    while (true) yield ++i
}

@Injectable()
export class PortService {
    private ports = new Map<string, number>()
    private getNewPort!: Generator<number>

    constructor() {
        this.getNewPort = getPort()
    }

    public getPort(name: string) {
        let port = this.ports.get(name)

        if (!port) {
            port = this.getNewPort.next().value
            this.ports.set(name, port)
        }

        return port
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
