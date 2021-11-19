import { Module } from '@nestjs/common'

import { StartCommand } from './commands/start.command'
import { PortService } from './port.service'

@Module({
    imports: [],
    controllers: [],
    providers: [PortService, StartCommand],
})
export class AppModule {}
