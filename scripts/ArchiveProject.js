const RemoveArgoCD = require('./remove/RemoveArgoCD')
const RemoveDokcerImage = require('./remove/RemoveDokcerImage')
const RemoveGitRepository = require('./remove/RemoveGitRepository')

async function ArchiveProject () {
  await WaitForLock.lock('GitlabToDeploy', async () => {
    await RemoveArgoCD()
    await RemoveDokcerImage()
    await RemoveGitRepository()
  })
}

module.exports = ArchiveProject