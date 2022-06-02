const fs = require('fs')
const path = require('path')

const ShellExec = require('./lib/ShellExec.js')
const ShellSpawn = require('./lib/ShellSpawnHelm.js')
const BuildDeployYamlValues = require('./BuildDeployYamlValues.js')
const BuildDeployYamlReplace = require('./BuildDeployYamlReplace.js')

const tempDir = '/tmp/render_templates'
const BUILD_DIR = path.join('/builds/', process.env.CI_PROJECT_NAMESPACE, process.env.CI_PROJECT_NAME)
const tempOutputDir = path.join(BUILD_DIR, '/deploy/render/')

async function RenderHelmChartTemplates () {
  // return true

  console.log(`
================================================
RenderHelmChartTemplates
================================================
`)

  // 1. 複製到指定資料夾

  if (fs.existsSync(tempDir) === false) {
    fs.mkdirSync(tempDir, {recursive: true})
  }
  if (fs.existsSync(tempOutputDir) === false) {
    fs.mkdirSync(tempOutputDir, {recursive: true})
  }
  process.chdir(tempDir)
 
  // console.log(BUILD_DIR)
  // console.log(fs.readdirSync(BUILD_DIR + '/deploy')) 
  // await ShellExec(`tree ${BUILD_DIR}/deploy/*`)
  // console.log(`cp -rf ${BUILD_DIR}/deploy/* ${BUILD_DIR}/deploy/render`)
  await ShellExec(`cp -rf ${BUILD_DIR}/deploy/* ${tempDir}`)

  

  // 2. 建立 values
  await BuildDeployYamlValues()
  await BuildDeployYamlReplace()

  // 3. 跑程式碼 helm template test11 ./test --debug
  // console.log(`helm template ${process.env.CI_PROJECT_NAME} ${tempDir} --debug >> ${path.join(tempOutputDir, '/output.txt')}`)
  // await ShellExec(`whereis helm`)
  // await ShellExec(`helm template ${process.env.CI_PROJECT_NAME} ${tempDir} --debug >> ${path.join(tempOutputDir, '/output.txt')}`, {verbose: true})
  // const result = await ShellExec(`helm template ${process.env.CI_PROJECT_NAME} ${tempDir} --debug`, {verbose: true, stderrHandler: function (stderr, reject) {
  //   if (verbose) {
  //     console.log(`[STDERR] ${stderr}`);
  //   }
  //   reject()
  // }})
  // let hasError = false
  let result = await ShellSpawn([`helm`,`template`,`${process.env.CI_PROJECT_NAME}`,`${tempDir}`, '--dry-run', '--debug'], {verbose: true, getResult: true })
  


  // console.log(fs.readdirSync(tempDir)) 
  // console.log(fs.readdirSync(tempOutputDir)) 

  
  // 4. 如果有錯誤，則這裡停止

  // 5. 把檔案分割成多個按照資料夾排好的檔案，
  writeSplitedHelmResult(result.stdout)

  if (result.stderr) {
    let errorFilePath = extractErrorFilePath(result.stderr + '')
    if (errorFilePath) {
      let errorFileContent = getContentFromErrorFile(errorFilePath)
      console.log(`=============================================`)
      console.log(`Source: ${errorFilePath}`)
      console.log(errorFileContent)
      console.log(`=============================================`)
    }

    throw new Error(result.stderr)
  }
  throw new Error('Please check helm')


  // fs.writeFileSync(path.join(tempOutputDir, '/output.txt'), result, 'utf-8')

  // 6. 結束
  return true
} 

function writeSplitedHelmResult (result) {
  let parts = result.split(`---
# Source:`)

  // console.log(`part length`, parts.length)
  // process.chdir(tempOutputDir)

  let needleTemplate = '/templates/'
  for (let i = 0; i < parts.length; i++) {
    if (i === 0) {
      continue
    }

    let part = parts[i].trim()

    let newLinePos = part.indexOf('\n')
    let yamlPath = part.slice(part.indexOf(needleTemplate) + needleTemplate.length, newLinePos).trim()
    let yamlName = yamlPath.slice(yamlPath.indexOf('/') + 1).trim()
    let yamlDir = yamlPath.slice(0, yamlPath.indexOf('/')).trim()
    let yamlContent = part.slice(newLinePos + 1).trim()

    fs.mkdirSync(path.join(tempOutputDir, yamlDir), {recursive: true})
    fs.writeFileSync(path.join(tempOutputDir, yamlPath), yamlContent, 'utf8')
  }
}

function extractErrorFilePath(message) {
  let pos1 = message.indexOf('error on ')
  if (pos1 === -1) {
    return false
  }

  let pos2 = message.indexOf('/') + 1
  let pos3 = message.indexOf(':') + 1
  let errorFilePath = message.slice(pos2, pos3)
  console.log({errorFilePath})
  return errorFilePath
}

function getContentFromErrorFile(errorFilePath) {
  let targetFile = path.join(tempOutputDir, errorFilePath)

  return fs.readFileSync(targetFile, 'utf8')
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