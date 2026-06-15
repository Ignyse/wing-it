const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

wss.on("connection", (socket) => {
  console.log("A client connected!");

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
    console.log("Client disconnected");
  });
});

console.log("WebSocket server running on ws://localhost:8080");