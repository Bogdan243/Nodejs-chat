document
.getElementById('submit')
.addEventListener('click', function (e) {
  e.preventDefault()

  // получаем данные формы
  let registerForm = document.forms['chatForm']
  let userName = registerForm.elements['userName'].value
  let publicChat = document.getElementById('publicChat')
  let publicChatt = registerForm.elements['publicChat']
  let userMessage = registerForm.elements['message'].value

  // сериализуем данные в json
  let user = JSON.stringify({
    userName: userName,
    userMessage: userMessage
  })
  
  fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: user
  }).then(response => {
    return response.json()
  }).then(json => {
    console.log(json)
    
    publicChat.placeholder = publicChat.placeholder + 
    '\n' + 
    `${json.userName}: ${json.userMessage}`
  })
})