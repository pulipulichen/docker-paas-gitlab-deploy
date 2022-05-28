const ShellExec = require('./lib/ShellExec.js')
const ShellSpawn = require('./lib/ShellSpawn.js')
const path = require('path')
const LoadYAMLConfig = require('./LoadYAMLConfig')

async function main() {
  
  console.log('=========================================')
  console.log('Start cypress test')
  console.log('=========================================')
 
  // 切回去原本的路徑
  const BUILD_DIR = path.join('/builds/', process.env.CI_PROJECT_NAMESPACE, process.env.CI_PROJECT_NAME)
  process.chdir(BUILD_DIR)

  //await ShellExec(`ls`)
  // await ShellExec(`cat /proc/sys/fs/inotify/max_user_instances`)
  // await ShellExec(`echo 256 > /proc/sys/fs/inotify/max_user_instances`)


  let config = await LoadYAMLConfig()
  await ShellExec('npm link js-yaml fast-glob')
  try {

    let jobs = config.environment.test.specs
    if (!jobs) {
      jobs = [
        `test/cypress/integration/gadget/admin.spec.js`,
        `test/cypress/integration/gadget/**/[!admin.spec.js]*`,
        `test/cypress/integration/app/**/*`
      ]
    }

    let verbose = true
    let args = [`cypress`, `run`, `--headless`, `--project`, `test`]
    if (config.app.test_repeats > 10 && config.environment.test.force_record === false) {
      args = args.concat(['--config', 'video=false,screenshotOnRunFailure=false'])
      verbose = false
    }

    for (let i = 0; i < jobs.length; i++) {
      await ShellSpawn(args.concat([`--spec`, jobs[i]]), {verbose})
    }

    // await ShellSpawn([`cypress`, `run`, `--headless`, `--project`, `test`, `--spec`, `test/cypress/integration/gadget/**/[!admin.spec.js]*`])
    // await ShellSpawn([`cypress`, `run`, `--headless`, `--project`, `test`, `--spec`, `test/cypress/integration/app/**/*`])


    // https://patorjk.com/software/taag/#p=display&h=0&v=0&f=ANSI%20Shadow&t=FINISH
console.log(`===================================


███████╗██╗███╗   ██╗██╗███████╗██╗  ██╗
██╔════╝██║████╗  ██║██║██╔════╝██║  ██║
█████╗  ██║██╔██╗ ██║██║███████╗███████║
██╔══╝  ██║██║╚██╗██║██║╚════██║██╔══██║
██║     ██║██║ ╚████║██║███████║██║  ██║
╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚═╝  ╚═╝

Checkout your awesome application:
APP:   http://${process.env.CI_PROJECT_NAME}.${process.env.CI_PROJECT_NAMESPACE}.${config.environment.project.domain_suffix}
ADMIN: http://admin.${process.env.CI_PROJECT_NAME}.${process.env.CI_PROJECT_NAMESPACE}.${config.environment.project.domain_suffix}
    `)
  }
  catch (e) {

    console.log(`===================================
Test is failed. Please check your main domain:
http://${process.env.CI_PROJECT_NAME}.${process.env.CI_PROJECT_NAMESPACE}.${config.environment.project.domain_suffix}
http://admin.${process.env.CI_PROJECT_NAME}.${process.env.CI_PROJECT_NAMESPACE}.${config.environment.project.domain_suffix}
===================================`)
    throw e
  }
  
 
  // await ShellExec('/app/docker-paas-gitlab-deploy/scripts/RunCypress.sh')
}

module.exports = main