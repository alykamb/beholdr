import { Injectable } from '@nestjs/common'
import readline from 'readline'
import { Observable } from 'rxjs'

@Injectable()
export class StdinService {
    private keyStrokes$: Observable<readline.Key>

    public init(): Observable<readline.Key> {
        if (!this.keyStrokes$) {
            this.keyStrokes$ = new Observable<readline.Key>((observer) => {
                process.stdin.resume()
                readline.emitKeypressEvents(process.stdin)
                process.stdin.setRawMode(true)
                process.stdin.setEncoding('utf8')

                const handleKey = (char: string, key: readline.Key) => {
                    if (char === '\u0003') {
                        process.exit()
                    }

                    observer.next(key)
                }

                process.stdin.on('keypress', handleKey)

                return () => {
                    process.stdin.end()
                    process.stdin.off('keypress', handleKey)
                }
            })
        }
        return this.keyStrokes$
    }
}
