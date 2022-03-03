//Refactoring task: Need add user storage
//Remove coockie using, and use socket
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

class Messanger {
  constructor(customSocket) {
    this.userSocket = customSocket;

    var addMsgFromServerWithBindedContext = this.addMsgFromServer.bind(this)
    this.userSocket.recivengMsgFromServer(addMsgFromServerWithBindedContext)

    this.currentUser = {}
    this.currentListtener = {}

    this.requestCurrentUser()

    document.querySelector(".invite-new-user").onclick = () =>
      this.getNewUser();

    this.userList = document.querySelector(".users");
    this.messages = document.querySelector(".messages");

    this.textInput = document.querySelector(".chat-input-msg");
    this.sendBtn = document.querySelector(".send-msg");


    // send user msg on "Send" btn press
    this.sendBtn.onclick = () => {
      this.addMSGFromCurrentUser();
    };

    // send user msg on Enter key press
    this.textInput.onkeypress = event => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.addMSGFromCurrentUser();
      }
    };

    // array, that contains users, who are currently "typing", and will send their msg shortly
    this.usersIsTyping = [];

    this.status = document.createElement("div");
    this.status.classList.add("typing-status");
    document.querySelector(".messages-list").appendChild(this.status);
  }

  /**************************************
    Data retrieving/manipulation (Model/* from MV*)
  ***************************************/
  /**
   * Gets new user info from 3rd party REST API
   */
  promiseCallback(user) {
    this.currentUser = user
    this.currentListtener = user
    this.downloadedUserList = [this.currentUser]
    this.currentUser.chatWith.forEach(item => {
        this.getNewUser(item, false);
    })
    this.userSocket.connectionMessageToServer({userName: user.userName})
    console.log(this.currentUser)
  }

  async getNewUser(nameOfNewUser = '', invitedUser = true) {

    if (nameOfNewUser == '') {
      nameOfNewUser = prompt('Who is it?');
    }

    let user = await this.requestNewUser(nameOfNewUser);
    console.log(user);

    if (!user || user.state == 'not found') return


    let foundNewUserInDownloaded = this.downloadedUserList.find(item => item.userName == user.userName);
    if (foundNewUserInDownloaded) {
      foundNewUserInDownloaded = user;
    } else {
      this.downloadedUserList.push(user);
    }

    this.addUserToDOM(user);
    this.addStatusMSG(
      `${user.fullName} joined chat at ${this.getCurrentTime()}`
    )

    if (invitedUser) {
      this.currentListtener = user;

      this.removeMessagesFromChat();
      this.insertMessages(this.currentUser, this.currentListtener, this);
    }


    return user;
  }

  removeMessagesFromChat() {
    let messagesClass = document.querySelectorAll('ul.messages');
    let msgList = messagesClass[0].querySelectorAll('li');
    msgList.forEach(elem => {
      console.log(elem);
      elem.remove();
    });
  }

  addMsgFromServer(msg) {
    msg = JSON.parse(msg);
    if(this.currentListtener.userName == msg.currentUser) {
      this.currentListtener.msgList.push(msg)
      this.addMSGToDOM(this.currentListtener, msg.msgText, false, this.getCurrentTime())
    } else {
      let senderUser = this.downloadedUserList.find(item => item.userName == msg.currentUser)

      if (!senderUser) {
        this.getNewUser(msg.currentUser, false) 
      } else {
        senderUser.msgList.push(msg);
      }
    }

    // if (msg.currentListtener == this.currentListtener.userName) {
    //   this.currentListtener.msgList.push(msg);
    //   this.addMSGToDOM(this.currentListtener, msg.msgText, false, this.getCurrentTime());
    // } else {
    //   let senderUser = this.downloadedUserList.find(item => item.userName == msg.currentUser);

    //   if (!senderUser) {
    //     this.getNewUser(msg.currentUser)
        
    //   } else {
    //     senderUser.msgList.push(msg);
    //   }

    // }
  }

  async requestCurrentUser() {

    let response = await fetch('/getUserAfterLogin', {
      method: 'get',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    });

    let responsedUserData = JSON.parse(await response.json()) || { state: 'not found' };
    //Handle empty or damaged request 
    const user = {
      fullName: responsedUserData.userName,
      userName: responsedUserData.userName,
      age: responsedUserData.userAge,
      phone: responsedUserData.cell,
      email: responsedUserData.email,
      avatar: responsedUserData.avatar,
      city: responsedUserData.location,
      gender: responsedUserData.gender,
      msgList: responsedUserData.msgList,
      state: '',
      msgList: [],
      chatWith: []
    };

    var callbackWithBindedContext = this.promiseCallback.bind( this )
    callbackWithBindedContext( user )

    return user;
  }

  async requestNewUser(nameOfNewUser) {
    let userData = JSON.stringify({
      userName: nameOfNewUser,
      nameOfCurrentUser: this.currentUser.userName
    })

    let response = await fetch('/getUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      },
      body: userData
    });

    let responsedUserData = JSON.parse(await response.json()) || { state: 'not found' };
    //Handle empty or damaged request 
    const user = {
      fullName: responsedUserData.userName,
      userName: responsedUserData.userName,
      age: responsedUserData.userAge,
      phone: responsedUserData.cell,
      email: responsedUserData.email,
      avatar: responsedUserData.avatar,
      city: responsedUserData.location,
      gender: responsedUserData.gender,
      msgList: responsedUserData.msgList,
      state: '',
      msgList: [],
      chatWith: []
    };

    return user;
  }

  insertMessages(user, currentListtener, messanger) {
    if (currentListtener.msgList.length > 0) {
      currentListtener.msgList.forEach(function (item) {
        if (item.currentUser == messanger.currentUser.userName) {
          messanger.addMSGToDOM(user, '', true, item.msgText, item.msgTime);
        } else {
          messanger.addMSGToDOM(currentListtener, item.msgText, false, '', item.msgTime);
        }

      });
    }
  }

  /**
   * Gets new message from 3rd party REST API
   */
  getNewMessage() {

  }

  /**************************************
      DOM manipulation methods (View)
  ***************************************/
  /**
   * Adds status message to the chat window
   * @example "John Doe joined group chat at 10:24:48" or "John Doe left group chat at 10:24:48"
   * @param {string} message
   */
  addStatusMSG(message) {
    if (typeof message === "string" && message.trim()) {
      const msg = document.createElement("li");

      msg.classList.add("status-msg");
      msg.textContent = message.trim();

      this.messages.appendChild(msg);
      this.scrollToBottom(this.messages);
    }
  }

  /**
   * Adds users message to the chat window
   * @param {Object} user
   * @param {boolean} isMe false by default; true means message was sent by current user (and displayed on the right with different bg color)
   * @param {string} myMSG message from current user
   */
  addMSGToDOM(user, messageText = '', isMe = false, myMSG = "🤣", time) {
    const msg = document.createElement("li");
    const avatar = document.createElement("img");
    const msgText = document.createElement("div");
    const msgTime = document.createElement("div");

    msg.classList.add("msg");
    if (isMe) {
      msg.classList.add("me");
    }

    avatar.classList.add("user-avatar");
    avatar.src = user.avatar;
    avatar.alt = user.fullName;
    avatar.title = user.fullName;

    msgText.classList.add("msg-text");
    msgText.innerHTML = isMe ? myMSG : messageText;

    msgTime.classList.add("msg-time");
    msgTime.textContent = time;

    msg.appendChild(avatar);
    msg.appendChild(msgText);
    msg.appendChild(msgTime);

    this.messages.appendChild(msg);
    this.scrollToBottom(this.messages);
  }

  /**
   * Adds message from the current user to chat window
   */
  addMSGFromCurrentUser() {
    const msg = this.textInput.value.trim();

    if (msg) {
      let fullMessage = {
        currentUser: this.currentUser.userName,
        currentListtener: this.currentListtener.userName,
        msgTime: this.getCurrentTime(),
        msgText: msg
      }

      this.userSocket.sendMessageToServer(fullMessage);
      this.addMSGToDOM(this.currentUser, '', true, msg, this.getCurrentTime());
      this.currentListtener.msgList.push(fullMessage)
      this.textInput.value = "";
      this.textInput.focus();
    }
  }

  /**
   * Adds user to the users list
   * @param {Object} user
   */
  addUserToDOM(user) {
    const li = document.createElement("li");
    const avatar = document.createElement("img");
    const userInfo = document.createElement("div");
    const userFullname = document.createElement("div");
    // const userEmail = document.createElement("div");
    const userActions = document.createElement("div");
    const removeUser = document.createElement("button");

    const bio = `${user.fullname} is a ${user.age} years old ${user.gender
      } from ${user.city}.`;
    const aboutUser = `${user.age} years • ${user.gender} • ${user.city}`;

    li.classList.add("user");
    li.title = bio;

    avatar.classList.add("user-avatar");
    avatar.src = user.avatar;
    avatar.alt = user.fullName;
    avatar.title = user.userName;

    userInfo.classList.add("user-info");
    userFullname.classList.add("user-fullname");
    // userEmail.classList.add("user-email");

    userFullname.textContent = user.fullName;
    // userEmail.textContent = aboutUser; //user.email;

    userActions.classList.add("user-actions");

    removeUser.classList.add("btn");
    removeUser.textContent = "Remove";
    removeUser.title = "Remove user";

    // remove user after click on "Mute" btn
    removeUser.onclick = () => {
      this.removeUser(user, li);
      this.removeMessagesFromChat();
    };

    userInfo.appendChild(userFullname);
    // userInfo.appendChild(userEmail);

    userActions.appendChild(removeUser);

    li.appendChild(avatar);
    li.appendChild(userInfo);
    li.appendChild(userActions);

    this.userList.appendChild(li);

    li.onclick = (event) => {
      let selectedUserName = event.currentTarget.querySelector('img.user-avatar').title

      if (selectedUserName != this.currentListtener.userName) {
        this.removeMessagesFromChat();

        let selectedUser = this.downloadedUserList.find(item => item.userName == selectedUserName)
        this.currentListtener = selectedUser;

        this.insertMessages(this.currentUser, this.currentListtener, this);
      }
    };
  }

  /**
   * Removes user from the chat
   * @param {Object} user
   * @param {HTMLElement} li
   */
  removeUser(user, li) {
    if (li instanceof HTMLElement && li.nodeName === "LI") {
      // this.addStatusMSG(
      //   `${user.fullname} left group chat at ${this.getCurrentTime()}`
      // );

      // clearInterval(user.msgIntervalId);

      // this.usersIsTyping = this.usersIsTyping.find(
      //   item => item !== user.fullname
      // );
      // clearInterval(user.isTypingId);

      li.remove();
      this.downloadedUserList = this.downloadedUserList.filter(item => item.userName != user.userName)
      if (user.userName == this.currentListtener.userName) {
        this.currentListtener = {
          fullName: '',
          userName: '',
          age: '',
          phone: '',
          email: '',
          avatar: '',
          city: '',
          gender: '',
          msgList: [],
          chatWith: []
        };
      }
      // this.updateIsTypingStatus();
    }
  }

  /**
   * Sets interval that shows "John Doe is typing..." notification at the bottom of chat window
   * @param {Object} user
   * @param {number} interval
   */
  setUserIsTypingInterval(user, interval) {
    user.isTypingId = setInterval(() => {
      if (!this.usersIsTyping.includes(user.fullname)) {
        this.usersIsTyping.push(user.fullname);
        this.updateIsTypingStatus();
      }
    }, interval - 3000);
  }

  /**
   * Updates "John Doe is typing..." notification at the bottom of chat window
   */
  updateIsTypingStatus() {
    const typingCount = this.usersIsTyping.length;

    if (typingCount === 0) {
      this.status.textContent = "";
      return;
    }

    let msg = "";

    if (typingCount === 1) {
      msg = `${this.usersIsTyping[0]} is typing...`;
    } else if (typingCount > 1 && typingCount <= 3) {
      msg = `${this.usersIsTyping.join(", ")} are typing...`;
    } else if (typingCount > 3) {
      msg = `${this.usersIsTyping.slice(0, 3).join(", ")} and ${typingCount -
        3} other are typing...`;
    }

    this.status.textContent = msg;
  }

  /**************************************
       Reusable common helper methods
  ***************************************/

  /**
   * Returns current time in format hh:mm:ss
   * @returns {string} time
   */
  getCurrentTime() {
    return new Date().toLocaleTimeString();
  }

  /**
   * Scrolls to element bottom
   * @param {HTMLElement} element
   */
  scrollToBottom(element) {
    if (element instanceof HTMLElement) {
      element.scrollTop = element.scrollHeight; // auto scroll to bottom
    }
  }

  getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }
}

// initialization
const mySocket = new CustomSocket();
const messanger = new Messanger(mySocket);

