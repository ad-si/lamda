const fs = require('fs')
const path = require('path')
const nodegit = require('nodegit')
const findit = require('findit')

const userHome = require('user-home')
global.basePath = global.basePath || userHome
global.config = global.config || {}
let projectsDir = path.join(global.basePath, 'projects')


function getNumberOfCommitsPromise (repoDir) {
  return nodegit
    .Repository
    .open(repoDir)
    .then(repo => repo.getMasterCommit())
    .then(firstCommitOnMaster => new Promise((resolve, reject) => {
      let numberOfCommits = 0

      const history = firstCommitOnMaster.history()
      history.on('commit', () => {
        numberOfCommits++
      })
      history.on('end', () => {
        resolve(numberOfCommits)
      })
      history.on('error', error => reject(error))
      history.start()
    }))
}

try {
  // Resolve projects directory if symbolic link
  projectsDir = fs.readlinkSync(path.join(global.basePath, 'projects'))
}
catch (error) {
  if (error.code === 'ENOENT') {
    // eslint-disable-next-line
    console.error('ERROR: Projects directory does not exist!')
  }
  else if (error.code !== 'EINVAL') {
    throw new Error(error)
  }
}

module.exports = function (request, response) {
  const projects = []
  let traversedTree = false
  let projectsCounter = 0

  function render () {
    if (traversedTree && projects.length === projectsCounter) {
      response.render('index', {
        page: 'Projects',
        projects: projects.sort((projectA, projectB) => {
          return projectB.numberOfCommits - projectA.numberOfCommits
        }),
        numberOfCommits: projects
          .map(project => {
            return project.numberOfCommits
          })
          .reduce((projectA, projectB) => {
            return projectA + projectB
          }),
      })
    }
  }

  if (!projectsDir) {
    return false
  }

  const repoFinder = findit(projectsDir)

  repoFinder.on('directory', (dirPath, stat, stop) => {
    const baseName = path.basename(dirPath)
    const relativeDirName = dirPath.slice(projectsDir.length + 1)
    let ignoreList = [
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
      'contents',
    ]


    if (relativeDirName.split(path.sep).length > 3) {
      stop()
      return
    }

    if (global.config.Projects && global.config.Projects.ignore) {
      ignoreList = ignoreList.concat(global.config.Projects.ignore)
    }

    const invalidName = ignoreList.some(toIgnore => {
      return toIgnore.search('/') === -1
        ? baseName.toLowerCase() === toIgnore.toLowerCase()
        : relativeDirName.toLowerCase() === toIgnore.toLowerCase()
    })

    if (invalidName || (baseName[0] === '.' && baseName !== '.git')) {
      return stop()
    }

    if (dirPath.search(/\.git$/) === -1) return

    const repoPath = path.dirname(dirPath)

    projectsCounter++

    getNumberOfCommitsPromise(repoPath)
      .then(numberOfCommits => {
        const relativeRepoPath = path.relative(projectsDir, repoPath)
        const project = {
          id: repoPath,
          path: repoPath,
          link: relativeRepoPath,
          name: relativeRepoPath,
          numberOfCommits,
          faviconPath: path.join(relativeRepoPath, 'favicon.ico'),
        }

        projects.push(project)

        render()
      })
      .catch(error => {
        projectsCounter--
        // eslint-disable-next-line
        console.error(repoPath, error)
      })

    stop()
  })

  repoFinder.on('end', () => {
    traversedTree = true
    render()
  })

  repoFinder.on('error', error => {
    throw new Error(error)
  })
}
