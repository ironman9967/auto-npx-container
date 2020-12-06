
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
    delay: process.env.AUTO_NPX_CONTAINER_DELAY || 15 * 60 * 1000,
    debug: process.env.AUTO_NPX_CONTAINER_DEBUG || 0
})
.then(({ debug, onCheck, dispose }) => {
    let unsubOnCheck = () => {}
    if (debug) {
        const { unsubscribe } = onCheck(moduleMeta => 
            console.log('version checked', { moduleMeta }))
        unsubOnCheck = unsubscribe
    }
    process.once('SIGINT', () => {
        unsubOnCheck()
        dispose().then(() => process.exit(0))
    })
})
    
