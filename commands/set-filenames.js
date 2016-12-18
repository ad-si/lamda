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
    const tasksPath = path.resolve(options.directory)
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
          const fileName = new Date(fileObject.data.created_at)
            .toISOString()
            .replace(/:/g, '')
            .replace(/Z$/i, '')
          const absoluteTargetPath = path.join(tasksPath, `${fileName}.yaml`)
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
