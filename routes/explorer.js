var files = require('../api/files'),
	pathToJson = require('../api/pathToJson')
//fsToJson = require('../api/fsToJson'),

baseURL = '/Users/adrian/Sites/lamda/home'


module.exports = function (req, res) {

	var pathParam = req.params[0] || '',
		folders = pathParam.split('/'),
		paths = [''],
		columns = [],
		counter = 0,
		depth = 0


	//console.log(JSON.stringify(pathToJson('/Users/adrian/Sites/lamda/home', '/test/foo/bar'), null, 4))
	//console.log(JSON.stringify(fsToJson('/Users/adrian/Sites/lamda/home/test'), null, '  '))


	/*folders.forEach(function (folder, index) {

	 var previousPath = paths[paths.length - 1] || ''

	 if (index)
	 paths.push(previousPath + '/' + folder)
	 })

	 paths.forEach(function (path, index) {
	 files(path, function (data) {

	 columns[index] = data

	 counter++

	 if (counter === paths.length)
	 res.render('explorer', {
	 page: 'explorer',
	 columns: columns
	 })

	 })
	 })*/


	function buildColumns(children) {

		children.forEach(function (child) {

			if (!columns[depth])
				columns[depth] = []

			if (typeof child === 'object') {

				columns[depth].push(child.name)
				depth++
				buildColumns(child.children)
				depth--
			}
			else
				columns[depth].push(child)


		})

		return columns
	}

	//console.log(baseURL, pathParam)
	//console.log(pathToJson(baseURL, pathParam).children)
	//console.log(buildColumns(pathToJson(baseURL, pathParam).children))

	res.render('explorer', {
		page: 'explorer',
		columns: buildColumns(pathToJson(baseURL, pathParam).children)
	})
}
