const WebSocket = require("ws");

// holds same instance of game while server on (caches in memory all the objects)
const game = require("./game");
const wss = new WebSocket.Server({ port: 8080 });
let counter = 0 

wss.on("connection", (socket) => {
  console.log("A client connected!");
  counter++;
  const playerId = game.addPlayer();
  const result = game.startGame();
  if (result) broadcastGameStart();
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

function broadcastAll(res){
    wss.clients.forEach((client) => {
        if (client.readyState == WebSocket.OPEN){
            client.send(res.toString());
        }
    });
}

function startCountdown(onTick, onDone){
    let count = 5 // 5 seconds
    const interval = setInterval( ()=> {
        onTick(count);
        count --;

        if (count <= 0){

            clearInterval(interval);
            setTimeout(onDone, 1000);
        }
    }, 1000)
}

function broadcastGameStart(){
    startCountdown(
        (count) => broadcastAll(`Game Starting in ${count}`),
        () => broadcastAll('Game Started !')
    );
}
console.log("WebSocket server running on ws://localhost:8080");