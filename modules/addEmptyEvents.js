'use strict'

let moment = require('moment')

module.exports = function (events) {

	let newEvents = []
	let timeFrame

	events.forEach(function (event, index) {
		let startDate = (event.time.type === 'moment') ?
			event.time.lowerLimit :
			(event.time.type === 'period') ?
				event.time.start.lowerLimit :
				null
		let endDate = (event.time.type === 'moment') ?
			event.time.upperLimit :
			(event.time.type === 'period') ?
				event.time.end.upperLimit :
				null

		event.startDate = startDate
		event.endDate = endDate

		if (!timeFrame)
			timeFrame = {
				startMoment: moment(startDate).startOf('day'),
				endMoment: moment(endDate).endOf('day'),
			}
		else if (timeFrame.startMoment.isBefore(startDate)) {
			newEvents.push({
				empty: true,
				startDate: timeFrame.startMoment.toDate(),
				endDate: startDate,
				duration: moment(startDate)
					.diff(timeFrame.startMoment, 'minutes')
			})

			newEvents.push(event)

			if (index === events.length - 1)
				newEvents.push({
					empty: true,
					startDate: endDate,
					endDate: timeFrame.endMoment.toDate(),
					duration: moment(timeFrame.endMoment)
						.diff(endDate, 'minutes')
				})


			timeFrame.startMoment = moment(event.endDate)
		}
	})

	return newEvents
}
