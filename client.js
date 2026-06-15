// Built into browsers — no install needed
const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
  console.log("Connected to server!");
  socket.send("Hello from the browser");
};

// Listen for messages FROM the server
// socket.onmessage = (event) => {
//   console.log("Server said:", event.data);
// };
socket.addEventListener("message", (e) => {
  log(`RECEIVED: ${e.data}: ${counter}`);
  counter++;
});
socket.onclose = () => {
  console.log("Disconnected");
};