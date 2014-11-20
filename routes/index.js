var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),
	nodegit = require('nodegit'),
	findit = require('findit'),

	projectsDir = path.join(global.baseURL, 'projects')


function getNumberOfCommits (repoDir, callback) {

	nodegit.Repo.open(repoDir, function (error, repo) {

		if (error) {
			callback(error)
			return
		}

		repo.getMaster(function (error, branch) {

			var history,
				numberOfCommits = 0

			if (error) {
				callback(error)
				return
			}

			history = branch.history()

			history.on('commit', function () {
				numberOfCommits++
			})

			history.on('end', function () {
				callback(null, numberOfCommits)
			})

			history.start()
		})
	})
}

function getFavicon (repoDir, callback) {

	var faviconPaths = [
			'img/favicon.png',
			'favicon.ico',
			'images/favicon.png'
		],
		faviconPath = false,
		foundFavicon


	function startFindit () {

		var finder = findit(repoDir)

		finder.on('directory', function (dir, stat, stop) {
			if (path.relative(repoDir, dir).split(path.sep).length > 3){
				finder.stop()
				callback()
			}
		})

		finder.on('file', function (filePath) {
			if (path.basename(filePath) === 'favicon.png' ||
			    path.basename(filePath) === 'favicon.ico') {

				finder.stop()
				callback(filePath)
			}
		})

		finder.on('end', function () {
			callback()
		})
	}

	foundFavicon = faviconPaths.some(function (relFaviconPath) {

		faviconPath = path.join(repoDir, relFaviconPath)

		return fs.existsSync(faviconPath)
	})

	if (!foundFavicon)
		startFindit()
	else
		callback(faviconPath)
}

module.exports = function (req, res) {

	var projectDirs = fs.readdirSync(projectsDir),
		projectsCounter = projectDirs.length,
		projects = []


	function render () {

		if (projects.length === projectsCounter) {

			res.render('index', {
				page: 'Projects',
				projects: projects.reverse(),
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

	projectDirs.forEach(function (projectDir) {

		var absoluteProjectPath = path.join(projectsDir, projectDir)


		fs.lstat(absoluteProjectPath, function (error, stats) {

			if (error) throw new Error(error)

			if (!stats.isDirectory()) {
				projectsCounter--
				render()
			}
			else
				getFavicon(absoluteProjectPath, function (faviconPath) {
					console.log(absoluteProjectPath)
					getNumberOfCommits(
						absoluteProjectPath,
						function (error, numberOfCommits) {

							var project = {
								id: projectDir,
								name: projectDir
							}

							project.numberOfCommits = error ? null : numberOfCommits
							project.faviconPath = faviconPath ?
							                      path.relative(projectsDir,
								                      faviconPath) :
							                      false


							projects.push(project)

							render()
						}
					)
				})
		})
	})
}
