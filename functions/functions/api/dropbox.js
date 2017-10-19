const Dropbox = require('dropbox')
const yaml = require('js-yaml')

const developmentMode = true


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


/**
* Load directory containting YAML files from Dropbox
* @param {string} path Path to directory in Dropbox
* @returns {array} Array of objects
*/
module.exports = async (path) => {
  if (developmentMode) {
    return [
      {name: 'John Doe'},
      {name: 'Anna Smith'},
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
