const fs = require('fs')
const path = require('path')
const userHome = require('user-home')
const projectDirectory = __dirname
const publicDirectory = path.join(projectDirectory, 'public')
const merge = require('deepmerge')
const yaml = require('js-yaml')


const defaults = {
  port: 3000,
  directory: path.join(userHome, 'Tasks'),
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

const configDirectory = path.join(userHome, '.config/lamda')
let config = {}

config = merge(config, defaults)

try {
  const fileContent = fs.readFileSync(path.join(configDirectory, 'lamda.yaml'))
  const lamdaConfig = yaml.load(fileContent)
  config = merge(config, lamdaConfig.tasks)
}
catch (error) {
  if (!error.message.includes('no such file or directory')) console.error(error)
}

try {
  const fileContent = fs.readFileSync(path.join(configDirectory, 'tasks.yaml'))
  const tasksConfig = yaml.load(fileContent)
  config = merge(config, tasksConfig)
}
catch (error) {
  if (!error.message.includes('no such file or directory')) console.error(error)
}

module.exports = config
