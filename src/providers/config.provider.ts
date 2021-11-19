import { FactoryProvider } from '@nestjs/common'

import { Config } from '../models/config.model'
import { ConfigService } from '../services/config.service'

export const CONFIG = Symbol()

export const configProvider: FactoryProvider<Promise<Config>> = {
    provide: CONFIG,
    useFactory: (config: ConfigService) => {
        return config.getConfig()
    },
    inject: [ConfigService],
}
