const fse = require('fs-extra')
const path = require('path')

async function getHtml () {
  const htmlPath = path.resolve(__dirname, '../build/contacts.html')
  const html = await fse.readFileSync(htmlPath)
  return html
}

/**
* Get contacts app
* @returns {buffer}
*/
// eslint-disable-next-line id-blacklist
module.exports = (token = '', context, callback) => {
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
