
export const create = ({
    cpSpawn,
    monitor,
    onNewVersion,
    onCheck,
    moduleName, 
    delay = 15 * 60 * 1000
}) => {
    let proc
    const stop = () => {
        const prom = new Promise(r => proc.once('close', () => {
            proc = void 0
            r()
        }))
        proc.kill('SIGINT')
        return prom
    }
    const { unsubscribe: dispose } = onNewVersion(({ 
        moduleMeta: { moduleName, latest }
    }) => {
        const start = () => proc = cpSpawn('npx', [ `${moduleName}@${latest}` ], {
            stdio: [ 'ignore', 'inherit', 'inherit' ]
        })
        if (!proc) {
            start()
            return Promise.resolve()
        }
        return stop().then(start)
    })
    return monitor(moduleName, delay).then(interval => ({
        onCheck,
        dispose: () => stop().then(() => {
            dispose()
            clearInterval(interval)
        })
    }))
}
