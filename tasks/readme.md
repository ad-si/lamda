# Tasks

## Getting started

```shell
npm start
```

Or to start it in the backgroud:

```shell
npm install --global forever && \
forever start server.js
```


## Configuration

Loading hierarchy:

- `~/.config/lamda/lamda.yaml` (All data of the `tasks` key)
- `~/.config/lamda/tasks.yaml`
- Environment variables (`LAMDA_TASKS_*`) // TODO
- Command line arguments // TODO


Example config file:

```yaml
port: 1234,
directories:
  - ~/Dropbox/tasks
  - ~/Dropbox (MyCompany)/ProjectA/tasks

views:
  - name: Overdue
    filter: !!js/function |
      function (task) {
        return !task.completed && task.dueDate
          ? task.dueDate < new Date()
          : false
      }
    sort: !!js/function |
      function (taskA, taskB) {
        return taskA.dueDate && taskB.dueDate
          ? taskA.dueDate > taskB.dueDate
          : 0
      }
    map: !!js/function |
      function (task) {
        delete task.uselessKey
        return task
      }

  - name: With due date
    filter: !!js/function |
      function (task) {
        return !task.completed && Boolean(task.dueDate)
      }
```

## Usage

All task files get flattened and normalized before being passed to the renderer.
A normalized task object looks like this:

```yaml
title: Buy milk
description: Go to the mall and buy some milk.
creationDate: 2015-03-18 09:37
dueDate: 2016-09-22 19:55
state: open # closed, in progress, …
```
