const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => log("Connected to server");
socket.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    switch(msg.type){
        case "broadcast":
            log("Server: " + msg.text);
            break;
        case "showSentences":
            addVotes(msg.sentences);
            break;
        case "newRound":
            removeButtons();
            cleanList();
            showRound(msg.round);
            break;
    }
    
    
});
socket.addEventListener("message", (e) => {});
socket.onclose = () => log("Disconnected");



const voteContainer = document.getElementById("container");
let selected = null;
voteContainer.addEventListener("click", (e) => {
  const btn = e.target.closest(".vote-btn");
  if (!btn) return;

  // remove tick from all
  document.querySelectorAll(".vote-btn")
    .forEach(b => b.classList.remove("ticked"));

  // tick clicked one
  btn.classList.add("ticked");

  // use ID instead of text
  selected = btn.dataset.id;
  voteClicked(btn.dataset.id);
  console.log("Selected ID:", selected);
});


function sendMsg() {
  const val = document.getElementById("input").value;
//   socket.send(val);
  socket.send(JSON.stringify({type: 'sentence', sentence: val}))
  log("You: " + val);
}

function voteClicked(idButtonOwner){
    socket.send(JSON.stringify({type: 'vote', votedFor: idButtonOwner}))
}
function log(msg) {
  const li = document.createElement("li");
  li.textContent = msg;
  document.getElementById("log").appendChild(li);
}

function addVotes(sentences){
    // need to retrieve each id specfic to each sentence
    const container = document.getElementById("container");

    // sentences.forEach({a,b}=>)
    sentences.forEach(element => {
        var btn = document.createElement("button");
        btn.classList.add("vote-btn");
        btn.dataset.id = 12;
        btn.textContent = element;
        container.appendChild(btn);
    });


}

function removeButtons(){
    const container = document.getElementById("container")
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}

function cleanList(){
    const container = document.getElementById("log");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
}

function showRound(round){
    const li = document.createElement("li");
    li.textContent = `Round: ${round}`;
    document.getElementById("log").appendChild(li);

}