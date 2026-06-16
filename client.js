const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => log("Connected to server");
socket.addEventListener("message", (e) => log("Server: " + e.data));
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