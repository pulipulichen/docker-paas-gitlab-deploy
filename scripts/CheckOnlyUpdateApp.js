const path = require('path')
const ShellSpawn = require('./lib/ShellSpawn')

const BUILD_DIR = path.join('/builds/', process.env.CI_PROJECT_NAMESPACE, process.env.CI_PROJECT_NAME)
module.exports = async function () {
  process.chdir(BUILD_DIR)
  
  const filelist = await ShellSpawn(`files=(\`git diff-tree --no-commit-id --name-only -r ${process.env.CI_COMMIT_SHA})\``)
  console.log(filelist)
  throw new Error('test')
}