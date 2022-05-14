const fs = require('fs')
const path = require('path')
const fg = require('fast-glob')

module.exports = async function () {
  const BUILD_DIR = path.join('/builds/', process.env.CI_PROJECT_NAMESPACE, process.env.CI_PROJECT_NAME)
  
  if (fs.existsSync(path.join(BUILD_DIR, '/deploy/values.yaml')) || 
      fs.existsSync(path.join(BUILD_DIR, '/deploy/values')) === false) {
    // 已經有檔案了，不重做
    console.log('skip BuildDeployYamlValues')
    return true
  }


  let valuesContent = []
  let files = await fg([path.join(BUILD_DIR, '/deploy/values/**/*.yaml')], { dot: true });
  files.forEach(file => {
    console.log('Read: ' + file)
    let content = fs.readFileSync( file, 'utf8')
    valuesContent.push(content)
  });

  valuesContent = valuesContent.join('\n')

  fs.writeFileSync(path.join(BUILD_DIR, '/deploy/values.yaml'), valuesContent, 'utf8')

  console.log('===[valuesContent]===============')
  console.log(valuesContent)
  console.log('=============================')
}