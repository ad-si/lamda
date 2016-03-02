'use strict'

const Ybdb = require('ybdb')
const db = new Ybdb()

// Contacts is set in script tag in HTML
db.object.contacts = contacts

const selectNoneButton = document.getElementById('selectNone')
const selectAllButton = document.getElementById('selectAll')
const tableBody = document.querySelector('tbody')
let numberOfSelectedContacts = 0

function setSelectButtonsVisibility () {
	if (numberOfSelectedContacts === 0) {
		selectNoneButton.classList.add('hidden')
		selectAllButton.classList.remove('hidden')
	}
	else if (numberOfSelectedContacts === contacts.length) {
		selectAllButton.classList.add('hidden')
		selectNoneButton.classList.remove('hidden')
	}
	else {
		selectNoneButton.classList.remove('hidden')
		selectAllButton.classList.remove('hidden')
	}
}


// Disable propagation of clicks on links
Array.from(tableBody.querySelectorAll('tr a'))
	.forEach(link => link.addEventListener('click', (event) => {
		event.stopPropagation()
	}))

// Select/deselect contacts on click
tableBody.addEventListener('click', (event) => {
	const clickedRow = event.path.find(element => element.tagName === 'TR')

	if (clickedRow) {
		clickedRow.classList.toggle('selected')

		numberOfSelectedContacts +=
			clickedRow.classList.contains('selected') ? +1 : -1
		setSelectButtonsVisibility()
	}
})


// Select all
selectAllButton.addEventListener('click', () => {
	const unselectedContacts = tableBody.querySelectorAll('tr:not(.selected)')
	Array
		.from(unselectedContacts)
		.forEach(row => row.classList.add('selected'))

	numberOfSelectedContacts += unselectedContacts.length
	console.log(numberOfSelectedContacts, contacts.length)

	setSelectButtonsVisibility()
})

// Select none
selectNoneButton.addEventListener('click', () => {
	Array
		.from(tableBody.querySelectorAll('tr.selected'))
		.forEach(row => row.classList.remove('selected'))
	numberOfSelectedContacts = 0
	setSelectButtonsVisibility()
})
