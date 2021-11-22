import { Inject } from '@nestjs/common'
import { AxiosInstance } from 'axios'
import { spawn } from 'child_process'
import { Command, CommandRunner } from 'nest-commander'
import { resolve } from 'path'
import { take } from 'rxjs'
import { io, Socket } from 'socket.io-client'
import kill from 'tree-kill'

import { renderOutput } from '../cli/Main'
import { Config } from '../models/config.model'
import { RunnerConfig } from '../models/runnerConfig.model'
import { AXIOS } from '../providers/axios.provider'
import { CONFIG } from '../providers/config.provider'
import { RunnerConfigService } from '../services/runnerConfig.service'

@Command({
    name: 'run',
    arguments: '[...scripts]',
})
export class RunCommand implements CommandRunner {
    constructor(
        private runnerConfigService: RunnerConfigService,
        @Inject(AXIOS) private axios: AxiosInstance,
        @Inject(CONFIG) private config: Config,
    ) {}

    public async run(): Promise<void> {
        let socket: Socket
        if (this.config.ws) {
            try {
                socket = io(`http://${this.config.ws.host}:${this.config.ws.port}`)

                socket = await new Promise<Socket>((resolve) => {
                    socket.on('connect', () => resolve(socket))
                    socket.on('connect_error', () => resolve(null))
                })
            } catch (e) {}
        }

        const runApp = (script: string, app: RunnerConfig): void => {
            app.output$.next([])
            app.status$.next('running')

            if (socket) {
                socket.emit('app:running', {
                    subdomain: app.subdomain,
                    target: `localhost:${app.port}`,
                })
            }

            const p = spawn(app.scripts[script], {
                shell: true,
                cwd: resolve(process.cwd(), app.src),
                stdio: ['ignore', 'pipe', 'pipe'],
                env: {
                    ...process.env,
                    ...app.env,
                },
            } as any)

            let output = []

            const pushMessage = (chunk: Buffer) => {
                const message = chunk.toString()
                output = [
                    ...output,
                    ...message
                        .replace(/(\r\n|\n|\r)/gm, '\n')
                        .split('\n')
                        .filter((str) => !!str),
                ]

                app.output$.next(output)
            }

            p.stdout.on('data', pushMessage)
            p.stderr.on('data', pushMessage)

            let closed = false
            let restart = false

            p.once('exit', (code) => {
                p.stdout.off('data', pushMessage)
                p.stderr.off('data', pushMessage)
                app.status$.next(code && !closed ? 'error' : 'idle')

                if (code && !closed) {
                    if (socket) {
                        socket.emit('app:error', {
                            subdomain: app.subdomain,
                            error: app.output$.value?.[app.output$.value?.length - 1],
                        })
                    }
                    app.status$.next('error')
                } else {
                    if (socket) {
                        socket.emit('app:exit', {
                            subdomain: app.subdomain,
                        })
                    }
                    app.status$.next('idle')
                }
                if (restart) {
                    setTimeout(() => runApp(script, app), 200)
                }
            })

            app.stop$.pipe(take(1)).subscribe(() => {
                closed = true
                if (p?.pid) {
                    kill(p.pid)
                }
            })

            app.restart$.pipe(take(1)).subscribe(() => {
                restart = true
                app.stop$.next()
            })
        }

        renderOutput(() => this.runnerConfigService.resolveApps(), runApp)
    }
}
