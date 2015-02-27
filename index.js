module.exports = function(tasks, callback){
  tasks = tasks.slice(0)

  var results = []
  var rollbacks = []

  function run(task){
    var up, down

    if( 'function' === typeof task ){
      up = task
      down = null
    } else {
      up = task.up
      down = task.down
    }

    function next(err){
      if( err ) return halt(err)

      var result = Array.prototype.slice.call(arguments, 1)
      var rollback = function(cb){
        if( down ) {
          down.apply(undefined, [cb].concat(result))
        } else {
          cb(null, result)
        }
      }

      results.push(result)
      rollbacks.unshift(rollback)

      if( tasks.length ) {
        run(tasks.shift())
      } else {
        succeed()
      }
    }

    up.call(undefined, next)
  }

  function halt(err){
    function run(rollback){
      if( rollback ){
        rollback(function(){
          run(rollbacks.shift())
        })
      } else {
        if( callback ) callback(err, results)
      }
    }

    run(rollbacks.shift())
  }

  function succeed(){
    if( callback ) callback(null, results)
  }

  run(tasks.shift())
}
