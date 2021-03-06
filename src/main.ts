#!/usr/bin/env node

import { CommandFactory } from 'nest-commander'

import { AppModule } from './app.module'

async function bootstrap() {
    await CommandFactory.run(AppModule)
}

void bootstrap().catch(console.error)
