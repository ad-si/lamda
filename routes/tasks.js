const path = require('path')

const fsp = require('fs-promise')
const yaml = require('js-yaml')
const momentFromString = require('@datatypes/moment').default


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
        // See https://github.com/adius/eventlang-reduce for explanation
        const reducedObject = {}
        for (const timestamp in fileObject.data) {
          if (!fileObject.data.hasOwnProperty(timestamp)) continue
          Object.assign(reducedObject, fileObject.data[timestamp])
        }

        const dateStringFromFilename = path.basename(
          fileObject.relativePath,
          '.yaml'
        )
        reducedObject.creationDate = momentFromString(dateStringFromFilename)
        reducedObject.id = fileObject.relativePath
        reducedObject.absoluteFilePath = fileObject.absolutePath

        // console.log(reducedObject.creationDate)

        return reducedObject
      })
      // .filter(reducedObject => !reducedObject.completed)
      .sort(alphabeticallyBy('creationDate', 'descending'))
    )
    .then(tasks => {
      response.render('index', {
        page: 'tasks',
        tasks: tasks,
      })
    })
    // eslint-disable-next-line no-console
    .catch(error => console.error(error))
}
