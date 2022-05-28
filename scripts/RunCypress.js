const ShellExec = require('./lib/ShellExec.js')
const ShellSpawn = require('./lib/ShellSpawn.js')
const path = require('path')
const LoadYAMLConfig = require('./LoadYAMLConfig')
const sleep = require('./lib/sleep.js')

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
        `test/cypress/integration/gadget/**/*`,
        `test/cypress/integration/app/**/*`
      ]
    }

    let verbose = true
    let args = [`cypress`, `run`, `--headless`, `--project`, `test`]
    // let repeatArgs = [`cypress-repeat`, `run`, '-n', '' + config.app.test_repeats, `--headless`, `--project`, `test`]

    if (config.app.test_repeats > 10 && config.environment.test.force_record === false) {
      args = args.concat(['--config', 'video=false,screenshotOnRunFailure=false'])
      // repeatArgs = repeatArgs.concat(['--config', 'video=false,screenshotOnRunFailure=false'])
      // verbose = false
    }

    for (let i = 0; i < jobs.length; i++) {
      let currentArgs = [].concat(args)

      let repeat = 1
      // if (i === jobs.length - 1) {
      //   currentArgs = [].concat(repeatArgs)
      // }

      currentArgs = currentArgs.concat([`--spec`, jobs[i]])
      // console.log(currentArgs.join(' '))

      if (i === jobs.length - 1) {
        currentArgs.push('--quiet')
        currentArgs = currentArgs.join(' ')
        let {test_repeats} = config.app

        let startTime = (new Date()).getTime()

        let lastInterval = 0
        for (let j = 0; j < test_repeats; j++) {
          let jobStartTime = (new Date()).getTime()
          let percent = Math.floor( ( (j+1) / test_repeats ) * 100 )
          
          await ShellExec(currentArgs, {verbose: false})  
          let jobInterval = (new Date()).getTime() - jobStartTime

          let diffInterval = lastInterval
          if (diffInterval !== 0) {
            diffInterval = lastTime - jobInterval
          }
          lastTime = jobInterval
          console.log(`Test App #${(j+1)}/${test_repeats} (${percent}%) ${jobInterval}ms (${diffInterval}) ${new Date()}`)
        }
        let endInterval = (new Date()).getTime() - startTime
        let endMinutes = Math.floor(endInterval / 1000 / 60)

        console.log(`Total time ${endMinutes} minutes`)
      }
      else {
        await ShellSpawn(currentArgs, {verbose})  
      }
      
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