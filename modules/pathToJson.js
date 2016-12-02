const fs = require('fs')
const path = require('path')
const fileIcon = require('file-formats')
const directoryIcon = fs.readFileSync(
  path.resolve(__dirname, '../public/images/directory.svg'),
  'utf-8'
)


function createFileObject (fileName, dirName) {
  const stats = fs.lstatSync(path.join(
    dirName, fileName
  ))
  const extname = path.extname(fileName)
  const fileEntry = {
    fileName: fileName,
    name: path.basename(fileName, extname),
    extension: extname.substr(1),
  }

  if (stats.isDirectory()) {
    fileEntry.type = 'directory'
    fileEntry.icon = directoryIcon
  }
  else {
    if (extname === '.txt') {
      fileEntry.type = 'text'
    }
    else if (extname === '.yaml') {
      fileEntry.type = 'yaml'
    }
    // TODO: Map all possible file types (and symlinks)
    fileEntry.icon = fileIcon(fileEntry)
  }

  return fileEntry
}


module.exports = (baseURL, file) => {

  const nodes = file.split('/')
  let currentDepth = 0
  let maxDepth = 0

  function doIt (filename) {
    const stats = fs.lstatSync(filename)
    let info = {
      path: filename,
      name: path.basename(filename),
      directory: path.dirname(filename),
    }

    if (stats.isDirectory()) {
      currentDepth++

      info.type = 'directory'
      info.icon = directoryIcon
      info.children = fs
        .readdirSync(filename)
        .map(child => {
          if (child === nodes[currentDepth]) {
            return doIt(filename + '/' + child)
          }
          else {
            return createFileObject(child, filename)
          }
        })
    }
    else {
      currentDepth++
      info = createFileObject(info.name, info.directory)
      info.active = true
    }

    if (currentDepth > maxDepth) {
      maxDepth = currentDepth
    }

    currentDepth--
    return info
  }

  const returnObject = doIt(baseURL)

  returnObject.maxDepth = maxDepth

  return returnObject
}
