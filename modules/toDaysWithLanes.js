'use strict'

const momentFromString = require('@datatypes/moment').default
const add = require('@datatypes/moment').add
const Duration = require('@datatypes/duration').default

module.exports = (day, dayIndex, days) => {

	const lanes = []
	let laneIndex = 0

	day.events.forEach(event => {
		while( // there is an overlap of events
			lanes[laneIndex] &&
			lanes[laneIndex].some(laneEvent => !(
				laneEvent.interval.end.upperLimit <
				event.interval.start.lowerLimit
				||
				event.interval.end.upperLimit <
				laneEvent.interval.start.lowerLimit
			))
		) {
			laneIndex++
		}

		if (!Array.isArray(lanes[laneIndex])) {
			lanes[laneIndex] = []
		}
		lanes[laneIndex].push(event)
		laneIndex = 0
	})

	day.lanes = lanes
	delete day.events

	return day
}
