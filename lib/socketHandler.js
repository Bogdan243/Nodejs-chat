var DBHandler = require('./dbHandler')

let clients = []

exports.socketConnection = (socket) => {
    console.log(`Client with id ${socket.id} connected`)
    clients.push(socket)

    socket.emit('message', "I'm server")

    socket.on('message', (message) => {
        console.log('Message: ', message)

        message = JSON.parse(message)

        var dbHandler = new DBHandler()
        var requestedCurrentUserPromise = dbHandler.getUser(message.currentUser)

        requestedCurrentUserPromise.then(function (currentUser) {
            currentUser.msgList.push(message)

            var requestedCurrentListtenerUserPromise = dbHandler.getUser(message.currentListtener)
            requestedCurrentListtenerUserPromise.then(function (currentListtener) {
                currentListtener.msgList.push(message)

                let responseSocket = clients.find(item => item.id == currentListtener.socketId)

                console.log(`responseSocket: ${responseSocket.id} with msg: ${message.msgText}`)

                responseSocket.emit('message', JSON.stringify(message))
            })
        })

    })

    socket.on('connectionMessage', (message) => {
        console.log('Connection with server: ', message)

        var dbHandler = new DBHandler()
        var requestedUserPromise = dbHandler.getUser(message.userName)

        requestedUserPromise.then(function (user) {
            user.socketId = socket.id
            dbHandler.updateUser(user)
            socket.emit('currentUserData', JSON.stringify(user))
        })
    })

    socket.on('disconnect', () => {
        clients.splice(clients.indexOf(socket.id), 1)
        console.log(`Client with id ${socket.id} disconnected`)
    })
}