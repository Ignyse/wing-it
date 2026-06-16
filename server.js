const WebSocket = require("ws");

const game = require("./game");
const wss = new WebSocket.Server({ port: 8080 });
let counter = 0 

wss.on("connection", (socket) => {
  console.log("A client connected!");
    counter++;
  // Listen for messages FROM the client
  socket.on("message", (data) => {
    console.log("Received:", data.toString());

    // Send a message BACK to that client
    wss.clients.forEach((client) => {
        if (client != socket && client.readyState == WebSocket.OPEN){
            client.send(data.toString());
        }
    });
    // socket.send("Got your message: " + data);
  });

  socket.on("close", () => {
    counter--;
    console.log("Client disconnected");
    console.log("Current clients connected: "+counter)
  });
});

console.log("WebSocket server running on ws://localhost:8080");