const fs = require('fs')

const pathToJson = require('../modules/pathToJson')
const fsToJson = require('../modules/fsToJson')


module.exports = function (req, res) {

	var pathParam = req.params[0] || '',
		columns = [],
		depth = 0,
		path = ''


	function buildColumns(element, children) {

		if (children) {

			if (!columns[depth])
				columns[depth] = {
					active: '',
					path: path,
					entries: []
				}

			children.forEach(function (child) {

				if (typeof child === 'object') {

					columns[depth].path = path
					path = path + '/' + child.name

					columns[depth].active = child.name
					columns[depth].entries.push(child.name)
					depth++
					buildColumns(child, child.children)
					depth--
				}
				else
					columns[depth].entries.push(child)
			})
		}
		else {
			columns[depth] = {
				file: element
			}

			// TODO: Map file types to functions

			if (columns[depth].file.type === 'text')
				columns[depth].file.content = fs
					.readFileSync(columns[depth].file.path, 'utf8')

			else if (columns[depth].file.type === 'yaml')
				columns[depth].file.content = fs
					.readFileSync(columns[depth].file.path, 'utf8')
		}


		return columns
	}

	//console.log(baseURL, pathParam)
	//console.log(JSON.stringify(fsToJson(baseURL), null, 2))
	//console.log(JSON.stringify(pathToJson(baseURL, pathParam), null, 2))
	//console.log(JSON.stringify(buildColumns(pathToJson(baseURL, pathParam).children), null, 2))

	res.render('index', {
		page: 'files',
		columns: buildColumns(
			pathToJson(req.app.locals.basePath, pathParam),
			pathToJson(req.app.locals.basePath, pathParam).children
		)
	})
}
