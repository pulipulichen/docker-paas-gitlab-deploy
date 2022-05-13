const fs = require('fs')
const fg = require('fast-glob');

module.exports = async function () {
  if (fs.existsSync('./deploy/values.yaml') || 
      fs.existsSync('./deploy/values') === false) {
    // 已經有檔案了，不重做
    return true
  }

  let valuesContent = []
  let files = await fg(['./deploy/values/**/*.yaml'], { dot: true });
  files.forEach(file => {
    console.log('Read: ' + file)
    let content = fs.readFileSync( file, 'utf8')
    valuesContent.push(content)
  });

  valuesContent = valuesContent.join('\n')

  fs.writeFileSync('./deploy/values.yaml', valuesContent, 'utf8')
}