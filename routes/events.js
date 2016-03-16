'use strict'

const fsp = require('fs-promise')
const path = require('path')
const clone = require('clone')
const userHome = require('user-home')
const Duration = require('@datatypes/duration').default
const momentFromString = require('@datatypes/moment').default
const add = require('@datatypes/moment').add
const subtract = require('@datatypes/moment').subtract

const loadEvents = require('../modules/loadEvents')
const loadBirthdays = require('../modules/loadBirthdays')
const splitEvents = require('../modules/splitEvents')
const addEmptyEvents = require('../modules/addEmptyEvents')
const toDays = require('../modules/toDays')
const addEndDate = require('../modules/addEndDate')
const addStyleInformation = require('../modules/addStyleInformation')

const displayInUTC = true
let eventsDirectory = path.join(userHome, 'Events')

// Uncomment for testing
// eventsDirectory = path.resolve(__dirname, '../test/events')

function notInRange (event, eventIndex, events) {
	const eventStart = event.interval.start.lowerLimit
	const eventEnd = event.interval.end.upperLimit

	return  eventEnd > events.startMoment.lowerLimit ||
		eventStart < events.endMoment.upperLimit
}

module.exports = (request, response, done) => {

	const pastDays = 50
	const futureDays = 50
	const now = new Date()
	const nowMoment = momentFromString(now.toISOString())

	const days = []
	const startMoment = subtract(nowMoment, new Duration(`P${pastDays}D`))
	const endMoment = add(nowMoment, new Duration(`P${futureDays}D`))
	const duration = endMoment.maximumOffset(startMoment).unsafeNormalize()

	for (let dayIndex = 0; dayIndex < duration.days; dayIndex++) {
		const date = add(startMoment, new Duration(`P${dayIndex}D`))
		const day = {
			date: date,
			events: [],
		}

		if (new Date().toISOString().substr(0, 10) ===
			date.string.substr(0, 10)
		) {
			day.today = true
		}

		days.push(day)
	}


	loadEvents(eventsDirectory)
		.then(events => loadBirthdays()
			.then(contacts => {
				// events = events.concat(contacts)
				return events
			})
		)
		.then(events => {

			events.startMoment = startMoment
			events.endMoment = endMoment

			const daysWithEvents = events
				.sort((eventA, eventB) =>
					eventA.interval.start.lowerLimit -
					eventB.interval.end.lowerLimit
				)
				.filter(notInRange)
				.reduce(splitEvents, [])
				.reduce(addEmptyEvents, [])
				.map(addStyleInformation)
				.reduce(toDays, days)

			const minuteOfDay = displayInUTC ?
				new Date().getUTCHours() * 60 + new Date().getUTCMinutes() :
				new Date().getHours() * 60 + new Date().getMinutes()

			response.render('index', {
				page: 'events',
				days: daysWithEvents,
				percentageOfDay: (minuteOfDay / 14.40) + '%'
			})
		})
		.catch(done)
}
