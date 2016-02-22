const fsp = require('fs-promise')
const path = require('path')

const yaml = require('js-yaml')
const userHome = require('user-home')
const capitalize = require('capitalize')

const formatContact = require('../modules/formatContact')
const loadContacts = require('../modules/loadContacts')


module.exports = (request, response) => {

	const contactsPath = path.join(request.app.locals.basePath, 'contacts')
	const keys = new Set()
	const errors = []

	loadContacts(contactsPath)
		.then(contacts => contacts.map(contactData => {
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
		}))
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
