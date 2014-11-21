var fs = require('fs'),
	path = require('path'),
	findit = require('findit')


module.exports = function (request, response, next) {

	var faviconPaths,
		faviconPath,
		foundFavicon,
		absRepoPath,
		stream,
		finder,
		ignoreList,
		invalidName


	function sendFavicon (faviconPath){

		if(path.extname(faviconPath) === '.svg')
			response.set({
				'Content-Type': 'image/svg+xml'
			})

		stream = fs.createReadStream(faviconPath)
		stream.pipe(response)
	}


	if (request.url.search(/favicon.ico$/) === -1) {
		next()
		return
	}

	absRepoPath = path.join(global.baseURL, 'projects', path.dirname(request.url))

	faviconPaths = [
		'img/favicon.png',
		'favicon.ico',
		'images/favicon.png'
	]

	faviconPath = false

	foundFavicon = faviconPaths.some(function (relFaviconPath) {

		faviconPath = path.join(absRepoPath, relFaviconPath)

		return fs.existsSync(faviconPath)
	})


	if (foundFavicon)
		sendFavicon(faviconPath)

	else {

		ignoreList = [
			'node_modules',
			'bower_components',
			'components',
			'plugins',
			'bin',
			'lib',
			'libs',
			'build',
			'trunk',
			'misc',
			'js',
			'jscripts',
			'scripts',
			'css',
			'gems',
			'thumbs',
			'cache'
		]

		finder = findit(absRepoPath)

		finder.on('directory', function (dir, stats, stop) {

			var baseName = path.basename(dir)

			invalidName = ignoreList.some(function (toIgnore) {
				return baseName === toIgnore
			})

			if (invalidName ||
			    (baseName[0] === '.' && baseName !== '.git')) {
				stop()
				return
			}

			if (path.relative(absRepoPath, dir).split(path.sep).length > 4) {
				finder.stop()
				next()
			}
		})

		finder.on('file', function (filePath) {
			if (path.basename(filePath) === 'favicon.png' ||
			    path.basename(filePath) === 'favicon.svg' ||
			    path.basename(filePath) === 'favicon.ico') {

				finder.stop()
				sendFavicon(filePath)
			}
		})

		finder.on('end', function () {
			next()
		})
	}
}
