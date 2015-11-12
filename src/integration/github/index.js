
var fs = require('vigour-fs-promised')
var log = require('npmlog')
var exec = require('../../utils/exec')
var config

module.exports = {
  init: function(cfg){
    config = cfg
  },
  makeDistribution: function(){
    return fetchAndMerge()
      .then(() => exec(config.pkg.scripts.build))
      .then(unignore)
      .then(addAndCommit)
      .then(pushChanges)
      .then(() => console.log('GIT success'))
      .catch((err) => console.log('GIT error', err))
  }
}

var pushChanges = function(){
  var remote = config.remote || 'origin'
  log.info('Sentinel', `pushing changes to ${remote}`)
  return exec(`git push ${remote} ${config.distBranch}`)
}

var addAndCommit = function(){
  log.info('Sentinel', 'adding and Committing changes')
  var commitMessage = `build for commit #${config.commit}`
  return exec('git add .')
    .then(() => exec( {cmd: 'git', args: ['commit', '-m', `"${commitMessage}"`] }))
}

var unignore = function(){
  log.info('Sentinel', 'unignoring build files')
  var filePath = `${config.dir}/.gitignore`
  var patterns = config.sentinel.unignore || ['build.*']
  return fs.readFileAsync(filePath, 'utf8')
    .then((data) => {
      var split = data.split('\n')
      var output = split.filter((line) => !~patterns.indexOf(line))
      return fs.writeFileAsync(filePath, output.join('\n'), 'utf8')
    })
}

var fetchAndMerge = function(){
  var remote = config.remote || 'origin'
  var distBranch = config.distBranch = config.branch + '-dist'
  var fetchCommand = `git config remote.${remote}.fetch +refs/heads/*:refs/remotes/${remote}/*`
  log.info('Sentinel', 'Changing git config to fetch all branches')
  return exec(fetchCommand)
    .then(() => {
      log.info('Sentinel', 'fetching all branches')
      return exec(`git fetch ${remote} ${distBranch}`)
    })
    .then(() => {
      log.info('Sentinel', `Checking Out local branch ${distBranch}`)
      return exec(`git checkout ${distBranch}`)
    }, () => {
      log.info('Sentinel', `Creating and Checking Out local branch ${distBranch}`)
      return exec(`git checkout -b ${distBranch}`)
    })
    .then(() => {
      log.info('Sentinel', `Merging from ${config.branch}`)
      return exec(`git merge ${config.branch}`)
    })
}
