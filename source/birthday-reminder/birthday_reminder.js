const lib = require('lib')
const sendgrid = require('@sendgrid/mail')
const {stripIndent} = require('common-tags')


function getMonthAndDay (date) {
  if (typeof date.toISOString !== 'function') return ''

  return date
    .toISOString()
    .slice(5, 10)
}


function getAge (birthDate) {
  // Taken from https://stackoverflow.com/a/7091965/1850340

  if (typeof birthDate === 'string') {
    const parsed = Date.parse(birthDate)
    if (parsed) birthDate = new Date(parsed)
    else return 0
  }

  if (typeof birthDate.toISOString !== 'function') return 0

  const now = new Date()
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear()
  const monthDiff = now.getUTCMonth() - birthDate.getUTCMonth()

  if (
    monthDiff < 0 ||
    (
      monthDiff === 0 &&
      now.getUTCDate() < birthDate.getUTCDate()
    )
  ) {
    age -= 1
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
    from: {
      name: 'Birthday Reminder',
      email: 'birthday-reminder@stdlib.com',
    },
    to: recipient,
    replyTo: {
      email: `${name}@example.com`,
      name,
    },
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


async function sendBirthdayReminder (mail) {
  console.info(`Try to send birthday reminder for "${mail.replyTo.name}"`)
  sendgrid.setApiKey(process.env.sendgridApiKey)
  await sendgrid.send(mail)
  return `Birthday reminder for "${mail.replyTo.name}" was sent`
}


function hasBirthdayToday (contact) {
  const birthdayUnix = Date.parse(contact.birthday)
  if (!birthdayUnix) return
  return getMonthAndDay(new Date(birthdayUnix)) ===
    getMonthAndDay(new Date())
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
