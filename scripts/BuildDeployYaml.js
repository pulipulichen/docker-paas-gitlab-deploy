const fs = require('fs')
const ShellExec = require('./ShellExec.js')
const BuildDeployYamlValues = require('./BuildDeployYamlValues.js')
const LoadYAMLConfig = require('./LoadYAMLConfig.js')

function touchFileIfNotExists(filename) {
  if (fs.existsSync(filename) === false) {
    fs.writeFileSync(filename, '', 'utf8')
  }
}

function readTagFromArtifact(BUILD_DIR, filename) {
  let fromTagFile = `${BUILD_DIR}/ci.tmp/${filename}`
  let tag
  if (fs.existsSync(fromTagFile)) {
    tag = fs.readFileSync(fromTagFile, 'utf8')
    fs.writeFileSync(filename, tag, 'utf8')
    console.log(`[${filename} UPDATED] ${tag}`)
  }
  else {
    tag = fs.readFileSync(filename, 'utf8')
    console.log(`[${filename}] ${tag}`)
  }

  return tag
}

async function updateTagInYaml(tagName, tag) {
  await ShellExec(`sed -i " s/{{ DOCKER_IMAGE_TAG_${tagName.toUpperCase()} }}/${tag}/g" ./values.yaml`)
  await ShellExec(`sed -i " s/{{ DOCKER_IMAGE_TAG_${tagName.toUpperCase()} }}/${tag}/g" ./Chart.yaml`)
}

module.exports = async function () {
  let config = await LoadYAMLConfig()

  const BUILD_DIR = process.cwd()
  console.log("BUILD_DIR: " + BUILD_DIR)

  let tmpGitPath = '/tmp/git-deploy'
  fs.mkdirSync(tmpGitPath)
  process.chdir(tmpGitPath)

  const REPO = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE
  console.log("REPO: " + REPO)

  if (REPO === '-') {
    throw new Error('CI_PROJECT_NAME and CI_PROJECT_NAMESPACE is unknown.')
  } 

  // -----------------------------

  // if (!process.env.DEPLOY_GIT_URL) {
  //   throw new Error('DEPLOY_GIT_URL is unknown.')
  // }
  
  const DEPLOY_GIT_URL = config.environment.build.deploy_git_url
  await ShellExec(`git clone ${DEPLOY_GIT_URL}`)

  let REPO_NAME = DEPLOY_GIT_URL.slice(DEPLOY_GIT_URL.lastIndexOf('/') + 1)
  REPO_NAME = REPO_NAME.slice(0, REPO_NAME.lastIndexOf('.'))
  process.chdir(tmpGitPath + '/' + REPO_NAME)

  // -----------------------------
  // 設定global name and email
  
  let {username, host} = new URL(DEPLOY_GIT_URL)

  ShellExec(`git config --global user.email "${username}@${host}"`)
  ShellExec(`git config --global user.name "${username}"`)

  ShellExec(`git checkout -b ${REPO} || git checkout ${REPO}`)

  // -------------------------------

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

  await ShellExec(`mv TAG_*.txt ../`)
  await ShellExec(`rm -rf /tmp/git-deploy/${REPO_NAME}/*`)
  await ShellExec(`mv ../TAG_*.txt ./`)
  await BuildDeployYamlValues()

  modules.forEach(module => {
    let tag = readTagFromArtifact(BUILD_DIR, `TAG_${module}.txt`)
    updateTagInYaml(module, tag)

  })

  // -------------------------------

  await ShellExec(`cp -r ${BUILD_DIR}/deploy/* /tmp/git-deploy/${REPO_NAME}`)
  
  let replaceVariables = {
    PROJECT_NAME: process.env.CI_PROJECT_NAME,
    PROJECT_NAMESPACE: process.env.CI_PROJECT_NAMESPACE,
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

  await ShellExec(`git add .`)
  await ShellExec(`git commit -m "CI TAG: ${process.env.CI_COMMIT_SHORT_SHA}"`)
  await ShellExec(`git push -f ${DEPLOY_GIT_URL}`)
}