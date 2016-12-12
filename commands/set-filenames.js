const path = require('path')
const fsp = require('fs-promise')
const yaml = require('js-yaml')

module.exports = {
  command: 'set-filenames [directory]',
  desc: 'Use `creationDate` key of yaml file to set filenames of tasks',
  builder: {
    directory: {
      default: '.',
    },
  },
  handler: (options) => {
    const tasksPath = path.resolve(options.dir)
    fsp
      .readdir(tasksPath)
      .then(paths => paths
        .filter(relativePath => /\.yaml$/.test(relativePath))
      )
      .then(paths => {
        const fileObjectPromises = paths
          .map(filePath => {
            const absolutePath = path.join(tasksPath, filePath)
            return fsp
              .readFile(absolutePath)
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
          const fileName = fileObject.data.created_at
            .replace(/:/g, '')
            .replace(/Z$/i, '')
          const absoluteTargetPath = path.join(tasksPath, fileName)
          return fsp.move(fileObject.absolutePath, absoluteTargetPath)
        })
      )
      .then(renamePromises => Promise.all(renamePromises))
      .then(() => {
        console.info('Files were renamed ✔')
      })
      .catch(error => {
        console.error(error)
      })
  },
}
