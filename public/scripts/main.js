'use strict'

const json2csv = require('json2csv')
const fileSaver = require('filesaver.js')
const getFields = require('../../modules/getFields')
const formatForCsv = require('../../modules/formatForCsv')
const Ybdb = require('ybdb')
const db = new Ybdb()

// Contacts is set in script tag in HTML
db.object.contacts = contacts

const selectNoneButton = document.getElementById('selectNone')
const selectAllButton = document.getElementById('selectAll')
const exportButton = document.getElementById('export')
const tableBody = document.querySelector('tbody')
let numberOfSelectedContacts = 0

function setSelectButtonsVisibility () {
	if (numberOfSelectedContacts === 0) {
		selectNoneButton.classList.add('hidden')
		selectAllButton.classList.remove('hidden')
		exportButton.classList.add('hidden')
	}
	else if (numberOfSelectedContacts > 0) {
		selectNoneButton.classList.remove('hidden')
		exportButton.classList.remove('hidden')

		if (numberOfSelectedContacts === contacts.length) {
			selectAllButton.classList.add('hidden')
		}
		else {
			selectAllButton.classList.remove('hidden')
		}
	}
}

function getSelected () {
	return Array.from(tableBody.querySelectorAll('tr.selected'))
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
	setSelectButtonsVisibility()
})

// Select none
selectNoneButton.addEventListener('click', () => {
	getSelected().forEach(row => row.classList.remove('selected'))
	numberOfSelectedContacts = 0
	setSelectButtonsVisibility()
})


// Export selected
exportButton.addEventListener('click', (event) => {
	event.preventDefault()

	const contactsToBeExported = []

	getSelected()
		.map(element => element.id)
		.forEach(contactId => {
			contactsToBeExported.push(
				db('contacts')
					.chain()
					.find({id: contactId})
					.omit(['id', 'mapLink'])
					.value()
			)
		})

	json2csv(
		{
			data: formatForCsv(contactsToBeExported),
			fields: getFields(contactsToBeExported),
		},
		(error, csv) => {
			if (error)
				throw error

			const csvText = csv.replace(/(,?)null(,?)/g, '$1$2')
			const csvBlob = new Blob(
				[csvText],
				{type: 'text/csv;charset=utf-8'}
			)
			fileSaver.saveAs(csvBlob, 'contacts.csv')
		}
	)
})
