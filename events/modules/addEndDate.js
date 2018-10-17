const momentFromString = require('@datatypes/moment')

module.exports = (events) => events
  .map(event => {
    event.endDate = momentFromString(event.startDate)
      .add(event.duration, 'minutes')
      .toDate()

    return event
  })
  .sort((previous, current) => previous.startDate - current.startDate)
