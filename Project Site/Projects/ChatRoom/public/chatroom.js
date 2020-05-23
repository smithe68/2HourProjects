let messages = firebase.firestore().collection('messages');
let user = "Anonymous"

function sendMessage(message) {
    if (message == "" | user == "") {
        return;
    }

    if (message == "clear") {
        clearMessages();
        return;
    }
    messages.add({
        text: message,
        user: user,
        date: Date.now()
    }).then(() => {
        console.log("Message Sent!");
        loadMessages();
    }).catch((err) => {
        console.error(err);
    });
}

function clearMessages() {
    messages.get().then(snap => {
        snap.forEach(doc => {
            messages.doc(doc.id).delete();
        });
    });
}

function loadMessages() {
    let chatbox = document.getElementById('chatroom');
    messages.orderBy("date").get().then((snap) => {
        chatbox.innerHTML = "";
        snap.forEach(doc => {
            let div = document.createElement('div');
            div.classList.add('message');
            let span = document.createElement('username');
            let p = document.createElement('p');

            span.innerHTML = doc.data().user;
            p.innerHTML = doc.data().text;

            div.append(span);
            div.append(p);

            chatbox.append(div);
        });
    }).catch(err => {
        console.error(err);
    })
}

function sendMessageEvent() {
    let chat = document.getElementById('chat');
    sendMessage(chat.value);
    chat.value = "";
}

$('#send').click(() => {
    sendMessageEvent();
});

$('#chat').keypress((e) => {
    if (e.which == 13) {
        sendMessageEvent();
    }
})

$('#getName').keypress(() => {
    user = document.getElementById('getName').value;
    updateUsername();
});

function updateUsername() {
    document.getElementById('user').innerHTML = `User: ${user}`;
}

$(() => {
    loadMessages();
    updateUsername();

    messages.onSnapshot(() => {
        loadMessages();
    });
});