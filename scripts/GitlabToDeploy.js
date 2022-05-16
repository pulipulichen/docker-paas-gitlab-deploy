const yaml = require('js-yaml')

//const config = yaml.load(fs.readFileSync(path.join(__dirname, '../deploy/values.yaml'), 'utf8'))
const LoadYAMLConfig = require('./LoadYAMLConfig.js')

// -----------------------------------

const ShellExec = require('./ShellExec.js')

const createApp = require('./ArgocdCreateApplication.js')
const refreshApp = require('./ArgocdRefreshApplication.js')
//const BuildDeployYamlValues = require('./BuildDeployYamlValues.js')
const BuildDeployYaml = require('./BuildDeployYaml.js')
const RunCypress = require('./RunCypress.js')

async function main () {
  const config = await LoadYAMLConfig()

  const enableDeploy = config.deploy.enable

  if (enableDeploy === true) {
    
    console.log('=========================================')
    console.log('Deploy Helm Charts to gitlab')
    console.log('=========================================')

    await BuildDeployYaml()

    await createApp()
    await refreshApp()
    //await shellExec('/app/scripts/build_deploy_yaml.sh')
    // node /app/scripts/argocd-create-application.js
    // node /app/scripts/argocd-refresh-application.js

    await RunCypress()
  }

}

main()