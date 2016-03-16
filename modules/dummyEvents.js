'use strict'

function getStartDate () {

	const rangeStart = new Date()
	const rangeEnd = new Date()
	const daysBefore = 10
	const daysAfter = 100

	rangeStart.setDate(rangeStart.getDate() - daysBefore)
	rangeEnd.setDate(rangeEnd.getDate() + daysAfter)

	return fakesome.date(rangeStart, rangeEnd)
}

function getEndDate (startDate) {

	const hourOffset = startDate.getHours() + fakesome.integer(1, 5)

	return new Date(new Date(startDate.getTime()).setHours(hourOffset))
}


module.exports = (number) => {

	number = number || 100

	const startDate = getStartDate()

	return fakesome.array(number).object({
		title: fakesome.word,
		startDate: getStartDate,
		duration: () => {
			return fakesome.integer(15, 1500)
		}
	})
}
