import { Module } from '@nestjs/common'

import { ConfigClearCommand } from './commands/config.clear.command'
import { ConfigCommand } from './commands/config.command'
import { ConfigListCommand } from './commands/config.list.command'
import { RunCommand } from './commands/run.command'
import { StartCommand } from './commands/start.command'
import { axiosProvider } from './providers/axios.provider'
import { configProvider } from './providers/config.provider'
import { ConfigService } from './services/config.service'
import { PortService } from './services/port.service'
import { RunnerConfigService } from './services/runnerConfig.service'
import { StdinService } from './services/stdin.service'

@Module({
    imports: [],
    controllers: [],
    providers: [
        PortService,
        ConfigCommand,
        ConfigClearCommand,
        ConfigListCommand,
        StartCommand,
        RunCommand,
        StdinService,
        ConfigService,
        RunnerConfigService,
        configProvider,
        axiosProvider,
    ],
})
export class AppModule {}
