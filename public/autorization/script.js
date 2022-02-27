$('.message a').click(function () {
    $('form').animate({ height: "toggle", opacity: "toggle" }, "slow");
});

//  console.log(message[0])
async function addUser() {
    var username = $('.registerUsername').val()
    var password = $('.registerPassword').val()

    let userData = JSON.stringify({
        userName: username,
        password: password,
    })

    let response = await fetch('/addUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: userData
    });

    let responsedUserData = JSON.parse(await response.json()).result
    if(responsedUserData == 'User registred') {
        window.location.href = 'http://localhost:3000/login'
    } else {
        alert(responsedUserData)
    }
}