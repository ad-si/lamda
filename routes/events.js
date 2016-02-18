'use strict'

const fsp = require('fs-promise')
const path = require('path')
const moment = require('moment')
const clone = require('clone')
const userHome = require('user-home')

const loadEvents = require('../modules/loadEvents')
const processEvents = require('../modules/processEvents')
const mapEventsToDays = require('../modules/mapEventsToDays')

const eventsDirectory = path.join(userHome, 'Events')


module.exports = (request, response, done) => {

	const now = moment()
	const pastDays = 10
	const futureDays = 50
	const eventPromises = loadEvents(eventsDirectory)
	const startDate = now
		.clone()
		.subtract(pastDays, 'days')
	const endDate = startDate
		.clone()
		.add(pastDays + futureDays, 'days')

	eventPromises
		.then(events => {
			events = events.sort((eventA, eventB) =>
				eventA.time.toObject().start.lowerLimit -
				eventB.time.toObject().start.lowerLimit
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

			response.render('index', {
				page: 'events',
				days: renderDays
			})
		})
		.catch(error => {
			done(error)
		})
}
