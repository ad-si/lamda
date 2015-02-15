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
}


try {
	projectsDir = fs.readlinkSync(path.join(global.baseURL, 'projects'))
}
catch (error) {
	if (error.code !== 'EINVAL')
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


	var repoFinder = findit(projectsDir)

	repoFinder.on('directory', function (dirPath, stat, stop) {

		var baseName = path.basename(dirPath),
			ignoreList = [
				'node_modules',
				'bower_components',
				'components',
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
				'trunk',
				'misc',
				'js',
				'jscripts',
				'scripts',
				'css',
				'img',
				'gems',
				'thumbs',
				'cache'
			],
			invalidName,
			repoPath


		// TODO: Also ignore paths and not just root directories
		ignoreList = ignoreList.concat(global.config.Projects.ignore)

		invalidName = ignoreList.some(function (toIgnore) {
			return baseName === toIgnore
		})

		if (invalidName ||
		    (baseName[0] === '.' && baseName !== '.git')) {
			stop()
			return
		}


		if (dirPath.search(/\.git$/) === -1)
			return

		repoPath = path.dirname(dirPath)

		projectsCounter++

		getNumberOfCommits(repoPath, function (error, numberOfCommits) {

				var relativeRepoPath = path.relative(projectsDir, repoPath)

				var project = {
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
