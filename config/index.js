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
