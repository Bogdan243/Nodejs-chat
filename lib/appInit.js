var session = require('express-session')
var passport = require('passport')
var express = require('express')
var path = require('path')
const pathHandler = require('./pathHandler')

module.exports = class Init {
    constructor(app) {
        this.app = app
    }

    init() {
        this.app.use(express.static(path.normalize(__dirname + '/../public')))
        this.app.use(express.json())
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(session({
            secret: 'secret',
            resave: false,
            saveUninitialized: false
        }))

        passport.serializeUser((user, done) => done(null, user))
        passport.deserializeUser((user, done) => done(null, user))
        passport.use(pathHandler.LocalStrategy)

        this.app.use(passport.initialize())
        this.app.use(passport.session())

        return this.app
    }
}

// module.exports = Init