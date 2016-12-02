/* globals Mousetrap */

if (typeof Mousetrap !== 'undefined') {
  Mousetrap.bind('/', () => {
    document
      .getElementById('console')
      .toggle()
  })
}

const themeSelector = document.getElementById('theme')

if (themeSelector) {
  themeSelector
    .addEventListener('change', () => {
      document
        .getElementById('themeLink')
        .setAttribute('href', `/styles/themes/${this.value}.css`)
    })
}
