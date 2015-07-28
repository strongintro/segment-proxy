var express = require('express');
var request = require('request')
var replaceStream = require('replace-stream')
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res) {
  res.json({
    success: true
  })
});

var url = 'localhost:4200'

if (process.env.NODE_ENV === 'staging') {
  url = 'a.genius.io'
}

router.get('/a/:segmentKey/a.js', function (req, res) {
  request('http://cdn.segment.com/analytics.js/v1/' + req.params.segmentKey + '/analytics.min.js')
    .pipe(replaceStream('api.segment.io', url))
    .pipe(replaceStream('www.google-analytics.com/analytics.js', url + '/a/ga.js'))
    .pipe(replaceStream('cdn.mxpnl.com/libs/mixpanel-2-latest.min.js', url + '/a/m.js'))
    .pipe(res)
})

router.get('/a/ga.js', function (req, res) {
  request('http://www.google-analytics.com/analytics.js')
    .pipe(replaceStream('www.google-analytics.com', url))
    .pipe(replaceStream('google-analytics.com', url))
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
      host = 'https://qa-search.genius.io'
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
      host = 'https://qa-search.genius.io'
    }

    res.header('Access-Control-Allow-Origin', host)
    res.__writeHead(status, reasonPhrase, headers)
  }
})

router.get('/a/m.js', function (req, res) {
  request('http://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js')
    .pipe(replaceStream('api.mixpanel.com', url))
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
        host = 'https://qa-search.genius.io'
      }

      res.header('Access-Control-Allow-Origin', host)
      res.__writeHead(status, reasonPhrase, headers)
    }
  })
})

module.exports = router;
