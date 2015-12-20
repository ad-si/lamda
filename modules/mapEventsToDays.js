'use strict'

let moment = require('moment')

module.exports = function (events, startDate, endDate) {

	var days = [],
		i

	for (i = 0; i < endDate.diff(startDate, 'days'); i++) {
		!function () {

			var date = startDate.clone().add(i, 'days'),
				day = {
					date: date.clone().toDate(),
					events: events.filter(function (event) {
						return moment(event.startDate).isSame(date, 'day')
					})
				}

			if (moment().isSame(date, 'day'))
				day.today = true

			days.push(day)
		}()
	}

	return days
}
