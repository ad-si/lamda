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

function normalizeTask (task) {
  if (!task.creationDate) task.creationDate = task.creation_date
  if (!task.creationDate) task.creationDate = task.created_at
  if (task.creationDate) {
    task.creationDate = Date.parse(task.creationDate)
    if (!Number.isNaN(task.creationDate)) {
      task.creationDateFormatted = new Date(task.creationDate)
        .toISOString()
        .substr(0, 10)
    }
  }

  if (!task.dueDate) task.dueDate = task.due
  if (!task.dueDate) task.dueDate = task.due_to
  if (!task.dueDate) task.dueDate = task.due_date
  if (task.dueDate) {
    task.dueDate = Date.parse(task.dueDate)
    if (!Number.isNaN(task.dueDate)) {
      task.dueDateFormatted = new Date(task.dueDate)
        .toISOString()
        .substr(0, 10)
    }
  }

  const stateIsInferable =
    (
      task.hasOwnProperty('completed') ||
      task.hasOwnProperty('obsolete')
    ) &&
    !task.hasOwnProperty('state')

  if (stateIsInferable) {
    task.state = task.completed || task.obsolete
      ? 'closed'
      : 'open'
  }
  delete task.completed

  if (task.hasOwnProperty('state')) {
    task.isOpen = task.state === 'open'
    task.isClosed = task.state === 'closed'
  }

  return task
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
  const fileListPromises = request.app.locals.directories
    .map(directoryPath => fsp
        .readdir(directoryPath)
        .then(fileNames => fileNames
          .map(fileName => path.join(directoryPath, fileName))
        )
    )

  // const database = new Ybdb({
  //   storagePath: path.join(__dirname, 'fixtures/contact-files'),
  // })
  //
  // database
  //   .init()
  //   .then(initializedDb => initializedDb
  //     .getState()
  //     .Tasks

  Promise
    .all(fileListPromises)
    .then(fileLists => {
      console.log(fileLists)

      const filePaths = [].concat.apply([], fileLists)
      return filePaths.filter(filePath => /\.yaml$/i.test(filePath))
    })
    .then(filteredFilePaths => {
      const fileObjectPromises = filteredFilePaths
        .map(filePath => {
          return fsp
            .readFile(filePath, 'utf-8')
            .then(content => ({
              absoluteFilePath: filePath,
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
          fileObject.absoluteFilePath,
          '.yaml'
        )

        try {
          reducedObject.creationDate = momentFromString(dateStringFromFilename)
        }
        catch (error) {
          console.error(
            `"${fileObject.absoluteFilePath}" has no valid file name`
          )
          reducedObject.creationDate = null
        }

        reducedObject.id = fileObject.absoluteFilePath

        return normalizeTask(reducedObject)
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
