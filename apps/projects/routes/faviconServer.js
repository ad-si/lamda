import fs from 'fs'
import path from 'path'
import findit from 'findit'


export default function (config = {}) {
  const iconPathCache = {}
  const ignoreList = [
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
    'cache',
  ]

  return function (request, response, next) {
    function sendFavicon (faviconPath) {
      iconPathCache[request.url] = faviconPath

      if (path.extname(faviconPath) === '.svg') {
        response.set({
          'Content-Type': 'image/svg+xml',
        })
      }

      const stream = fs.createReadStream(faviconPath)
      stream.on('error', error => {
        // eslint-disable-next-line
        console.error(error)
        delete iconPathCache[request.url]
        searchFavicon()
      })
      stream.pipe(response)
    }

    function noFavicon () {
      iconPathCache[request.url] = false

      response
        .status(204)
        .send()
    }

    function searchFavicon () {
      const absRepoPath = path.join(
        config.projectsDir,
        path.dirname(request.url),
      )
      const faviconPaths = [
        'img/favicon.png',
        'favicon.ico',
        'images/favicon.png',
      ]
      let faviconPath

      const foundFavicon = faviconPaths.some(relFaviconPath => {
        faviconPath = path.join(absRepoPath, relFaviconPath)
        return fs.existsSync(faviconPath)
      })

      if (foundFavicon) {
        sendFavicon(faviconPath)
      }
      else {
        const finder = findit(absRepoPath)

        finder.on('directory', (dir, stats, stop) => {

          const baseName = path.basename(dir)
          const invalidName = ignoreList.some(toIgnore => {
            return baseName === toIgnore
          })

          if (invalidName || (baseName[0] === '.' && baseName !== '.git')) {
            stop()
            return
          }

          if (
            path
              .relative(absRepoPath, dir)
              .split(path.sep).length > 4
          ) {
            finder.stop()
            noFavicon()
          }
        })

        finder.on('file', filePath => {
          if (
            path.basename(filePath) === 'favicon.png' ||
            path.basename(filePath) === 'favicon.svg' ||
            path.basename(filePath) === 'favicon.ico'
          ) {
            finder.stop()
            sendFavicon(filePath)
          }
        })

        finder.on('end', () => {
          noFavicon()
        })
      }
    }

    if (request.url.search(/favicon.ico$/) === -1) {
      next()
    }
    else if (iconPathCache[request.url] === false) {
      noFavicon()
    }
    else if (iconPathCache[request.url]) {
      sendFavicon(iconPathCache[request.url])
    }
    else {
      searchFavicon()
    }
  }
}
