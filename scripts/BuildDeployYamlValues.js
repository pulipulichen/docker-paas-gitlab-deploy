const fs = require('fs')
const path = require('path')
const fg = require('fast-glob')

const CheckOnlyStatusChanged = require('./CheckOnlyStatusChanged')

function keepServersWokeUpStatus (valuesContent) {
  if (fs.existsSync('/tmp/git-deploy/values.yaml') === false) {
    return valuesContent
  }
  let content = fs.readFileSync('/tmp/git-deploy/values.yaml', 'utf8')
  let config = 'wake_up_server: true'
  if (content.indexOf(config) > -1) {
    // valuesContent = valuesContent + '\n' + config
    valuesContent = valuesContent.replaceAll(`wake_up_server: false`, `wake_up_server: true`)
  }
  return valuesContent
}

module.exports = async function (tempDir) {
  const BUILD_DIR = path.join('/builds/', process.env.CI_PROJECT_NAMESPACE, process.env.CI_PROJECT_NAME)
  
  if (fs.existsSync(path.join(BUILD_DIR, '/deploy/values.yaml')) || 
      fs.existsSync(path.join(BUILD_DIR, '/config')) === false) {
    // 已經有檔案了，不重做
    console.log('skip BuildDeployYamlValues')
    return true
  }


  let valuesContent = []
  let files = await fg([path.join(BUILD_DIR, '/config/*.yaml')], { dot: true });
  for (let i = 0; i < files.length; i++) {
    let file = files[i]

    console.log('Read: ' + file)

    let content = fs.readFileSync( file, 'utf8')

    if (file.endsWith('/config/project.yaml') && await CheckOnlyStatusChanged()) {
      content = content.replaceAll(`persist_data: true`, `persist_data: false`)
    }

    valuesContent.push(content)
  }

  valuesContent = valuesContent.join('\n')

  // valuesContent = keepServersWokeUpStatus(valuesContent)

  fs.writeFileSync(path.join(tempDir, '/values.yaml'), valuesContent, 'utf8')

  // console.log('===[valuesContent]===============')
  // console.log(valuesContent)
  // console.log('=============================')
}
