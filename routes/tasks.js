const path = require('path')

const fsp = require('fs-promise')
const yaml = require('js-yaml')
const momentFromString = require('@datatypes/moment').default
const defaultConfig = require('../config')


function alphabeticallyBy (attribute, order) {
  let factor
  if (order === 'ascending' || !order) factor = 1
  else if (order === 'descending') factor = -1
  else throw new Error(order + ' is not allowed here.')

  return function (itemA, itemB) {
    const first = itemA[attribute]
    const second = itemB[attribute]

    if (first < second) return -factor
    if (first > second) return factor
    return 0
  }
}

// function getKeyToDateMap (eventMap, reducedObject) {
//   const timestamps = Object.keys(reducedObject)
//   const keyToDateMap = new Map()
//
//   timestamps.forEach(timestamp => {
//     Object
//       .keys(reducedObject[timestamp])
//       .forEach(key => {
//         keyToDateMap.set(key, timestamp)
//       })
//   })
//
//   return keyToDateMap
// }


module.exports = (request, response) => {
  const tasksPath = request.app.locals.basePath

  return fsp
    .readdir(tasksPath)
    .then(filePaths =>
      filePaths.filter(filePath => /\.yaml$/i.test(filePath))
    )
    .then(filteredFilePaths => {
      const fileObjectPromises = filteredFilePaths
        .map(filePath => {
          const absolutePath = path.join(tasksPath, filePath)
          return fsp
            .readFile(absolutePath, 'utf-8')
            .then(content => ({
              relativePath: filePath,
              absolutePath,
              content,
            }))
        })

      return Promise.all(fileObjectPromises)
    })
    .then(fileObjects => fileObjects
      .map(fileObject => {
        fileObject.data = yaml.safeLoad(fileObject.content)
        return fileObject
      })
      .map(fileObject => {
        const reducedObject = {}
        // Check if all keys are timestamps
        const keysAreTimestamps = Object
          .keys(fileObject.data)
          .every(key => {
            const keyString = String(key)
            return keyString.length > 2 &&
              String(new Date(keyString)) !== 'Invalid Date'
          })

        if (keysAreTimestamps) {
          // See https://github.com/adius/eventlang-reduce for explanation
          for (const timestamp in fileObject.data) {
            if (!fileObject.data.hasOwnProperty(timestamp)) continue
            Object.assign(reducedObject, fileObject.data[timestamp])
          }
        }
        else {
          Object.assign(reducedObject, fileObject.data)
        }

        const dateStringFromFilename = path.basename(
          fileObject.relativePath,
          '.yaml'
        )
        reducedObject.creationDate = momentFromString(dateStringFromFilename)
        reducedObject.id = fileObject.relativePath
        reducedObject.absoluteFilePath = fileObject.absolutePath

        return reducedObject
      })
      // .filter(reducedObject => !reducedObject.completed)
      .sort(alphabeticallyBy('creationDate', 'descending'))
    )
    .then(tasks => {
      response.render('index', {
        page: 'tasks',
        tasks,
        tasksString: JSON.stringify(tasks),
        defaultConfigString: JSON
          .stringify(
            defaultConfig,
            (key, value) => typeof value === 'function'
              ? value.toString()
              : value,
            2
          )
          // Include functions as real functions and not as strings
          // Arrow functions
          .replace(/\:\s*\"(.+?)\=\>(.+?)\"\s*(\,|\})/g, ':$1 => $2$3')
          // Normal functions
          .replace(/\:\s*"function(.+?)"\s*(,|})/g, ':function$1$2')
          .replace(/\\n/g, '\n'),
      })
    })
    // eslint-disable-next-line no-console
    .catch(error => console.error(error))
}
