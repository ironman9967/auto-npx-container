
import { spawn as cpSpawn } from 'child_process'

import fetch from 'node-fetch'
import semvarCompare from 'semver-compare'
import { createSubject } from 'create-subject-with-filter'

import { create as createModuleMonitor } from './module-monitor'
import { create as createModuleLoader } from './module-loader'

createModuleLoader({ 
    ...createModuleMonitor({
        fetch,
        semvarCompare,
        createSubject
    }),
    cpSpawn,
    moduleName: process.env.AUTO_NPX_CONTAINER_MODULE_NAME || 'ledsrv-test-docker-app',
    delay: 15000 || process.env.AUTO_NPX_CONTAINER_DELAY || 15 * 60 * 1000,
    killSignal: 'SIGTERM' || process.env.AUTO_NPX_CONTAINER_KILL_SIGNAL || 'SIGINT',
    debug: 1 || process.env.AUTO_NPX_CONTAINER_DEBUG || 0
})
.then(({ debug, killSignal, onCheck, dispose }) => {
    let unsubOnCheck = () => {}
    // if (debug) {
    //     const { unsubscribe } = onCheck(moduleMeta => 
    //         console.log('version checked', { moduleMeta }))
    //     unsubOnCheck = unsubscribe
    // }
    process.once(killSignal, () => {
        unsubOnCheck()
        dispose().then(() => process.exit(0))
    })
})
