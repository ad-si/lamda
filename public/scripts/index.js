const asides = document.getElementsByTagName('aside')

Array
  .from(asides[0].querySelector('li'))
  .forEach(listItem => {
    listItem.addEventListener('click', () => {
      alert('test')
    })
  })
