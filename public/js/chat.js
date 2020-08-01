const form = document.querySelector('.form')
const textarea = document.querySelector('.form textarea')
const mainChatArea = document.querySelector('.main-chat')
const downButton = document.querySelector('.go-down')
const socket = io()


function element(ele) {
    return document.querySelector(ele)
}
const USERNAME = element('#username').value
const messages = element("#messages")
const USERID = element("#userId").value
const userPicture = element('#userDisplayPic').value
const ROOM = element('#room').value


socket.emit('joinRoom', { USERNAME, USERID, ROOM, userPicture })

socket.on('roomUsers', ({ room, users }) => {
    outputUsers(users)
})

socket.on('message', data => {
    outMessage(data)
    console.log('hello')
    mainChatArea.scrollTop = mainChatArea.scrollHeight
})

form.addEventListener('submit', e => {
    e.preventDefault()
    socket.emit('chatMessage', textarea.value)
    textarea.value = ''
    textarea.style.height = '50px'
})


const outMessage = (data) => {
    if (data.userId === null) {
        const botMsg = document.createElement('div')
        botMsg.classList.add('bot-msg')
        botMsg.innerHTML = ` 
       <p> <strong> ${data.text} </strong> </p>
        <span>${data.time}</span>`;
        return messages.append(botMsg)
    }
    const messageDiv = document.createElement('div')
    messageDiv.classList.add('a-msg')
    if (data.userId == USERID) {
        messageDiv.classList.add('mine')
    }
    messageDiv.innerHTML = `
    <div class="a-msg__image">
        <img src="${data.userPicture}" alt="">
    </div>
    <div class="a-msg__content">
        <div class="text-author">
            <p class="author">
            ${data.username}
            </p>
            <p class="text">
            ${data.text}
            </p>
        </div>
        <div class="time">
            <p>${data.time}</p>
        </div>
    </div>
    `
    messages.append(messageDiv)

}

function outputUsers(users) {
    const allUsersContainer = document.querySelector('.all-users')
    const allUsers = users.map(user => {
        return `<div class="a-user ${USERID == user.userId ? 'mine' : ''}">
        <div class="a-user__image">
            <img src="${user.userPicture}" alt="">
        </div>
        <div class="a-user__info">
            <p class="name">${user.username}</p>
            <p class="status">Available!</p>
        </div>
        </div>
        `
    })
    document.querySelector('.number-of-members').textContent = users.length;
    allUsersContainer.innerHTML = allUsers
}

mainChatArea.addEventListener('scroll', () => {
    if (mainChatArea.scrollTop + mainChatArea.offsetHeight <= mainChatArea.scrollHeight) {
        downButton.classList.add('show')
    } else {
        downButton.classList.remove('show')
    }
})

downButton.addEventListener('click', () => {
    mainChatArea.scrollTop = mainChatArea.scrollHeight
})

function toggle() {
    const menu = document.querySelector('.menu-icon')
    const children = menu.querySelectorAll('span')
    const meAndNav = document.querySelector('div.me-and-nav')
    if (meAndNav.classList.contains('open')) {
        children.forEach(ele => {
            ele.classList.remove('open')
        });
        meAndNav.classList.remove('open')
    } else {
        children.forEach(ele => {
            ele.classList.toggle('open')
        });
        meAndNav.classList.add('open')
    }
}