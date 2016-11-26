!function (window, document) {

	var $aside = $('aside')

	$aside.find('li').each(function(index, listItem){
		listItem.click(function(event){
			alert('test')
		})
	})

}(window, document)
