/* globals rawTasks, defaultConfig */

console.log(defaultConfig)


const Vue = require('vue')
const VueResource = require('vue-resource')

Vue.use(VueResource)

// const addViewButton = document.getElementById('addViewButton')
// const modalBackdrop = document.getElementById('modalBackdrop')
// const modal = document.getElementById('modal')

// eslint-disable-next-line no-unused-vars
const app = new Vue({
  el: '#tasks',
  data: {
    tasks: rawTasks,
    views: defaultConfig.views,
    currentViewName: 'Overdue',
  },
  computed: {
    normalizedTasks: function () {
      return this.tasks
        .map(task => {
          if (!task.creationDate) task.creationDate = task.creation_date
          if (!task.creationDate) task.creationDate = task.created_at
          if (task.creationDate) {
            task.creationDate = new Date(task.creationDate)
            task.creationDateFormatted = task.creationDate
              .toISOString()
              .substr(0, 10)
          }

          if (!task.dueDate) task.dueDate = task.due
          if (!task.dueDate) task.dueDate = task.due_to
          if (!task.dueDate) task.dueDate = task.due_date
          if (task.dueDate) {
            task.dueDate = Date.parse(task.dueDate)

            if (!Number.isNaN(task.dueDate)) {
              task.dueDateFormatted = new Date(task.dueDate)
                .toISOString()
                .substr(0, 10)
            }
          }

          return task
        })
    },
    currentView: function () {
      return this.views.find(
        view => view.name === this.currentViewName
      )
    },
    filteredTasks: function () {
      return this.normalizedTasks.filter(this.currentView.filter)
    },
  },
  methods: {
    setCurrentView: function (viewName) {
      this.currentViewName = viewName
    },
    editFile: function (absoluteFilePath) {
      this.$http
        .get(`/open${absoluteFilePath}`)
        .catch(error => console.error(error))
    },
  },
})
