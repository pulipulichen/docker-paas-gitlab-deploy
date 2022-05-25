const fs = require('fs')
const ShellExec = require('./ShellExec.js')
const BuildDeployYamlValues = require('./BuildDeployYamlValues.js')
const LoadYAMLConfig = require('./LoadYAMLConfig.js')
const sleep = require('./lib/sleep.js')
const path = require('path')

function touchFileIfNotExists(filename) {
  if (fs.existsSync(filename) === false) {
    fs.writeFileSync(filename, '', 'utf8')
  }
}

function readTagFromArtifact(BUILD_DIR, filename) {
  let fromTagFile = `${BUILD_DIR}/ci.tmp/${filename}`
  let tag = ''
  /*
  if (fs.existsSync(fromTagFile)) {
    tag = fs.readFileSync(fromTagFile, 'utf8')
    fs.writeFileSync(filename, tag, 'utf8')
    // console.log(`[${filename} UPDATED] "${tag}"`)
  }
  else {
    tag = fs.readFileSync(filename, 'utf8')
    // console.log(`[${filename}] "${tag}"`)
    // if (tag === '') {
    //   tag = ' '
    // }
  }
  */
  tag = fs.readFileSync(filename, 'utf8')
  if (typeof(tag) === 'string') {
    tag = tag.trim()
  }
  return tag
}

async function updateTagInYaml(tagName, tag) {
  await ShellExec(`sed -i " s/{{ DOCKER_IMAGE_TAG_${tagName.toUpperCase()} }}/${tag}/g" ./values.yaml`)
  await ShellExec(`sed -i " s/{{ DOCKER_IMAGE_TAG_${tagName.toUpperCase()} }}/${tag}/g" ./Chart.yaml`)
  
}

function getTagPrefix(config) {
  let prefix = config.deploy.docker_image_tag_prefix

  if (!prefix) {
    return
  }

  prefix = prefix.toLowerCase()
  prefix = prefix.replace(/[^a-zA-Z0-9\-]/g, "")

  if (prefix === '') {
    return
  }

  return prefix
}

function getRepoName (config) {
  const DEPLOY_GIT_URL = config.environment.build.deploy_git_url
  let REPO_NAME = DEPLOY_GIT_URL.slice(DEPLOY_GIT_URL.lastIndexOf('/') + 1)
  REPO_NAME = REPO_NAME.slice(0, REPO_NAME.lastIndexOf('.'))

  return REPO_NAME
}

let tmpGitPath = '/tmp/git-deploy'
const BUILD_DIR = path.join('/builds/', process.env.CI_PROJECT_NAMESPACE, process.env.CI_PROJECT_NAME)
const REPO = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE

let clone = async function (retry = 0) {
  let config = await LoadYAMLConfig()

  
  console.log("BUILD_DIR: " + BUILD_DIR)

  if (fs.existsSync(tmpGitPath) === false) {
    fs.mkdirSync(tmpGitPath)
  }
  
  process.chdir(tmpGitPath)

  
  console.log("REPO: " + REPO)

  if (REPO === '-') {
    throw new Error('CI_PROJECT_NAME and CI_PROJECT_NAMESPACE is unknown.')
  } 

  // -----------------------------

  // if (!process.env.DEPLOY_GIT_URL) {
  //   throw new Error('DEPLOY_GIT_URL is unknown.')
  // }
  
  const DEPLOY_GIT_URL = config.environment.build.deploy_git_url

  const REPO_NAME = getRepoName(config)
  if (fs.existsSync(tmpGitPath + '/' + REPO_NAME) === false) {
    await ShellExec(`git clone -b ${REPO} ${DEPLOY_GIT_URL} || git clone ${DEPLOY_GIT_URL}`)
  }
  
  process.chdir(tmpGitPath + '/' + REPO_NAME)

  // -----------------------------
  // 設定global name and email
  
  let {username, host} = new URL(DEPLOY_GIT_URL)

  await ShellExec(`git config --global user.email "${username}@${host}"`)
  await ShellExec(`git config --global user.name "${username}"`)

  await ShellExec(`git checkout -b ${REPO} || git checkout ${REPO}`)

  await ShellExec(`ls -l`)

  // ----------------------------------------------------------------
  //let result = true
  if (fs.existsSync('FORCE_DEPLOY.txt')) {
    console.log('FORCE_DEPLOY', fs.readFileSync('FORCE_DEPLOY.txt', 'utf8'))
    fs.unlinkSync('FORCE_DEPLOY.txt')
    //result = true
    console.log(`
================================================
FORCE_DEPLOY.txt is deleted.
================================================
`)
  }
  else if (config.deploy.only_update_app === true) {
    console.log('only_update_app')
    return false
  }

  let modules = [
    'APP',
    'DATABASE_SQLITE', 
    'DATABASE_MYSQL', 
    'DATABASE_PGSQL', 
    'DATABASE_NEO4J', 
    'DATABASE_MONGO']

  modules.forEach(module => {
    touchFileIfNotExists(`TAG_${module}.txt`)
  })

  // -------------------------------

  await ShellExec(`cat TAG_*.txt`)

  await ShellExec(`mv TAG_*.txt ../`)
  await ShellExec(`rm -rf /tmp/git-deploy/${REPO_NAME}/*`)
  await ShellExec(`cp -r ${BUILD_DIR}/deploy/* /tmp/git-deploy/${REPO_NAME}`)
  await ShellExec(`mv ../TAG_*.txt ./`)
  await BuildDeployYamlValues()

  modules.forEach(async function (module) {
    let tag = readTagFromArtifact(BUILD_DIR, `TAG_${module}.txt`)
    await updateTagInYaml(module, tag)
    console.log('TAG UPDATED', module, '[', tag, ']')
  })
  await sleep(100)

  let valuesContent = fs.readFileSync('./values.yaml', 'utf8')
  if (valuesContent.indexOf('{{ DOCKER_IMAGE_TAG_') > -1) {
    console.log('================================================')
    console.log(valuesContent)
    console.log('================================================')
    if (retry === 1) {
      throw new Error('updateTagInYaml failed.')
    }
    
    console.error('updateTagInYaml failed.')

    retry++
    return await clone(retry)
  }

  // -------------------------------

  let replaceVariables = {
    PROJECT_NAME: process.env.CI_PROJECT_NAME,
    PROJECT_NAMESPACE: process.env.CI_PROJECT_NAMESPACE,
    PROJECT_ID: process.env.CI_PROJECT_ID,
  }

  let replaceFiles = [
    './values.yaml',
    './Chart.yaml'
  ]
  
  for (const [key, value] of Object.entries(replaceVariables)) {
    replaceFiles.forEach(async function (file) {
      await ShellExec(`sed -i " s/{{ ${key} }}/${value}/g" ${file}`)
    })
  }

  // -------------------------------

  // let valuesContent2 = fs.readFileSync('./values.yaml', 'utf8')
  // console.log('================================================')
  // console.log(valuesContent2)
  // console.log('================================================')
  
  // -------------------------------

  return true
}

let push = async function (retry = 0) {
  console.log(`==============================
push
==============================`)

  let config = await LoadYAMLConfig()
  const DEPLOY_GIT_URL = config.environment.build.deploy_git_url

  const REPO_NAME = getRepoName(config)
  process.chdir(tmpGitPath + '/' + REPO_NAME)

  // console.log(`Target: `, tmpGitPath + '/' + REPO_NAME)
  // await ShellExec(`pwd`)
  
  // -------------------------------

  let tag = process.env.CI_COMMIT_SHORT_SHA
  let prefix = getTagPrefix(config)
  if (prefix) {
    tag = prefix + '-' + tag
  }

  // await ShellExec(`git add .`)
  // await ShellExec(`git commit -m "CI TAG: ${tag}" --allow-empty`)
  // //await ShellExec(`git commit -m "${process.env.CI_COMMIT_SHORT_SHA}"`)
  // await ShellExec(`git push -f ${DEPLOY_GIT_URL}`)
  await ShellExec([
    `cd ${tmpGitPath + '/' + REPO_NAME}`, 
    `echo "OK1"`,
    `pwd`,
    `echo "OK2"`,
    `git add .`,
    `echo "OK3"`,
    `ls -l`,
    `echo "OK4"`,
    `git commit -m "CI TAG: ${tag}" --allow-empty`,
    `echo "OK5"`,
    `git push -f ${DEPLOY_GIT_URL}`,
    `echo "OK6"`,
  ])
}

module.exports = {
  clone,
  push
}