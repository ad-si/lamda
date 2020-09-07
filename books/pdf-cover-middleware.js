const fs = require('fs')
const path = require('path')
const url = require('url')

const gm = require('gm')
const os = require('os')
const mkdirp = require('mkdirp')

const cpus = os.cpus()

const idleQueue = []
const workers = []


function workOffQueue (worker, firstPdf, callback) {

  function afterWrite (error, pdf) {
    if (error) {
      callback(error)
      if (pdf.callback) {
        pdf.callback(error)
      }
      return
    }

    console.log(
      'Thumbnail:',
      pdf.absolutePath, '->', pdf.absoluteThumbnailPath
    )

    if (pdf.callback) {
      pdf.callback(null, pdf.absoluteThumbnailPath)
    }

    let nextPdf = idleQueue.pop()

    if (nextPdf) {
      worker.pdf = nextPdf
      convert(nextPdf)
    }
    else {
      callback()
    }
  }


  function convert (pdf) {
    const pathDirectories = pdf.absoluteThumbnailPath.split('/')
    pathDirectories.pop()

    mkdirp(
      path.normalize(pathDirectories.join('/')),
      (error) => {
        if (error) {
        	callback(error)
        	return
        }

        // TODO: Just try to create file and handle error
        if (fs.existsSync(pdf.absoluteThumbnailPath)) {
          callback()
          return
        }

        // TODO: Use streams to directly stream the response
        // Only convert page 0
        gm(pdf.absolutePath + '[0]')
          .resize(pdf.width, pdf.height, pdf.modifier)
          .noProfile()
          .write(
            pdf.absoluteThumbnailPath,
            error => afterWrite(error, pdf)
          )
      }
    )
  }


  convert(firstPdf)
}


function addWorker () {
  const currentPdf = idleQueue.pop()

  if (!currentPdf) {
    return
  }

  const worker = {
    id: new Date(),
    pdf: currentPdf
  }

  workers.push(worker)

  workOffQueue(
    worker,
    currentPdf,
    () => workers.splice(workers.indexOf(worker), 1)
  )
}


function addToQueue (pdf) {
  const positionInQueue = idleQueue
    .map(pdf => pdf.absolutePath)
    .indexOf(pdf.absolutePath)

  const processingWorker = workers
    .map(worker => worker.pdf.absolutePath)
    .indexOf(pdf.absolutePath)

  if (positionInQueue != -1 || processingWorker != -1) {
    return
  }

  idleQueue.push(pdf)

  if (workers.length < cpus.length) {
    addWorker()
  }
}


function getMiddleware (options = {}) {
  const thumbnailsPath = options.thumbnailsPath ||
    path.join(__dirname, 'thumbs')
  const basePath = options.basePath || global.basePath

  console.assert(basePath, 'BasePath is not specified')

  return function (request, response, next) {

    const fileUrl = url.parse(request.url, true)
    const width = Number(fileUrl.query.width)
    const height = Number(fileUrl.query.height)
    const maxWidth = Number(fileUrl.query['max-width'])
    const maxHeight = Number(fileUrl.query['max-height'])
    const pathFromUrl = decodeURIComponent(fileUrl.pathname)

    // Skip middleware if…
    if (!/\.pdf\.jpe?g$/.test(pathFromUrl) ||  // is not an PDF image or
      !(width || height || maxWidth || maxHeight)  // has no size parameter
    ) {
      next()
      return
    }

    const fullExtension = '.' + pathFromUrl.split('.').slice(1).join('.')
    const fileName = path.basename(pathFromUrl, fullExtension)

    const calculatedWidth = maxWidth || width
    const calculatedHeight = maxHeight || height

    let modifier = '!'

    if (maxWidth || maxHeight) {
      modifier = '>'
    }

    const thumbnailPath = pathFromUrl
      .replace(new RegExp(fullExtension + '$'), '') + '_' +
      calculatedWidth + 'x' + calculatedHeight + modifier +
      fullExtension
    const fileExtension = path.extname(pathFromUrl)

    const pdf = {
      absolutePath: path.join(basePath,
      	path.basename(pathFromUrl, fileExtension)),
      absoluteThumbnailPath: path.join(thumbnailsPath, thumbnailPath),
      modifier,
      width: calculatedWidth,
      height: calculatedHeight,
      callback: (error, absoluteThumbnailPath) => {
        if (error) {
          next(error)
          return
        }

        fs
          .createReadStream(absoluteThumbnailPath)
          .pipe(response)
      },
    }

    const stream = fs.createReadStream(pdf.absoluteThumbnailPath)

    stream.on('error', (error) => {
      if (error.code !== 'ENOENT') {
        next(error)
        return
      }

      // Create thumbnail if it does not exist yet
      addToQueue(pdf)
    })

    stream.pipe(response)
  }
}


module.exports = {addToQueue, getMiddleware}
