const fsp = require('fs-promise')
const path = require('path')

const yaml = require('js-yaml')
const userHome = require('user-home')
const capitalize = require('capitalize')


const formatContact = require('./formatContact')


module.exports = (request, response) => {

	const contactsPath = path.join(request.app.locals.basePath, 'contacts')
	const keys = new Set()
	const encoding = 'utf-8'
	const yamlRegex = /\.yaml$/i
	const errors = []

	fsp
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
		.then(fileObjects => fileObjects
			.map(fileObject => {
				try {
					return yaml.safeLoad(fileObject.fileContent, {
							filename: fileObject.fileName
						}
					)
				}
				catch (error) {
					error.message = capitalize(error.message)
					errors.push(error)
					console.error(error.message)
					return null
				}
			})
			.map(contactData => {
				if (contactData) {
					Object
						.keys(contactData)
						.forEach(key => keys.add(key))

					return formatContact(contactData)
				}
			})
			.sort((previous, current) => {
				if (previous && current && previous.name && current.name)
					return previous.name.localeCompare(current.name)
			})
		)
		.then(sortedContacts => {
			const numberOfMale = sortedContacts
				.filter(a => a && a.gender === 'male')
				.length

			response.render(
				'contacts',
				{
					page: 'contacts',
					contacts: sortedContacts,
					errors,
					availableKeys: Array.from(keys),
					numberOfMale,
					percentageOfMale: Math.trunc(
						numberOfMale/sortedContacts.length * 100
					),
					sortedKeys: [
						'name',
						'birthday',
						'email',
						'mobile',
						'website',
						'facebook',
						'address'
					]
				}
			)
		})
		.catch(error => console.error(error.stack))
}
