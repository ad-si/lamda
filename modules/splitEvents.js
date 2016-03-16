'use strict'

module.exports = (separatedEvents, event, eventIndex, events) => {

	if ( // Compare date part of ISO strings
		event.interval.start.string.substr(0, 10) !==
		event.interval.end.string.substr(0, 10)
	) {
		const endOfDayEvent = Object.assign({}, event)
		endOfDayEvent.interval = event.interval.clone()
		endOfDayEvent.interval.end = endOfDayEvent.interval.start.clone()
		endOfDayEvent.interval.end.endOfDay()

		const startOfDayEvent = Object.assign({}, event)
		startOfDayEvent.interval = event.interval.clone()
		startOfDayEvent.interval.start = startOfDayEvent.interval.end.clone()
		startOfDayEvent.interval.start.startOfDay()

		separatedEvents.push(endOfDayEvent, startOfDayEvent)
	}
	else {
		separatedEvents.push(event)
	}

	return separatedEvents
}
