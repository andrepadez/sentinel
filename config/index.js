var config = module.exports = {
  branch: process.env.TRAVIS_BRANCH,
  repoSlug: process.env.TRAVIS_REPO_SLUG,
  buildId: process.env.TRAVIS_BUILD_ID,
  commit: process.env.TRAVIS_COMMIT,
  result: process.env.TRAVIS_TEST_RESULT,
  dir: process.env.TRAVIS_BUILD_DIR,
  buildNumber: process.env.TRAVIS_BUILD_NUMBER,
  nodeVersion: process.env.TRAVIS_NODE_VERSION,
  slack: {
    webhook: process.env.SENTINEL_SLACK_WEBHOOK
  },
  github: {
    username: process.env.SENTINEL_GITHUB_USERNAME,
    password: process.env.SENTINEL_GITHUB_PASSWORD
  }
}

var splitSlug = config.repoSlug.split('/')
config.repoName = splitSlug.pop()
config.repoOwner = splitSlug.pop()
