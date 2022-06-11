const ShellExec = require('../lib/ShellExec')
const LoadYAMLConfig = require('../lib/LoadYAMLConfig')
const REPO = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE

async function removeBranch(git_url) {
  try {
    // https://www.educative.io/edpresso/how-to-delete-remote-branches-in-git
    // git push origin --delete test
    await ShellExec(`git push ${git_url} --delete ${REPO} || echo 'delete ${REPO} failed'`)
  }
  catch (e) {
    console.error(e)
  }

  let u = new URL(git_url)

  let {pathname} = u
  pathname = pathname.slice(0, pathname.lastIndexOf('.')) + `/-/tree/${REPO}`

  let url = u.protocol + '//' + u.host + u.port + pathname

  console.log(`Check result: ${url}`)
  if ((await CheckRemoved(url)) === false) {
    throw new Error(`Remove Git failed`)
  }
}

async function RemoveDokcerImage() {
  let config = await LoadYAMLConfig()
  const DEPLOY_GIT_URL = config.environment.build.deploy_git_url
  const APP_GIT_URL = config.environment.build.app_git_url

  console.log('================================')
  console.log('Remove related Git Repositories')
  console.log('================================')

  await removeBranch(APP_GIT_URL)
  await removeBranch(DEPLOY_GIT_URL)
}

module.exports = RemoveDokcerImage