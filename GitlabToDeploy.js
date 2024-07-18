// const yaml = require('js-yaml')

//const config = yaml.load(fs.readFileSync(path.join(__dirname, '../deploy/values.yaml'), 'utf8'))
const LoadYAMLConfig = require('./scripts/lib/LoadYAMLConfig.js')

// -----------------------------------

// const ShellExec = require('./scripts/ShellExec.js')

const createApp = require('./scripts/ArgocdCreateApplication.js')
const refreshApp = require('./scripts/ArgocdRefreshApplication.js')
// const restartResource = require('./scripts/ArgocdRestartApplication.js')
//const BuildDeployYamlValues = require('./BuildDeployYamlValues.js')
const BuildDeployYaml = require('./scripts/BuildDeployYaml.js')
// const RunCypress = require('./scripts/RunCypress.js')
const UpdateCustomDomain = require('./scripts/UpdateCustomDomain.js')
// const WaitForLock = require('./scripts/lib/WaitForLock.js')

const RenderHelmChartTemplates = require('./scripts/RenderHelmChartTemplates.js')
const ArchiveProject = require('./scripts/ArchiveProject.js')

async function main () {
  const config = await LoadYAMLConfig()

  const enableDeploy = config.deploy.enable
  const project_archive = config.project_archive

  if (enableDeploy === false) {
    console.log('Deploy is disabled.') 
    return false
  }

  if (project_archive === true) {
    console.log('Project is archived.') 
    await ArchiveProject()
    return false
  }

  // if (config.deploy.only_update_app === true) {
  //   console.log('only_update_app')
  //   return false
  // }
  
  // await WaitForLock.lock('GitlabToDeploy')

  try {
  //if (config.deploy.only_update_app !== true) {
    console.log('=========================================')
    console.log('Deploy Helm Charts to gitlab')
    console.log('=========================================')

    if ((await RenderHelmChartTemplates()) === false) {
      return false
    }

    if (await BuildDeployYaml.clone()) {
      await UpdateCustomDomain(config)
      await BuildDeployYaml.push()

      await createApp()
      await refreshApp()

      await BuildDeployYaml.deployed()
    }
    //await shellExec('/app/scripts/build_deploy_yaml.sh')
    // node /app/scripts/argocd-create-application.js
    // node /app/scripts/argocd-refresh-application.js
  //}
  // else {
  //   await restartResource()
  // }
  }
  catch (e) {
    // await WaitForLock.unlock('GitlabToDeploy')
    throw e
  }
  // await WaitForLock.unlock('GitlabToDeploy')
  

  // await RunCypress()

}

main()