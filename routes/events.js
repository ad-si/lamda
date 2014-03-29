var fs = require('fs'),
	files = require('../api/files'),
	events = require('../api/events'),
	moment = require('moment'),
	clone = require('clone')

function splitEvents(events, startDate, endDate) {

	var i

	events.forEach(function (event) {
		// In range
		if ((event.start > startDate || event.end > startDate) && event.start < endDate) {

			// Start and end not on same day
			var diffDays = moment(event.start).diff(moment(event.end), 'days')

			if (diffDays) {

				for (i = 0; i < diffDays; i++) {
					!function () {

						var eventClone = clone(event)

						if (i !== 0)
							eventClone.start = moment(eventClone.start)
								.add('days', i)
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

function mapEventsToDays(events, startDate, endDate) {

	var days = [],
		i

	for (i = 0; i < endDate.diff(startDate, 'days'); i++) {
		!function () {

			var date = startDate.clone().add('days', i).toJSON()

			days.push({
				date: date,
				events: events.filter(function (event) {
					return moment(event.start).diff(date, 'days') === 0
				})
			})

		}()
	}

	return days
}

module.exports = function (req, res) {

	var now = moment(),
		pastDays = 10,
		futureDays = 50,
		startDate = now.clone().subtract('days', pastDays),
		endDate = startDate.clone().add('days', pastDays + futureDays),
		processedEvents = splitEvents(events(), startDate, endDate)

	res.render('events', {
		page: 'events',
		days: mapEventsToDays(processedEvents, startDate, endDate)
	})
}
