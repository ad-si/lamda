const fs = require('fs')
const path = require('path')

const pathToJson = require('../modules/pathToJson')

module.exports = (request, response) => {
  const pathParam = request.params[0] || ''
  const columns = []
  let depth = 0
  let currentPath = ''

  function buildColumns (fileTree) {
    if (fileTree.children) {
      if (!columns[depth]) {
        columns[depth] = {
          path: currentPath,
          entries: [],
        }
      }

      fileTree.children.forEach(child => {
        child.path = currentPath + '/' + child.fileName

        if (child.hasOwnProperty('children')) {
          columns[depth].path = currentPath
          currentPath =  currentPath + '/' + child.name

          child.active = true
          columns[depth].entries.push(child)

          depth++
          buildColumns(child)
          depth--
        }
        else {
          columns[depth].entries.push(child)

          if (child.hasOwnProperty('active')) {
            depth++
            buildColumns(child)
            depth--
          }
        }
      })
    }
    else {
      columns[depth] = fileTree

      const fileExtensions = ['txt', 'yaml', 'json']

      if (fileExtensions.indexOf(columns[depth].extension) > -1) {
        columns[depth].content = fs.readFileSync(
          path.join(request.app.locals.basePath, columns[depth].path),
          'utf-8'
        )
      }
    }


    return columns
  }

  const fileTree = pathToJson(request.app.locals.basePath, pathParam)
  const processedColumns = buildColumns(fileTree)

  response.render('index', {
    page: 'files',
    columns: processedColumns,
  })
}
