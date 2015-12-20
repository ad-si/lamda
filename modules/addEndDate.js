var moment = require('moment')


module.exports = function (events) {

	return events
		.map(function (event) {

			event.endDate = moment(event.startDate)
				.add(event.duration, 'minutes')
				.toDate()

			return event
		})
		.sort(function (previous, current) {
			return previous.startDate - current.startDate
		})
}
