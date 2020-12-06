
export const create = ({
    cpSpawn,
    monitor,
    onNewVersion,
    onCheck,
    moduleName, 
    delay = 15 * 60 * 1000,
    debug = 0
}) => {
    let proc
    const log = (...args) => debug
        ? console.log.apply(null, args)
        : void 0
    log('version check interval', delay)
    const stop = () => {
        const prom = new Promise(r => proc.once('close', () => {
            log('module closed')
            proc = void 0
            r()
        }))
        log('stopping - sending SIGINT to module')
        proc.kill('SIGINT')
        return prom
    }
    const { unsubscribe: dispose } = onNewVersion(({ 
        moduleMeta: { moduleName, latest }
    }) => {
        log('new version', { moduleName, latest })
        const start = () => {
            log('spawning module')
            proc = cpSpawn('npx', [ `${moduleName}@${latest}` ], {
                stdio: [ 'ignore', 'inherit', 'inherit' ]
            })
            return Promise.resolve()
        }
        if (!proc) {
            log('first run')
            return start()
        }
        return stop().then(start)
    })
    return monitor(moduleName, delay).then(interval => ({
        debug: debug == 1,
        onCheck,
        dispose: () => {
            log('disposing...')
            return stop().then(() => {
                log('disposed')
                dispose()
                clearInterval(interval)
            })
        }
    }))
}
