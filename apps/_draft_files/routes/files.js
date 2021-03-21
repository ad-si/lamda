import fs from 'fs'
import path from 'path'

import pathToJson from '../modules/pathToJson.js'


export default function (request, response) {
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

        if (Object.prototype.hasOwnProperty.call(child, 'children')) {
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

          if (Object.prototype.hasOwnProperty.call(child, 'active')) {
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
          'utf-8',
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
