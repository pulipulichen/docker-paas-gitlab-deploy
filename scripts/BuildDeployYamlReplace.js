const ShellExec = require('./lib/ShellExec.js')
const LoadYAMLConfig = require('./lib/LoadYAMLConfig.js')

async function main () {
  let config = await LoadYAMLConfig()
  let {WORKDIR, USER, CMD, EXPOSE, ENV} = config.environment.app.Dockerfile

  let replaceVariables = {
    PROJECT_NAME: process.env.CI_PROJECT_NAME,
    PROJECT_NAMESPACE: process.env.CI_PROJECT_NAMESPACE,
    PROJECT_ID: process.env.CI_PROJECT_ID,
    DOCKERFILE_USER: USER,
    DOCKERFILE_WORKDIR: WORKDIR,
    DOCKERFILE_CMD: CMD,
    DOCKERFILE_EXPOSE: EXPOSE,
    DOCKERFILE_ENV: JSON.stringify(ENV),
  }

  let replaceFiles = [
    './values.yaml',
    './Chart.yaml'
  ]
  
  for (const [key, value] of Object.entries(replaceVariables)) {
    for (let i = 0; i < replaceFiles.length; i++) {
      let file = replaceFiles[i]
      await ShellExec(`sed -i " s/{{ ${key} }}/${value}/g" ${file}`)
    }
  }
}

module.exports = main