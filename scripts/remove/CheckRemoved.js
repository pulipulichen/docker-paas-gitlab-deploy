const axios = require('axios')

async function CheckRemoved (url) {
  try {
    await axios.get(url)

    return false
  }
  catch (e) {
    return true
  }
}

module.exports = CheckRemoved