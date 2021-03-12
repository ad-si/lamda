import path from 'path'
import url from 'url'

import pug from 'pug'
import fse from 'fs-extra'
import yaml from 'js-yaml'

const dirname = path.dirname(url.fileURLToPath(import.meta.url))


async function getHtml () {
  const compiledTemplate = pug.compileFile(
    path.resolve(dirname, '../views/home.pug'),
  )
  const dataFilePath = path.resolve(dirname, '../data.yaml')
  const dataYaml = await fse.readFile(dataFilePath)
  const data = yaml.load(dataYaml)
  const html = compiledTemplate(data)

  return html
}


/**
* Home page
* @param {String} token Authentication token
* @returns {Buffer}
*/
// eslint-disable-next-line id-blacklist
export default function (token = '', context, callback) {
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
