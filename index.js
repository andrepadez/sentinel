var config = require('./config')
var log = require('npmlog')
var sentinel = require('./src')
var slack = require('./src/integration/slack')
var args = process.argv.slice(2)

sentinel.init(config)

if (args.indexOf('--notify-fail') !== -1) {
  sentinel.notifyFail()
    .catch(errorHandler)
} else {
  sentinel.cli()
    .catch(errorHandler)
}

function errorHandler (err) {
  log.error('Sentinel', 'CLI process failed', err)
  return fs.writeFile(slack.checkFilePath, 255, 'utf8')
    .then(() => process.exit(255))
}
