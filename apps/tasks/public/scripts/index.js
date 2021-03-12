/* globals rawTasks, defaultConfig */

import Vue from 'vue'
import VueResource from 'vue-resource'

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
    currentViewName: defaultConfig.views[0].name,
    newTaskTitle: '',
  },
  computed: {
    currentView: function () {
      return this.views.find(
        view => view.name === this.currentViewName,
      )
    },
    processedTasks: function () {
      let processedTasks = this.tasks

      if (this.currentView.filter) {
        processedTasks = processedTasks.filter(this.currentView.filter)
      }
      if (this.currentView.sort) {
        processedTasks = processedTasks.sort(this.currentView.sort)
      }
      if (this.currentView.map) {
        processedTasks.map(this.currentView.map)
      }

      return processedTasks
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
    addNewTask: function () {
      const currentURL = new URL(window.location)
      this.$http
        .post(currentURL.pathname, {title: this.newTaskTitle})
        .catch(error => console.error(error))
    },
  },
})
