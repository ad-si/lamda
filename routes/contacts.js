const path = require('path')

const formatContact = require('../modules/formatContact')
const loadContacts = require('../modules/loadContacts')


module.exports = (request, response) => {

  const contactsPath = path.join(request.app.locals.basePath, 'contacts')
  const keys = new Set()
  const errors = []

  loadContacts(contactsPath)
    .then(contacts => contacts.map(contactData => {
      if (!contactData) return undefined

      contactData = formatContact(contactData)

      Object
        .keys(contactData)
        .forEach(key => keys.add(key))

      return contactData
    })
    .sort((previous, current) => {
      return previous && current && previous.name && current.name
        ? previous.name.localeCompare(current.name)
        : undefined
    }))
    .then(sortedContacts => {
      const numberOfMale = sortedContacts
        .filter(contact => contact && contact.gender === 'male')
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
            numberOfMale / sortedContacts.length * 100
          ),
          sortedKeys: [
            'name',
            'birthday',
            'emails',
            'phones',
            'links',
            'address',
          ],
        }
      )
    })
    .catch(error =>
      // eslint-disable-next-line no-console
      console.error(error.stack)
    )
}
