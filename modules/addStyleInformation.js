'use strict'

let moment = require('moment')

module.exports = function (events) {

	events.forEach(function (event) {
		let minutesDiff = moment(event.startDate).diff(
			moment(event.startDate).startOf('day'),
			'minutes'
		)
		let style = {
			'flex-grow': event.duration || minutesDiff
		}

		event.style = JSON.stringify(style)
			.replace(/"/g, '')
			.replace(/,/g, ';')
			.replace(/^\{(.*)\}$/g, '$1')
	})

	return events
}
