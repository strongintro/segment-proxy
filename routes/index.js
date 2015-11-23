var express = require('express')
var request = require('request')
var replaceStream = require('replace-stream')
var router = express.Router()

/* GET home page. */

router.get('/', function(req, res) {
  res.json({
    success: true
  })
})

var url = 'localhost:4200'

if (process.env.NODE_ENV === 'staging') {
  url = 'a.genius.io'
}

function getUrl (host) {
  return host.split('.').length > 2
    ? host
      .split('.')
      .filter(function (h, i) { return i > 0 })
      .join('.')
    : host
}

router.get('/a/:segmentKey/a.js', function (req, res) {
  request('http://cdn.segment.com/analytics.js/v1/' + req.params.segmentKey + '/analytics.min.js')
    .pipe(replaceStream('api.segment.io', req.hostname))
    .pipe(replaceStream('www.google-analytics.com/analytics.js', req.hostname + '/a/ga.js'))
    .pipe(replaceStream('cdn.mxpnl.com/libs/mixpanel-2-latest.min.js', req.hostname + '/a/m.js'))
    .pipe(replaceStream('widget.intercom.io', req.hostname))
    .pipe(res)
})

router.get('/a/ga.js', function (req, res) {
  request('http://www.google-analytics.com/analytics.js')
    .pipe(replaceStream('www.google-analytics.com', req.hostname))
    .pipe(replaceStream('google-analytics.com', req.hostname))
    .pipe(res)
})

router.get('/r/collect', function (req, res) {
  request('https://www.google-analytics.com/r/collect', {
    qs: req.query
  })
    .pipe(res)

  res.__writeHead = res.writeHead
  res.writeHead = function (status, reasonPhrase, headers) {
    var host = 'http://localhost:3000'

    if (process.env.NODE_ENV === 'staging') {
      host = 'https://search.' + getUrl(req.hostname)
    }

    res.header('Access-Control-Allow-Origin', host)
    res.__writeHead(status, reasonPhrase, headers)
  }
})

router.get('/collect', function (req, res) {
  request('https://www.google-analytics.com/collect', {
    qs: req.query
  })
    .pipe(res)

  res.__writeHead = res.writeHead
  res.writeHead = function (status, reasonPhrase, headers) {
    var host = 'http://localhost:3000'

    if (process.env.NODE_ENV === 'staging') {
      host = 'https://search.' + getUrl(req.hostname)
    }

    res.header('Access-Control-Allow-Origin', host)
    res.__writeHead(status, reasonPhrase, headers)
  }
})

router.get('/a/m.js', function (req, res) {
  return request('http://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js')
    .pipe(replaceStream('api.mixpanel.com', req.hostname))
    .pipe(res)
})

var methods = ['track', 'decide', 'engage']

methods.map(function (m) {
  router.get('/' + m, function (req, res) {
    request('http://api.mixpanel.com/' + m, {
      qs: req.query
    })
      .pipe(res)

    res.__writeHead = res.writeHead
    res.writeHead = function (status, reasonPhrase, headers) {
      var host = 'http://localhost:3000'

      if (process.env.NODE_ENV === 'staging') {
        host = 'https://search.' + getUrl(req.hostname)
      }

      res.header('Access-Control-Allow-Origin', host)
      res.__writeHead(status, reasonPhrase, headers)
    }
  })
})

// Intercom API
router.get('/widget/:widgetId', function (req, res) {
  return request('https://js.intercomcdn.com/intercom.2c931e1e.js')
    .pipe(replaceStream('api-iam.intercom.io', req.hostname))
    .pipe(replaceStream('api-ping.intercom.io', req.hostname))
    .pipe(res)
})

var intercomMethods = ['ping', 'events']

intercomMethods.map(function (m) {
  router.post('/vjs/users/' + m, function (req, res) {
    request
      .post('https://api-ping.intercom.io/vjs/users/' + m)
      .form(req.body)
      .pipe(res)

    res.__writeHead = res.writeHead
    res.writeHead = function (status, reasonPhrase, headers) {
      var host = 'http://localhost:3000'

      if (process.env.NODE_ENV === 'staging') {
        host = 'https://search.' + getUrl(req.hostname)
      }

      res.header('Access-Control-Allow-Origin', host)
      res.__writeHead(status, reasonPhrase, headers)
    }
  })
})

var intercomAPIs = ['conversations', 'messages']

intercomAPIs.map(function (api) {
  router.post('/widget_api/' + api, function (req, res) {
    request
      .post('https://api-iam.intercom.io/widget_api/' + api)
      .form(req.body)
      .pipe(res)

    res.__writeHead = res.writeHead
    res.writeHead = function (status, reasonPhrase, headers) {
      var host = 'http://localhost:3000'

      if (process.env.NODE_ENV === 'staging') {
        host = 'https://search.' + getUrl(req.hostname)
      }

      res.header('Access-Control-Allow-Origin', host)
      res.__writeHead(status, reasonPhrase, headers)
    }
  })
})

router.post('/widget_api/conversations/:cid/fetch', function (req, res) {
  var cid = req.params.cid

  request
    .post('https://api-iam.intercom.io/widget_api/conversations/' + cid + '/fetch')
    .form(req.body)
    .pipe(res)

  res.__writeHead = res.writeHead
  res.writeHead = function (status, reasonPhrase, headers) {
    var host = 'http://localhost:3000'

    if (process.env.NODE_ENV === 'staging') {
      host = 'https://search.' + getUrl(req.hostname)
    }

    res.header('Access-Control-Allow-Origin', host)
    res.__writeHead(status, reasonPhrase, headers)
  }
})

module.exports = router
