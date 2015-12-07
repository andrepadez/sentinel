var config = require('./config')
var fs = require('vigour-fs-promised')
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
  return fs.writeFileAsync(slack.checkFilePath, 255, 'utf8')
    .then(() => process.exit(255))
}
