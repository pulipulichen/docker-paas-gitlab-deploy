const LoadYAMLConfig = require('./../LoadYAMLConfig.js')
const sleep = require('./sleep.js');

const axios = require('axios')
const axiosRetry = require('axios-retry')
axiosRetry(axios, { retries: 10 })
axiosRetry(axios, { retryDelay: (retryCount) => {
    return retryCount * 1000;
}})

let api = `https://script.google.com/macros/s/AKfycbzQ_BzJ8yeocQpWM5iERBWBfsFOhtOq4KSsGE6wkCDtCREuOGWcp1PIqURQRQZ5r3ds/exec`
let view = `https://docs.google.com/spreadsheets/d/11U6a_gZTz0Gq3nmO2e_1qfLkhqd9Q70j5M1COzndKZA/edit?usp=sharing`

let queryPassed = ['added', 'reset', 'timeout', 'existed']
let name = process.env.CI_PROJECT_NAME + '-' + process.env.CI_PROJECT_NAMESPACE
let timeout = 1000 * 30 * 60
let concurrent = 1
let concurrentRunCypress = 2

async function getKey (keySuffix) {
  let config = await LoadYAMLConfig()

  let key = config.environment.project.domain_suffix
  key = key + '_' + keySuffix

  return key
}

async function waitForLock (keySuffix = '', retry = 0) {
  let key = await getKey(keySuffix)

  if (keySuffix === 'RunCypress') {
    concurrent = concurrentRunCypress
  }
  
  let result = await axios.get(`${api}?key=${key}&name=${name}&timeout=${timeout}&concurrent=${concurrent}&action=query`)
  let data = result.data.result
  
  if (queryPassed.indexOf(data) === -1) {
    if (retry === 500) {
      throw new Error(`
==================
Wait for lock error. 
Please check locker: ${view}
==================
`)
    }

    let ms = 180000 - (10000 * (retry + 1))
    if (ms < 15000) {
      ms = 15000
    }

    console.log(`
wait for ${(ms / 1000)} seconds ... ` + retry + ` ${new Date() + ''}
  Check ${view}
`)
    
    await sleep(ms)

    retry++
    return await waitForLock(keySuffix, retry)
  }
}

async function unlock (keySuffix = '') {
  if (keySuffix === 'RunCypress') {
    concurrent = concurrentRunCypress
  }

  let key = await getKey(keySuffix)
  await axios.get(`${api}?key=${key}&name=${name}&timeout=${timeout}&concurrent=${concurrent}&action=remove`)
}

module.exports = {
  lock: waitForLock,
  unlock
}
