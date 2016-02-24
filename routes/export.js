'use strict'

const path = require('path')
const json2csv = require('json2csv')
const loadContacts = require('../modules/loadContacts')


module.exports = (request, response) => {

	const contactsPath = path.join(request.app.locals.basePath, 'contacts')
	const csvFieldsMap = {}

	if (request.query.format !== 'csv') {
		response.sendStatus(404)
		return
	}

	function conversionCallback (error, csv) {
		if (error)
			throw error

		response.attachment('contacts.csv')
		response.send(csv.replace(/(,?)null(,?)/g, '$1$2'))
	}

	return loadContacts(contactsPath)
		.then(contacts => {
			const csvFieldsMap = []
			contacts.forEach(contact => {
				Object
					.keys(contact)
					.forEach(key => csvFieldsMap[key] = true)
			})

			json2csv(
				{
					data: contacts,
					fields: Object.keys(csvFieldsMap)
				},
				conversionCallback
			)
		})
		.catch(error => console.error(error.stack))
}
