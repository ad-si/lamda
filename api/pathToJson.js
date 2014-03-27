var fs = require('fs'),
	path = require('path')


module.exports = function pathToJson(baseURL, file) {


	var nodes = file.split('/'),
		currentDepth = 0,
		maxDepth = 0,
		returnObject


	function doIt(filename) {

		var stats = fs.lstatSync(filename),
			info = {
				path: filename,
				name: path.basename(filename)
			}


		if (stats.isDirectory()) {

			currentDepth++

			info.type = 'folder'
			info.children = fs.readdirSync(filename).map(function (child) {

				if(child === nodes[currentDepth])
					return doIt(filename + '/' + child)
				else
					return child
			})
		}
		else {
			currentDepth++
			// could be a symlink or something else!
			info.type = "file"
		}

		if(currentDepth > maxDepth)
			maxDepth = currentDepth

		currentDepth--
		return info
	}

	returnObject = doIt(baseURL)

	returnObject.maxDepth = maxDepth


	return returnObject
}
