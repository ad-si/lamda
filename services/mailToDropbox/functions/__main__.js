const fse = require('fs-extra')
const yaml = require('js-yaml')
const express = require('@runkit/runkit/express-endpoint/1.0.0')
const formidable = require('formidable')
const Dropbox = require('dropbox')
const util = require('util')

const dropbox = new Dropbox({ accessToken: process.env.dropboxToken })
const app = express(exports)


function getFileName (date) {
  return date
    .toISOString()
    .replace(/:/g, '')
    .slice(0, 17)
    .toLowerCase()
}


async function parseData (stream) {
  return await new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm()

    form.parse(stream, (error, fields, files) => {
      if (error) {
        reject(error)
        return
      }

      resolve({ fields, files })
    })
  })
}


async function getAttachmentPromises (attachmentsObject, fileBasePath) {
  return Object
    .values(attachmentsObject)
    .map(async file => ({
      path: `${fileBasePath}_${file.name}`,
      contents: await fse.readFile(file.path),
    }))
}


async function uploadMail (request, emailCommentToken) {
  console.info('Start to parse mail data')

  const {fields, files} = await parseData(request)

  if (!fields.To || !fields.To.includes(emailCommentToken)) {
    return false
  }

  const now = new Date()
  const fileBasePath = `/Mails/${getFileName(now)}`
  const filePath = fileBasePath + '.yaml'

  const mail = {
    path: filePath,
    contents: yaml.safeDump(fields),
  }

  console.info(`Mail received at "${now.toISOString()}" has been parsed`)

  const attachments = await getAttachmentPromises(files, fileBasePath)
  const uploads = [mail, ...attachments]

  console.info(`${uploads.length} files to upload`)

  const results = await Promise.all(
    uploads.map(async fileObjPromise => {
      const fileObj = await fileObjPromise
      return dropbox.filesUpload(fileObj)
    })
  )

  console.info(
    results.map(uploadResult => {
      if (uploadResult.name) {
        return `Upload of file "…${uploadResult.name.slice(-8)}" was successful`
      }
      else {
        return uploadResult
      }
    })
  )

  return results
}


app.post('/', async (request, response, done) => {
  try {
    const results = await uploadMail(request, process.env.emailCommentToken)
    if (!results) response.sendStatus(406)
    else response.send(results)
  }
  catch (error) {
    done(util.inspect(error))
    return
  }
})
