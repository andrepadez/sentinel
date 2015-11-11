"use strict";
var fs = require('fs-promise')
var command = require('command-promise')
var startProcess = require('command-promise/Process')
var drain = require('stream-to-promise');
var sendToSlack = require('./integration/slack');
var config = require('./config')
var repo = config.repo
var buildId = config.buildId
var commit = config.commit
var branch = config.branch
var dir = config.dir
var slackUrl = config.slack.url
var packageJson = require(`${dir}/package.json`);

module.exports.ci = function ci() {
  let config = packageJson && packageJson.vigour && packageJson.vigour.services && packageJson.vigour.services.sentinel;
  let branches = ((config && config.branches) || ['production', 'staging']);
  let hasRunTests = false;

  console.log(`Sentinel: Running test`);

  var test = startProcess(packageJson.scripts.test);
  test.pipe(process.stdout);

  return drain(test)
    .then(() => {
      hasRunTests = true;

      if (branches.indexOf(branch) === -1) {
        notifySuccess();
        return;
      }

      let branchName = `${branch}-dist`;
      let remote = config.remote || 'origin';

      console.log(`Sentinel: Changing git config to fetch all branches`);
      return command(`git`, ['config', `remote.${remote}.fetch`, '+refs/heads/*:refs/remotes/origin/*'])
        .then(() => {
          console.log(`Sentinel: Cleanning git`);
          return command(`git clean -df`)
            .then(() => {
              return command(`git checkout -- .`);
            });
        })
        .then(() => {
          console.log(`Sentinel: Fetching ${remote} ${branchName}`);
          return command(`git fetch ${remote} ${branchName}`)
            .then(
              () => {
                console.log(`Sentinel: Checking out local branch ${branchName}`);
                return command(`git checkout ${branchName}`);
              },
              () => {
                console.log(`Sentinel: Creating local branch ${branchName} and checking out`);
                return command(`git checkout -b ${branchName}`);
              }
            );
        })
        .then(() => {
          console.log(`Sentinel: Merge ${branch} into ${branchName}`);
          return command(`git merge ${branch}`);
        })
        .then(() => {
          console.log('Sentinel: Unignoring patterns');
          let patterns = config.unignore && config.unignore.length ? config.unignore : ['build'];
          return removeIgnorablePatterns(patterns);
        })
        .then(() => {
          console.log('Sentinel: Building');
          return command('npm run build');
        })
        .then(() => {
          console.log(`Sentinel: Adding changed files`);
          return command(`git add .`);
        })
        .then(() => {
          return command(`git status -s`)
            .then((res) => {
              let output = res[0];

              //if there are changes
              if (output) {
                let commitMessage = `${Date.now()} commit #${commit}`;

                console.log(`Sentinel: Commiting: ${commitMessage}`);
                return command(`git commit -m "${commitMessage}"`)
                  .then(() => {
                    console.log(`Sentinel: Pushing to ${remote} ${branchName}`);
                    return command(`git push ${remote} ${branchName}`);
                  });
              } else {
                console.log('Sentinel: No changes detected');
              }
            });
        })
        .then(() => {
          notifySuccess();
        });
    })
    .catch((err) => {
      console.error(err);

      if (!hasRunTests) {
        notifyTestsFail(err);
      } else {
        notifyFail(err);
      }
    });
}


function removeIgnorablePatterns (patterns) {
  let gitignorePath = `${dir}/.gitignore`;

  return fs.readFile(gitignorePath)
    .then((data) => {
      let result = data.toString();

      patterns.forEach((item) => {
        let reg = new RegExp(`\n${item}\n`);
        result = result.replace(reg, '\n');
      });

      return fs.writeFile(gitignorePath, result, 'utf8');
    });
}


var notifySuccess = module.exports.notifySuccess = function () {
  console.log('Sentinel: Notifying Success');
  sendToSlack('good', 'Build Succeeded');
}


var notifyFail = module.exports.notifyFail = function (err) {
  console.log('Sentinel: Notifying Failed');
  sendToSlack('danger', 'Build Failed')
    .then(() => {
      exitError(err);
    });
}


var notifyTestsFail = module.exports.notifyTestsFail = function (err) {
  console.log('Sentinel: Notifying Tests Failed');
  sendToSlack('danger', 'Tests Failed', err.code)
    .then(() => {
      exitError(err);
    });
}


function exitError (err) {
  console.log('Sentinel: Exiting with Error: ', err && err.code);
  process.exit(err && err.code ? err.code : 1);
}
