const formatAddress = require('./formatAddress')

function addPlus (number) {
  number = String(number)
  return number[0] === '+'
    ? number
    : '+' + number
}

function addPhone (number, array) {
  if (typeof number === 'number' || typeof number === 'string') {
    array.push({
      type: 'mobile',
      number: number,
    })
  }
}


function combinePhoneNumbers (contact) {
  if (!Array.isArray(contact.phones)) {
    contact.phones = []
  }

  addPhone(contact.mobile, contact.phones)
  delete contact.mobile

  addPhone(contact.phone, contact.phones)
  delete contact.phone

  addPhone(contact.home, contact.phones)
  delete contact.home

  contact.phones = contact.phones
    .map(entry => {
      if (typeof entry === 'number') {
        entry = {number: entry}
      }
      entry.number = addPlus(entry.number)
      return entry
    })

  return contact
}

function unifyEmailAddresses (contact) {
  contact.emails = contact.emails || []

  if (contact.email) {
    if (typeof contact.email === 'string') {
      contact.emails.push({
        type: 'main',
        value: contact.email,
      })
    }
    else {
      contact.emails.push(contact.email)
    }
    delete contact.email
  }

  contact.emails = contact.emails.map(email => {
    if (typeof email === 'string') {
      return {
        value: email,
      }
    }
    return email
  })

  return contact
}

function addMapLink (contact) {
  const value = contact.address
  contact.mapLink = 'https://nominatim.openstreetmap.org/search?'

  if (value) {
    contact.mapLink += [
      value.country ? '&country=' + value.country : '',
      value.county ? '&county=' + value.county : '',
      value.city ? '&city=' + value.city : '',
      value.zip ? '&postalcode=' + value.zip : '',
      value.street
        ? '&street=' + [value.number, value.addition, value.street ].join(' ')
        : '',
    ].join('')

    contact.prettyAddress =
      (value.city ? value.city + ' ' : '') +
      (value.zip ? value.zip + ', ' : '') +
      (value.street ? value.street + ' ' : '') +
      (value.number ? value.number + ' ' : '') +
      (value.addition ? value.addition : '')
  }
}

function combineLinks (contact) {
  contact.links = contact.links || []

  const providers = {
    website: 'http://{{user}}',
    facebook: 'https://facebook.com/{{user}}',
    linkedin: 'https://linkedin.com/in/{{user}}',
    'google-plus': 'https://plus.google.com/u/0/+{{user}}',
    twitter: 'https://twitter.com/{{user}}',
    stackoverflow: 'https://stackoverflow.com/users/{{user}}',
    github: 'https://github.com/{{user}}',
    reddit: 'https://reddit.com/user/{{user}}',
    skype: 'skype:{{user}}?call',
    xing: 'https://xing.com/profile/{{user}}',
  }

  Object
    .keys(providers)
    .forEach(provider => {
      if (contact[provider]) {
        contact[provider] = String(contact[provider])
        contact.links.push({
          provider: provider,
          url: contact[provider].includes('/')
            ? contact[provider].startsWith('http')
              ? contact[provider]
              : 'http://' + contact[provider]
            : providers[provider].replace('{{user}}', contact[provider]),
        })
        delete contact.provider
      }
    }
  )
}

module.exports = (data) => {

  data.gender = data.gender || ''

  if (data.email && typeof data.email !== 'string') {
    data.email = data.email.value
  }
  if (!data.name) {
    data.name = data.firstname + ' ' + data.lastname
  }
  if (typeof data.fax === 'number') {
    data.fax = '+' + data.fax
  }
  if (data.birthday) {
    data.birthday = new Date(data.birthday)
    data.age = String(
      new Date(new Date() - data.birthday)
        .toISOString()
        .substr(0, 4) - 1970
    )
  }

  if (data.address) {
    data.address = formatAddress(data.address)
  }
  data = combinePhoneNumbers(data)
  data = unifyEmailAddresses(data)

  addMapLink(data)
  combineLinks(data)

  return data
}
