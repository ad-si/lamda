'use strict'

const moment = require('moment')

module.exports = (events, startDate, endDate) => {

	const numberOfDays = endDate.diff(startDate, 'days')
	const days = []

	for (let dayIndex = 0; dayIndex < numberOfDays; dayIndex++) {
		const date = startDate.clone().add(dayIndex, 'days')
		const day = {
			date: date.clone().toDate(),
			events: events.filter(event =>
				moment(event.startDate).isSame(date, 'day')
			)
		}

		if (moment().isSame(date, 'day'))
			day.today = true

		days.push(day)
	}

	console.log(days)


	return days
}
