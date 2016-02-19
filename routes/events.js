'use strict'

const fsp = require('fs-promise')
const path = require('path')
const moment = require('moment')
const clone = require('clone')
const userHome = require('user-home')

const loadEvents = require('../modules/loadEvents')
const loadBirthdays = require('../modules/loadBirthdays')
const processEvents = require('../modules/processEvents')
const mapEventsToDays = require('../modules/mapEventsToDays')

const eventsDirectory = path.join(userHome, 'Events')
// const eventsDirectory = path.resolve(__dirname, '../test/events')

const displayInUTC = true


module.exports = (request, response, done) => {

	const now = moment()
	// const now = moment('2015-11-25')
	const pastDays = 10
	const futureDays = 50
	const startDate = now
		.clone()
		.subtract(pastDays, 'days')
	const endDate = startDate
		.clone()
		.add(pastDays + futureDays, 'days')

	loadEvents(eventsDirectory)
		.then((events) => loadBirthdays()
			.then(contacts => {
				// events = events.concat(contacts)
				return events
			})
		)
		.then(events => {
			// Add lower limit to periods to unify interface of event objects
			events = events
				.map(event => {
					if (event.time.type === 'period') {
						event.time.lowerLimit = event.time
							.toObject().start.lowerLimit
					}
					return event
				})

			events = events.sort((eventA, eventB) =>
				eventA.time.lowerLimit - eventB.time.lowerLimit
			)

			const processedEvents = processEvents(
				events,
				startDate,
				endDate
			)

			const renderDays = mapEventsToDays(
				processedEvents,
				startDate,
				endDate
			)

			const minuteOfDay = displayInUTC ?
				new Date().getUTCHours() * 60 + new Date().getUTCMinutes() :
				new Date().getHours() * 60 + new Date().getMinutes()

			response.render('index', {
				page: 'events',
				days: renderDays,
				percentageOfDay: (minuteOfDay / 14.40) + '%'
			})
		})
		.catch(error => {
			done(error)
		})
}
