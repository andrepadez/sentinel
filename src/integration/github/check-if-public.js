var request = require('axios')

var resHandler = (res) => res.status === 200

module.exports = (slug) => {
  var split = slug.split('/')
  var url = `https://github.com/${split[0]}/${split[1]}`
  return request.get(url)
    .then(resHandler, resHandler)
}
