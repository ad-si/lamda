const birthdayReminder = require('./birthday_reminder.js')


module.exports = (context, callback) => {

  console.log(context)

  // const getFromDropbox = lib[`${context.service.identifier}.api.dropbox`]
  // const contacts = await getFromDropbox('/Contacts')

  const contacts = [
    {name: 'Test 1'},
    {name: 'Test 2'},
  ]

  Promise
    .all(
      contacts
        .filter(hasBirthdayToday)
        .map(contactToMail)
        .map(sendBirthdayReminder)
    )
    .then(() => {
      callback(undefined, {status: 'OK'})
    })
}
