'use strict'

const fs = require('fs')
const path = require('path')


module.exports = (baseURL, file) => {

	const nodes = file.split('/')
	let currentDepth = 0
	let maxDepth = 0

	function doIt (filename) {
		const stats = fs.lstatSync(filename)
		const info = {
			path: filename,
			name: path.basename(filename),
		}

		if (stats.isDirectory()) {
			currentDepth++

			info.type = 'folder'
			info.children = fs
				.readdirSync(filename)
				.map(child => {
					if (child === nodes[currentDepth])
						return doIt(filename + '/' + child)
					else
						return child
				})
		}
		else {
			currentDepth++

			// TODO: Map all possible file types

			if (path.extname(info.name) === '.txt')
				info.type = 'text'

			else if (path.extname(info.name) === '.yaml')
				info.type = 'yaml'

			else
				info.type = "file" // Could be a symlink or something else!
		}

		if (currentDepth > maxDepth)
			maxDepth = currentDepth

		currentDepth--
		return info
	}

	const returnObject = doIt(baseURL)

	returnObject.maxDepth = maxDepth

	return returnObject
}
