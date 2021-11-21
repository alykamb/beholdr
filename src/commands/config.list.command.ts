import chalk from 'chalk'
import { CommandRunner, SubCommand } from 'nest-commander'

import { ConfigService } from '../services/config.service'

@SubCommand({ name: 'list' })
export class ConfigListCommand implements CommandRunner {
    constructor(private configService: ConfigService) {}
    public async run() {
        console.log(chalk.bgYellow('Current Configuration '))
        console.table(await this.configService.getConfig())
    }
}
