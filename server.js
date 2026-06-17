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
    game.newRound();
    if (game.getHost() != -1){
        const host= sockets[game.getHost()];
        // host.send("You are the host");
        host.send(JSON.stringify({ type: "broadcast", text: "You are the host" }));
    }
  }
  // Listen for messages FROM the client
  socket.on("message", (data) => {
    // 
    if (game.getHost()==playerId && game.getGameState().status=='playing'){
        console.log("Received:", data.toString());
        sentence = game.createGameSentence(data.toString());
        broadcastExceptSender(sentence, socket);
        runRound();
  }
    if (game.getHost() != playerId && game.getGameState().status=='answering'){
        game.addPlayerEnding(data.toString(),playerId);

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
            // client.send(data.toString());
            client.send(JSON.stringify({ type: "broadcast", text: data.toString() }));
        }
    });
}

function broadcastAll(res){
    wss.clients.forEach((client) => {
        if (client.readyState == WebSocket.OPEN){
            // client.send(res.toString());
            client.send(JSON.stringify({ type: "broadcast", text: res.toString() }));
        }
    });
}

function startCountdown(onTick, onDone, time){
    let count = time // 5 seconds
    const interval = setInterval( ()=> {
        onTick(count);
        count --;
        if (count <= 0){
            clearInterval(interval);
            setTimeout(onDone, 1000);
        }
    }, 1000)
}

function startCountdownPromise(onTick, time){
    return new Promise((resolve) =>{
        let count = time // 5 seconds
        const interval = setInterval( ()=> {
        onTick(count);
        count --;
        if (count <= 0){
            clearInterval(interval);
            resolve();
        }
    }, 1000)
    });
    
}

function broadcastGameStart(){
    startCountdown(
        (count) => broadcastAll(`Game Starting in ${count}`),
        () => broadcastAll('Game Started !'),
        5
    );
}
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
async function runRound(){
    broadcastAll(`Time left to write:`);
    await startCountdownPromise(
        (count) => broadcastAll(`${count} s`),
        game.getConstants().answerTime
    );
    await sleep(1000); // wait 1 second
    broadcastAll(`Time's up`); 
    game.startVoting();
    // need to call here otherwise duplicates
    let endings = game.getAllEndings();
    wss.clients.forEach((client) => {
        console.log("state:", client.readyState);
        if (client.readyState == WebSocket.OPEN){
            client.send(JSON.stringify({ type: "showSentences", sentences: endings }));
        }});
    broadcastAll(`Time left to vote:`);
    await startCountdownPromise(
        (count) => broadcastAll(`${count} s`),
        game.getConstants().voteTime
    );
    broadcastAll(`Vote finished.`);
    let nextRound = game.newRound();
    if (nextRound){
        broadcastAll(`Next round starting in:`);
        wss.clients.forEach((client) => {
        console.log("state:", client.readyState);
        if (client.readyState == WebSocket.OPEN){
            client.send(JSON.stringify({ type: "newRound"}));
        }});
        await startCountdownPromise(
            (count) => broadcastAll(`${count} s`),
            game.getConstants().startTime
        );
        
        if (game.getHost() != -1){
            const host= sockets[game.getHost()];
            // host.send("You are the host");
            host.send(JSON.stringify({ type: "broadcast", text: "You are the host" }));
        }
    }
    else{
        broadcastAll(`Game finished. Player XX won.`);
    }
    
    // user need to write his sentence

    // logic for his sentence

    // shown to all the other

    // guessing
}
console.log("WebSocket server running on ws://localhost:8080");