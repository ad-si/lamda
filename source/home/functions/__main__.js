const path = require('path')

const pug = require('pug')
const fse = require('fs-extra')
const yaml = require('js-yaml')


async function getHtml () {
  const compiledTemplate = pug.compileFile(
    path.resolve(__dirname, '../views/home.pug')
  )
  const dataFilePath = path.resolve(__dirname, '../data.yaml')
  const dataYaml = await fse.readFile(dataFilePath)
  const data = yaml.safeLoad(dataYaml)
  const html = compiledTemplate(data)

  return html
}


/**
* Home page
* @param {String} token Authentication token
* @returns {Buffer}
*/
// eslint-disable-next-line id-blacklist
module.exports = (token = '', context, callback) => {
  if (token !== process.env.homeToken) {
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
      callback(null, Buffer.from(html), options)
    })
    .catch(error => callback(error))
}
