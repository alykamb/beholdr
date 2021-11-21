import { Inject } from '@nestjs/common'
import { AxiosInstance } from 'axios'
import { spawn } from 'child_process'
import { Command, CommandRunner } from 'nest-commander'
import { resolve } from 'path'
import readline from 'readline'
import { combineLatestWith, Observable, startWith } from 'rxjs'

import { renderOutput } from '../cli/Main'
import { Config } from '../models/config.model'
import { RunnerConfig } from '../models/runnerConfig.model'
import { AXIOS } from '../providers/axios.provider'
import { CONFIG } from '../providers/config.provider'
import { RunnerConfigService } from '../services/runnerConfig.service'
import { StdinService } from '../services/stdin.service'
@Command({
    name: 'run',
    arguments: '[...scripts]',
})
export class RunCommand implements CommandRunner {
    constructor(
        private runnerConfigService: RunnerConfigService,
        private stdinService: StdinService,
        @Inject(AXIOS) private axios: AxiosInstance,
        @Inject(CONFIG) private config: Config,
    ) {}

    public async run(inputs: string[]): Promise<void> {
        const mainApp = await this.runnerConfigService.loadConfig()
        const apps = await this.runnerConfigService.resolveApps(process.cwd(), mainApp)

        renderOutput(apps, (script: string, app: RunnerConfig) => {
            return spawn(app.scripts[script], {
                shell: true,
                cwd: resolve(process.cwd(), app.src),
                env: {
                    ...process.env,
                    PORT: 3000,
                },
            } as any)
        })
        // const box = (await import('boxen')).default
        // this.stdinService
        //     .init()
        //     .pipe(
        //         startWith(null),
        //         combineLatestWith(
        //             new Observable<{ x: number; y: number }>((observer) => {
        //                 const onResize = () => {
        //                     observer.next({
        //                         x: process.stdout.columns,
        //                         y: process.stdout.rows,
        //                     })
        //                 }

        //                 onResize()
        //                 process.stdout.on('resize', onResize)
        //                 return () => process.stdout.off('resize', onResize)
        //             }),
        //         ),
        //     )
        //     .subscribe(([key, size]) => this.draw(box, key, size))

        // if (apps[0].subdomain) {
        //     await this.axios.post('/hosts', {
        //         target: 'localhost:3000',
        //         host: this.config.getUrl(false, apps[0].subdomain),
        //     })
        // }
    }

    public draw(key: readline.Key, size: { x: number; y: number }) {
        console.clear()
        console.log(key, size)
        console
            .log
            // box('unicorns love rainbows', {
            //     title: 'magical',
            //     titleAlignment: 'center',
            //     width: size.x,
            //     borderStyle: 'round',
            // }),
            ()
    }
}
