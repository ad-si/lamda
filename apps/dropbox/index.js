const util = require('util')
const assert = require('assert')

const fetch = require('node-fetch') // Used by Dropbox
const Dropbox = require('dropbox').Dropbox
const express = require('express')
const yaml = require('js-yaml')

const app = express()
const developmentMode = false


function isYamlEntry (entry) {
  return entry['.tag'] === 'file' &&
    entry.name.endsWith('.yaml')
}


function fileToJson (file) {
  const fileContent = Buffer
    .from(file.fileBinary, 'binary')
    .toString()

  return yaml.safeLoad(fileContent)
}


async function loadData (path) {
  assert(path, "You must specify a path")

  if (developmentMode) {
    return [
      {
        name: 'John Doe',
        birthday: new Date('1963-05-14'),
      },
      {
        name: 'Anna Smith',
        birthday: new Date('1985-10-03'),
      },
    ]
  }

  console.info(`Load YAML files from Dropbox at "${path}"`)

  const dropbox = new Dropbox({
    fetch,
    accessToken: 'wxGSk-Ylcf0AAAAAAACVp570y0tQ44SVX3aWpEH5oQYxHABB2A4e0-tAw7peRMv3',
  })
  const response = await dropbox.filesListFolder({path})

  if (response.has_more) {
    throw new Error('Not all files were loaded')
  }

  const files = await Promise.all(
    response.entries
      .filter(isYamlEntry)
      .map(entry => dropbox
        .filesDownload({path: entry.path_display})
      )
  )

  console.info(`Found ${files.length} entries`)

  return await Promise.all(
    files.map(fileToJson)
  )
}


async function tryToLoadData (counter, path) {
  try {
    const data = await loadData(path)
    return data
  }
  catch (error) {
    counter -= 1

    console.error(`Try failed. Try ${counter} more times.`)
    console.error(util.inspect(error, {colors: true, depth: null}))

    return counter
      ? tryToLoadData(counter, path)
      : 'An error occured'
  }
}

app.use(express.json())

app.get('/', async (req, res, next) => {
  const counter = 5
  const path = req.query.path || req.body.path

  try {
    assert(path, "A path must be specified as a query or body parameter!")
    res.json(await tryToLoadData(counter, path))
  }
  catch (error) {
    return next(error)
  }
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500)
})

app.listen(3000, () => {
  console.info('Server started')
})
