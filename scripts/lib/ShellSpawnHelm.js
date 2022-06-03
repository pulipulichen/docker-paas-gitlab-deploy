const { spawn } = require("child_process");

module.exports = function (cmdArray, options = {}) {

  let {stderrHandler, errorHandler, verbose = true, getResult = false} = options

  let dataArray = []
  let errorMessage

  if (typeof(stderrHandler) !== 'function') {
    stderrHandler = function (stderr, resolve, dataArray) {
      console.log(`[STDERR] ${stderr}`);

      if (getResult) {
        // console.log('^^================================')
        console.log(dataArray.join('\n'))
        // console.log('^^================================')
        resolve({
          stdout: dataArray.join('\n'),
          stderr
        })
      }
      else {
        resolve()
      }
    }

  }

  if (typeof(errorHandler) !== 'function') {
    errorHandler = function (error, reject) {
      console.log(`[ERROR]\n${error.message}`)
      reject(error)
      return
    }
  }

  return new Promise(function (resolve, reject) {
    const job = spawn(cmdArray[0], cmdArray.splice(1));

    job.stdout.on("data", data => {
      if (verbose) {
        console.log(`${data}`);
      }

      if (getResult) {
        dataArray.push(data)
      }
    });
    
    job.stderr.on("data", data => {
      errorMessage = data
      // stderrHandler(`${data}`, resolve, dataArray);
    });
    
    job.on('error', (error) => {
      // stderrHandler(`error: ${error.message}`, resolve, dataArray);
    });
    
    job.on("close", code => {
        console.log('close')
        if (verbose) {
          console.log(`child process exited with code ${code}`);
        }
        if (code !== 0) {
          // return reject(code)
          // return stderrHandler(code, resolve, dataArray)
          // console.log(code)
          setTimeout(() => {
            stderrHandler(errorMessage, resolve, dataArray)
          }, 5000)
          return false
        }

        if (getResult) {
          resolve({
            stdout: dataArray.join('\n')
          })
        }
        else {
          resolve()
        }
        
    });
  })
}