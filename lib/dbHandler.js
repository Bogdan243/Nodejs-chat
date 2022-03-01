const e = require('connect-flash')

const mongo = require('mongodb').MongoClient
const dbURL = require('./db').url

class DBHandler {
    constructor() {

    }

    initBD() {

    }

    addUser(data) {

        mongo.connect(dbURL, (err, client) => {
            var db = client.db('myFirstDatabase')

            console.log('Connected')

            db.collection('notes').insertOne(data, (err, result) => {
                if (err) console.log(err)
                else {
                    console.log('Insertion callback result: ', result)

                    client.close()
                }
            })
        })
    }

    async getUser(userName, password, done) {

        var client = await mongo.connect(dbURL)

        var db = client.db('myFirstDatabase')

        console.log('Connected')

        var user = await db.collection('notes').findOne({ userName: userName })
        console.log('Getting result: ', user)
        client.close()


        if (typeof done === 'function') {
            if (userName !== user.userName)
                return done(null, false, {
                    message: 'User not found',
                })
            else if (password !== user.password)
                return done(null, false, {
                    message: 'Wrong password',
                })


            return done(null, user)
        }

        return user

    }

    async updateUser(user) {

        var client = await mongo.connect(dbURL)

        var db = client.db('myFirstDatabase')

        console.log('Connected')
        console.log('Updatable data:', user)
        var result = await db.collection('notes').updateOne({ userName: user.userName }, {$set: {socketId: user.socketId}})
        console.log('Updating result: ', result)
        client.close()


        return user

    }
}

module.exports = DBHandler