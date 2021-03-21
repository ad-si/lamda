import fs from 'fs'
import url from 'url'
import path from 'path'

import fileIcon from '@lamdahq/file-formats'


const dirname = path.dirname(url.fileURLToPath(import.meta.url))
const directoryIcon = fs.readFileSync(
  path.resolve(dirname, '../public/images/directory.svg'),
  'utf-8',
)


function createFileObject (fileName, dirName) {
  const stats = fs.lstatSync(path.join(
    dirName, fileName,
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


export default function (baseURL, file) {

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

  // TODO: Finish implementationimport// const fsp from 'fs-promise'
  //
  // function doItAsync (filename) {
  //   const info = {
  //     path: filename,
  //     name: path.basename(filename),
  //     directory: path.dirname(filename),
  //   }
  //
  //   return fsp
  //     .lstat(filename)
  //     .then(stats => {
  //       if (stats.isDirectory()) {
  //         currentDepth++
  //
  //         return fsp
  //           .readdir(filename)
  //           .then(children => {
  //             info.type = 'directory'
  //             info.icon = directoryIcon
  //             info.children = children
  //               .map(child => {
  //                 if (child === nodes[currentDepth]) {
  //                   return doIt(filename + '/' + child)
  //                 }
  //                 else {
  //                   return createFileObject(child, filename)
  //                 }
  //               })
  //           })
  //
  //       }
  //       else {
  //         currentDepth++
  //         info = createFileObject(info.name, info.directory)
  //         info.active = true
  //       }
  //
  //       if (currentDepth > maxDepth) {
  //         maxDepth = currentDepth
  //       }
  //
  //       currentDepth--
  //       return info
  //     })
  // }

  const returnObject = doIt(baseURL)

  returnObject.maxDepth = maxDepth

  return returnObject
}
