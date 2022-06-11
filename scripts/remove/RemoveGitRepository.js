const ShellExec = require('../lib/ShellExec')
const LoadYAMLConfig = require('../lib/LoadYAMLConfig')
const REPO = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE

async function RemoveDokcerImage() {
  let config = await LoadYAMLConfig()
  const DEPLOY_GIT_URL = config.environment.build.deploy_git_url
  const APP_GIT_URL = config.environment.build.app_git_url
  try {
    // https://www.educative.io/edpresso/how-to-delete-remote-branches-in-git
    // git push origin --delete test
    await ShellExec(`git push ${DEPLOY_GIT_URL} --delete ${REPO}`, {retry: 3})
    await ShellExec(`git push ${APP_GIT_URL} --delete ${REPO}`, {retry: 3})
  }
  catch (e) {
    console.error(e)
  }
}

module.exports = RemoveDokcerImage