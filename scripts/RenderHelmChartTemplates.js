const fs = require('fs')
const path = require('path')

const ShellExec = require('./lib/ShellExec.js')
const BuildDeployYamlValues = require('./BuildDeployYamlValues.js')

const tempDir = '/tmp/render_templates'
const BUILD_DIR = path.join('/builds/', process.env.CI_PROJECT_NAMESPACE, process.env.CI_PROJECT_NAME)
const tempOutputDir = path.join(BUILD_DIR, '/deploy/render/')

async function RenderHelmChartTemplates () {
  console.log(`
================================================
RenderHelmChartTemplates
================================================
`)

  // 1. 複製到指定資料夾

  if (fs.existsSync(tempDir) === false) {
    fs.mkdirSync(tempDir, {recursive: true})
  }
  process.chdir(tempDir)

  // console.log(BUILD_DIR)
  // console.log(fs.readdirSync(BUILD_DIR + '/deploy')) 
  // await ShellExec(`tree ${BUILD_DIR}/deploy/*`)
  // console.log(`cp -rf ${BUILD_DIR}/deploy/* ${BUILD_DIR}/deploy/render`)
  await ShellExec(`cp -rf ${BUILD_DIR}/deploy/ ${tempDir}`)

  console.log(fs.readdirSync(tempDir)) 

  // 2. 建立 values
  // await BuildDeployYamlValues()

  // 3. 跑程式碼 helm template test11 ./test --debug
  // await ShellExec(`helm template ${process.env.CI_PROJECT_NAME} ${tempDir} --debug >> ${tempOutputDir}/output.txt`)

  throw new Error('Please check helm')
  // 4. 如果有錯誤，則這裡停止

  // 5. 把檔案分割成多個按照資料夾排好的檔案，

  // 6. 結束
  return true
} 

async function getErrorYaml (message) {
  console.error('@TODO RenderHelmChartTemplates')

  // 1. 分析錯誤訊息裡面有沒有檔案路徑

  // 2. 有錯誤路徑，則抓出那個檔案顯示出來
  let filePath = `path-tofile`
  let fileContent = 'content'

  console.log(`
================================================
# Source ${filePath}

${fileContent}
================================================
You can use HELM-PLAYGROUND.COM to verfity the code:
https://helm-playground.com/#
`)
}

module.exports = RenderHelmChartTemplates