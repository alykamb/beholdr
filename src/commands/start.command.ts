import * as chalk from 'chalk'
import fastify, { FastifyInstance, FastifyServerFactory } from 'fastify'
import * as http from 'http'
import * as httpProxy from 'http-proxy'
import { Command, CommandRunner } from 'nest-commander'

import { PortService } from '../port.service'

@Command({
    name: 'start',
    options: { isDefault: true },
})
export class StartCommand implements CommandRunner {
    private fastify: FastifyInstance
    private hosts = new Map<string, string>()

    constructor(private portService: PortService) {}

    public async run(): Promise<void> {
        const port = 4433
        const serverFactory: FastifyServerFactory = (handler) => {
            const proxy = httpProxy.createProxyServer({
                followRedirects: false,
                ws: true,
            })

            const server = http.createServer((req, res) => {
                const target = this.hosts.get(req.headers.host)
                if (target) {
                    proxy.web(req, res, { target: `${target}${req.url}` })
                    return
                }
                if (this.hosts) handler(req, res)
            })

            return server
        }

        this.fastify = fastify({ serverFactory })

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

        await this.fastify.listen(port)
        console.clear()
        console.log(chalk.green('Beholdr proxy started on port'), chalk.inverse(port))
    }
}
