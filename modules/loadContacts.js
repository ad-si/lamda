const path = require('path')
const fsp = require('fs-promise')
const yaml = require('js-yaml')

const encoding = 'utf-8'
const yamlRegex = /\.yaml$/i
const errors = []

module.exports = (contactsPath) => fsp
	.readdir(contactsPath)
	.then(fileNames => fileNames
		.filter(fileName => yamlRegex.test(fileName))
		.map(fileName => fsp
			.readFile(path.join(contactsPath, fileName), encoding)
			.then(fileContent => ({
				fileName: fileName,
				fileContent: fileContent,
			}))
		)
	)
	.then(contactFilePromises => Promise.all(contactFilePromises))
	.then(fileObjects => fileObjects.map(fileObject => {
		try {
			const contact = yaml.safeLoad(fileObject.fileContent, {
					filename: fileObject.fileName
				}
			)
			contact.id = fileObject.fileName.slice(0,-5)
			return contact
		}
		catch (error) {
			error.message = capitalize(error.message)
			errors.push(error)
			console.error(error.message)
			return null
		}
	}))
