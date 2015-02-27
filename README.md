# Disclaimer

**Don't use this LIB! [This](https://github.com/mjlescano/batch) one does the same with a much better interface.**

# Fail Safe Queue

It's a very simple Queue of functions. But also let's you define, for each one, a
rollback in case something goes wrong later on the queue stack calling.

Heavily inspired by [caolan/async](https://github.com/caolan/async).

## Installation
`npm install fail-safe-queue --save`

## Quick Examples

__Success example:__
```js
var queue = require('fail-safe-queue')

queue([
  {
    up: function(next){
      console.log('+ up! 1')
      next(null, 1)
    },
    down: function(prev){
      console.log('- down! 1')
      prev()
    }
  },
  function(next){
    console.log('+ up! 2')
    next(null, 2)
  },
  {
    up: function(next){
      console.log('+ up! 3')
      next('3 con error', 3)
    },
    down: function(prev){
      console.log('- down! 3')
      prev()
    }
  }
], function(err, upResults, downResults){
  console.log('err', err)
  console.log('upResults', upResults)
})
```
__Will echo:__
```
  + up! 1
  + up! 2
  + up! 3
  err null
  results [ [ 1 ], [ 2 ], [ 3 ] ]
```


__Fail example:__
```js
var queue = require('fail-safe-queue')

queue([
  {
    up: function(next){
      console.log('+ up! 1')
      next(null, 1)
    },
    down: function(prev){
      console.log('- down! 1')
      prev()
    }
  },
  {
    up: function(next){
      console.log('+ up! 2')
      next('This method triggered an error :S', 2)
    },
    down: function(prev){
      console.log('- down! 2')
      prev()
    }
  },
  {
    up: function(next){
      console.log('+ up! 3')
      next(null, 3)
    },
    down: function(prev){
      console.log('- down! 3')
      prev()
    }
  }
], function(err, upResults){
  console.log('err', err)
  console.log('upResults', upResults)
})
```
__Will echo:__
```
  + up! 1
  + up! 2
  - down! 1
  err This method triggered an error :S
  results [ [ 1 ] ]
```

## API

### queue(tasks, [callback])

__Arguments__
* `tasks` - It's an array of tasks. Each task could be a simple function to be
  called in order or an object with two functions, `up: [Function(next)]` and
  `down: [Function(prev)]`.
* `callback(err, results)` - An optional callback to run once all the functions
  have completed. This function gets a results array containing all the result
  arguments passed to the `task` callbacks.
