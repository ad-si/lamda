var fakesome = require('fakesome')


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

	return fakesome.array(100).object({
		title: fakesome.word,
		startDate: getStartDate,
		duration: function () {
			return fakesome.integer(15, 1500)
		}
	})
}
