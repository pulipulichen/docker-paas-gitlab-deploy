const ArgocdHelpers = require('./../ArgocdHelpers')
const ShellSpawn = require('./../lib/ShellSpawn')
const LoadYAMLConfig = require('./../lib/LoadYAMLConfig')
const REPO = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE

async function RemoveArgoCD() {
  const token = await ArgocdHelpers.getCookieToken()
  if (await ArgocdHelpers.isAppExists(REPO, token) === false) {
    return false
  }
  
  try {
    console.log('================================')
    console.log('Remove ArgoCD project')
    console.log('================================') 

    await ArgocdHelpers.deleteApp(REPO, token)
  }
  catch (e) {
    console.error(e)
  }
  
}

module.exports = RemoveArgoCD