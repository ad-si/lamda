'use strict'

const path = require('path')

const fsp = require('fs-promise')
const yaml = require('js-yaml')
const userHome = require('user-home')
const moment = require('@datatypes/moment')
const Day = moment.Day

const yamlRegex = /\.ya?ml$/i
const contactsDirectory = path.join(userHome, 'Contacts')


module.exports = () => fsp
  .readdir(contactsDirectory)
  .then(filePaths => filePaths
    .filter(filePath => yamlRegex.test(filePath))
    .map(filePath => fsp
      .readFile(path.join(contactsDirectory, filePath))
      .then(fileContent => yaml.safeLoad(fileContent, {filename: filePath}))
      .then(contact => {
        if (!contact.birthday) return

        if (!(contact.birthday instanceof Date)) {
          contact.birthday = new Date(contact.birthday)
        }
        contact.birthday.setUTCFullYear(
          new Date()
            .getUTCFullYear()
        )

        contact.title = contact.name ||
          (contact.firstname + ' ' + contact.lastname)

        // TODO: Display birthdays not just for current year
        // TODO: Allow partial birthday (e.g. ????-04-23)
        contact.time = new Day(
          contact.birthday
            .toJSON()
            .slice(0, 10)
        )
        return contact
      })
      .catch(error => {
        console.error('An error occured for a contact')
        console.error(error.stack)
        return
      })
    )
  )
  .then(filePromises => Promise.all(filePromises))
  .then(contacts => contacts.filter(contact => contact))
  .catch(error => {
    if (!error.message.includes('no such file or directory')) {
      throw error
    }
    console.error(error.stack)
    return null
  })
