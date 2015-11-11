"use strict";
var log = require('npmlog')
var path = require('path')
var fs = require('vigour-fs-promised')
var exec = require('./utils/exec')

// var slack = require('.integration/slack')
// var github = require('.integration/github')

var Sentinel = module.exports = {
  init: function(config){
    var pkg = this.pkg = require(path.join(config.dir,'package.json'))
    config.sentinel = {}
    if(pkg && pkg.vigour && pkg.vigour.services && pkg.vigour.services.sentinel){
      config.sentinel = pkg.vigour.services.sentinel
    }
    this.config = config
    this.cli()
  },
  cli: function(){
    var config = Sentinel.config
    var failedTests

    exec('gaston test', true, true)
      .then((code) => {
        console.log('success', code)
        failedTests = code
        return ~config.sentinel.branches.indexOf(config.branch)
      })
      .then((treatBranch) => {
        if(treatBranch){
          // return github.doStuff()
        }
      })
      // .then(() => slack.notify(failedTests))
      .catch((err) => {
        log.error('Sentinel', 'err', err)
        process.exit(1)
      })
  }
}
