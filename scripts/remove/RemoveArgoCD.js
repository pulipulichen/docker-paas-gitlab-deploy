const ArgocdHelpers = require('./../ArgocdHelpers')
const ShellSpawn = require('./../lib/ShellSpawn')
const LoadYAMLConfig = require('./../lib/LoadYAMLConfig')
const REPO = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE
const CheckRemoved = require('./CheckRemoved')

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
  
  const config = await LoadYAMLConfig()
  let url = config.environment.paas.paas_argocd
  url = url.replaceAll(`{{ PROJECT_NAME }}`, process.env.CI_PROJECT_NAME)
  .replaceAll(`{{ PROJECT_NAMESPACE }}`, process.env.CI_PROJECT_NAMESPACE)

  console.log(`Check result: ${url}`)
  // if ((await CheckRemoved(url)) === false) {
  //   throw new Error(`Remove ArgoCD failed`)
  // }
}

module.exports = RemoveArgoCD