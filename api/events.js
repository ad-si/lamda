var fakesome = require('fakesome')

module.exports = function () {

	var latestDate

	function getStartDate() {
		return latestDate = fakesome.date('2014-01-01', '2014-05-01')
	}

	function getEndDate() {

		var hourOffset = latestDate.getHours() + fakesome.integer(1, 5)

		return new Date(new Date(latestDate.getTime()).setHours(hourOffset))
	}

	return fakesome.array(100).object({
		title: 'word()',
		start: getStartDate,
		end: getEndDate
	})
}
