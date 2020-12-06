
export const create = ({
    fetch,
    semvarCompare,
    createSubject
}) => {
    const { next, filter } = createSubject()

    const monitorModule = next => {
        const moduleMeta = { moduleName: null, latest: '0.0.0' }
        return (moduleName, delay = 10 * 60 * 1000) => {
            moduleMeta.moduleName = moduleName
            const url = `https://registry.npmjs.org/${moduleName}`
            const getLatest = () => fetch(url)
                .then(res => res.json())
                .then(({ error, ...res }) => error
                    ? Promise.reject(new Error(`module ${moduleName} (${url}) - ${error}`))
                    : { moduleName, latest: res['dist-tags'].latest })
                .then(({ latest }) => {
                    const update = semvarCompare(latest, moduleMeta.latest) > 0
                    if (update) {
                        moduleMeta.latest = latest
                    }
                    next({ stamp: Date.now(), update, moduleMeta })
                })
                .catch(err => {
                    console.error('monitorModule Error', err)
                    throw err
                })
            return getLatest().then(() => setInterval(getLatest, delay))
        }
    }

    return {
        monitor: monitorModule(next),
        onNewVersion: filter(({ update }) => update).subscribe,
        onCheck: filter(({ update }) => !update).subscribe
    }
}
