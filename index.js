console.log('in index.js')

var config = require('./config')
var sentinel = require('./src')
var slackIntegration = require('./src/integration/slack/')
var args = process.argv.slice(2)

sentinel.init(config)

if (args.indexOf('--notify-fail') !== -1) {
  slackIntegration.init(config)
  slackIntegration.notify(0, false)
} else {
  sentinel.cli()
    .catch((err) => log.error('Sentinel', 'CLI process failed', err))
}
