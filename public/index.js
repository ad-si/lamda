// TODO: Use browserify to load javascript

!function () {

	$('img')
		.one('load', function (event) {
			$(event.target)
				.closest('a')
				.css('background-image', 'none')
		})
		.each(function () {
			if (this.complete)
				$(this).load()
		})

}()
