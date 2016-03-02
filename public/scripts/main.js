'use strict'

const Ybdb = require('ybdb')
const db = new Ybdb()

db.object.contacts = contacts


// Selection of contacts
Array.from(document.querySelectorAll('tr a'))
	.forEach(link => link.addEventListener('click', (event) => {
		event.stopPropagation()
	}))

document
	.querySelector('tbody')
	.addEventListener('click', (event) => {
		event.path
			.find(element => element.tagName === 'TR')
			.classList.toggle('selected')
	})
