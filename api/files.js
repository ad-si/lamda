const fs = require('fs')

module.exports = (path, loadCallback) => {
  const baseURL = ''

  function getStats (readPath, statsCallback) {
    fs.stat(readPath, (error, stats) => {
      if (error) throw error

      stats.path = path

      statsCallback(stats)
    })
  }

  function readFiles (readPath, readCallback) {
    const returnFiles = []

    fs.readdir(readPath, (error, files) => {
      if (error) throw error

      files.forEach(file => {

        const fileInfo = {
          type: '',
          name: file,
          path: (path + '/' + file)
            .replace(/(\/)+/g, '/'),
        }
        const isDirectory = fs
          .lstatSync(readPath + '/' + file)
          .isDirectory()

        if (isDirectory) {
          fileInfo.type = 'directory'
        }

        returnFiles.push(fileInfo)
      })

      readCallback(returnFiles)
    })
  }


  fs.lstat(baseURL + '/' + path, (error, stats) => {
    if (error) throw error
    if (stats.isDirectory()) {
      // if(path.substr(-1) == '/')
      readFiles(baseURL + '/' + path, loadCallback)
      // else
      //   getStats(baseURL + '/' + path, loadCallback)
    }
    else {
      getStats(baseURL + '/' + path, loadCallback)
    }
  })
}
