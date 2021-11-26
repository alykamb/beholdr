import { Inject, Injectable } from '@nestjs/common'
import { AxiosInstance } from 'axios'
import { join } from 'path'
import { BehaviorSubject, Subject } from 'rxjs'

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

    public async loadConfig(root = '.'): Promise<RunnerConfig> {
        return (await this.configService.loadConfigFile<RunnerConfig>(root)).config
    }

    public async resolveApps(path = process.cwd(), app?: RunnerConfig): Promise<RunnerConfig[]> {
        if (!app) {
            app = await this.loadConfig()
        }
        const resolveApp = async (a: RunnerConfig) => {
            let port: number
            const ports = {}
            if (a.ports) {
                for (const key of Object.keys(a.ports)) {
                    const p = a.ports[key]
                    const value =
                        p.value || (await this.axios.get(`/ports/${p.id || a.id}-${key}`)).data

                    ports[key] = value

                    if (p.default) {
                        port = value
                    }
                }
            }

            a.port = port
            a.env = {
                ...ports,
                ...(a.env || {}),
            }

            if (a.envMappings) {
                a.env = this.mapEnvVars(a.env, a.envMappings)
            }

            delete a.ports

            a.stop$ = new Subject()
            a.restart$ = new Subject()
            a.status$ = new BehaviorSubject('idle')
            a.output$ = new BehaviorSubject([])
            return [a]
        }

        if (!app.apps) {
            return resolveApp(app)
        }

        const c = (...s: string[]) => (s || []).filter((i) => !!i).join(':')

        return Promise.all(
            app.apps.map(async (a) => {
                if (typeof a === 'string') {
                    const src = a
                    a = await this.loadConfig(a)
                    if (!a) {
                        return null
                    }
                    a.src = join(src, a.src)
                }

                const newApp = {
                    ...a,
                    ports: {
                        ...(app.ports || {}),
                        ...(a.ports || {}),
                    },
                    env: {
                        ...(app.env || {}),
                        ...(a.env || {}),
                    },
                    parent: app.id,
                    app: app.id || a.id,
                    id: c(app.id, a.id),
                    name: c(app.name, a.name),
                    src: join(app.src || '', a.src || ''),
                }

                if (a.apps) {
                    return this.resolveApps(join(path, newApp.src), newApp)
                }
                return resolveApp(newApp)
            }),
        ).then((apps) => apps.flat().filter((app) => !!app))
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
