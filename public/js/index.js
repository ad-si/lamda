!function (window, document) {

	if (typeof Mousetrap !== 'undefined')
		Mousetrap.bind('/', function(){
			document
				.getElementById('console')
				.toggle()
		})

	var themeSelector = document.getElementById('theme')

	if (themeSelector)
		themeSelector
			.addEventListener('change', function () {
				document
					.getElementById('themeLink')
					.setAttribute(
						'href',
						'/styles/themes/' + this.value +'.css'
					)
			})

}(window, document)
