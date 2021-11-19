import { Command, CommandRunner, Option } from 'nest-commander'

import { ConfigService } from '../services/config.service'
import { ConfigClearCommand } from './config.clear.command'
import { ConfigListCommand } from './config.list.command'

@Command({
    name: 'config',
    arguments: '[task]',
    subCommands: [ConfigClearCommand, ConfigListCommand],
})
export class ConfigCommand implements CommandRunner {
    constructor(private configService: ConfigService) {}
    public async run(_inputs: string[], options: Record<string, any>) {
        await this.configService.fromConfigFile(options.path)
    }

    @Option({
        flags: '-p, --path <path>',
        description: 'Config file path',
        required: false,
    })
    public parsePath(val: string) {
        return [val]
    }
}
