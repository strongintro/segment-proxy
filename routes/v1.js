var express = require('express')
var replaceStream = require('replace-stream')
var request = require('request')

var router = express.Router()

router.all('/i', function (req, res) {
  request({
    method: req.method,
    url: 'http://api.segment.io/v1/i',
    body: req.data,
    json: true
  }).pipe(res)
})

router.all('/p', function (req, res) {
  request({
    method: req.method,
    url: 'http://api.segment.io/v1/p',
    body: req.data,
    json: true
  }).pipe(res)
})

router.all('/t', function (req, res) {
  request({
    method: req.method,
    url: 'http://api.segment.io/v1/p',
    body: req.data,
    json: true
  }).pipe(res)
})

module.exports = router
