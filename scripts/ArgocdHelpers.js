const axios = require('axios')
const LoadYAMLConfig = require('./LoadYAMLConfig.js')
//const FormData = require('form-data')
const fetch = require('node-fetch')

const fs = require('fs')

const tmpTokenPath = '/tmp/argocd.token.txt'

let config
module.exports = {
    getConfig: async function () {
        if (config) {
            return config
        }

        let values = await LoadYAMLConfig()
        const ARGOCD_AUTH_TOKEN = values.environment.build.argocd_auth_token

        try {
            config = JSON.parse(Buffer.from(ARGOCD_AUTH_TOKEN, 'base64').toString())

            if (!config.username || !config.password || !config.server) {
                throw new Error('ARGOCD_AUTH_TOKEN is not well configured.')
            }
        }
        catch (e) {
            console.error(e)
            throw new Error('ARGOCD_AUTH_TOKEN is not well configured.')
        }
        return config
    },
    getCookieToken: async function () {
        if (fs.existsSync(tmpTokenPath)) {
            return fs.readFileSync(tmpTokenPath, 'utf8')
        }
        await this.getConfig()

        const result = await axios.post(config.server + '/api/v1/session', {
            "username": config.username,
            "password": config.password
        })

        const token = result.data.token

        fs.writeFileSync(tmpTokenPath, token, 'utf8')

        return token
        /*
        const curlTask = new Curl();
    
        const terminate = curlTask.close.bind(curlTask);
    
        curlTask.setOpt(Curl.option.URL, server + '/api/v1/session');
        curlTask.setOpt(
            Curl.option.POSTFIELDS,
            JSON.stringify({
                "username": username,
                "password": password
            })
        );
    
        curlTask.on("end", function (statusCode, data, headers) {
            console.info("Status code " + statusCode);
            console.info("***");
            console.info("Our response: " + data);
            console.info("***");
            console.info("Length: " + data.length);
            console.info("***");
            console.info("Total time taken: " + this.getInfo("TOTAL_TIME"));
    
            this.close();
        });
    
        curlTask.on("error", terminate);
    
        curlTask.perform();
        /*
        console.log('gogo', {
        "username": username,
        "password": password
      })
        console.log(server + '/api/v1/applications')
      axios.get(server + '/api/v1/applications', {
        "username": username,
        "password": password
      })
      /*
      const response = await fetch(server + '/api/v1/applications', {method: 'POST', body: `{"username": "${username}", "password": "${password}"}`});
      console.log(response)
      return response.token
      */

        return false
    },
    isAppExists: async function (appName, token) {
        await this.getConfig()
        const url = config.server + '/api/v1/applications/deploybot-' + appName
        let result
        try {
            result = await axios.get(url, {
                headers: {
                    Cookie: 'argocd.token=' + token
                }
            })
        }
        catch (e) {
            return false
        }
        return true
    },
    createApp: async function (appName, token) {
        await this.getConfig()
        const url = config.server + '/api/v1/applications'

        //appName = 'test20220428-2220-pudding'
        const data = { "apiVersion": "argoproj.io/v1alpha1", "kind": "Application", "metadata": { "name": 'deploybot-' + appName }, "spec": { "destination": { "name": "", "namespace": "default", "server": "https://kubernetes.default.svc" }, "source": { "path": ".", "repoURL": "https://gitlab.nccu.syntixi.dev/deploybot/argocd.git", "targetRevision": appName }, "project": "default", "syncPolicy": { "automated": { "prune": true, "selfHeal": false }, "syncOptions": ["PruneLast=true"] } } }

        let result
        try {
            result = await axios.post(url, data, {
                headers: {
                    Cookie: 'argocd.token=' + token
                }
            })
        }
        catch (e) {
            console.error(e)
        }
        return true
    },

    refreshApp: async function (appName, token) {
        await this.getConfig()
        //const url = config.server + '/api/v1/applications/deploybot-' + appName + '?refresh=normal'
        const url = config.server + '/api/v1/applications/deploybot-' + appName + '?refresh=hard'
        let result
        try {
            result = await axios.get(url, {
                headers: {
                    Cookie: 'argocd.token=' + token
                }
            })

            // console.log('refreshApp')
            // console.log(result)
        }
        catch (e) {
            return false
        }
        return true
    },
    syncApp: async function (appName, token) {
        await this.getConfig()
        const url = config.server + '/api/v1/applications/deploybot-' + appName + '/sync'
        // https://argocd.nccu.syntixi.dev/api/v1/applications/deploybot-test20220428-2220-pudding/sync
        const data = {
            "revision": appName,
            "prune": true,
            "dryRun": false,
            "strategy": {
                "hook": {
                    //"force": false
                    "force": true
                }
            },
            "resources": null,
            "syncOptions": {
                "items": [
                    "PruneLast=true"
                ]
            }
        }

        let result
        try {
            result = await axios.post(url, data, {
                headers: {
                    Cookie: 'argocd.token=' + token
                }
            })
            //console.log('SYNC RESULT')
            //console.log(result)
        }
        catch (e) {
            return false
        }
        return true
    },
    terminatedSync: async function (appName, token) {
        await this.getConfig()
        const url = config.server + '/api/v1/applications/deploybot-' + appName + '/operation'
        // https://argocd.nccu.syntixi.dev/api/v1/applications/deploybot-test20220428-2220-pudding/operation
        const data = {
        }

        let result
        try {
            result = await axios.delete(url, {
                headers: {
                    Cookie: 'argocd.token=' + token
                }
            })
            //console.log('terminatedSync')
            //console.log(result)
        }
        catch (e) {
            return false
        }
        return true
    },
    sleep: function (ms = 500) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    waitOperation: async function (appName, token, retry = 0) {
        await this.getConfig()
        const url = config.server + '/api/v1/applications/deploybot-' + appName
        // https://argocd.nccu.syntixi.dev/api/v1/settings
        let result
        result = await axios.get(url, {
            headers: {
                Cookie: 'argocd.token=' + token
            }
        })

        let status = result.data.status
        console.log(status)

        //if (status.health.status !== 'Healthy') {
        //if (status.operationState.phase !== 'Running') {
        if (status.conditions && 
            (status.conditions[0].type.indexOf('Error') > -1 )) {
            return status
        }

        if (status.health && 
            status.health.status === 'Degraded' && 
            status.operationState.phase !== 'Running') {
            return status
        }

        if (status.operationState && 
                status.operationState.phase === 'Running' && 
                status.operationState.message && 
                status.operationState.message.startsWith('one or more objects failed to apply, reason:')) {
            return status
        }

        if (status.operationState && 
            status.operationState.phase === 'Error') {
        return status
    }

        if ((status.operationState && status.operationState.phase === 'Running') || 
            status.health.status === 'Progressing') {
            await this.sleep(3000)
            retry++
            return await this.waitOperation(appName, token, retry)
        }

        return status
    },
    healthyCheckMessageFilter: function (message) {
        let m = message
        if (!m) {
            m = ''
          }
          if (m.startsWith('Back-off pulling image ')) {
              let repo = m.slice(m.indexOf('"') + 1, m.lastIndexOf(':'))
              m += '\nPlease check Git image repositroy: ' + quay_baseurl + repo + '?tab=history'
          }

          if (m.indexOf('` failed exit status 1: Error: ') > -1) {
              let needle = '` failed exit status 1: Error: '
              let pos = m.lastIndexOf(needle)
              let errorMessage = m.slice(pos + needle.length)

              m += '\n-----------------------------------\n' + errorMessage + '\n---------------------------------------\n1'
          }
          return m
    },
    healthyCheck: async function (status) {
        let config = await LoadYAMLConfig()
        //console.log(result)
        let message
        let resourcesHealth
        let error 

        let quay_baseurl = config.environment.paas.paas_quay
        quay_baseurl = quay_baseurl.slice(0, quay_baseurl.lastIndexOf('/') + 1)

        //let quayMessage = []
        if (status.operationState.phase !== "Succeeded") {
            if (Array.isArray(status.operationState.syncResult.resources)) {
                message = status.operationState.syncResult.resources
                    //.filter(r => r.status !== 'Synced')
                    .filter(r => r.hookPhase !== 'Succeeded')
                    .filter(r => r.message.endsWith(' unchanged') === false)
                    .filter(r => r.message.endsWith(' configured') === false)
                    .map(r => '[' + r.name + ']\n' + r.message)
                    .join('\n\n')
            }
            else if (status.operationState.message) {
                message = this.healthyCheckMessageFilter(status.operationState.message)
            }
            error = 'Operation State: ' + status.operationState.phase
        }

        if (status.health.status !== 'Healthy') {
            if (Array.isArray(status.resources)) {
                resourcesHealth = status.resources
                    //.filter(r => r.status !== 'Synced')
                    .filter(r => r.health.status !== 'Healthy')
                    .map(r => {
                      let m = this.healthyCheckMessageFilter(r.health.message)
                      return '[' + r.name + ']\n' + m
                    })
                    .join('\n\n')
            }

            if (!error) {
                error = 'Health Statues: ' + status.health.status
            }
            
        }

        if (message || error || resourcesHealth) {
            console.log('=============================')
            console.log(status)
            console.log('=============================')
            console.log(status.resources)
            console.log('=============================')

            console.log('=============================')
            console.log('ERROR MESSAGES')
            console.log('=============================')
            if (message) {
                console.log(message)
            }
            if (resourcesHealth) {
                console.log(resourcesHealth)
            }
            console.log('=============================')
            console.log('Open ArgoCD')

            let argoCDURL = config.environment.paas.paas_argocd
            // {{ PROJECT_NAME }}-{{ PROJECT_NAMESPACE }}
            argoCDURL = argoCDURL.replace(`{{ PROJECT_NAME }}`, process.env.CI_PROJECT_NAME)
            argoCDURL = argoCDURL.replace(`{{ PROJECT_NAMESPACE }}`, process.env.CI_PROJECT_NAMESPACE)

            console.log(argoCDURL)
            console.log('=============================')

            //throw new Error('APP HEALTH: ' + status.health.status)
            throw new Error(error)
        }

        return true
    },
    waitForImageSynced: async function (appName, token, tags, retry = 0) {
        await this.getConfig()
        if (!tags) {
            let files = fs.readdirSync(`/tmp/git-deploy/argocd/`)
            // console.log({files})
            tags = files.filter(f => f.startsWith('TAG_') && f.endsWith('.txt'))
                .map(f => {
                    let tagPath = `/tmp/git-deploy/argocd/${f}`
                    let tag = fs.readFileSync(tagPath, 'utf8')
                    tag = tag.trim()
                    let suffix
                    if (f === 'TAG_APP.txt') {
                        suffix = 'app'
                    }
                    else if (f.startsWith('TAG_DATABASE_')) {
                        suffix = f.slice(f.lastIndexOf('_') + 1, f.lastIndexOf('.')).toLowerCase()
                    }

                    return {
                        suffix,
                        tag
                    }
                })
                .filter(o => o.tag !== '')
            // console.log({tags})
        }
        let values = await LoadYAMLConfig()
        let status = await this.waitOperation(appName, token)

        let images = status.summary.images
        // console.log(retry, tag)
        // console.log(images)
        // console.log(images.filter(u => u.trim().endsWith(tag)).length)
        // console.log(images[0].trim())
        // console.log(images[0].trim().endsWith(tag))
        // console.log(images[0].slice(images[0].lastIndexOf(":") + 1))
        // console.log(tag)
        // console.log(images[0].slice(images[0].lastIndexOf(":") + 1) + '' == tag.trim() + '')

        for (let i = 0; i < tags.length; i++) {
            let {suffix, tag} = tags[i]
            let imagePrefix = values.environment.build.quay_prefix + '/' + process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE + '-' + suffix + ':'

            let passed = true
            if (images.filter(u => u.trim().endsWith(':' + tag)).length == 0 || 
                images.filter(u => u.trim().startsWith(imagePrefix)).length > 1) {
                passed = false
            }

            if (suffix !== 'app') {
                let imagePrefix = values.environment.build.quay_prefix + '/' + process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE + '-' + suffix + '-init:'

                if (images.filter(u => u.trim().endsWith(':' + tag)).length == 0 || 
                    images.filter(u => u.trim().startsWith(imagePrefix)).length > 1) {
                    passed = false
                } 
            }

            if (passed === false) {
                retry++
                if (retry === 10) {
                    console.log('=============================')
                    console.log('PLEASE CHECK ARGOCD')
                    console.log(`${config.server}/applications/deploybot-${process.env.CI_PROJECT_NAME}-${process.env.CI_PROJECT_NAMESPACE}`)
                    console.log('=============================')

                    throw Error('Image sync failed ' + tag)
                }

                await this.refreshApp(appName, token)
                await this.sleep(2000)
                await this.syncApp(appName, token)

                console.log(`Wait for image sync: ${tag} (${retry})`)

                await this.sleep(10000)
                await this.waitForImageSynced(appName, token, tags, retry)
            }
        }

            
    },


    restartResource: async function (appName, token, resourceName = 'app') {
        await this.getConfig()
        // https://argocd.nccu.syntixi.dev/api/v1/applications/deploybot-test20220428-2220-pudding/resource/actions?namespace=default&resourceName=webapp-deployment-pudding-test20220428-2220&version=v1&kind=Deployment&group=apps

        const url = config.server + `/api/v1/applications/deploybot-${appName}/resource/actions?namespace=default&resourceName=${resourceName}-deployment-${appName}&version=v1&kind=Deployment&group=apps`
        //console.log('restartResource', url)
        //console.log('token', token)

        //appName = 'test20220428-2220-pudding'
        //const data = { "restart": "" }

        try {
            // let resultGet = await axios.get(url, {
            //     headers: {
            //         Cookie: 'argocd.token=' + token,
            //         //Referer: `${config.server }/applications/deploybot-${appName}?view=tree&conditions=false&resource=&operation=false`
            //     }
            // })

            // console.log(resultGet)

            // const data = { "restart": "" }
            // let resultPost = await axios.post(url, data, {
            //     headers: {
            //         Cookie: 'argocd.token=' + token,
            //         //Referer: `${config.server }/applications/deploybot-${appName}?view=tree&conditions=false&resource=&operation=false`
            //     }
            // })
            /*
            var data = new FormData();
            data.append('restart', '')
            
            console.log(data)
            console.log(data.getHeaders())

            let resultPost = await axios({
                method: 'post',
                url,
                //data: data.getHeaders(),
                body: '"restart"',
                headers: {
                    Cookie: 'argocd.token=' + token
                }
            })

            console.log(resultPost)
            */
            await fetch(url, {
                "headers": {
                  "content-type": "application/x-www-form-urlencoded",
                  "cookie": `argocd.token=${token}`,
                },
                "body": "\"restart\"",
                "method": "POST"
              });

            return true
        }
        catch (e) {
            console.error(e)
            throw new Error(e)
        }
    },
}
