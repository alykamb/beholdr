import { FactoryProvider } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { Agent } from 'https'

import { Config } from '../models/config.model'
import { CONFIG } from './config.provider'
export const AXIOS = Symbol()

export const axiosProvider: FactoryProvider<AxiosInstance> = {
    provide: AXIOS,
    useFactory: (config: Config) =>
        axios.create({
            httpsAgent: new Agent({
                rejectUnauthorized: false,
            }),
            baseURL: `http://localhost:${config.port}`,
        }),
    inject: [CONFIG],
}
