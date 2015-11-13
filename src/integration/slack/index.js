var path = require('path')
var request = require('axios')
var log = require('npmlog')
var fs = require('vigour-fs-promised')
var checkIfPublic = require('../github/check-if-public')
var tmpdir = require('os').tmpdir()
var checkFilePath = path.join(tmpdir, 'sentinel-notification-sent')
var config

var Slack = module.exports = {
  init: function(cfg){
    config = cfg
  },
  notify: function(failedTests, buildSuccess){
    return fs.existsAsync(checkFilePath)
      .then((exists) => {
        if(exists){
          return
        }

        var sConfig = config.sentinel
        var channel = getChannelName()
        return getAttachment(failedTests, buildSuccess)
          .then((attachment) => sendNotification(channel, attachment))
          .then(() => log.info('Sentinel', 'Notification sent'))

      })
  }
}

var sendNotification = function(channel, attachment){
  var slackUrl = config.slack.webhook
  var payload = {
    attachments: [attachment],
    channel: channel
  }

  return request.post(slackUrl, payload)
    .then( writeFile )
}

var getAttachment = function(failedTests, buildSuccess, isPublic){
  var success = buildSuccess && !failedTests
  var result = success? 'Succeeded' : 'Failed'
  var color = success ? 'good' : 'danger'
  var title = `Build #${config.buildNumber} ${result} (log)`
  var buildId = config.buildId
  var commit = config.commit
  var repoSlug = config.repoSlug
  var repoName = config.repoName

  return checkIfPublic(repoSlug)
    .then((isPublic) => {
      var travisUrl
      if(isPublic){
        travisUrl = `https://travis-ci.org/${repoSlug}/builds/${buildId}`
      } else {
        travisUrl = `https://magnum.travis-ci.com/${repoSlug}/builds/${buildId}`
      }
      var attachment = {
        color: color,
        title: title,
        title_link: travisUrl,
        fields: [
          {
            title: 'Branch',
            value: config.branch
          },
          {
            title: 'Commit',
            value: `<https://github.com/${repoName}/commit/${commit}|${commit.slice(0, 8)}>`
          }
        ]
      }

      if (!success) {
        attachment.fields.unshift({
          title: 'Reason',
          value: failedTests? failedTests + ' tests failed' : ' check build log'
        });
      }

      return attachment
    })
}

var getChannelName = function(){
  var slackChannel = config.sentinel.slackChannel
  return '#' + (slackChannel || config.repoName)
}

var writeFile = function(){
  return fs.writeFileAsync(checkFilePath, 'done', 'utf8')
}
