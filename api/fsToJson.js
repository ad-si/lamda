var fs = require('fs'),
	path = require('path')

module.exports = function fsToJson(filename) {

	var stats = fs.lstatSync(filename),
		info = {
			path: filename,
			name: path.basename(filename)
		}


	if (stats.isDirectory()) {
		info.type = 'folder'
		info.children = fs.readdirSync(filename).map(function (child) {
			return fsToJson(filename + '/' + child)
		})
	}
	else {
		// Assuming it's a file. In real life it could be a symlink or
		// something else!
		info.type = "file"
	}

	return info
}
