const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => log("Connected to server");
socket.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    switch(msg.type){
        case "broadcast":
            log("Server: " + msg.text);
            break;
        case "showSentences":
            addVotes(msg.sentences)
            break;
    }
    
    
});
socket.addEventListener("message", (e) => {});
socket.onclose = () => log("Disconnected");

function sendMsg() {
  const val = document.getElementById("input").value;
  socket.send(val);
  log("You: " + val);
}

function log(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  document.getElementById("log").appendChild(li);
}

function addVotes(sentences){
    const container = document.getElementById("container");

    sentences.array.forEach(element => {
        var btn = document.createElement("button");
        btn.textContent = element;
    });


}