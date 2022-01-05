const bodyParser = require('body-parser')
const express = require('express')

var app = express()

const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/main.html')
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