const path = require('path')
const userHome = require('user-home')

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
  loadEvents(eventsDirectory, request)
    .then(events => loadBirthdays()
      .then(() => {
        // events = events.concat(contacts)
        return events
      })
    )
    .then(events => {

      const days = getDays()

      function notInRange (event) {
        const eventStart = event.interval.start.lowerLimit
        const eventEnd = event.interval.end.upperLimit

        return eventEnd > days.startMoment.lowerLimit ||
          eventStart < days.endMoment.upperLimit
      }

      const daysWithEvents = events
        .filter(event => event != null)
        .sort((eventA, eventB) =>
          eventA.interval.start.lowerLimit -
          eventB.interval.end.lowerLimit
        )
        // .forEach(day =>
        //   console.dir(day.interval.start, {depth: 0, colors: true})
        // )
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
