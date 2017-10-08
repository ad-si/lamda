const Dropbox = require('dropbox')
const sendgrid = require('@sendgrid/mail')
const yaml = require('js-yaml')
const {stripIndent} = require('common-tags')
const util = require('util')


function getMonthAndDay (date) {
  if (typeof date.toISOString !== 'function') return ''

  return date
    .toISOString()
    .slice(5, 10)
}


function getAge (birthDate) {
  // Taken from https://stackoverflow.com/a/7091965/1850340

  if (typeof birthDate.toISOString !== 'function') return 0

  const now = new Date()
  const age = now.getFullYear() - birthDate.getFullYear()
  const monthDiff = now.getMonth() - birthDate.getMonth()

  if (
    monthDiff < 0 ||
    (
      monthDiff === 0 &&
      now.getDate() < birthDate.getDate()
    )
  ) {
    age--
  }

  return age
}


function getMail ({recipient, name, age}) {
  const text = stripIndent `
    Hi ${name},
    Ich wünsch dir alles Gute zum Geburtstag! 😁
    Hoffe du feirst auch entsprechend!? 🎊🎉
    Liebe Grüße!
  `
  const mail = {
    to: recipient,
    from: 'birthday-reminder@stdlib.com',
    subject: `${name} turns ${age} years old today`,
    text,
    html: text.replace(/\n/g, '<br>'),
    trackingSettings: {
      openTracking: {
        enable: false,
      },
    },
  }

  return mail
}


function sendBirthdayReminder (mail) {
  sendgrid.setApiKey(process.env.sendgridApiKey)
  return sendgrid.send(mail)
}


function isYamlEntry (entry) {
  return entry['.tag'] === 'file' &&
    entry.name.endsWith('.yaml')
}


function fileToJson (file) {
  const fileContent = Buffer
    .from(file.fileBinary, 'binary')
    .toString()

  return yaml.safeLoad(fileContent)
}


function hasBirthdayToday (contact) {
  if (!contact.birthday) return

  const now = new Date()

  return getMonthAndDay(contact.birthday) === getMonthAndDay(now)
}


function contactToMail (contact) {
  const name = contact.name ||
    `${contact.firstname} ${contact.lastname}`
  const age = getAge(contact.birthday)

  return getMail({
    recipient: process.env.recipientEmailAddress,
    name,
    age,
  })
}


async function loadFiles (context) {
  const dropbox = new Dropbox({
    accessToken: process.env.dropboxAccessToken,
  })
  const response = await dropbox.filesListFolder({path: '/Contacts'})

  if (response.has_more) {
    throw new Error('Not all files were loaded')
  }

  const files = await Promise.all(
    response.entries
      .filter(isYamlEntry)
      .map(entry => dropbox
        .filesDownload({path: entry.path_display})
      )
  )

  console.info(`Found ${files.length} contacts`)

  return await Promise.all(
    files
      .map(fileToJson)
      .filter(hasBirthdayToday)
      .map(contactToMail)
      .map(sendBirthdayReminder)
  )
}


async function checkAndSend (context, counter) {
  try {
    await loadFiles(context)
    return 'All contacts have been checked'
  }
  catch (error) {
    console.error(`Try number ${counter} failed`)
    console.error(
      util.inspect(error, {colors: true, depth: null})
    )

    if (counter) {
      counter -= 1
      return checkAndSend(context, counter)
    }
    else {
      return 'An error occured'
    }
  }
}


/**
* Checks which contacts have birthday and sends you a reminder
* @returns {string}
*/
module.exports = async (context) => {
  let counter = 10
  return await checkAndSend(context, counter)
}
