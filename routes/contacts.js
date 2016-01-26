const fsp = require('fs-promise')
const path = require('path')

const yaml = require('js-yaml')
const userHome = require('user-home')

const formatContact = require('./formatContact')

global.basePath = global.basePath || userHome
const contactsPath = path.join(global.basePath, 'contacts')


module.exports = (request, response) => {

	const keys = new Set()
	const encoding = 'utf-8'
	const yamlRegex = /\.yaml$/i

	fsp
		.readdir(contactsPath)
		.then(fileNames => fileNames
			.filter(fileName => yamlRegex.test(fileName))
			.map(fileName => fsp.readFile(
				path.join(contactsPath, fileName),
				encoding
			))
		)
		.then(contactFilePromises => Promise.all(contactFilePromises))
		.then(contactFiles => contactFiles
			.map(contactFile => yaml.safeLoad(contactFile))
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
			response.render(
				'contacts',
				{
					page: 'contacts',
					contacts: sortedContacts,
					availableKeys: Array.from(keys),
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
}
