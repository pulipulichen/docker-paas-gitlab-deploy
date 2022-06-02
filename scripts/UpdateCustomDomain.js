
const ShellExec = require('./lib/ShellExec.js')
const fs = require('fs')
const path = require('path')
const sleep = require('./lib/sleep.js')

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

function getTagPrefix(config) {
  let prefix = config.deploy.docker_image_tag_prefix

  if (!prefix) {
    return
  }

  prefix = prefix.toLowerCase()
  prefix = prefix.replace(/[^a-zA-Z0-9\-]/g, "")

  return prefix
}

async function getTag(config) {
  let tag = process.env.CI_COMMIT_SHORT_SHA
  let prefix = getTagPrefix(config)
  if (prefix) {
    tag = prefix + '-' + tag
  }
  return tag
}

async function setCustomDomain({customDomain, REPO, customDomainFilePath}) {

  let content = {}
  if (fs.existsSync(customDomainFilePath)) {
    content = fs.readFileSync(customDomainFilePath, 'utf8')
    if (content.trim() !== '') {
      content = JSON.parse(content.trim())
    }
  }
  
  if (customDomain && customDomain !== '' && content[customDomain]) {
    if (content[customDomain] !== REPO) {
      throw new Error('Custom domain is occupied. ' + customDomain + ': ' + content[customDomain])
    }
    else {
      // 一樣的名稱，就不做任何事情了
      return false
    }
  }
  
  // 刪除過去的資料
  let changed = false
  let domains = Object.keys(content)
  for (let i = 0; i < domains.length; i++) {
    let domain = domains[i]
    if (domain !== customDomain && content[domain] === REPO) {
      console.log('delete ' + content[domain])
      delete content[domain]
      changed = true
      break
    }
  }

  if (customDomain && customDomain !== '') {
    content[customDomain] = REPO
    changed = true
  }
  
  // console.log({content})
  if (changed) {
    fs.writeFileSync(customDomainFilePath, JSON.stringify(content, null, 2), 'utf8')
  }
  
  return changed
}

async function main (config, retry = 0) {
  // return true

  if (!config || !config.deploy) {
    return false
  }

  console.log(`
============================================================
UPDATE CUSTOM DOMAIN
============================================================
`)

  // -----------------------

  let tmpGitPath = '/tmp/git-deploy-custom-domain'
  fs.mkdirSync(tmpGitPath, { recursive: true})
  process.chdir(tmpGitPath)

  const REPO = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE
  console.log("REPO: " + REPO)

  const DEPLOY_GIT_URL = config.environment.build.deploy_git_url

  let customDomainBranch = 'custom-domain'
  await ShellExec(`git clone  --branch ${customDomainBranch} ${DEPLOY_GIT_URL}`, {retry: 10})

  const REPO_NAME = getRepoName(config)

  process.chdir(path.join(tmpGitPath, REPO_NAME))

  await setUserNameEmail(config)
  await ShellExec(`git checkout -b ${customDomainBranch} || git checkout ${customDomainBranch}`)

  // ----------------------------------------------------------------

  let customDomainFilePath = path.join(tmpGitPath, REPO_NAME, `/custom_domain.txt`)

  if (fs.existsSync(customDomainFilePath)) {
    await ShellExec(`mv ${customDomainFilePath} ${tmpGitPath}`)
    await ShellExec(`rm -rf ${path.join(tmpGitPath, REPO_NAME)}/*`)
    await ShellExec(`mv ${path.join(tmpGitPath, `/custom_domain.txt`)} ${path.join(tmpGitPath, REPO_NAME)}`)
  }
  else {
    await ShellExec(`rm -rf ${path.join(tmpGitPath, REPO_NAME)}/*`)
  }

  await ShellExec(`ls ${path.join(tmpGitPath, REPO_NAME)}`)

  // ----------------------------------------------------------------
  let customDomain = config.deploy.custom_domain
  let domain_suffix = config.environment.project.domain_suffix

  if (typeof(domain_suffix) === 'string') {
    if (!customDomain) {
      customDomain = ''
    }
    else {
      customDomain = customDomain + '.' + config.environment.project.domain_suffix
    }

    if (await setCustomDomain({customDomain, REPO, customDomainFilePath}) === false) {
      console.log('custom domain not changed.', customDomain)
      return false
    }
  }
  else if (Array.isArray(domain_suffix)) {
    let changed = false
    for (let i = 0; i < domains_suffix.length; i++) {
      let domain = domains_suffix[i]

      let eachCustomDomain = customDomain
      if (!eachCustomDomain) {
        eachCustomDomain = ''
      }
      else {
        eachCustomDomain = eachCustomDomain + '.' + domain
      }
  
      if (await setCustomDomain({eachCustomDomain, REPO, customDomainFilePath}) === false) {
        console.log('custom domain not changed.', eachCustomDomain)
        // return false
      }
      else {
        changed = true
      }
    }

    if (changed === false) {
      return false
    }
  }

  // ----------------------------------------------------------------

  // await ShellExec(`git add .`)
  // await ShellExec(`git commit -m "CI TAG: ${await getTag(config)}" --allow-empty`)
  // await ShellExec(`git push -f ${DEPLOY_GIT_URL}`)
  try {
    await ShellExec([
      `cd ${path.join(tmpGitPath, REPO_NAME)}`, 
      `pwd`,
      `ls -l`,
      `git add .`,
      `git commit -m "CI TAG: ${await getTag(config)}" --allow-empty`
    ])

    await ShellExec([
      `cd ${path.join(tmpGitPath, REPO_NAME)}`, 
      `git push -f ${DEPLOY_GIT_URL}`
    ], {retry: 10})
  }
  catch (e) {
    if (retry === 10) {
      throw e
    }
    console.error(e)

    await ShellExec("rm -rf " + $tmpGitPath)

    retry++
    console.log('retry ' + retry)
    await sleep(10000)
    return await main(config, retry)
  }

  console.log(`
  ============================================================
  UPDATE CUSTOM DOMAIN FINISH
  ============================================================
  `)
}

module.exports = main