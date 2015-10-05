var fakesome = require('fakesome'),
	moment = require('moment')


function getStartDate() {

	var rangeStart = new Date(),
		rangeEnd = new Date(),
		daysBefore = 10,
		daysAfter = 100

	rangeStart.setDate(rangeStart.getDate() - daysBefore)
	rangeEnd.setDate(rangeEnd.getDate() + daysAfter)

	return fakesome.date(rangeStart, rangeEnd)
}

function getEndDate(startDate) {

	var hourOffset = startDate.getHours() + fakesome.integer(1, 5)

	return new Date(new Date(startDate.getTime()).setHours(hourOffset))
}


module.exports = function () {

	var startDate = getStartDate()

	// return fakesome.array(100).object({
	// 	title: fakesome.word,
	// 	startDate: getStartDate,
	// 	duration: function () {
	// 		return fakesome.integer(15, 1500)
	// 	}
	// })

	return [
		{
			title: 'First Event',
			startDate: moment().subtract(10, 'hours').toDate(),
			duration: 37
		},
		{
			title: 'Second Event',
			startDate: moment().subtract(8, 'hours').toDate(),
			duration: 95
		},
		{
			title: 'Third Event',
			startDate: moment().subtract(2.3, 'hours').toDate(),
			duration: 60
		}
	]

}
