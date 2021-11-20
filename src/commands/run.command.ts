import { Inject } from '@nestjs/common'
import { AxiosInstance } from 'axios'
import { spawn } from 'child_process'
import { Command, CommandRunner } from 'nest-commander'
import { resolve } from 'path'

import { Config } from '../models/config.model'
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
    public async run(inputs: string[]): Promise<void> {
        console.log(inputs)
        const apps = await this.runnerConfigService.resolveApps()
        console.log(apps)

        if (apps[0].subdomain) {
            await this.axios.post('/hosts', {
                target: 'localhost:3000',
                host: this.config.getUrl(false, apps[0].subdomain),
            })
        }
        spawn(apps[0].scripts['default'], {
            shell: true,
            cwd: resolve(process.cwd(), apps[0].src),
            stdio: 'inherit',
            env: {
                ...process.env,
                PORT: 3000,
            },
        } as any)
    }
}
