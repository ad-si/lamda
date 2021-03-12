import path from 'path'
import userHome from 'user-home'
import Interval from '@datatypes/interval'

import getDays from '../modules/getDays.js'
import loadEvents from '../modules/loadEvents.js'
import loadBirthdays from '../modules/loadBirthdays.js'
import splitEvents from '../modules/splitEvents.js'
import addEmptyEvents from '../modules/addEmptyEvents.js'
import toDays from '../modules/toDays.js'
import toDaysWithLanes from '../modules/toDaysWithLanes.js'
import addStyleInformation from '../modules/addStyleInformation.js'

// TODO: Implement displaying in local time
// const displayInUTC = true
const eventsDirectory = path.join(userHome, 'Dropbox/Events')

// Uncomment for testing
// const dirname = path.dirname(url.fileURLToPath(import.meta.url))
// eventsDirectory = path.resolve(dirname, '../test/sequential/')


export default function (request, response, done) {
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
        if (!Object.prototype.hasOwnProperty.call(event, 'interval')) {
          event.interval = new Interval(event.time.intervalString)
        }
        return event
      }

      const daysWithEvents = []
        .concat(events)
        .concat(birthdays)
        .filter(event =>
          event != null &&
          event.interval != null &&
          event.interval.start != null &&
          event.interval.end != null,
        )
        .map(addInterval)
        .sort((eventA, eventB) =>
          eventA.interval.start.lowerLimit -
          eventB.interval.end.lowerLimit,
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
