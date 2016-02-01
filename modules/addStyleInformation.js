'use strict'

let moment = require('moment')

module.exports = function (events) {

	events.forEach(function (event) {
		const minutesDiff = moment(event.startDate)
			.diff(moment(event.startDate).startOf('day'), 'minutes')
		const style = {
			'flex-grow': event.minutes || minutesDiff
		}

		event.style = JSON.stringify(style)
			.replace(/"/g, '')
			.replace(/,/g, ';')
			.replace(/^\{(.*)\}$/g, '$1')
	})

	return events
}
