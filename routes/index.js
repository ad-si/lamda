var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml'),
	nodegit = require('nodegit'),

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

module.exports = function (req, res) {

	var projectDirs = fs.readdirSync(projectsDir),
		projectsCounter = projectDirs.length,
		projects = []


	function render () {

		if (projects.length === projectsCounter)
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

	projectDirs.forEach(function (projectDir) {

		var absoluteProjectPath = path.join(projectsDir, projectDir)


		fs.lstat(absoluteProjectPath, function (error, stats) {

			if (error) throw new Error(error)

			if (!stats.isDirectory()) {
				projectsCounter--
				render()
			}
			else
				getNumberOfCommits(
					absoluteProjectPath,
					function (error, numberOfCommits) {

						if (error)
							numberOfCommits = null

						projects.push({
							id: projectDir,
							name: projectDir,
							numberOfCommits: numberOfCommits
						})

						render()
					}
				)
		})
	})
}
