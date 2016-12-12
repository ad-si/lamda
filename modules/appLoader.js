const fs = require('fs')
const path = require('path')
const yaml = require('js-yaml')
const packageData = require('../package.json')


function getPackageContent (appPath) {
  if (fs.existsSync(path.join(appPath, 'package.yaml'))) {
    return yaml.safeLoad(
      fs.readFileSync(
        path.join(appPath, 'package.yaml'),
        'utf-8'
      )
    )
  }
  else if (fs.existsSync(path.join(appPath, 'package.json'))) {
    return require(path.join(appPath, 'package.json'))
  }
  else {
    throw new Error('Package file is missing!')
  }
}


function addAppToAppMap (appMap, appPath, rootApp, locals, appPaths) {
  const absoluteAppPath = path.join(locals.projectPath, appPath)
  const appName = path.basename(appPath)
  const localsClone = Object.assign({}, locals)

  try {
    let appModule = require(absoluteAppPath)

    if (appModule.isCallback) {
      appModule = appModule(localsClone)
    }
    appMap[appName] = getPackageContent(absoluteAppPath)

    if (!appMap[appName].hasOwnProperty('lamda')) {
      appMap[appName].lamda = {}
    }

    appMap[appName].lamda.module = appModule
    appMap[appName].lamda.path = absoluteAppPath

    Object.assign(appModule.locals, localsClone)
    appModule.locals.page = appName
    appModule.locals.baseURL = '/' + appName
    appModule.locals.appNames = rootApp.locals.appNames = appPaths.map(
      localAppPath => path.basename(localAppPath)
    )

    rootApp.use('/' + appName, appModule)
  }
  catch (error) {
    console.error('Following error occured while loading the app:', appName)
    console.error(error.stack)
  }

  return appMap
}


module.exports = (rootApp, locals) => {
  let appDirectories

  if (!fs.existsSync('apps')) {
    appDirectories = Object.keys(packageData.optionalDependencies)
      .map(name => {
        return path.join('node_modules', name)
      })
  }
  else {
    appDirectories = fs
      .readdirSync('./apps')
      .map(() => {
        return path.join('apps', name)
      })
  }

  return appDirectories
    .filter(appPath => {
      const isDirectory = fs
        .statSync(appPath)
        .isDirectory()
      return isDirectory && path.basename(appPath) !== 'boilerplate'
    })
    .reduce(
      (map, appPath, index, appPaths) =>
        addAppToAppMap(
          map,
          appPath,
          rootApp,
          locals,
          appPaths
        ),
    {}
  )
}
