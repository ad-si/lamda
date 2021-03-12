import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { fileURLToPath } from 'url'

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
    return require(path.join(appPath, 'package.json'))
  }
  else {
    throw new Error('Package file is missing!')
  }
}


async function addAppToAppMap (appMap, appPath, rootApp, locals, appPaths) {
  const absoluteAppPath = path.join(locals.projectPath, appPath)
  const appName = path.basename(appPath)
  const localsClone = Object.assign({}, locals)

  try {
    let appModule = await import(path.join(absoluteAppPath, 'server.js'))

    if (appModule.isCallback) {
      appModule = appModule(localsClone)
    }
    appMap[appName] = getPackageContent(absoluteAppPath)

    if (!Object.hasOwnProperty.call(appMap[appName], 'lamda')) {
      appMap[appName].lamda = {}
    }

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


export default async function (rootApp, locals) {
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

  const apps = appDirectories.reduce(
    async (map, appPath, index, appPaths) =>
      await addAppToAppMap(
        map,
        appPath,
        rootApp,
        locals,
        appPaths,
      ),
    {},
  )

  console.info(apps)

  return apps
}
