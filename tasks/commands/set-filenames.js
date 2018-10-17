const path = require('path')
const fsp = require('fs-promise')
const yaml = require('js-yaml')
const Instant = require('@datatypes/moment').Instant

module.exports = {
  command: 'set-filenames [directory]',
  desc: 'Use `creationDate` key of yaml files to update their filenames',
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
        .map((fileObject, index) => {
          const creationDate = fileObject.data.created_at ||
            fileObject.data.createdAt ||
            fileObject.data.creationDate ||
            fileObject.data.creation

          const fileName = creationDate
            ? new Instant(creationDate)
              .toISOString()
              .replace(
                // TODO: Add flag for changing precision
                // /T(\d{2}):(\d{2}).+$/i,
                // `T$1$2_${index.toString(36)}`
                /T(\d{2}):(\d{2}):(\d{2}).+$/i,
                `T$1$2$3_${index.toString(36)}`
              )
            : `0000-00-00_${index.toString(36)}`

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
