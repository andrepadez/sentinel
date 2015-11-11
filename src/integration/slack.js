"use strict";
var request = require('axios')
var fs = require('fs-promise')
var Config = require('../config')
var repo = Config.repo
var buildId = Config.buildId
var commit = Config.commit
var branch = Config.branch
var dir = Config.dir
var slackUrl = Config.slack.webhook
var packageJson = require(`${dir}/package.json`);

module.exports = function (color, title, testsFailed) {
  let config = packageJson && packageJson.vigour && packageJson.vigour.services && packageJson.vigour.services.sentinel;
  config = config || {}
  let channel = '#sentinel';
  let statusFilePath = `${dir}/sentinel-has-notified`;

  if (!config.slackChannel && repo) {
    let repoSplit = repo.split('/');
    if (repoSplit.length && repoSplit[1]) {
      channel = `#${repoSplit[1]}`;
    }
  } else if (config.slackChannel){
    channel = `#${config.slackChannel}`;
  }

  let attachment = {
    color: color,
    title: title,
    title_link: `https://magnum.travis-ci.com/${repo}/builds/${buildId}`,
    fields: [
      {
        title: 'Branch',
        value: branch
      },
      {
        title: 'Commit',
        value: `<https://github.com/${repo}/commit/${commit}|${commit.slice(0, 8)}>`
      }
    ]
  };

  if (testsFailed) {
    attachment.fields.push({
      title: 'Failing tests',
      value: testsFailed
    });
  }

  return fs.exists(statusFilePath)
    .then((exists) => {
      if (!exists) {
        return request.post(slackUrl, { attachments: [attachment], channel: channel })
          .then(() => {
            return fs.writeFile(statusFilePath);
          });
      } else {
        return fs.unlink(statusFilePath);
      }
    })
    .catch(onRequestCompleted);
}

function onRequestCompleted (err) {
  if (err) {
    console.error(err);
  }
}
