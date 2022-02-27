let clients = []

exports.socketConnection = (socket) => {
    console.log(`Client with id ${socket.id} connected`)
    clients.push(socket)
  
    socket.emit('message', "I'm server")
  
    socket.on('message', (message) => {
      console.log('Message: ', message)
  
      message = JSON.parse(message)
  
      let currentUser = users.find(item => item.userName == message.currentUser)
      currentUser.msgList.push(message);
  
      let currentListtener = users.find(item => item.userName == message.currentListtener)
      currentListtener.msgList.push(message);
  
      let responseSocket = clients.find(item => item.id == currentListtener.socketId)
  
      console.log(`responseSocket: ${responseSocket.id} with msg: ${message.msgText}`)
  
      responseSocket.emit('message', JSON.stringify(message))
    })
  
    socket.on('connectionMessage', (message) => {
      console.log('Connection with server: ', message)
  
      let user = users.find(item => item.userName == message)
      user.socketId = socket.id
  
      socket.emit('currentUserData', JSON.stringify(user))
    })
  
    socket.on('disconnect', () => {
      clients.splice(clients.indexOf(socket.id), 1)
      console.log(`Client with id ${socket.id} disconnected`)
    })
  }