
const express = require('express')
const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)

const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')


const port = process.env.PORT || 3000
const host = 'localhost'

app.use(express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use(cookieParser('secret key'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/autorization/index.html')
})

app.get('/socket.io', function (req, res) {
  res.sendFile(__dirname + '/public/chat/socket.io')
})

let users = [];

app.post('/', function (req, res) {
  if (!req.body) return res.sendStatus(400)
  console.log(req.body)

  users.push({
    userName: req.body.userName,
    pasword: req.body.userPassword,
    fullname: '',
    age: '',
    phone: '',
    email: '',
    avatar: 'https://pbs.twimg.com/media/C4k-7OdWYAAPLid.jpg',
    city: '',
    gender: '',
    state: '',
    msgList: []
  })

  res.cookie('userName', req.body.userName, {
    maxAge: 3600 * 1,
    secure: true,
  })

  res.redirect(303, '/reg')
})

app.post('/get-user', function (req, res) {
  if (!req.body) return res.sendStatus(400)
  console.log(req.body)

  res.clearCookie()

  let userData = JSON.stringify(users.find(item => item.userName == req.body.name) || {state: 'not found'})
  res.json(userData)
})

app.get('/reg', function (req, res) {
  res.sendFile(__dirname + '/public/chat/main.html')
})

let clients = []

io.on('connection', (socket) => {
  console.log(`Client with id ${socket.id} connected`)
  clients.push(socket)

  socket.emit('message', "I'm server")

  socket.on('message', (message) => {
    console.log('Message: ', message)
    message = JSON.parse(message)
    let currentListtener = users.find(item => item.userName == message.currentListtener) 
    
    let responseSocket = clients.find(item => item.id == currentListtener.socketId) 
    console.log(`responseSocket: ${responseSocket.id} with msg: ${message.msgText}`)
    responseSocket.emit('message', message.msgText)
  })

  socket.on('connectionMessage', (message) => {
    console.log('Connection with server: ', message)

    let user = users.find(item => item.userName == message)
    user.socketId = socket.id
  })

  socket.on('disconnect', () => {
    clients.splice(clients.indexOf(socket.id), 1)
    console.log(`Client with id ${socket.id} disconnected`)
  })
})

http.listen(port, function () {
  console.log(`Server listens http://${host}:${port}`);
});