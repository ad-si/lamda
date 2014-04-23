var fs = require('fs'),
	yaml = require('js-yaml'),
	path = require('path'),
	async = require('async'),

	listPath = baseURL + '/tasks'


function getFileName(string) {

	var offset = -path.extname(string).length || undefined

	return string.slice(0, offset)
}

function byCompletion(a, b) {
	if (a.hasOwnProperty('completed_at'))
		return Number(!b.hasOwnProperty('completed_at'))

	return -1
}

function alphabeticallyBy(attribute, order) {

	var factor

	if (order === 'descending')
		factor = -1
	else if (order === 'ascending')
		factor = 1
	else
		throw new Error(order + ' is not allowed here.')

	return function (a, b) {
		var first = a[attribute],
			second = b[attribute]

		if (a[attribute] < b[attribute]) return -factor
		if (a[attribute] > b[attribute]) return factor
		return 0
	}
}

function getList(fileName, callback) {

	fs.readFile(
		(listPath + '/' + fileName),
		{encoding: 'utf-8'},
		function (error, fileContent) {

			if (error) throw error

			var completedTasks = [],
				uncompletedTasks = [],
				numberOfCompletedTasks = 0

			if (fileContent !== '')
				var listData = yaml.safeLoad(fileContent)//,{schema: 'FAILSAFE_SCHEMA'})

			listData.id = fileName.slice(0, -5)

			if (listData.tasks) {

				// TODO: Sort by age, due date, importance, …
				listData
					.tasks
					.sort(alphabeticallyBy('created_at', 'descending'))

				listData
					.tasks
					.forEach(function (task) {
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


function writeBackList(filePath, listData) {

	listData.tasks.sort(alphabeticallyBy('created_at', 'descending'))

	fs.writeFile(filePath, yaml.safeDump(listData), function (error) {

		if (error) throw error

		console.log('Task was saved!')
	})
}


module.exports = function (req, res, next) {

	//TODO: Set default list in config.yaml
	var paramList = req.params.list || 'inbox',
		lists = [],
		files = fs.readdirSync(listPath),
		writeBackPath = '',
		writeBackData,
		mustWriteBack = false


	async.each(
		files,
		function (fileName, done) {

			getList(fileName, function (listData) {

				if (req.method === 'POST' &&
					paramList === getFileName(fileName)) {

					mustWriteBack = true

					listData.tasks.unshift({
						title: req.body.title,
						created_at: (new Date).toISOString()
					})

					writeBackPath = path.join(listPath, fileName)
					writeBackData = listData
				}

				lists.push(listData)

				done()
			})
		},
		function (error) {

			if (error) throw error

			lists.sort(alphabeticallyBy('id', 'ascending'))

			res.on('finish', function () {
				if (mustWriteBack)
					writeBackList(writeBackPath, writeBackData)
			})

			res.render('index', {
				page: 'tasks',
				lists: lists,
				currentList: paramList
			})
		}
	)
}
