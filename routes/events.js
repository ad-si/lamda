var fs = require('fs'),
	moment = require('moment'),
	clone = require('clone'),

	events = require('../test/events')


function splitEvents(events, startDate, endDate) {

	var i

	events.forEach(function (event) {
		// In range
		if ((event.startDate > startDate || event.endDate > startDate) &&
			event.startDate < endDate) {

			// Start and end not on same day
			var diffDays = moment(event.startDate)
				.diff(moment(event.endDate), 'days')

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

			var date = startDate.clone().add('days', i),
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

function addStyleInformation(events) {

	var minutesPerDay = 1440

	events.forEach(function (event) {

		var style,
			minutesDiff,
			duration


		minutesDiff = moment(event.startDate)
			.diff(
				moment(event.startDate).startOf('day'),
				'minutes'
			)

		style = {
			'flex-grow': event.duration
		}


		event.style = JSON.stringify(style)
			.replace(/"/g, '')
			.replace(/,/g, ';')
			.replace(/^\{(.*)\}$/g, '$1')
	})

	return events
}

function addEmptyEvents (events) {

	var timeFrame = {
			startMoment: moment(events[0].startDate).startOf('day'),
			endMoment: moment(events[0].endDate).endOf('day')
		},
		newEvents = []

	events.forEach(function (event) {

		if (timeFrame.startMoment.isBefore(event.startDate)) {
			newEvents.push({
				empty: true,
				startDate: timeFrame.startMoment.toDate(),
				endDate: event.startDate,
				duration: moment(event.startDate)
					.diff(timeFrame.startMoment, 'minutes')
			})

			newEvents.push(event)

			timeFrame.startMoment = moment(event.endDate)
		}
	})

	return newEvents
}

module.exports = function (req, res) {

	var now = moment(),
		pastDays = 10,
		futureDays = 50,
		processedEvents,
		startDate,
		endDate,
		listOfEvents = events(),
		renderDays

	listOfEvents = listOfEvents
		.map(function (event) {

			event.endDate = moment(event.startDate)
				.add(event.duration, 'minutes')
				.toDate()

			return event
		})
		.sort(function (previous, current) {
			return previous.startDate - current.startDate
		})


	listOfEvents = addEmptyEvents(listOfEvents)

	startDate = now
		.clone()
		.subtract(pastDays, 'days'),

	endDate = startDate
		.clone()
		.add(pastDays + futureDays, 'days'),

	processedEvents = splitEvents(
		addStyleInformation(listOfEvents),
		startDate,
		endDate
	)

	console.log(processedEvents);

	renderDays = mapEventsToDays(
		processedEvents,
		startDate,
		endDate
	)

	console.log(renderDays)

	res.render('index', {
		page: 'events',
		days: renderDays
	})
}
