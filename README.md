# Sentinel
Sentinel is a cli tool that facilitates testing, building and deploying of Vigour.io projects into Travis workflow. It also notifies about failed and success results on the following integrations:
  - Slack ( just that for now :) )

## Concepts

### 1. Testing
  - Sentinel runs `npm test` script and get it's exit code result to know how many tests have failed.
  - If your `npm install` or `npm test` script executes any other third party tool, make sure that this returns the correct exit code. That way we can send the correct notification and travis can set the correct build result (passing or failing).
  > Exit Codes: `> 0 means failure; = 0 means success`

### 2. Building
  - Sentinel will run `npm build` script since the project is configured to do at `sentinel.branches` on `pakcage.json` file

### 3. Deploying
  - Sentinel deploy distribution files to a specific github branch (`dist-BRANCH`)
  - Sentinel will unignore build files in `.gitignore` file that match `build.*` pattern. It can be configure as an array on `package.json` file at `sentinel.unignore`

## Configuring your project
First, you need to know whether your repository is private or public because Travis has different URL locations for them.
  - private repos: https://magnum.travis-ci.com
  - public repos: https://travis-ci.org


  1. Access one of the URLs above
  2. Login with github, don't forget to give **permissions** to organization level
  3. Select your repository in your account settings inside Travis.
  4. Go to the repository settings in Travis and provide `SENTINEL_SLACK_WEBHOOK` environment variable. **IMPORTANT!** this must be set as private/hidden/sensitive.
  5. create a `.travis.yml` file with the following configuration:

```yml
  language: node_js
  node_js:
    - "5.0.0" #all the versions you want to be tested
  branches:
    only:
      - master #all the branches that will trigger travis
      - develop
      - staging
  before_install:
    - npm install -g gaston #as we use gaston to test we need to install it beforehand
    - npm install -g vigour-sentinel #required
  script:
    - sentinel #required
  after_failure:
    - sentinel --notify-fail #required
  sudo: required
  services:
    - docker
```
