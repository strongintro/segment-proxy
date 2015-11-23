var express = require('express')
var path = require('path')
var favicon = require('serve-favicon')
var logger = require('morgan')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

var routes = require('./routes/index')
var users = require('./routes/user')
var v1 = require('./routes/v1')

var app = express()

var env = process.env.NODE_ENV || 'development'
app.locals.ENV = env
app.locals.ENV_DEVELOPMENT = env == 'development'

// app.use(favicon(__dirname + '/public/img/favicon.ico'))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

var url = 'http://localhost:3000'

if (process.env.NODE_ENV === 'staging') {
  url = 'https://search.genius.io'
}

function getUrl (host) {
  return host.split('.').length > 2
    ? host
      .split('.')
      .filter(function (h, i) { return i > 0 })
      .join('.')
    : host
}

app.use(function (req, res, next) {
  console.log(getUrl(req.hostname))
  res.header("Access-Control-Allow-Origin", 'https://search.' + getUrl(req.hostname))
  res.header("Access-Control-Allow-Credentials", true)
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

app.use('/', routes)
app.use('/v1', v1)

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found')
    err.status = 404
    next(err)
})

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      console.log('Error')
      console.log(err)
        res.status(err.status || 500)
        res.json({
            message: err.message,
            error: err,
            title: 'error'
        })
    })
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.json({
        message: err.message,
        error: {},
        title: 'error'
    })
})


module.exports = app
