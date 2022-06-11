const setupQuay = require('./../lib/setupQuay')
const ShellSpawn = require('./../lib/ShellSpawn')
const LoadYAMLConfig = require('./../lib/LoadYAMLConfig')
const REPO = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE

async function RemoveDokcerImage() {
  await setupQuay()

  let config = await LoadYAMLConfig()
  let QUAY_PREFIX = config.environment.build.quay_prefix
  try {
    console.log('================================')
    console.log('Remove the docker images repository')
    console.log('================================')

    // https://stackoverflow.com/a/33528020/6645399
    console.log(`curl -X DELETE https://${QUAY_PREFIX}/${REPO}`)
    await ShellSpawn(`curl -X DELETE https://${QUAY_PREFIX}/${REPO}`)
  }
  catch (e) {
    console.error(e)
  }
  console.log(`Check result: https://${QUAY_PREFIX}/${REPO}/-/job`)
}

module.exports = RemoveDokcerImage