import * as chalk from 'chalk'
import fastify, { FastifyInstance, FastifyServerFactory } from 'fastify'
import { readFile } from 'fs/promises'
import * as http from 'http'
import * as httpProxy from 'http-proxy'
import * as https from 'https'
import { Command, CommandRunner } from 'nest-commander'
import { resolve } from 'path'

import { ConfigService } from '../services/config.service'
import { PortService } from '../services/port.service'

@Command({
    name: 'start',
    options: { isDefault: true },
})
export class StartCommand implements CommandRunner {
    private fastify: FastifyInstance
    private hosts = new Map<string, string>()

    constructor(private portService: PortService, private configService: ConfigService) {}

    public async run(): Promise<void> {
        const port = 4433
        const config = await this.configService.getConfig()
        let key: Buffer
        let cert: Buffer

        if (config.https) {
            ;[key, cert] = await Promise.all([
                readFile(resolve(__dirname, '..', config.privateKey)),
                readFile(resolve(__dirname, '..', config.certificate)),
            ])
        }

        const serverFactory: FastifyServerFactory = (handler) => {
            const proxy = httpProxy.createProxyServer({
                followRedirects: false,
                ws: true,
            })

            const requestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => {
                const target = this.hosts.get(req.headers.host)
                console.log(req)
                if (target) {
                    proxy.web(req, res, { target: `${target}${req.url}` })
                    return
                }
                if (this.hosts) handler(req, res)
            }

            if (config.https) {
                return https.createServer({ key, cert }, requestHandler)
            }

            return http.createServer(requestHandler)
        }

        this.fastify = fastify({ serverFactory, logger: true })

        this.fastify.get('/port/:name', (req, res) => {
            void res.status(200).send(this.portService.getPort((req.params as any).name))
        })

        this.fastify.post('/host', (req, res) => {
            const { target, host } = req.body as any
            this.hosts.set(host, target)
            void res.status(201).send()
        })

        this.fastify.delete('/host/:host', (req, res) => {
            const host = (req.params as any).host
            this.hosts.delete(host)
            void res.status(200).send()
        })

        this.fastify.get('/env', (_req, res) => {
            void res.status(200).send(config.defaultEnv)
        })

        await this.fastify.listen(port, '0.0.0.0')

        // console.clear()
        console.log(
            chalk.green(`Beholdr ${config.https ? 'secure' : ''} proxy started on port`),
            chalk.inverse(port),
        )
    }
}
