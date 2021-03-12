import path from 'path'
import fsp from 'fs-promise'
import yaml from 'js-yaml'
// import capitalize from 'capitalize'

const encoding = 'utf-8'
const yamlRegex = /\.yaml$/i
// const errors = []

export default function (contactsPath) {
  return fsp
    .readdir(contactsPath)
    .then(fileNames => fileNames
      .filter(fileName => yamlRegex.test(fileName))
      .map(fileName => fsp
        .readFile(path.join(contactsPath, fileName), encoding)
        .then(fileContent => ({
          fileName: fileName,
          fileContent: fileContent,
        })),
      ),
    )
    .then(contactFilePromises => Promise.all(contactFilePromises))
    .then(fileObjects => fileObjects
      .map(fileObject => {
        const contact = yaml.load(
          fileObject.fileContent,
          {
            filename: fileObject.fileName,
          },
        )
        contact.id = fileObject.fileName.slice(0, -5)
        return contact
      }),
    )
    .catch(error => {
      if (!error.message.includes('no such file or directory')) {
        throw error
      }
      // error.message = capitalize(error.message)
      // errors.push(error)
      console.error(error.stack)
      return null
    })
}
