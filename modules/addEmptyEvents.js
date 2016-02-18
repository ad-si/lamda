'use strict'

const moment = require('moment')

module.exports = (events) => {

	const newEvents = []
	let timeFrame

	events
		.filter(event => Boolean(event))
		.map(event => {
			// Unify start-date and end-date in events
			event.startDate = (event.time.type === 'moment') ?
				event.time.lowerLimit :
				(event.time.type === 'period') ?
					event.time.start.lowerLimit :
					null
			event.endDate = (event.time.type === 'moment') ?
				event.time.upperLimit :
				(event.time.type === 'period') ?
					event.time.end.upperLimit :
					null
			event.minutes = moment(event.endDate)
				.diff(event.startDate, 'minutes')

			return event
		})
		.forEach((event, index, events) => {

			const startMoment = moment.utc(event.startDate).startOf('day')
			const endMoment = moment.utc(event.endDate).endOf('day')

			if (!timeFrame || timeFrame.startMoment !== startMoment) {
				timeFrame = {startMoment, endMoment}
			}

			// If last event started on another day …
			if (events[index - 1] && !moment
					.utc(events[index - 1].startDate)
					.startOf('day')
					.isSame(startMoment)
				) {
					// … add empty event to the end of the day
					const endOfLastDay = moment.utc(events[index - 1])
						.endOf('day')
					newEvents.push({
						empty: true,
						startDate: events[index - 1].endDate,
						endDate: endOfLastDay,
						minutes: moment(endOfLastDay)
							.diff(events[index - 1].endDate, 'minutes')
					})
				}

			if (timeFrame.startMoment.isSameOrBefore(event.startDate)) {
				if (timeFrame.startMoment.isBefore(event.startDate)) {
					newEvents.push({
						empty: true,
						startDate: timeFrame.startMoment.toDate(),
						endDate: event.startDate,
						minutes: moment(event.startDate)
							.diff(timeFrame.startMoment, 'minutes')
					})
				}

				newEvents.push(event)

				// If last event
				if (index === events.length - 1) {
					const emptyEndOfDayEvent = {
						empty: true,
						startDate: event.endDate,
						endDate: timeFrame.endMoment.toDate(),
						minutes: moment(timeFrame.endMoment)
							.diff(event.endDate, 'minutes')
					}
					newEvents.push(emptyEndOfDayEvent)
				}

				timeFrame.startMoment = moment(event.endDate)
			}
		})

	return newEvents
}
