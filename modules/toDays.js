'use strict'

const momentFromString = require('@datatypes/moment').default
const add = require('@datatypes/moment').add
const Duration = require('@datatypes/duration').default

module.exports = (days, event, eventIndex, events) => {

	const eventDay = days.find(dayObject =>
		dayObject.date.string.substr(0, 10) ===
		event.interval.start.string.substr(0, 10)
	)

	if (eventDay) {
		eventDay.events.push(event)
	}

	return days
}
