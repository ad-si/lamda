import birthdayReminder from './lib.js'


export default function (context, reminderSentCb) {

  // const getFromDropbox = lib[`${context.service.identifier}.api.dropbox`]
  // const contacts = await getFromDropbox('/Contacts')

  const contacts = [
    {name: 'Test 1'},
    {name: 'Test 2'},
  ]

  Promise
    .all(
      contacts
        .filter(birthdayReminder.hasBirthdayToday)
        .map(birthdayReminder.contactToMail)
        .map(birthdayReminder.sendBirthdayReminder),
    )
    .then(() => {
      reminderSentCb(undefined, {status: 'OK'})
    })
}
