'use strict'

const fs = require('fs')

const pathToJson = require('../modules/pathToJson')
const fsToJson = require('../modules/fsToJson')


module.exports = (request, response) => {

	const pathParam = request.params[0] || ''
	const columns = []
	let depth = 0
	let path = ''

	function buildColumns (element, children) {
		if (children) {
			if (!columns[depth]) {
				columns[depth] = {
					active: '',
					path: path,
					entries: []
				}
			}

			children.forEach(child => {

				if (typeof child === 'object') {
					columns[depth].path = path
					path = path + '/' + child.name

					columns[depth].active = child.name
					columns[depth].entries.push(child.name)
					depth++
					buildColumns(child, child.children)
					depth--
				}
				else {
					columns[depth].entries.push(child)
				}
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

	response.render('index', {
		page: 'files',
		columns: buildColumns(
			pathToJson(request.app.locals.basePath, pathParam),
			pathToJson(request.app.locals.basePath, pathParam).children
		)
	})
}
