import { Command, CommandRunner } from 'nest-commander'

import { RunnerConfigService } from '../services/runnerConfig.service'

@Command({
    name: 'run',
    arguments: '[...scripts]',
})
export class RunCommand implements CommandRunner {
    constructor(private runnerConfigService: RunnerConfigService) {}
    public async run(inputs: string[]): Promise<void> {
        console.log(inputs)
        const apps = await this.runnerConfigService.resolveApps()
        console.log(apps)
    }
}
