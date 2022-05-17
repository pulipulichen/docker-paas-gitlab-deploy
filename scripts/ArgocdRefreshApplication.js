
//console.log(axios)

const appName = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE
if (!appName || appName === '-') {
  process.exit()
}

const ArgocdHelpers = require("./ArgocdHelpers.js")

const fs = require('fs')

async function main () {
    const token = await ArgocdHelpers.getCookieToken()
    if (await ArgocdHelpers.isAppExists(appName, token) === true) {

        await ArgocdHelpers.sleep(1000)
        await ArgocdHelpers.terminatedSync(appName, token)

        await ArgocdHelpers.sleep(1000)
        await ArgocdHelpers.refreshApp(appName, token)

        let status = await ArgocdHelpers.waitOperation(appName, token)
        if (status.operationState.phase === "Error") {
          console.log(status)
          await ArgocdHelpers.healthyCheck(status)
        }

        await ArgocdHelpers.sleep(1000)

        await ArgocdHelpers.syncApp(appName, token)

        await ArgocdHelpers.sleep(5000)

        // /builds/pudding/test20220428-2220
        await ArgocdHelpers.waitForImageSynced(appName, token)

        //await ArgocdHelpers.waitOperation(appName, token)
        //await ArgocdHelpers.syncApp(appName, token)

        //await argocdHelpers.sleep(3000)
        status = await ArgocdHelpers.waitOperation(appName, token)
        // console.log('=============================')
        // console.log(status)
        // console.log('=============================')
        // console.log(status.resources)
        // console.log('=============================')
        await ArgocdHelpers.healthyCheck(status)
    }
}

module.exports = main
