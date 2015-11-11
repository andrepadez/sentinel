
var spawn = require('child_process').spawn


module.exports = function(command, verbose, forceResolve){
  return new Promise((resolve, reject) => {
    var errorMessage = `error executing cmd: '${command}'`
    var args = command.split(' ')
    var cmd = args.shift()
    var spawned = spawn(cmd, args, { stdio: 'inherit'})
    spawned.on('exit', function(code){
      if(code === 0 || forceResolve){
        resolve(code)
      } else {
        reject(errorMessage)
      }
    })
    spawned.on('error', () => reject(errorMessage))
  })
}
