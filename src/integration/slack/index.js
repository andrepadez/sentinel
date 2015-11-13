var request = require('axios')
var log = require('npmlog')
var fs = require('vigour-fs-promised')
var config

var Slack = module.exports = {
  init: function(cfg){
    config = cfg
  },
  notify: function(failedTests, buildSuccess){
    return fs.existsAsync('./notification-sent')
      .then((exists) => {
        if(exists){
          return
        }

        var sConfig = config.sentinel
        var channel = getChannelName()
        var attachment = getAttachment(failedTests, buildSuccess)

        return sendNotification(channel, attachment)
          .then(() => log.info('Sentinel', 'Notification sent'))
          .catch((err) => log.error('Sentinel', 'Notification failed', err))
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

var getAttachment = function(failedTests, buildSuccess){
  var success = buildSuccess && !failedTests
  var color = success ? 'good' : 'danger'
  var title = `#${config.buildNumber}` + (success ? 'Build Passing' : 'Build Failing') + ' (log)'
  var buildId = config.buildId
  var commit = config.commit
  var repo = config.repo
  var attachment = {
    color: color,
    title: title,
    title_link: `https://magnum.travis-ci.com/${repo}/builds/${buildId}`,
    fields: [
      {
        title: 'Branch',
        value: config.branch
      },
      {
        title: 'Commit',
        value: `<https://github.com/${repo}/commit/${commit}|${commit.slice(0, 8)}>`
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
}

var getChannelName = function(){
  var slackChannel = config.sentinel.slackChannel
  return '#' + (slackChannel || config.repo.split('/').pop())
}

var writeFile = function(){
  return fs.writeFileAsync('./notification-sent', 'done', 'utf8')
}

var deleteFile = function(){
  return fs.unlinkAsync('./notification-sent')
}
