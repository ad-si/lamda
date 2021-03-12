import Feedparser from 'feedparser'
import requestModule from 'request'

// import Crawler from 'crawler'
// const crawler = new Crawler({
//   maxConnections: 10,
//   // eslint-disable-next-line id-length
//   'callback': (error, result, $) => {
//     $('#content a')
//       .each((index, link) => {
//         // c.queue(link.href)
//         console.info(link.href)
//       })
//   },
// })


export default function (request, response) {
  const url = request.app.locals.news
    ? request.app.locals.news.url
    : 'http://feeds.feedblitz.com/newatlas'

  if (!url) {
    response.render('index', {
      page: 'news',
    })
    return
  }

  const articles = []
  const feedReq = requestModule(url)

  feedReq.on('error', error => {
    console.error(error)
  })
  feedReq.on('response', function (feedResponse) {
    const stream = this
    if (feedResponse.statusCode !== 200) {
      return this.emit('error', new Error('Bad status code'))
    }
    stream.pipe(feedparser)
  })


  const feedparser = new Feedparser()

  feedparser.on('error', error => {
    console.error(error)
  })
  feedparser.on('readable', function () {
    // This is where the action is!
    const stream = this
    let item

    // eslint-disable-next-line no-cond-assign
    while (item = stream.read()) {
      articles.push(item)
    }
  })
  feedparser.on('end', () => {
    response.render('index', {
      page: 'news',
      articles: articles,
    })
  })
}
