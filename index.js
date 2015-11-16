console.log('in index.js')

var config = require('./config')
var sentinel = require('./src')
var slackIntegration = require('./src/integration/slack/')
var args = process.argv.slice(2)

sentinel.init(config)

if (args.indexOf('--notify-fail') !== -1) {
  sentinel.notifyFail()
    .catch(errorHandler)
} else {
  sentinel.cli()
    .catch(errorHandler)
}

function errorHandler(){
  log.error('Sentinel', 'CLI process failed', err)
}
