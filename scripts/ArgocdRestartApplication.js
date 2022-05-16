
//console.log(axios)

const appName = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE
if (!appName || appName === '-') {
  throw Error('App name should be specified.')
  process.exit()
}

const ArgocdHelpers = require("./ArgocdHelpers.js")

async function main () {
    const token = await ArgocdHelpers.getCookieToken()
    await ArgocdHelpers.restartResource(appName, token, 'app')
}

module.exports = main