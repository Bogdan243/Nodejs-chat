class CustomSocket {
    constructor() {
      this.socket = io()
  
    }
  
    recivengMsgFromServer(calback = () => { }) {
      this.socket.on('message', (message) => {
        console.log(message)
        if (message == 'I\'m server') {
  
        } else {
          calback(message);
        }
      })
    }
  
    sendMessageToServer(fullMessage) {
      let msg = JSON.stringify(fullMessage)
      this.socket.emit('message', msg)
    }
  
    connectionMessageToServer(msg) {
      this.socket.emit('connectionMessage', msg)
    }
  
    currentUserData(callback) {
      this.socket.on('currentUserData', data => {
        callback(JSON.parse(data))
      })
    }
  
  
  }