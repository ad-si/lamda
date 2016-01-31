var fs = require('fs'),
    path = require('path'),
    yaml = require('js-yaml'),
    Feedparser = require('feedparser'),
    feedparser = new Feedparser,
    Crawler = require('crawler').Crawler,
    crawler = new Crawler({
	    maxConnections: 10,
	    callback: function (error, result, $) {

		    $("#content a").each(function (index, a) {
			    //c.queue(a.href)
			    console.log(a.href)
		    })
	    }
    })


module.exports = function (req, res) {

	var FeedParser = require('feedparser'),
	    request = require('request'),
	    url = req.app.locals.news ?
            req.app.locals.news.url :
            'http://feeds.feedblitz.com/gizmag',
	    feedparser = new FeedParser(),
	    articles = [],
    	feedReq


	//crawler.queue(url)

	if (url) {

		feedReq = request(url)

		feedReq.on('error', function (error) {
			throw new Error(error)
		})

		feedReq.on('response', function (res) {

			var stream = this

			if (res.statusCode != 200)
				return this.emit('error', new Error('Bad status code'))

			stream.pipe(feedparser)
		})


		feedparser.on('error', function (error) {
			throw new Error(error)
		})

		feedparser.on('readable', function () {
			// This is where the action is!
			var stream = this,
				meta = this.meta,
				item

			while (item = stream.read()) {
				articles.push(item)
			}
		})



		feedparser.on('end', function () {
			res.render('index', {
				page: 'news',
				articles: articles
			})
		})
	}
	else {
		res.render('index', {
			page: 'news'
		})
	}
}
