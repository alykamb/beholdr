import { FactoryProvider } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { Agent } from 'https'
export const AXIOS = Symbol()

export const axiosProvider: FactoryProvider<AxiosInstance> = {
    provide: AXIOS,
    useFactory: () =>
        axios.create({
            httpsAgent: new Agent({
                rejectUnauthorized: false,
            }),
        }),
}
