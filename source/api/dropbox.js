const util = require('util')

const Dropbox = require('dropbox')
const yaml = require('js-yaml')

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
    accessToken: process.env.dropboxAccessToken,
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


/**
* Load directory containting YAML files from Dropbox
* @param {string} path Path to directory in Dropbox
* @returns {array} Array of objects
*/
module.exports = async (path) => {
  const counter = 10
  return await tryToLoadData(counter, path)
}
