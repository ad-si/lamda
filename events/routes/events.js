const path = require('path')
const userHome = require('user-home')
const Interval = require('@datatypes/interval').default

const getDays = require('../modules/getDays')
const loadEvents = require('../modules/loadEvents')
const loadBirthdays = require('../modules/loadBirthdays')
const splitEvents = require('../modules/splitEvents')
const addEmptyEvents = require('../modules/addEmptyEvents')
const toDays = require('../modules/toDays')
const toDaysWithLanes = require('../modules/toDaysWithLanes')
const addStyleInformation = require('../modules/addStyleInformation')

// TODO: Implement displaying in local time
// const displayInUTC = true
const eventsDirectory = path.join(userHome, 'Events')

// Uncomment for testing
// eventsDirectory = path.resolve(__dirname, '../test/sequential/')

module.exports = (request, response, done) => {
  return Promise
    .all([
      loadEvents(eventsDirectory, request),
      loadBirthdays(),
    ])
    .then(results => {
      const [events, birthdays] = results
      const page = 'events'

      if (!events && !birthdays) {
        response.render('index', {page})
        return
      }

      const days = getDays()

      function notInRange (event) {
        const eventStart = event.interval.start.lowerLimit
        const eventEnd = event.interval.end.upperLimit

        return eventEnd > days.startMoment.lowerLimit ||
          eventStart < days.endMoment.upperLimit
      }

      function addInterval (event) {
        if (!event.hasOwnProperty('interval')) {
          event.interval = new Interval(event.time.intervalString)
        }
        return event
      }

      const daysWithEvents = []
        .concat(events)
        .concat(birthdays)
        .filter(event =>
          event !== null &&
          event !== undefined
        )
        .map(addInterval)
        .sort((eventA, eventB) =>
          eventA.interval.start.lowerLimit -
          eventB.interval.end.lowerLimit
        )
        .filter(notInRange)
        .reduce(splitEvents, [])
        .reduce(toDays, days)
        .map(toDaysWithLanes)
        .map(addEmptyEvents)
        .map(addStyleInformation)

      response.render('index', {
        page: 'events',
        days: daysWithEvents,
      })
    })
    .catch(done)
}
