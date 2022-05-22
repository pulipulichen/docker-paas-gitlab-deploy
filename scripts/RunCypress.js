const ShellExec = require('./ShellExec.js')
const path = require('path')
const LoadYAMLConfig = require('./LoadYAMLConfig')
const concurrently = require('concurrently')
const fg = require('fast-glob')
 
async function main() {
  let config = await LoadYAMLConfig()

  console.log('=========================================')
  console.log('Start cypress test')
  console.log('=========================================')

  // 切回去原本的路徑
  const BUILD_DIR = path.join('/builds/', process.env.CI_PROJECT_NAMESPACE, process.env.CI_PROJECT_NAME)
  process.chdir(BUILD_DIR)

  //await ShellExec(`ls`)
  // await ShellExec(`cat /proc/sys/fs/inotify/max_user_instances`)
  // await ShellExec(`echo 256 > /proc/sys/fs/inotify/max_user_instances`)


  await ShellExec('npm link js-yaml fast-glob')
  try {
    await ShellExec('cypress run --headless --project test --spec "test/cypress/integration/index.spec.js"')
    // await ShellExec('cypress run --headless --project test --spec "test/cypress/integration/**/[!app.spec.js][!index.spec.js]*"')
    // await ShellExec('cypress run --headless --project test --spec "test/cypress/integration/app.spec.js"')

    let specs = await fg([path.join(BUILD_DIR, 'test/cypress/integration/**/[!app.spec.js][!index.spec.js]*.js')], { dot: true })

    let jobs = []
    specs.forEach(file => {
      jobs.push({
        name: file,
        command: 'cypress run --headless --project test --spec "' + file + '"'
      })
    })

    for (let i = 0; i < config.app.test_repeats; i++) {
      jobs.push({
        name: 'app-' + i,
        command: 'cypress run --headless --project test --spec "test/cypress/integration/app.spec.js"'
      })
    }
    console.log(jobs)
    await concurrently(jobs, {
      killOthers: ['failure']
    })
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