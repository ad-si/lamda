var fs = require('fs'),
	yaml = require('js-yaml'),
	util = require('../util'),

	path = './home/tasks'

function sortByCompletion(a, b) {
	if (a.hasOwnProperty('completed_at'))
		if (b.hasOwnProperty('completed_at'))
			return 0
		else
			return 1
}

module.exports = function (req, res) {

	var lists = [],
		files = fs.readdirSync(path),
		keys = {}


	files.forEach(function (fileName) {

		fs.readFile(
			(path + '/' + fileName),
			{encoding: 'utf-8'},
			function (error, fileContent) {

				if (error) throw error

				var listData = ''


				if (fileContent !== '') {

					listData = yaml.safeLoad(fileContent)

					util.writeAvailableKeys(keys, listData)

					if (!listData.hasOwnProperty('tasks'))
						listData.tasks = []
				}

				listData.tasks.sort(sortByCompletion)

				lists.push(listData)


				if (lists.length === files.length) {

					res.render('tasks', {
						page: 'tasks',
						lists: lists
					})
				}

			})
	})
}
