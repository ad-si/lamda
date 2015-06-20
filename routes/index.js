var fs = require('fs'),
	path = require('path'),
	nodegit = require('nodegit'),
	findit = require('findit'),

	projectsDir = path.join(global.baseURL, 'projects')


function getNumberOfCommits (repoDir, callback) {

	nodegit
		.Repository
		.open(repoDir)
		.then(function (repo) {
			return repo.getMasterCommit()
		})
		.then(function (firstCommitOnMaster) {

			var history = firstCommitOnMaster.history(),
				numberOfCommits = 0

			history.on('commit', function () {
				numberOfCommits++
			})

			history.on('end', function () {
				callback(null, numberOfCommits)
			})

			history.start()
		})
		.catch(function (error) {
			callback(error)
		})
}

try {
	// Resolve projects directory if symbolic link
	projectsDir = fs.readlinkSync(path.join(global.baseURL, 'projects'))
}
catch (error) {
	if (error.code === 'ENOENT')
		console.error('ERROR: Projects directory does not exist!')

	else if (error.code !== 'EINVAL')
		throw new Error(error)
}

module.exports = function (req, res) {

	var projectsCounter = 0,
		projects = [],
		traversedTree = false


	function render () {

		if (traversedTree && projects.length === projectsCounter) {

			res.render('index', {
				page: 'Projects',
				projects: projects.sort(function (a, b) {
					return b.numberOfCommits - a.numberOfCommits
				}),
				numberOfCommits: projects
					.map(function (project) {
						return project.numberOfCommits
					})
					.reduce(function (a, b) {
						return a + b
					})
			})
		}
	}

	if (!projectsDir)
		return false

	var repoFinder = findit(projectsDir)

	repoFinder.on('directory', function (dirPath, stat, stop) {

		var baseName = path.basename(dirPath),
			relativeDirName = dirPath.slice(projectsDir.length + 1),
			ignoreList = [
				'node_modules',
				'bower_components',
				'components',
				'classes',
				'plugins',
				'public',
				'src',
				'source',
				'include',
				'core',
				'bin',
				'lib',
				'libs',
				'build',
				'example',
				'examples',
				'samples',
				'trunk',
				'misc',
				'js',
				'jscripts',
				'scripts',
				'css',
				'img',
				'gems',
				'thumbs',
				'cache',
				'javadoc',
				'contents'
			],
			invalidName,
			repoPath


		if (relativeDirName.split(path.sep).length > 3) {
			return stop()
		}

		if (global.config.Projects && global.config.Projects.ignore)
			ignoreList = ignoreList.concat(global.config.Projects.ignore)

		invalidName = ignoreList.some(function (toIgnore) {
			if (toIgnore.search('/') === -1) {
				return baseName.toLowerCase() === toIgnore.toLowerCase()
			}
			else {
				return relativeDirName.toLowerCase() === toIgnore.toLowerCase()
			}
		})

		if (invalidName || (baseName[0] === '.' && baseName !== '.git'))
			return stop()

		if (dirPath.search(/\.git$/) === -1)
			return


		repoPath = path.dirname(dirPath)

		projectsCounter++

		getNumberOfCommits(repoPath, function (error, numberOfCommits) {

				if (error){
					projectsCounter--
					console.error(repoPath, error)
				}

				var relativeRepoPath = path.relative(projectsDir, repoPath),
					project = {
						id: repoPath,
						path: repoPath,
						link: relativeRepoPath,
						name: path.basename(relativeRepoPath),
						numberOfCommits: error ? null : numberOfCommits,
						faviconPath: path.join(relativeRepoPath, 'favicon.ico')
					}

				projects.push(project)

				render()
			}
		)

		stop()
	})

	repoFinder.on('end', function () {
		traversedTree = true
		render()
	})

	repoFinder.on('error', function (error) {
		throw new Error(error)
	})
}
