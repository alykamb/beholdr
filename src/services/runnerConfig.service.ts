import { Inject, Injectable } from '@nestjs/common'
import { AxiosInstance } from 'axios'
import { join } from 'path'

import { Config } from '../models/config.model'
import { RunnerConfig } from '../models/runnerConfig.model'
import { AXIOS } from '../providers/axios.provider'
import { CONFIG } from '../providers/config.provider'
import { ConfigService } from './config.service'

@Injectable()
export class RunnerConfigService {
    constructor(
        private configService: ConfigService,
        @Inject(AXIOS) private axios: AxiosInstance,
        @Inject(CONFIG) private config: Config,
    ) {}

    public async loadConfig(): Promise<RunnerConfig> {
        return (await this.configService.loadConfigFile<RunnerConfig>()).config
    }

    public async resolveApps(path = process.cwd(), app?: RunnerConfig): Promise<RunnerConfig[]> {
        if (!app) {
            app = await this.loadConfig()
        }
        const resolveApp = (a: RunnerConfig) => {
            return [a]
        }

        if (!app.apps) {
            return resolveApp(app)
        }

        let port: number
        const ports = {}
        if (app.ports) {
            for (const key of Object.keys(app.ports)) {
                const p = app.ports[key]
                const value = p.value || (await this.axios.get(`/ports/${app.id}-${key}`)).data

                ports[key] = value

                if (p.default) {
                    port = value
                }
            }
        }

        app.port = port
        app.env = {
            ...(await this.axios.get(`/env`)),
            ...ports,
            ...(app.env || {}),
        }

        if (app.envMappings) {
            app.env = this.mapEnvVars(app.env, app.envMappings)
        }

        delete app.ports

        const c = (...s: string[]) => s.filter((i) => !!i).join(':')

        return Promise.all(
            app.apps.map(async (a) => {
                const newApp = {
                    ...a,
                    env: {
                        ...(app.env || {}),
                        ...(a.env || {}),
                    },
                    parent: app.id,
                    port,
                    app: a.id,
                    id: c(app.id, a.id),
                    name: c(app.name, a.name),
                    src: join(path, app.src, a.src),
                }

                if (a.apps) {
                    return this.resolveApps(join(path, newApp.src), newApp)
                }
                return resolveApp(newApp)
            }),
        ).then((apps) => apps.flat())
    }

    public mapEnvVars(
        config: Record<string, string>,
        mappings: Record<string, string>,
    ): Record<string, string> {
        return Object.keys(config).reduce((acc, key) => {
            acc[key] = config[key]
            Object.keys(mappings).forEach((mapping) => {
                if (key === mappings[mapping]) {
                    acc[mapping] = config[key]
                }
            })
            return acc
        }, config)
    }
}
