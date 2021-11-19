import * as chalk from 'chalk'
import { CommandRunner, SubCommand } from 'nest-commander'

import { ConfigService } from '../services/config.service'

@SubCommand({ name: 'clear' })
export class ConfigClearCommand implements CommandRunner {
    constructor(private configService: ConfigService) {}
    public async run() {
        await this.configService.removeConfigFile()
        console.log(chalk.green('Configuration file succesfully removed'))
    }
}
