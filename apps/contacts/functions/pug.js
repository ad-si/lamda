const util = require('util')
const path = require('path')

const lib = require('lib')
const pug = require('pug')

const formatContact = require('../modules/formatContact')

const compiledTemplate = pug.compileFile(
  path.resolve(__dirname, '../views/contacts.pug')
)


async function loadFiles (context) {
  const getFromDropbox = lib[`${context.service.identifier}.api.dropbox`]
  const contacts = await getFromDropbox('/Contacts')
  return contacts
}


async function getContacts (context, counter) {
  try {
    const contacts = await loadFiles(context)
    return contacts
  }
  catch (error) {
    counter -= 1

    console.error(`Try failed. Try ${counter} more times.`)
    console.error(util.inspect(error, {colors: true, depth: null}))

    return counter
      ? getContacts(context, counter)
      : 'An error occured'
  }
}


async function getHtml (context) {
  const counter = 10
  const contacts = await getContacts(context, counter)
  // const contacts = false
  const keys = new Set()


  if (!contacts) {
    return compiledTemplate({
      page: 'contacts',
      contacts: null,
    })
  }

  const sortedContacts = contacts
    .map(formatContact)
    .map(contactData => {
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

  const numberOfMale = sortedContacts
    .filter(contact => contact && contact.gender === 'male')
    .length

  return compiledTemplate(
    {
      page: 'contacts',
      contacts: sortedContacts,
      errors: null,
      availableKeys: Array.from(keys),
      numberOfMale,
      percentageOfMale: Math.trunc(numberOfMale / sortedContacts.length * 100),
      sortedKeys: [
        'name',
        'gender',
        'birthday',
        'emails',
        'phones',
        'links',
        'address',
      ],
    }
  )
}


/**
* View all contacts in a table
* @returns {buffer}
*/
module.exports = (context, htmlRetrievedCb) => {
  // Returning HTML is not yet supported for async functions
  // therefore the callback variant is used
  // (and stdlib requries the variable to be called `callback`)
  getHtml(context)
    .then(html => {
      htmlRetrievedCb(
        null,
        Buffer.from(html),
        {'Content-Type': 'text/html; charset=utf-8'},
      )
    })
    .catch(error => htmlRetrievedCb(error))
}
