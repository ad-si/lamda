// eslint-disable-next-line no-unused-vars
import moment from '@datatypes/moment'
const {Instant} = moment
import Duration from '@datatypes/duration'
import add from '@datatypes/moment'


export default function (separatedEvents, event) {
  if ( // Compare date part of ISO strings
    event.interval.start.string.substr(0, 10) !==
    event.interval.end.string.substr(0, 10)
  ) {
    const endOfDayEvent = Object.assign({}, event)
    endOfDayEvent.interval = event.interval.clone()
    endOfDayEvent.interval.end = endOfDayEvent.interval.start.clone()
    endOfDayEvent.interval.end.endOfDay()
    separatedEvents.push(endOfDayEvent)

    let iteratorDay = add(
      event.interval.start,
      new Duration('P1D'),
    )

    while (
      iteratorDay.string.substr(0, 10) !==
      event.interval.end.string.substr(0, 10)
    ) {
      const fullDay = Object.assign({}, event)
      fullDay.interval = event.interval.clone()
      fullDay.interval.start = iteratorDay
        .clone()
        .startOfDay()
      fullDay.interval.end = iteratorDay
        .clone()
        .endOfDay()
      fullDay.isSecondary = true
      separatedEvents.push(fullDay)
      iteratorDay = add(iteratorDay, new Duration('P1D'))
    }


    const startOfDayEvent = Object.assign({}, event)
    startOfDayEvent.interval = event.interval.clone()
    startOfDayEvent.interval.start = startOfDayEvent.interval.end.clone()
    startOfDayEvent.interval.start.startOfDay()
    startOfDayEvent.isSecondary = true
    separatedEvents.push(startOfDayEvent)
  }
  else {
    separatedEvents.push(event)
  }

  return separatedEvents
}
