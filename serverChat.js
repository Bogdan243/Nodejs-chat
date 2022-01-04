const bodyParser = require('body-parser')
const express = require('express')

var app = express()

const port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))


app.get('/', function (req, res) {
  res.sendFile(__dirname + '/public/main.html')
})

const urlencodedParser = bodyParser.urlencoded({
  extended: false,
})

app.post('/', urlencodedParser, function (req, res) {

  if (!req.body) return res.sendStatus(400)
  console.log(req.body)
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})