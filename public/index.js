!function () {

	var book = ePub({
		restore: true,
		styles: {
			color: 'rgb(200,200,200)'
		}
	})

	book.open(bookUrl)

	book.renderTo('bookContent')

	$('#previous').click(function () {
		book.prevPage()
	})

	$('#next').click(function () {
		book.nextPage()
	})

	book
		.getMetadata()
		.then(function (meta) {
			console.log(meta)
		})

}()
