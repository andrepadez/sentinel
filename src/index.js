var path = require('path')
var fs = require('vigour-fs-promised')
var exec = require('./utils/exec')
var config

var slack = require('./integration/slack')
var github = require('./integration/github')

module.exports = {
  init: function (cfg) {
    config = cfg
    var pkg = config.pkg = require(path.join(config.dir, 'package.json'))
    config.sentinel = pkg.sentinel || {}
    slack.init(config)
    github.init(config)
  },

  cli: function () {
    var failedTests

    return exec(config.pkg.scripts.test, true, true)
      .then((code) => {
        failedTests = code
        config.sentinel.branches = config.sentinel.branches || []
        return ~config.sentinel.branches.indexOf(config.branch)
      })
      .then((treatBranch) => {
        if (treatBranch && !failedTests) {
          return github.makeDistribution()
        }

        return true
      })
      .then((buildSuccess) => {
        slack.notify(failedTests, buildSuccess)
          .then(() => process.exit(failedTests))
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
              process.exit(code)
            })
        } else {
          return slack.notify(0, false)
        }
      })
  }
}
