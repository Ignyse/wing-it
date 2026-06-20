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
        const hostId=game.getHost();
        host.send(JSON.stringify({ type: "broadcast", text: "You are the host" }));
        Object.entries(sockets).forEach(([id, socket]) => {
        if (id == hostId) return; 
            socket.send(JSON.stringify({ type: "broadcast", text: "Finish the sentence of the host, to confuse others!" }));
        });
    }
  }

  socket.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    switch(msg.type){
        case "sentence":
            handlePlayers(playerId,socket, msg.sentence);
            break;
        case "vote":
            handleVotes(playerId,msg.votedFor);
            break;
        case "ready-on":
            handleReadyOn();
            break;
        case "ready-off":
            handleReadyOff();
            break;
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

// FUNCTION HANDLING DATA FROM CLIENTS (players)
function handlePlayers(playerId, socket, data){
    // do i really NEED the socket ? thought for future
    if (game.getHost()==playerId && game.getGameState().status=='playing'){
        console.log("Received:", data.toString());
        sentence = game.createGameSentence(data.toString());
        broadcastExceptSender(sentence, socket);
        runRound();
  }
  // gets the sentence of the players except host
  if (game.getHost() != playerId && game.getGameState().status=='answering'){
        game.addPlayerEnding(data.toString(),playerId);
}
}

function handleVotes(playerId, votedFor){
    if (game.getGameState().status=='voting'){
        game.manageVotes(playerId,votedFor);
    }
}

function handleReadyOn(){
    // should i have a game state after voting
    game.addReady();
    wss.clients.forEach((client)=>{
        if (client.readyState == WebSocket.OPEN){
             client.send(JSON.stringify({ type: "updateReadyAmount", text: game.getAmountReady() }));
        }
    });
    
}

function handleReadyOff(){
    // should i have a game state after voting
    game.removeReady();
    // dont know why when i put in text: getamoundready() directly it didnt call the function? anyway..
    amountReady = game.getAmountReady()
    wss.clients.forEach((client)=>{
        if (client.readyState == WebSocket.OPEN){
             client.send(JSON.stringify({ type: "updateReadyAmount", text: amountReady  }));
        }
    });
}

function addReadyButtonClients(){
    wss.clients.forEach((client)=>{
        if (client.readyState == WebSocket.OPEN){
             client.send(JSON.stringify({ type: "readyButton" }));
        }
    })
}

function removeReadyButtonClients(){
    wss.clients.forEach((client)=>{
        if (client.readyState == WebSocket.OPEN){
             client.send(JSON.stringify({ type: "removeReadyButton" }));
        }
    })
}
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

function waitUntilOrTimeout(conditionFn, timeoutMs, checkInterval = 200) {
  return new Promise((resolve) => {
    const start = Date.now();

    const interval = setInterval(() => {
      if (conditionFn() || Date.now() - start >= timeoutMs) {
        clearInterval(interval);
        resolve();
      }
    }, checkInterval);
  });
}

function handleNewRound(){
    wss.clients.forEach((client) => {
        if (client.readyState == WebSocket.OPEN){
            client.send(JSON.stringify({ type: "newRound",round: game.getRound()}));
        }});
}

function handleEndGame(){
    wss.clients.forEach((client) => {
        if (client.readyState == WebSocket.OPEN){
            client.send(JSON.stringify({ type: "endGame"}));
        }});
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
    console.log(`all endings ${endings}`)
    wss.clients.forEach((client) => {
        console.log("state:", client.readyState);
        if (client.readyState == WebSocket.OPEN){
            client.send(JSON.stringify({ type: "showSentences", sentences: endings }));
            console.log(JSON.stringify({ type: "showSentences", sentences: endings }))
        }});
    broadcastAll(`Time left to vote:`);
    await startCountdownPromise(
        (count) => broadcastAll(`${count} s`),
        game.getConstants().voteTime
    );
    await sleep(1000); // wait 1 second
    broadcastAll(`Vote finished.`);
    broadcastAll(JSON.stringify(game.showVotes()));
    // need to add this to like before everyone pass with a safety timer
    addReadyButtonClients();
    await waitUntilOrTimeout(
        // function doesnt exist yet
        () => game.allReady(),
        game.getConstants().afkTime*1000
        );
    removeReadyButtonClients();
    let nextRound = game.newRound();
    if (nextRound){
        broadcastAll(`Next round starting in:`);
        handleNewRound();
        await startCountdownPromise(
            (count) => broadcastAll(`${count} s`),
            game.getConstants().startTime
        );
        
        if (game.getHost() != -1){
            const host= sockets[game.getHost()];
            const hostId=game.getHost();
            host.send(JSON.stringify({ type: "broadcast", text: "You are the host" }));
            Object.entries(sockets).forEach(([id, socket]) => {
            if (id == hostId) return; 
                socket.send(JSON.stringify({ type: "broadcast", text: "Finish the sentence of the host to confuse others!" }));
            });
        }
    }
    else{
        handleEndGame();
        const winner = game.getWinner();
        broadcastAll(`Game finished. Player ${winner.id} won with score ${winner.score}.`);
        game.reset();
    }
    
}



console.log("WebSocket server running on ws://localhost:8080");