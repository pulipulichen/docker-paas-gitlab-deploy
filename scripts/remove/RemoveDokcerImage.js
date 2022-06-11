const setupQuay = require('./../lib/setupQuay')
const ShellSpawn = require('./../lib/ShellSpawn')
const LoadYAMLConfig = require('./../lib/LoadYAMLConfig')
const REPO = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE

async function RemoveDokcerImage() {
  await setupQuay()

  let config = await LoadYAMLConfig()
  let QUAY_PREFIX = config.environment.build.quay_prefix
  try {

    // https://stackoverflow.com/a/33528020/6645399
    await ShellSpawn(`curl -X DELETE ${QUAY_PREFIX}/${REPO}`)
  }
  catch (e) {
    console.error(e)
  }
}

module.exports = RemoveDokcerImage