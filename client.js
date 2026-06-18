const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => log("Connected to server");
socket.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    switch(msg.type){
        case "broadcast":
            log("Server: " + msg.text);
            break;
        case "showSentences":
            console.log("went to addvote");
            addVotes(msg.sentences);
            break;
        case "newRound":
            removeButtons();
            cleanList();
            showRound(msg.round);
            break;
        case "readyButton":
            addReadyButton();
            break;
        case "removeReadyButton":
            removeReadyButton();
            break;
        case "updateReadyAmount":
            whoReady(msg.text);
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
  voteClicked(selected);
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
    console.log(`sentence inside addvotes ${sentences}`)
    // sentences.forEach({a,b}=>)
    sentences.forEach(({sentence,host}) => {
        console.log(`Sentence ${sentence} with id ${host}`)
        var btn = document.createElement("button");
        btn.classList.add("vote-btn");
        console.log(`assigning id in advotes ${host}`)
        btn.dataset.id = host;
        btn.textContent = sentence;
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

function addReadyButton(){
    const container = document.getElementById("rdyButton");
    var btn = document.createElement("button");
    btn.textContent = "Ready";
    container.appendChild(btn);
    btn.addEventListener("click", (e) => {
        toggleReady(btn);
        console.log("User toggled ready:");
    });
}

function removeReadyButton(){
    const container = document.getElementById("rdyButton");
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
}
function toggleReady(btn) {
  const isTicked = btn.classList.contains("ticked");

  if (isTicked) {
    btn.classList.remove("ticked");
    socket.send(JSON.stringify({type: 'ready-off'}))
  } else {
    btn.classList.add("ticked");
    socket.send(JSON.stringify({type: 'ready-on'}))
  }
}

function whoReady(text){
    const container = document.getElementById("whoReady");
    container.textContent = text;
}