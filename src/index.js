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
    this.cli()
  },
  cli: function(){
    var failedTests

    exec(config.pkg.scripts.test, true, true)
      .then((code) => {
        failedTests = code
        return ~config.sentinel.branches.indexOf(config.branch)
      })
      .then((treatBranch) => {
        if(treatBranch && !failedTests){
          return github.makeDistribution()
        }
        if(failedTests){
          process.exit(failedTests)
        }
      })
      .then((buildSuccess) => slack.notify(failedTests, /*buildSuccess*/ true))
      .catch((err) => {
        log.error('Sentinel', 'err', err)
        process.exit(1)
      })
  }
}
