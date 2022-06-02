const ShellExec = require('./lib/ShellExec.js')

async function main () {
  let replaceVariables = {
    PROJECT_NAME: process.env.CI_PROJECT_NAME,
    PROJECT_NAMESPACE: process.env.CI_PROJECT_NAMESPACE,
    PROJECT_ID: process.env.CI_PROJECT_ID,
  }

  let replaceFiles = [
    './values.yaml',
    './Chart.yaml'
  ]
  
  for (const [key, value] of Object.entries(replaceVariables)) {
    replaceFiles.forEach(async function (file) {
      await ShellExec(`sed -i " s/{{ ${key} }}/${value}/g" ${file}`)
    })
  }
}

module.exports = main