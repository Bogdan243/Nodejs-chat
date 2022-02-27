
var express = require('express')
var app = express()
var http = require('http').createServer(app)
var io = require('socket.io')(http)

var pathHandler = require('./lib/pathHandler')
var socketHandler = require('./lib/socketHandler')
var Initializer = require('./lib/appInit')

var appInitializer = new Initializer(app)
appInitializer.init()

app.get('/login', pathHandler.login)

app.post('/login/password',
  pathHandler.loginPost,
  function (req, res) {
      res.redirect('/chat');
  }
)

app.get('/socket.io', pathHandler.socket)

app.post('/addUser', pathHandler.addUser)

app.post('/getUser', pathHandler.getUser)

app.get('/getUserAfterLogin', pathHandler.getUserAfterLogin)

app.get('/chat', pathHandler.chat)

io.on('connection', socketHandler.socketConnection)

var port = process.env.PORT || 3000
var host = 'localhost'

http.listen(port, function () {
  console.log(`Server listens http://${host}:${port}`);
});