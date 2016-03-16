'use strict'

module.exports = (events) => events
	.map(event => {
		event.endDate = moment(event.startDate)
			.add(event.duration, 'minutes')
			.toDate()

		return event
	})
	.sort((previous, current) => previous.startDate - current.startDate)
