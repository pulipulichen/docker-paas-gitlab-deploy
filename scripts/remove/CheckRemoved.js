const axios = require('axios')

async function CheckRemoved (url) {
  try {
    let result = await axios.get(url)

    console.log(result)

    return false
  }
  catch (e) {
    return true
  }
}

module.exports = CheckRemoved