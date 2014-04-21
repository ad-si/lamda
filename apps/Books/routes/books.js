var fs = require('fs'),
	path = require('path'),
	yaml = require('js-yaml')


module.exports = function (req, res) {

	var books = [],
	//files = fs.readdirSync(global.baseURL + '/books'),
	//fileCounter = files.length,
		files = [
			{
				name: 'Book 1',
				imageSource: '/img/placeholder.jpg'
			},
			{
				name: 'Book 2',
				imageSource: '/img/placeholder.jpg'
			},
			{
				name: 'Book 3',
				imageSource: '/img/placeholder.jpg'
			}
		]


	res.render('index', {
		page: 'books',
		books: files
	})


	// TODO: Adapt for books
	/*files.forEach(function (file) {


	 if (path.extname(file) === '.epub') {

	 var filePath = global.baseURL + '/books/' + file

	 fs.readFile(
	 filePath,
	 {encoding: 'utf-8'},
	 function (error, fileContent) {

	 if (error) throw error

	 var jsonData = yaml.safeLoad(fileContent)

	 jsonData.imageSource = '/img/things/' +
	 path.basename(filePath, '.yaml') + '.jpg'

	 things.push(jsonData)

	 if (things.length === fileCounter) {

	 res.render('index', {
	 page: 'things',
	 things: things
	 })
	 }
	 })
	 }
	 else
	 fileCounter--

	 })*/
}
