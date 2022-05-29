const fs = require('fs')
const path = require('path')

const tempDir = '/tmp/render_templates'


async function RenderHelmChartTemplates () {
  // throw new Error('todo')
  console.error('@TODO RenderHelmChartTemplates')

  // 1. 複製到指定資料夾

  // 2. 建立 values

  // 3. 跑程式碼 helm template test11 ./test --debug

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