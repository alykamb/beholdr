import { defaultsDeep } from 'lodash'

export class Config {
    public port = 7878
    public ws? = {
        port: 7879,
        host: 'beholdr.stuns.org',
    }
    public minPort = 7880
    public host = 'localhost'
    public https = false
    public logger = false
    public privateKey?: string
    public certificate?: string
    public defaultEnv = {}

    public get url(): string {
        return this.getUrl(true)
    }

    public getUrl(protocol = false, subdomain?: string) {
        let p = `:${this.port}`
        if ((!this.https && this.port === 80) || (this.https && this.port === 443)) {
            p = ''
        }
        const s = subdomain ? `${subdomain}.` : ''
        const prtl = protocol ? `${this.https ? 'https' : 'http'}://` : ''
        return `${prtl}${s}${this.host}${p}`
    }

    constructor(arg?: Partial<Config>) {
        defaultsDeep(this, arg)
    }
}
