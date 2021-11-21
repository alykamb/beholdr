import { Inject } from '@nestjs/common'
import chalk from 'chalk'
import fastify, { FastifyInstance, FastifyServerFactory, RouteHandler } from 'fastify'
import { readFile } from 'fs/promises'
import http from 'http'
import httpProxy from 'http-proxy'
import https from 'https'
import { Command, CommandRunner } from 'nest-commander'
import { Socket } from 'net'
import { resolve } from 'path'

import { Config } from '../models/config.model'
import { CONFIG } from '../providers/config.provider'
import { PortService } from '../services/port.service'

@Command({
    name: 'start',
    options: { isDefault: true },
})
export class StartCommand implements CommandRunner {
    private fastify: FastifyInstance
    private hosts = new Map<string, string>()

    constructor(private portService: PortService, @Inject(CONFIG) private config: Config) {}

    public async run(): Promise<void> {
        const port = this.config.port

        const serverFactory = await this.serverFactory()
        this.fastify = fastify({ serverFactory, logger: this.config.logger })

        this.registerRoutes()

        await this.fastify.listen(port, '0.0.0.0')

        console.log(
            chalk.green(`Beholdr ${this.config.https ? 'secure' : ''} proxy started on port`),
            chalk.inverse(port),
        )
    }

    private registerHost: RouteHandler = (req, res) => {
        const { target, host } = req.body as any
        if (this.hosts.get(host)) {
            void res.send(403).send('target is already running')
            return
        }
        this.hosts.set(host, target)
        void res.status(201).send()
    }

    private deleteHost: RouteHandler = (req, res) => {
        const host = (req.params as any).host
        this.hosts.delete(host)
        void res.status(200).send()
    }

    private getEnv: RouteHandler = (req, res) => {
        void res.status(200).send(this.config.defaultEnv)
    }

    private getPort: RouteHandler = (req, res) => {
        void res.status(200).send(this.portService.getPort((req.params as any).name))
    }

    private listPorts: RouteHandler = (req, res) => {
        void res.status(200).send(this.portService.listPorts())
    }

    private getHosts: RouteHandler = (req, res) => {
        void res.status(200).send(JSON.stringify(Array.from(this.hosts.entries())))
    }

    private registerRoutes() {
        this.fastify.post('/hosts', this.registerHost)
        this.fastify.get('/env', this.getEnv)
        this.fastify.delete('/host/:host', this.deleteHost)
        this.fastify.get('/ports/:name', this.getPort)
        this.fastify.get('/ports', this.listPorts)
        this.fastify.get('/hosts', this.getHosts)
    }

    private async serverFactory(): Promise<FastifyServerFactory> {
        let key: Buffer
        let cert: Buffer

        if (this.config.https) {
            ;[key, cert] = await Promise.all([
                readFile(resolve(__dirname, '..', this.config.privateKey)),
                readFile(resolve(__dirname, '..', this.config.certificate)),
            ])
        }

        return (handler) => {
            const proxy = httpProxy.createProxyServer({
                followRedirects: false,
                ws: true,
            })

            proxy.on('error', (err, req, res) => {
                const target = this.hosts.get(req.headers.host)
                this.hosts.delete(req.headers.host)
                console.log(chalk.red(`Error reaching %s, closing the socket`), target)
                res.destroy(err)
            })

            proxy.on('close', () => {
                // view disconnected websocket connections
                console.log('Client disconnected')
            })

            const requestHandler = (req: http.IncomingMessage, res: http.ServerResponse) => {
                const target = this.hosts.get(req.headers.host)

                if (target) {
                    proxy.web(req, res, { target: `http://${target}` })
                    return
                }
                if (this.hosts) handler(req, res)
            }

            const proxyUpgradeHandler = (req: http.IncomingMessage, socket: Socket, head: any) => {
                const target = this.hosts.get(req.headers.host)

                if (target) {
                    console.log(chalk.blue('Upgrading proxy conection to websocket: %s'), target)
                    proxy.ws(req, socket, head, {
                        target: `ws://${target}`,
                    })
                }
            }

            let server: http.Server

            if (this.config.https) {
                server = https.createServer({ key, cert }, requestHandler)
            }

            server = http.createServer(requestHandler)
            server.on('upgrade', proxyUpgradeHandler)

            return server
        }
    }
}
