module.exports = {
	branch: process.env.TRAVIS_BRANCH,
	repo: process.env.TRAVIS_REPO_SLUG,
	buildId: process.env.TRAVIS_BUILD_ID,
	commit: process.env.TRAVIS_COMMIT,
	result: process.env.TRAVIS_TEST_RESULT,
	dir: process.env.TRAVIS_BUILD_DIR,
	slack: {
		webhook: process.env.SENTINEL_SLACK_WEBHOOK
	},
	github: {
		username: process.env.SENTINEL_GITHUB_USERNAME,
		password: process.env.SENTINEL_GITHUB_PASSWORD
	}
}


//Please keep this for local testing purposes

module.exports = {
  branch: 'master',
  repo: 'vigour-io/sentinel-test-private',
  buildId: '17616511',
  commit: 'de710c5fd61fa65b84ca16ee2e2dc52a123d00e7',
  result: undefined,
  dir: '/Users/andrepadez/develop/vigour-io/sentinel-test-private',
  slack: {
    webhook: process.env.SENTINEL_SLACK_WEBHOOK
  },
  github: {
    username: process.env.SENTINEL_GITHUB_USERNAME,
    password: process.env.SENTINEL_GITHUB_PASSWORD
  }
}
