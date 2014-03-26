var api = require('./api')

module.exports = function (req, res) {

	api.files('/lamda/home/', function(data){
		res.render('index', {
			page: 'home',
			files: data
		})
	})
}
