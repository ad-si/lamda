import path from 'path'
import json2csv from 'json2csv'

import loadContacts from '../modules/loadContacts.js'
import getFields from '../modules/getFields.js'
import formatForCsv from '../modules/formatForCsv.js'


export default function (request, response) {

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
        conversionCallback,
      )
    })
    .catch(error =>
      // eslint-disable-next-line no-console
      console.error(error.stack),
    )
}
