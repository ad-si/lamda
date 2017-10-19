module.exports = (contacts) => contacts.map(
  contact => {
    contact.email = contact.emails[0].value
    contact.emails = contact.emails
      .map(emailObject => emailObject.value)
      .join()

    if (contact.address) {
      contact.address = contact.address.country + ', ' + contact.prettyAddress
      delete contact.prettyAddress
    }

    return contact
  }
)
