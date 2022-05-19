
const ShellExec = require('./ShellExec.js')
const fs = require('fs')

function getRepoName (config) {
  const DEPLOY_GIT_URL = config.environment.build.deploy_git_url
  let REPO_NAME = DEPLOY_GIT_URL.slice(DEPLOY_GIT_URL.lastIndexOf('/') + 1)
  REPO_NAME = REPO_NAME.slice(0, REPO_NAME.lastIndexOf('.'))

  return REPO_NAME
}

async function setUserNameEmail(config) {
  const DEPLOY_GIT_URL = config.environment.build.deploy_git_url
  let {username, host} = new URL(DEPLOY_GIT_URL)

  await ShellExec(`git config --global user.email "${username}@${host}"`)
  await ShellExec(`git config --global user.name "${username}"`)
}

async function getTag(config) {
  let tag = process.env.CI_COMMIT_SHORT_SHA
  let prefix = getTagPrefix(config)
  if (prefix) {
    tag = prefix + '-' + tag
  }
}

async function setCustomDomain({customDomain, REPO, customDomainFilePath}) {

  let content = {}
  if (fs.existsSync(customDomainFilePath)) {
    content = fs.readFileSync(customDomainFilePath, 'utf8')
    if (content.trim() !== '') {
      content = JSON.parse(content.trim())
    }
  }
  
  if (content[customDomain]) {
    if (content[customDomain] !== REPO) {
      throw new Error('Custom domain is occupied. ' + customDomain + ': ' + content[customDomain])
    }
    else {
      // 一樣的名稱，就不做任何事情了
      return false
    }
  }
  
  // 刪除過去的資料
  let domains = Object.keys(content)
  for (let i = 0; i < domains.length; i++) {
    let domain = domains[i]
    if (content[domain] === REPO) {
      delete content[domain]
      break
    }
  }

  content[customDomain] = REPO
  fs.writeFileSync(customDomainFilePath, JSON.stringify(content), 'utf8')
  return true
}

async function main (config) {

  if (!config || !config.deploy || !config.deploy.custom_domain) {
    return false
  }

  let customDomain = config.deploy.custom_domain

  if (!customDomain) {
    customDomain = ''
  }


  // -----------------------

  let tmpGitPath = '/tmp/git-deploy-custom-domain'
  fs.mkdirSync(tmpGitPath, { recursive: true})
  process.chdir(tmpGitPath)

  const REPO = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE
  console.log("REPO: " + REPO)

  const DEPLOY_GIT_URL = config.environment.build.deploy_git_url
  await ShellExec(`git clone ${DEPLOY_GIT_URL}`)

  const REPO_NAME = getRepoName(config)

  process.chdir(path.join(tmpGitPath, REPO_NAME))

  await setUserNameEmail(config)
  let customDomainBranch = 'custom-domain'
  await ShellExec(`git checkout -b ${customDomainBranch} || git checkout ${customDomainBranch}`)

  // ----------------------------------------------------------------

  let customDomainFilePath = path.join(tmpGitPath, REPO_NAME, `/custom_domain.txt`)
  if (await setCustomDomain({customDomain, REPO, customDomainFilePath}) === false) {
    return false
  }

  // ----------------------------------------------------------------

  await ShellExec(`git add .`)
  await ShellExec(`git commit -m "CI TAG: ${getTag(config)}" --allow-empty`)
  await ShellExec(`git push -f ${DEPLOY_GIT_URL}`)
}

module.exports = main