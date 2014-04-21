var fs = require('fs'),
	yaml = require('js-yaml'),

	path = './home/tasks',
	lists = [],
	files


function sortByCompletion(a, b) {
	if (a.hasOwnProperty('completed_at'))
		if (b.hasOwnProperty('completed_at'))
			return 0
		else
			return 1
	else
		return -1
}

function sortAlphabetical(a, b) {
	if (a.id < b.id) return -1
	if (a.id > b.id) return 1
	return 0
}

function getList(fileName, callback) {

	fs.readFile(
		(path + '/' + fileName),
		{encoding: 'utf-8'},
		function (error, fileContent) {

			if (error) throw error

			var completedTasks = [],
				uncompletedTasks = [],
				numberOfCompletedTasks = 0

			if (fileContent !== '')
				var listData = yaml.safeLoad(fileContent)

			listData.id = fileName.slice(0, -5)

			if (listData.tasks) {

				//listData.tasks = listData.tasks.sort(sortByCompletion)

				listData.tasks.forEach(function (task) {
					if (task.hasOwnProperty('completed_at'))
						completedTasks.push(task)
					else
						uncompletedTasks.push(task)
				})
			}

			listData.numberOfCompletedTasks = completedTasks.length

			listData.tasks = uncompletedTasks.concat(completedTasks)

			callback(listData)
		}
	)
}

module.exports = function (req, res) {

	var paramList = req.params.list || 'inbox'

	lists = []
	files = fs.readdirSync(path)

	files.forEach(function (fileName) {

		getList(fileName, function (listData) {

			lists.push(listData)

			if (lists.length === files.length) {

				lists = lists.sort(sortAlphabetical)

				res.render('index', {
					page: 'tasks',
					lists: lists,
					currentList: paramList
				})
			}
		})
	})
}
