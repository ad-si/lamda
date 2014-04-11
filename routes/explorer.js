var files = require('../api/files'),
	pathToJson = require('../api/pathToJson'),
	baseURL = '/Users/adrian/Sites/lamda/home'

module.exports = function (req, res) {

	var pathParam = req.params[0] || '',
		columns = [],
		depth = 0,
		path = ''


	function buildColumns(children) {

		children.forEach(function (child) {

			if (!columns[depth]){
				columns[depth] = {
					active: '',
					path: path,
					entries: []
				}
			}

			if (typeof child === 'object') {

				columns[depth].path = path
				path = path + '/' + child.name

				columns[depth].active = child.name
				columns[depth].entries.push(child.name)
				depth++
				buildColumns(child.children)
				depth--
			}
			else
				columns[depth].entries.push(child)
		})

		return columns
	}

	//console.log(baseURL, pathParam)
	//console.log(JSON.stringify(pathToJson(baseURL, pathParam), null, 2))
	//console.log(JSON.stringify(buildColumns(pathToJson(baseURL, pathParam).children), null, 2))

	res.render('explorer', {
		page: 'explorer',
		columns: buildColumns(pathToJson(baseURL, pathParam).children)
	})
}
