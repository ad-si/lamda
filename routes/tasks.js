var fs = require('fs'),
	yaml = require('js-yaml'),
	util = require('../util'),

	path = './home/tasks',
	lists = [],
	files

function sortByCompletion(a, b) {
	if (a.hasOwnProperty('completed_at'))
		if (b.hasOwnProperty('completed_at'))
			return 0
		else
			return 1
}

function getList(fileName, callback) {

	fs.readFile(
		(path + '/' + fileName),
		{encoding: 'utf-8'},
		function (error, fileContent) {

			if (error) throw error

			if (fileContent !== '') {

				var listData = yaml.safeLoad(fileContent)

				if (!listData.hasOwnProperty('tasks'))
					listData.tasks = []
			}

			listData.id = fileName.slice(0, -5)
			listData.tasks = listData.tasks.sort(sortByCompletion)

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

			if (lists.length === files.length){

				lists = lists.sort(function(a, b){
					if(a.id < b.id) return -1
					if(a.id > b.id) return 1
					return 0
				})

				res.render('tasks', {
					page: 'tasks',
					lists: lists,
					currentList: paramList
				})
			}
		})
	})
}
