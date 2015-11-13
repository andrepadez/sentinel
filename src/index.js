"use strict";
var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs-promised')
var exec = require('./utils/exec')
var config

var slack = require('./integration/slack')
var github = require('./integration/github')

var Sentinel = module.exports = {
  init: function(cfg){
    config = cfg
    var pkg = config.pkg = require(path.join(config.dir,'package.json'))
    config.sentinel = {}
    if(pkg && pkg.vigour && pkg.vigour.services && pkg.vigour.services.sentinel){
      config.sentinel = pkg.vigour.services.sentinel
    }
    slack.init(config)
    github.init(config)
  },
  cli: function(){
    var failedTests

    return exec(config.pkg.scripts.test, true, true)
      .then((code) => {
        failedTests = code
        return  ~config.sentinel.branches.indexOf(config.branch)
      })
      .then((treatBranch) => {
        if(treatBranch && !failedTests){
          return github.makeDistribution()
        }

        return true
      })
      .then((buildSuccess) => slack.notify(failedTests, buildSuccess))
      .catch((err) => {
        log.error('Sentinel', 'err', err)
        process.exit(1)
      })
  }
}
