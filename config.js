const fs = require('fs')
const path = require('path')
const userHome = require('user-home')
const projectDirectory = __dirname
const publicDirectory = path.join(projectDirectory, 'public')
const merge = require('deepmerge')
const yaml = require('js-yaml')
const untildify = require('untildify')

const configDirectory = path.join(userHome, '.config/lamda')
const defaults = {
  port: 3000,
  directories: [
    path.join(userHome, 'Tasks'),
  ],
  faviconPath: path.join(publicDirectory, 'images/favicon.ico'),
  views: [
    {
      name: 'Overdue',
      filter: task =>
        !task.completed && task.dueDate
          ? task.dueDate < new Date()
          : false,
      sort: (taskA, taskB) =>
        taskA.dueDate && taskB.dueDate
          ? taskA.dueDate > taskB.dueDate
          : 0,
      map: task => task,
    },
  ],
}


function normalizeConfig (configObject) {
  if (configObject.hasOwnProperty('directory')) {
    configObject.directories = configObject.directories || []
    configObject.directories.push(configObject.directory)
    delete configObject.directory
  }
  // Delete duplicates
  configObject.directories = Array.from(new Set(
    configObject.directories
      .map(directoryPath => untildify(directoryPath))
  ))
  return configObject
}


let config = {tasks: defaults}

try {
  const fileContent = fs.readFileSync(path.join(configDirectory, 'lamda.yaml'))
  const lamdaConfig = yaml.load(fileContent)
  config = merge(
    config,
    {lamda: lamdaConfig},
    {arrayMerge: (sourceArray, destArray) => destArray}
  )
}
catch (error) {
  if (!error.message.includes('no such file or directory')) console.error(error)
}

try {
  const fileContent = fs.readFileSync(path.join(configDirectory, 'tasks.yaml'))
  const tasksConfig = yaml.load(fileContent)
  config = merge(
    config,
    {tasks: tasksConfig},
    {arrayMerge: (sourceArray, destArray) => destArray}
  )
}
catch (error) {
  if (!error.message.includes('no such file or directory')) console.error(error)
}

module.exports = normalizeConfig(config.tasks)
