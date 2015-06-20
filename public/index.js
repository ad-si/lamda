!function (document, window) {

	if (/\.epub$/.test(bookUrl)) {

		var book = ePub({
			restore: true,
			styles: {
				color: 'rgb(200,200,200)'
			}
		})

		book.open(bookUrl)

		book.renderTo('bookContent')

		document
			.getElementById('previous')
			.addEventListener('click', function () {
				book.prevPage()
			})

		document
			.getElementById('next')
			.addEventListener('click', function () {
				book.nextPage()
			})

		book
			.getMetadata()
			.then(function (meta) {
				console.log(meta)
			})
	}
	else {

	}

}(document, window)
