export class Config {
    public port = 7878
    public wsPort = 7879
    public minPort = 7880
    public host = 'localhost'
    public https = false
    public privateKey?: string
    public certificate?: string
    public defaultEnv = {}
}
