var fs = require('fs'),
	yaml = require('js-yaml'),
	util = require('../util'),

	path = './home/tasks'


module.exports = function (req, res) {

	var lists = [],
		files = fs.readdirSync(path),
		keys = {}


	files.forEach(function (file) {

		fs.readFile(path + '/' + file, {encoding: 'utf-8'}, function (error, fileContent) {

			if (error) throw error

			var jsonListData = ''


			if (fileContent !== '') {

				jsonListData = yaml.safeLoad(fileContent)

				util.writeAvailableKeys(keys, jsonListData)


				if(!jsonListData.hasOwnProperty('tasks'))
					jsonListData.tasks = []

			}

			lists.push(jsonListData)


			if (lists.length === files.length) {

				res.render('tasks', {
					page: 'tasks',
					lists: lists
				})
			}

		})
	})
}
