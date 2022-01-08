/*
  This code requires refactoring, but this will make it look overcomplicated even more :(

  TODO:
    - create classes for User, Measage, StatusMessage, etc.
      - add proper method checks - if argument is instance of User, Measage, StatusMessage, etc.
    - split code into MV* architecture, separate common/helper functions...
    - get rid of "magic numbers"
    - use better/proper method/variable naming and code explanation
    - create helper method to create DOM elements, set attributes, textContnte, etc.
    - etc.
*/

class Messanger {
  constructor() {
    document.querySelector(".invite-new-user").onclick = () =>
      this.getNewUser();

    this.userList = document.querySelector(".users");
    this.messages = document.querySelector(".messages");

    this.textInput = document.querySelector(".chat-input-msg");
    this.sendBtn = document.querySelector(".send-msg");

    /*
      Probably would be better to load this mock info about "current user" from local .json file
    */
    this.currentUser = {
      fullname: "Oleh Melnyk",
      username: "olehmelnyk",
      age: 28,
      phone: "+380631215555",
      email: "oleh.melnyk@gmail.com",
      avatar: "https://avatars.githubusercontent.com/olehmelnyk",
      city: "Lviv",
      gender: "male"
    };

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
  getNewUser() {
    this.makeRequest("https://randomuser.me/api/")
      .then(data => {
        const userData = data.results[0];

        const fullname = `${this.capitalize(
          userData.name.first
        )} ${this.capitalize(userData.name.last)}`;

        // user age is often over 45, but profile pictures look young,
        // so, let's make this fake data look a bit more realistic ;)
        const age = userData.dob.age;
        const userAge = age > 45 ? Math.floor(age / 2) : age;

        const user = {
          fullname,
          username: userData.login.username,
          age: userAge,
          phone: userData.cell,
          email: userData.email,
          avatar: userData.picture.medium,
          city: this.capitalize(userData.location.city),
          gender: userData.gender
        };

        user.msgIntervalId = this.setNewMSGInterval(user); // this is the ID we need to pass to clearInterval() function to cancel interval

        this.addUserToDOM(user);
        this.addStatusMSG(
          `${user.fullname} joined group chat at ${this.getCurrentTime()}`
        );
      })
      .catch(error => console.error(error.message));
  }

  /**
   * Gets new message from 3rd party REST API
   */
  getNewMessage() {
    const paragraphsCount = this.getRandomNumber(1, 5);
    const paragraphMinLength = this.getRandomNumber(1, 5);
    const paragraphMaxLength = this.getRandomNumber(10, 25);

    return this.makeRequest(
      `https://www.randomtext.me/api/gibberish/p-${paragraphsCount}/${paragraphMinLength}-${paragraphMaxLength}`
    )
      .then(message => message.text_out)
      .catch(error => console.error(error.message));
  }

  /**
   * Creates interval that adds new messgaes from the user to messanger
   * @param {Object} user with all info about user, including full name, age, etc.
   * @param {number} interval 5-30 seconds (5000-30000 ms) interval to add new message from the user
   * @returns interval id - used at clearInterval() method once needed
   */
  setNewMSGInterval(user, interval = this.getRandomNumber(5, 30) * 1000) {
    this.setUserIsTypingInterval(user, interval);

    // intercal that adds messages
    const intervalId = setInterval(() => {
      this.addMSGToDOM(user);

      this.usersIsTyping = this.usersIsTyping.filter(u => u !== user.fullname);
      this.updateIsTypingStatus();
    }, interval);

    return intervalId;
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
  addMSGToDOM(user, isMe = false, myMSG = "🤣") {
    this.getNewMessage().then(messageText => {
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
      avatar.alt = user.fullname;
      avatar.title = user.fullname;

      msgText.classList.add("msg-text");
      msgText.innerHTML = isMe ? myMSG : messageText;

      msgTime.classList.add("msg-time");
      msgTime.textContent = this.getCurrentTime();

      msg.appendChild(avatar);
      msg.appendChild(msgText);
      msg.appendChild(msgTime);

      this.messages.appendChild(msg);
      this.scrollToBottom(this.messages);
    });
  }

  /**
   * Adds message from the current user to chat window
   */
  addMSGFromCurrentUser() {
    const msg = this.textInput.value.trim();

    if (msg) {
      this.addMSGToDOM(this.currentUser, true, this.textInput.value.trim());
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
    const userEmail = document.createElement("div");
    const userActions = document.createElement("div");
    const muteUser = document.createElement("button");

    const bio = `${user.fullname} is a ${user.age} years old ${
      user.gender
    } from ${user.city}.`;
    const aboutUser = `${user.age} years • ${user.gender} • ${user.city}`;

    li.classList.add("user");
    li.title = bio;

    avatar.classList.add("user-avatar");
    avatar.src = user.avatar;
    avatar.alt = user.fullname;
    avatar.title = user.fullname;

    userInfo.classList.add("user-info");
    userFullname.classList.add("user-fullname");
    userEmail.classList.add("user-email");

    userFullname.textContent = user.fullname;
    userEmail.textContent = aboutUser; //user.email;

    userActions.classList.add("user-actions");

    muteUser.classList.add("btn");
    muteUser.textContent = "Mute";
    muteUser.title = "Remove user";

    // remove user after click on "Mute" btn
    muteUser.onclick = () => {
      this.removeUser(user, li);
    };

    userInfo.appendChild(userFullname);
    userInfo.appendChild(userEmail);

    userActions.appendChild(muteUser);

    li.appendChild(avatar);
    li.appendChild(userInfo);
    li.appendChild(userActions);

    this.userList.appendChild(li);
  }

  /**
   * Removes user from the chat
   * @param {Object} user
   * @param {HTMLElement} li
   */
  removeUser(user, li) {
    if (li instanceof HTMLElement && li.nodeName === "LI") {
      this.addStatusMSG(
        `${user.fullname} left group chat at ${this.getCurrentTime()}`
      );

      clearInterval(user.msgIntervalId);

      this.usersIsTyping = this.usersIsTyping.filter(
        item => item !== user.fullname
      );
      clearInterval(user.isTypingId);

      li.remove();

      this.updateIsTypingStatus();
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
   * Makes XMLHTTTPRequest and returns promise with XHR
   * @param {string} url
   * @param {string} method
   * @param {boolean} async request
   * @returns {Promise}
   */
  makeRequest(url, method = "GET", async = true) {
    const xhr = new XMLHttpRequest();

    xhr.open(method, url, async);
    xhr.send();

    return new Promise((resolve, reject) => {
      xhr.onreadystatechange = () => {
        if (xhr.readyState !== 4) return;

        if (xhr.status !== 200) {
          reject(`${xhr.status}: ${xhr.statusText}`);
        } else {
          resolve(JSON.parse(xhr.responseText));
        }
      };
    });
  }

  /**
   * Returns a random number in set mix-max range
   * @param {number} min
   * @param {number} max
   * @returns {number} random number in desired range
   */
  getRandomNumber(min = 1, max = 30) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  /**
   * Returns string where each word is capitalised
   * @param {string} string
   * @returns {string}
   */
  capitalize(string) {
    if (typeof string === "string" && string.trim()) {
      return string
        .trim()
        .split(" ")
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(" ");
    }
  }

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
}

// initialization
const messanger = new Messanger();
