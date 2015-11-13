
var spawn = require('child_process').spawn


module.exports = function(command, verbose, forceResolve){
  return new Promise((resolve, reject) => {
    // verbose = true //[TODO] delete this line
    var errorMessage = `error executing cmd: '${command}'`

    var args
    var cmd

    if(typeof command === 'object'){
      cmd = command.cmd
      args = command.args
    } else {
      args = command.split(' ')
      cmd = args.shift()
    }
    var stdio = verbose? 'inherit' : null
    var spawned = spawn(cmd, args, { stdio: stdio})
    spawned.on('exit', function(code){
      if(code === 0 || forceResolve){
        resolve(code)
      } else {
        reject(errorMessage)
      }
    })
    spawned.on('error', () => {
      console.log(require('util').inspect(command, { depth: null }));
      reject(errorMessage)}
    )
  })
}
