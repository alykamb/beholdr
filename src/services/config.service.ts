import { Injectable } from '@nestjs/common'
import * as chalk from 'chalk'
import { cp, readFile, rm, writeFile } from 'fs/promises'
import { defaultsDeep } from 'lodash'
import { basename, resolve } from 'path'

import { Config } from '../models/config.model'

const CONFIG_FILE = '__beholdr__'

@Injectable()
export class ConfigService {
    public async loadConfigFile<T = any>(
        paths: string[] = ['.beholdrrc', '.beholdrrc.js', 'beholder.json'],
    ): Promise<{ config: T; path: string }> {
        let config: T
        let path: string
        for (path of paths) {
            try {
                if (path.endsWith('.js')) {
                    // eslint-disable-next-line @typescript-eslint/no-var-requires
                    config = require(resolve(process.cwd(), path))
                    break
                } else {
                    const contents = await readFile(resolve(process.cwd(), path))
                    config = JSON.parse(contents.toString())
                    break
                }
            } catch (err) {}
        }

        return { config, path }
    }

    public async fromConfigFile(paths?: string[]) {
        const { config, path } = await this.loadConfigFile<Config>(paths)

        if (!config) {
            console.log(chalk.red(`No configuration file found in ${path}`))
            return
        }

        if (config.certificate && config.privateKey) {
            await this.copyFiles(config.certificate, config.privateKey)
            config.certificate = basename(config.certificate)
            config.privateKey = basename(config.privateKey)
        }
        await this.writeConfigFile(defaultsDeep(config, await this.getConfig()))
        console.log(chalk.green(`Beholdr configuration successfully loaded from ${path}`))
    }

    public writeConfigFile(config: Config) {
        return writeFile(resolve(__dirname, '..', CONFIG_FILE), JSON.stringify(config))
    }

    public async copyFiles(...files: string[]): Promise<void> {
        await Promise.all(
            files.map((file) =>
                cp(resolve(process.cwd(), file), resolve(__dirname, '..', basename(file))),
            ),
        )
    }

    public async readConfigFile(): Promise<Config> {
        const contents = await readFile(resolve(__dirname, '..', CONFIG_FILE))
        return JSON.parse(contents.toString())
    }

    public async removeConfigFile(): Promise<void> {
        try {
            const config = await this.readConfigFile()
            const removals = [rm(resolve(__dirname, '..', CONFIG_FILE))]
            if (config.certificate) {
                removals.push(rm(resolve(__dirname, '..', config.certificate)))
            }
            if (config.privateKey) {
                removals.push(rm(resolve(__dirname, '..', config.privateKey)))
            }
            await Promise.all(removals)
        } catch (err) {}
    }

    public async getConfig() {
        try {
            return new Config(await this.readConfigFile())
        } catch (err) {
            return new Config()
        }
    }
}
