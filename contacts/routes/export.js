const path = require('path')
const json2csv = require('json2csv')
const loadContacts = require('../modules/loadContacts')
const getFields = require('../modules/getFields')
const formatForCsv = require('../modules/formatForCsv')


module.exports = (request, response) => {

  const contactsPath = path.join(request.app.locals.basePath, 'contacts')

  if (request.query.format !== 'csv') {
    response.sendStatus(404)
    return
  }

  function conversionCallback (error, csv) {
    if (error) throw error

    response.attachment('contacts.csv')
    response.send(csv.replace(/(,?)null(,?)/g, '$1$2'))
  }

  return loadContacts(contactsPath)
    .then(contacts => {
      json2csv(
        {
          data: formatForCsv(contacts),
          fields: getFields(contacts),
        },
        conversionCallback
      )
    })
    .catch(error =>
      // eslint-disable-next-line no-console
      console.error(error.stack)
    )
}
