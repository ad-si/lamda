const path = require('path')

const fsp = require('fs-promise')
const yaml = require('js-yaml')


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


module.exports = function (request, response) {
  const tasksPath = path.join(request.app.locals.basePath, 'tasks')

  return fsp
    .readdir(tasksPath)
    .then(filePaths => {
      const fileContentPromises = filePaths
        .filter(filePath => /\.yaml$/i.test(filePath))
        .map(filePath => fsp.readFile(
          path.join(tasksPath, filePath),
          'utf-8'
        ))

      return Promise.all(fileContentPromises)
    })
    .then(files => files
      .map(fileContent => yaml.safeLoad(fileContent))
      .map(eventTask => {
        // See https://github.com/adius/eventlang-reduce for explanation
        const reducedObject = {}
        for (const timestamp in eventTask) {
          if (!eventTask.hasOwnProperty(timestamp)) continue
          Object.assign(reducedObject, eventTask[timestamp])
        }

        reducedObject.creationDate = new Date(
          Object
            .keys(eventTask)
            .sort()[0]
        )

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
