'use strict'

const Interval = require('@datatypes/interval').default

module.exports = (day) => {
	day.lanes = day.lanes.map(lane => lane.map(event => {
			// TODO: Don't clone (blocked by github.com/datatypesjs/duration/issues/2)
			const duration = event.interval.clone().duration

			// TODO: Use duration.asMinutes()
			// (blocked by github.com/datatypesjs/duration/issues/1)
			const minutes =
				(duration.minutes || 0) +
				((duration.hours || 0) * 60)
			const style = {
				'flex-grow': minutes,
			}

			event.style = JSON.stringify(style)
				.replace(/"/g, '')
				.replace(/,/g, ';')
				.replace(/^\{(.*)\}$/g, '$1')

			return event
		})
	)
	return day
}
