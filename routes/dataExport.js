const path = require('path')
const json2csv = require('json2csv')

const loadContacts = require('../modules/loadContacts')


module.exports = (request, response) => {

	const contactsPath = path.join(request.app.locals.basePath, 'contacts')

	if (request.query.format !== 'csv') {
		response.sendStatus(404)
		return
	}

	return loadContacts(contactsPath)
		.then(contacts => json2csv({data: contacts}, (error, csv) => {
			if (error)
				throw error

			response.attachment('contacts.csv')
			response.send(csv)
		}))
		.catch(error => console.error(error.stack))
}
