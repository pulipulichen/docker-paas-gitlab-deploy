// const yaml = require('js-yaml')

//const config = yaml.load(fs.readFileSync(path.join(__dirname, '../deploy/values.yaml'), 'utf8'))
// const LoadYAMLConfig = require('./scripts/lib/LoadYAMLConfig.js')

// -----------------------------------

// const ShellExec = require('./scripts/lib/ShellExec.js')

// const createApp = require('./scripts/ArgocdCreateApplication.js')
// const refreshApp = require('./scripts/ArgocdRefreshApplication.js')
// const restartResource = require('./scripts/ArgocdRestartApplication.js')
// //const BuildDeployYamlValues = require('./BuildDeployYamlValues.js')
// const BuildDeployYaml = require('./scripts/BuildDeployYaml.js')
const RunCypress = require('./scripts/RunCypress.js')
// const WaitForLock = require('./scripts/lib/WaitForLock.js')
const LoadYAMLConfig = require('./scripts/lib/LoadYAMLConfig.js')

async function main () {
  // const config = await LoadYAMLConfig()
  const config = await LoadYAMLConfig()

  const enableDeploy = config.deploy.enable
  const project_archive = config.project_archive

  if (enableDeploy === false) {
    console.log('Deploy is disabled.') 
    return false
  }

  if (project_archive === true) {
    console.log('Project is archived.') 
    return false
  }

  // await WaitForLock.lock('RunCypress')
  try {
    await RunCypress()
  }
  catch (e) {
    // await WaitForLock.unlock('RunCypress')
    throw e  
  }
  // await WaitForLock.unlock('RunCypress')
}

main()