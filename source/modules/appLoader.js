import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import yaml from 'js-yaml'
import debug from 'debug'

const log = debug('lamda:app-loader')
const dirname = path.dirname(fileURLToPath(import.meta.url))
const packageData = JSON.parse(
  fs.readFileSync(path.join(dirname, '../../package.json'), 'utf-8'),
)
const appsDir = path.resolve(dirname, '../../apps')


function getPackageContent (appPath) {
  if (fs.existsSync(path.join(appPath, 'package.yaml'))) {
    return yaml.load(
      fs.readFileSync(
        path.join(appPath, 'package.yaml'),
        'utf-8',
      ),
    )
  }
  else if (fs.existsSync(path.join(appPath, 'package.json'))) {
    return JSON.parse(
      fs.readFileSync(path.join(appPath, 'package.json'), 'utf-8')
    )
  }
  else {
    throw new Error('Package file is missing!')
  }
}


async function addAppToAppMap (appMap, appPath, rootApp, locals, appPaths, appToPaths) {
  const absoluteAppPath = path.join(locals.projectPath, appPath)
  const appName = path.basename(appPath)
  const localsClone = Object.assign({}, locals)

  localsClone.lamda = {filePaths: appToPaths[appName.toLowerCase()]}

  log('Try to add app %s to appMap', appName)

  try {
    const modulePath = path.join(absoluteAppPath, 'index.js')
    let appModule = await import(modulePath)

    if (appModule.isCallback) {
      appModule = appModule.default(localsClone)
    }
    appMap[appName] = getPackageContent(absoluteAppPath)
    appMap[appName].lamda = appMap[appName].lamda || localsClone.lamda || {}
    appMap[appName].lamda.module = appModule
    appMap[appName].lamda.path = absoluteAppPath

    Object.assign(appModule.locals, localsClone)
    appModule.locals.page = appName
    appModule.locals.baseURL = '/' + appName
    appModule.locals.appNames = rootApp.locals.appNames = appPaths.map(
      localAppPath => path.basename(localAppPath),
    )

    rootApp.use('/' + appName, appModule)
  }
  catch (error) {
    console.error('Following error occured while loading the app:', appName)
    console.error(error.stack)
  }

  return appMap
}


export default async function ({app, locals, appToPaths}) {
  let appDirectories

  if (!fs.existsSync(appsDir)) {
    appDirectories = Object.keys(packageData.optionalDependencies)
      .map(name => path.join('node_modules', name))
  }
  else {
    appDirectories = fs
      .readdirSync(appsDir)
      .filter(appDir =>
        appDir !== '.DS_Store' &&
        !appDir.endsWith('boilerplate') &&
        !appDir.startsWith('_draft_'),
        // Should not be necessary, since the content of the dir is predefined
        // const isDirectory = fs
        //   .statSync(appPath)
        //   .isDirectory()
      )
      .map(name => path.join('apps', name))
  }

  const appsPromise = appDirectories.reduce(
    async (map, appPath, index, appPaths) =>
      await addAppToAppMap(
        map,
        appPath,
        app,
        locals,
        appPaths,
        appToPaths,
      ),
    {},
  )

  const apps = await appsPromise
  log('Following apps are available: %o', Object.keys(apps))

  return apps
}
