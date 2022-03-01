
var path = require('path')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy
var DBHandler = require('./dbHandler')


exports.login = (req, res) => res.sendFile(path.normalize(__dirname + '/../public/autorization/index.html'))

exports.chat = (req, res) => res.sendFile(path.normalize(__dirname + '/../public/chat/chat.html'))

exports.socket = (req, res) => res.sendFile(path.normalize(__dirname + '/../public/chat/socket.io'))

exports.LocalStrategy = new LocalStrategy({
    usernameField: 'userName',
    passwordField: 'password',
}, (username, password, done) => {
    console.log('Check login', username)
    
    var dbHandler = new DBHandler()
    let requestedUserPromise = dbHandler.getUser(username, password, done)

    requestedUserPromise.then((requestedUser) => {
        console.log('RU: ', requestedUser)
    })
})

exports.loginPost = function (req, res, next) {
    console.log(req.body)
    var fu = passport.authenticate('local', {
        failureRedirect: '/login'
    })
    console.log(fu)
    return fu(req, res, next)
}

let users = [];

exports.addUser = (req, res) => {
    if (!req.body) return res.sendStatus(400)
    console.log('Add user request: ', req.body)

    // let requestedUser = users.find(item => item.userName == req.body.userName)

    var dbHandler = new DBHandler()
    let requestedUserPromise = dbHandler.getUser(req.body.userName)

    requestedUserPromise.then((requestedUser) => {
        if (!requestedUser) {
            dbHandler.addUser({
                userName: req.body.userName,
                email: req.body.emailAddress,
                password: req.body.password,
                fullname: '',
                age: '',
                phone: '',
                email: '',
                avatar: 'https://pbs.twimg.com/media/C4k-7OdWYAAPLid.jpg',
                city: '',
                gender: '',
                state: '',
                msgList: [],
                chatWith: [],
                socketId: ''
            })
            res.json(JSON.stringify({ result: 'User registred' }))
        } else {
            res.json(JSON.stringify({ result: 'User already was registred' }))
        }
    })


}

exports.getUser = (req, res) => {
    if (!req.body) return res.sendStatus(400)
    console.log('Get user request: ', req.body)

    var dbHandler = new DBHandler()
    let requestedUserPromise = dbHandler.getUser(req.body.userName)

    requestedUserPromise.then((requestedUser) => {
        // let userData = JSON.stringify(users.find(item => item.userName == requestObj.userName) || { state: 'not found' })
        res.json(JSON.stringify(requestedUser))
    })
}

exports.getUserAfterLogin = (req, res) => {
    if (!req.body) return res.sendStatus(400)
    console.log('Loginned user request: ', req.body)

    var dbHandler = new DBHandler()
    let requestedUserPromise = dbHandler.getUser(req.user.userName)

    requestedUserPromise.then((requestedUser) => {
        res.json(JSON.stringify(requestedUser))
    })


}