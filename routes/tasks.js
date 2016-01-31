'use strict'

const path = require('path')

const fsp = require('fs-promise')
const yaml = require('js-yaml')
const evlReduce = require('eventlang-reduce')


function getFileName (string) {

	var offset = -path.extname(string).length || undefined

	return string.slice(0, offset)
}

function byCompletion (a, b) {
	if (a.hasOwnProperty('completed_at'))
		return Number(!b.hasOwnProperty('completed_at'))

	return -1
}

function alphabeticallyBy (attribute, order) {

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

function getList (fileName, callback) {

	fs.readFile(
		(listPath + '/' + fileName),
		{encoding: 'utf-8'},
		function (error, fileContent) {

			if (error) throw error

			var completedTasks = [],
				uncompletedTasks = [],
				numberOfCompletedTasks = 0,
				listData

			if (fileContent !== '')
				listData = yaml.safeLoad(fileContent)
				//,{schema: 'FAILSAFE_SCHEMA'})

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


function writeBackList (filePath, listData) {

	listData.tasks.sort(alphabeticallyBy('created_at', 'descending'))

	fs.writeFile(filePath, yaml.safeDump(listData), function (error) {

		if (error) throw error

		console.log('Task was saved!')
	})
}


module.exports = function (request, response) {

	const tasksPath = path.join(request.app.locals.basePath, 'tasks')

	fsp
		.readdir(tasksPath)
		.then(filePaths => Promise
			.all(filePaths.map(filePath => fsp.readFile(
				path.join(tasksPath, filePath),
				'utf8'
			)))
		)
		.then(files => {
			let taskEventPromises = files.map(
				fileContent => yaml.safeLoad(fileContent)
			)
			return Promise.all(taskEventPromises)
		})
		.then(eventTasks => {
			return eventTasks.map(eventTask => {
				let reducedObject = {}

				for (let timestamp in eventTask)
					Object.assign(reducedObject, eventTask[timestamp])

				reducedObject.creationDate = new Date(
					Object.keys(eventTask).sort()[0]
				)

				return reducedObject
			})
		})
		.then(tasks => {
			response.render('index', {
				page: 'tasks',
				tasks: tasks
			})
		})
		.catch(error => console.error(error.stack))
}
