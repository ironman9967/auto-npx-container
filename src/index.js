
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
    moduleName: process.env.NPX_APP_MODULE_NAME || 'ledsrv-test-docker-app',
    delay: process.env.NPX_APP_DELAY || 15 * 60 * 1000
})
.then(({ dispose }) => 
    process.once('SIGINT', () => dispose().then(() => process.exit(0))))
