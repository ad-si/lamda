import formatContact from '../modules/formatContact.js'
import loadContacts from '../modules/loadContacts.js'


export default function (request, response) {
  if (request.app.locals.lamda.filePaths?.length !== 1) {
    throw new Error('Contacts currently supports only exactly one file path')
  }
  const contactsPath = request.app.locals.lamda.filePaths[0]

  const keys = new Set()
  const errors = []

  // TODO: Get errors from loadContacts
  loadContacts(contactsPath)
    .then(contacts => {
      if (!contacts) return null

      return contacts
        .map(contactData => {
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
        })
    })
    .then(sortedContacts => {
      if (!sortedContacts) {
        response.render('contacts', {
          page: 'contacts',
          contacts: null,
        })
        return
      }

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
            numberOfMale / sortedContacts.length * 100,
          ),
          sortedKeys: [
            'name',
            'birthday',
            'emails',
            'phones',
            'links',
            'address',
          ],
        },
      )
    })
    .catch(error =>
      console.error(error.stack),
    )
}
