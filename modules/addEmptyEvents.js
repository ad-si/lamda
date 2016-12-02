const Interval = require('@datatypes/interval').default
const datatypesMoment = require('@datatypes/moment')
const Millisecond = datatypesMoment.Millisecond


function addEmptyEventsToLane (newEvents, event, index, events) {

  function addStartOfDayEvent () {
    // and add empty event until this event (first of the current day)
    const startOfDay = event.interval.start
      .clone()
      .startOfDay()
    const startString = startOfDay.string
    const endString = event.interval.start.string

    if (startString !== endString ) {
      newEvents.push({
        empty: true,
        interval: new Interval(startString + '--' + endString),
      })
    }
  }


  if (index === 0) {
    addStartOfDayEvent()
    newEvents.push(event)
  }

  if (index > 0) {
    if (
      events[index - 1].interval.start.string.substr(0, 10) !==
      event.interval.start.string.substr(0, 10)
    ) {
      // … add empty event to the end of that day
      const endOfPreviousDay = events[index - 1].interval.end.clone()
      endOfPreviousDay.endOfDay()

      const startString = events[index - 1].interval.end.string
      const endString = endOfPreviousDay.string

      if (startString !== endString ) {
        const interval = new Interval(startString + '--' + endString)
        const endOfLastDayEvent = {
          empty: true,
          interval: interval,
        }
        newEvents.push(endOfLastDayEvent)
      }

      addStartOfDayEvent()
    }
    // Previous event started on the same day
    else {
      // Add empty event as padding from previous to current event
      const startString = events[index - 1].interval.end.string
      const endString = event.interval.start.string

      if (startString !== endString ) {
        const paddingEvent = {
          empty: true,
          interval: new Interval(startString + '--' + endString),
        }
        newEvents.push(paddingEvent)
      }
    }
    newEvents.push(event)
  }

  const eventHash =
    (event.interval.end.hour || 0) +
    (event.interval.end.minute || 0) +
    (event.interval.end.second || 0) +
    (event.interval.end.millisecond || 0)

  // Last event and before midnight
  if (index === events.length - 1 && eventHash < (23 + 59 + 59 + 999)) {
    const startString = event.interval.end.string

    // TODO: Replace with
    // const endString = event.interval.end.clone().endOfDay().string
    // (blocked by github.com/datatypesjs/moment/issues/6)
    const isoString = event.interval.end.lowerLimit.toISOString()
    const endString = new Millisecond(isoString)
      .endOfDay()
      .string
    const emptyEndOfDayEvent = {
      empty: true,
      interval: new Interval(startString + '--' + endString),
    }
    newEvents.push(emptyEndOfDayEvent)
  }

  return newEvents
}


module.exports = (day) => {

  day.lanes = day.lanes.map(laneOfEvents =>
    laneOfEvents.reduce(addEmptyEventsToLane, [])
  )

  return day
}
