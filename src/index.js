var path = require('path')
var fs = require('vigour-fs-promised')
var log = require('npmlog')
var exec = require('./utils/exec')
var config

var slack = require('./integration/slack')

module.exports = {
  init: function (cfg) {
    config = cfg
    var pkg = config.pkg = require(path.join(config.dir, 'package.json'))
    config.sentinel = pkg.sentinel || {}
    slack.init(config)
  },

  cli: function () {
    var failedTests

    return exec(config.pkg.scripts.test, true, true)
      .then((code) => {
        failedTests = code
        if (!code && config.pkg.scripts.build) {
          return exec(config.pkg.scripts.build, true)
        }
        return code
      })
      .then((code) => slack.notify(failedTests, !code))
      .then(() => log.info('sentinel', 'exiting with code', failedTests))
      .then(() => process.exit(failedTests))
      .catch((err) => {
        console.error('sentinel', 'exiting in catch cli', err.stack)
        process.exit(255)
      })
  },

  notifyFail: function () {
    var checkFilePath = slack.checkFilePath
    return fs.existsAsync(checkFilePath)
      .then((exists) => {
        if (exists) {
          return fs.readFileAsync(checkFilePath, 'utf8')
            .then((data) => {
              var code = parseInt(data, 10)
              log.info('sentinel', 'is this where it exits?', code)
              process.exit(code)
            })
        } else {
          return slack.notify(0, false)
        }
      })
      .catch((err) => log.info('sentinel', 'exiting in catch notifyFail', err))
  }
}
