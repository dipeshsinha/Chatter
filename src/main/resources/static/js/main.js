

const usernamePage = document.getElementById("Username-Page");
const chatPage = document.getElementById("chat-page");
let usernameForm = document.getElementById("userNameForm");
let messageForm = document.getElementById("messageForm");
const messageInput = document.getElementById("message");
const messageArea = document.getElementById("messageArea");
const connectingElement = document.querySelector(".connecting");

let username = null;
let stompClient = null;

function connect(event) {
    event.preventDefault();
    username = document.querySelector('#name').value.trim();
    
    if (username) {
        usernamePage.style['display'] = "none";
        chatPage.classList.remove('hidden');
 
        let socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
}
function onConnected() {
    // subscribe to the public topic
    stompClient.subscribe('/topic/public', onMessageReceived);

    //tell username to the server

    stompClient.send('/app/chat.addUser',
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    );
    connectingElement.classList.add('hidden');
}

function onMessageReceived(payload) {
    let message = JSON.parse(payload.body);
    let messageElement = document.createElement('li');

    //change class here in css
    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' joined !';
    } else if(message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' left !';
    } else {
        messageElement.classList.add('chat-message');

        let avatarElement = document.createElement('i');
        let avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.classList.add('avatar-element');
        // avatarElement.style['background-color'] = "aqua";
        messageElement.appendChild(avatarElement);

        let usernameElement = document.createElement('span');
        let usernameText = document.createTextNode(message.sender);
        if(username == message.sender) {
            console.log("same user");
            messageElement.classList.add('self-message');
        }
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    let textElement = document.createElement('p');
    let messageText = document.createTextNode(message.content);
    textElement.appendChild(messageText);
    messageElement.appendChild(textElement);
    messageArea.appendChild(messageElement);
    messageArea.scrollTop = messageArea.scrollHeight;
}

function onError() {
    connectingElement.textContent = 'Could not connect to websocket server. Please refresh.';
    connectingElement.getElementsByClassName.color = 'red';
}

function sendMessage(event) {
    event.preventDefault();
    let messageContent = messageInput.value.trim();
    if (messageContent && stompClient) {
        let chatMessage = {
            sender: username,
            content: messageContent,
            type: 'CHAT'
        };
        stompClient.send(
            '/app/chat.sendMessage',
            {},
            JSON.stringify(chatMessage)
        );
        messageInput.content = '';
    }
}

usernameForm.addEventListener("submit", connect, true);
messageForm.addEventListener("submit", sendMessage, true);