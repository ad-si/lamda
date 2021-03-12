import path from 'path'
import url from 'url'

import fse from 'fs-extra'


const dirname = path.dirname(url.fileURLToPath(import.meta.url))

async function getHtml () {
  const htmlPath = path.resolve(dirname, '../build/contacts.html')
  const html = await fse.readFileSync(htmlPath)
  return html
}

/**
* Get contacts app
* @returns {buffer}
*/
// eslint-disable-next-line id-blacklist
export default function (token = '', context, callback) {
  if (token !== process.env.contactsToken) {
    callback(
      null,
      new Buffer('Not Found'),
      {status: 404},
    )
    return
  }

  const options = {
    'content-type': 'text/html; charset=utf-8',
  }

  // Returning HTML is not yet supported for async functions
  // therefore the callback variant is used
  // (and stdlib requries the variable to be called `callback`)

  getHtml(context)
    .then(html => {
      callback(null, html, options)
    })
    .catch(error => callback(error))
}
