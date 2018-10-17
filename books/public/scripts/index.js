/* globals bookUrl, ePub */
// TODO: remove globals

// const ePub = require('epubjs')

if (/\.epub$/.test(bookUrl)) {
  const book = ePub({
    restore: true,
    styles: {
      color: 'rgb(200, 200, 200)',
    },
  })

  book.open(bookUrl)

  book.renderTo('bookContent')

  document
    .getElementById('previous')
    .addEventListener('click', () => {
      book.prevPage()
    })

  document
    .getElementById('next')
    .addEventListener('click', () => {
      book.nextPage()
    })

  // book
  //  .getMetadata()
  //  .then(function (meta) {
  //    console.log(meta)
  //  })
}
