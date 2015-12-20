'use strict'

let moment = require('moment')

module.exports = function (events, startDate, endDate) {

	events.forEach(function (event) {
		// In range
		if ((event.startDate > startDate || event.endDate > startDate) &&
			event.startDate < endDate) {

			// Start and end not on same day
			var diffDays = moment(event.startDate)
				.diff(moment(event.endDate), 'days')

			if (diffDays) {

				for (let i = 0; i < diffDays; i++) {
					!function () {

						var eventClone = clone(event)

						if (i !== 0)
							eventClone.start = moment(eventClone.start)
								.add(i, 'days')
								.hour(0)
								.minute(0)

						eventClone.end = moment(eventClone.start)
							.hour(24)
							.minute(0)

						events.push(eventClone)
					}()
				}
			}
		}
	})

	return events
}
