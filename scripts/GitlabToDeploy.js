const yaml = require('js-yaml')

//const config = yaml.load(fs.readFileSync(path.join(__dirname, '../deploy/values.yaml'), 'utf8'))
const LoadYAMLConfig = require('./LoadYAMLConfig.js')

// -----------------------------------

const ShellExec = require('./ShellExec.js')

const createApp = require('./ArgocdCreateApplication.js')
const refreshApp = require('./ArgocdRefreshApplication.js')
//const BuildDeployYamlValues = require('./BuildDeployYamlValues.js')
const BuildDeployYaml = require('./BuildDeployYaml.js')

async function main () {
  const config = await LoadYAMLConfig()

  const enableDeploy = config.enable

  if (enableDeploy === true) {
    
    console.log('=========================================')
    console.log('Deploy Helm Charts to gitlab')
    console.log('=========================================')

    await BuildDeployYaml()
    //await shellExec('/app/scripts/build_deploy_yaml.sh')
    // node /app/scripts/argocd-create-application.js
    // node /app/scripts/argocd-refresh-application.js

    console.log('=========================================')
    console.log('Deploy to ArgoCD')
    console.log('=========================================')

    await createApp()
    await refreshApp()
  }

  console.log('=========================================')
  console.log('Start cypress test')
  console.log('=========================================')

  await ShellExec('npm link js-yaml')
  await ShellExec('cypress run --headed --project test')
}

main()