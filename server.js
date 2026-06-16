const WebSocket = require("ws");

// holds same instance of game while server on (caches in memory all the objects)
const game = require("./game");
const sockets = {}; // playerId -> socket
const wss = new WebSocket.Server({ port: 8080 });
let counter = 0 

wss.on("connection", (socket) => {
  console.log("A client connected!");
  counter++;
  const playerId = game.addPlayer();
  sockets[playerId] = socket
  const result = game.canStartGame();
  if (result) {
    broadcastGameStart();
    game.startRound();
  }
  // Listen for messages FROM the client
  socket.on("message", (data) => {
    // 
    if (game.getHost()==playerId && game.getGameState()=='playing'){
        console.log("Received:", data.toString());
        sentence = game.createGameSentence;
        broadcastExceptSender(sentence, socket);
  }
    
  });

  socket.on("close", () => {
    counter--;
    delete sockets[playerId];  
    game.removePlayer(playerId);
    console.log(`Client disconnected ${playerId}`);
    console.log("Current clients connected: "+counter)
  });
});

function broadcastExceptSender(data,socket){
     wss.clients.forEach((client) => {
        if (client != socket && client.readyState == WebSocket.OPEN){
            client.send(data.toString());
        }
    });
}

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

async function runRound(){
    // user need to write his sentence

    // logic for his sentence

    // shown to all the other

    // guessing
}
console.log("WebSocket server running on ws://localhost:8080");