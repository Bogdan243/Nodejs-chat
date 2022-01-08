const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

var app = express()

const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public/autorization'))
app.use(express.static(__dirname + '/public/chat'))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/autorization/index.html')
})

let users = [];

app.post('/register', urlencodedParser, function (
  request,
  response
) {
  if (!request.body) return response.sendStatus(400)
  console.log(request.body)

  users.push({
    userName: request.body.userName,
    pasword: request.body.userPassword
  })
  
  res.sendFile(__dirname + '/public/chat/main.html')
})

let messageList = []

app.post('/', function (req, res) {

  if (!req.body) return res.sendStatus(400)
  console.log(req.body)
  messageList.push(req.body.userMessage)
  res.json(req.body)
})

app.listen(port, function () {
  console.log('Example app listening on port 3000!')
})