// const yaml = require('js-yaml')

//const config = yaml.load(fs.readFileSync(path.join(__dirname, '../deploy/values.yaml'), 'utf8'))
// const LoadYAMLConfig = require('./scripts/LoadYAMLConfig.js')

// -----------------------------------

// const ShellExec = require('./scripts/lib/ShellExec.js')

// const createApp = require('./scripts/ArgocdCreateApplication.js')
// const refreshApp = require('./scripts/ArgocdRefreshApplication.js')
// const restartResource = require('./scripts/ArgocdRestartApplication.js')
// //const BuildDeployYamlValues = require('./BuildDeployYamlValues.js')
// const BuildDeployYaml = require('./scripts/BuildDeployYaml.js')
const RunCypress = require('./scripts/RunCypress.js')
const WaitForLock = require('./scripts/lib/WaitForLock.js')

async function main () {
  // const config = await LoadYAMLConfig()

  await WaitForLock.lock('RunCypress')
  await RunCypress()
  await WaitForLock.unlock('RunCypress')
}

main()