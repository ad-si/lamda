const fse = require('fs-extra')
const path = require('path')

async function getHtml () {
  const htmlPath = path.resolve(__dirname, '../../build/contacts.html')
  const html = await fse.readFileSync(htmlPath)
  return html
}

/**
* Get contacts app
* @returns {buffer}
*/
module.exports = (context, callback) => {
  getHtml()
    .then(html => {
      callback(
        null,
        html,
        {
          'content-type': 'text/html; charset=utf-8',
        }
      )
    })
}
