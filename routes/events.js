'use strict'

const fsp = require('fs-promise')
const path = require('path')
const clone = require('clone')
const userHome = require('user-home')
const Duration = require('@datatypes/duration').default
const momentFromString = require('@datatypes/moment').default
const add = require('@datatypes/moment').add
const subtract = require('@datatypes/moment').subtract

const getDays = require('../modules/getDays')
const loadEvents = require('../modules/loadEvents')
const loadBirthdays = require('../modules/loadBirthdays')
const splitEvents = require('../modules/splitEvents')
const addEmptyEvents = require('../modules/addEmptyEvents')
const toDays = require('../modules/toDays')
const toDaysWithLanes = require('../modules/toDaysWithLanes')
const addEndDate = require('../modules/addEndDate')
const addStyleInformation = require('../modules/addStyleInformation')

// TODO: Implement displaying in local time
const displayInUTC = true
let eventsDirectory = path.join(userHome, 'Events')

// Uncomment for testing
// eventsDirectory = path.resolve(__dirname, '../test/sequential/')

function notInRange (event, eventIndex, events) {
	const eventStart = event.interval.start.lowerLimit
	const eventEnd = event.interval.end.upperLimit

	return  eventEnd > events.startMoment.lowerLimit ||
		eventStart < events.endMoment.upperLimit
}

module.exports = (request, response, done) => {

	loadEvents(eventsDirectory, request)
		.then(events => loadBirthdays()
			.then(contacts => {
				// events = events.concat(contacts)
				return events
			})
		)
		.then(events => {
			const days =  getDays()
			events.startMoment = days.startMoment
			events.endMoment = days.endMoment

			const daysWithEvents = events
				.sort((eventA, eventB) =>
					eventA.interval.start.lowerLimit -
					eventB.interval.end.lowerLimit
				)
				.filter(notInRange)
				// .forEach(day => console.dir(day, {depth: 1, colors: true}))
				.reduce(splitEvents, [])
				.reduce(toDays, days)
				.map(toDaysWithLanes)
				.map(addEmptyEvents)
				.map(addStyleInformation)

			response.render('index', {
				page: 'events',
				days: daysWithEvents,
			})
		})
		.catch(done)
}
