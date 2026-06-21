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
  const enoughPlayer = game.canStartGame();
  socket.send(JSON.stringify({type: `addNewGameButton`}))

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
        case "start-game":
            handleReadyOn();
            handleStartGame();
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
  }
  // gets the sentence of the players except host
  if (game.getHost() != playerId && game.getGameState().status=='answering' && !game.playerWroteSentence(playerId)){
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

// not async because i allow more player to join
function handleStartGame(){
    if (!game.getGameState().initiatedGame){
        // if enough player to start initiate and status on unaviable before
        if(game.canStartGame() && game.getGameState().ready>= game.getConstants().minPlayers){
            game.initiateGame();
            // first if all ready then stop interval return 0 otherwise inteval goes down by 1
            // on Done start the round process
            beginStartProcess(
                (count)=>{broadcastAll(`Game Starting in ${count}`); return game.allReady() ? 0: count-1},
                ()=>{broadcastAll("Game starts"); runRound();},
                game.getConstants().countdownTime
            );
        }
    }
}


function beginStartProcess(onTick, onDone,time){
    let count = time 
    const interval = setInterval( ()=> {
        count = onTick(count);
        if (count <= 0){
            clearInterval(interval);
            setTimeout(() => {
                onDone();
            }, 1000);
        }
    }, 1000)
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


function startCountdownPromise(onTick, onDone, time){
    return new Promise((resolve) =>{
        let count = time // 5 seconds
        const interval = setInterval( ()=> {
        onTick(count);
        count --;
        if (count <= 0){
            clearInterval(interval);
            setTimeout(() => {
                onDone();
                resolve();
            }, 1000);;

        }
    }, 1000)
    });
    
}




async function broadcastRoundStartPromise(){
    await startCountdownPromise(
        (count) => broadcastAll(`Round Starting in ${count}`),
        () => broadcastAll('Round Started !'),
        game.getConstants().countdownTime
    );
}

function broadcastStart(text){
    return ;
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


/*
Countdown to start round
select host
change to playing status after that
*/
async function beginningRound(){
    // does this need to be async too or not, to block user writing
    await broadcastRoundStartPromise();
    game.newRound();
    handleNewRound();
    // if host selected
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

async function answeringRound(){
    broadcastAll(`Time left to write:`);
    await startCountdownPromise(
        (count) => broadcastAll(`${count} s`),
        () => broadcastAll(`Time's up`),
        game.getConstants().answerTime
    );
    
}

async function votingRound(){
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
        () =>     broadcastAll(`Vote finished.`),
        game.getConstants().voteTime
    );

}

async function endRound(){
    broadcastAll(JSON.stringify(game.showVotes()));
    // need to add this to like before everyone pass with a safety timer
    // need reset because already ready from before
    game.resetReady();
    wss.clients.forEach((client)=>{
        if (client.readyState == WebSocket.OPEN){
             client.send(JSON.stringify({ type: "updateReadyAmount", text: game.getAmountReady() }));
        }
    });
    addReadyButtonClients();
    await waitUntilOrTimeout(
        // function doesnt exist yet
        () => game.allReady(),
        game.getConstants().afkTime*1000
        );
    removeReadyButtonClients();

}


/*
Flow:
Initial: runRound called by the ready start game button of players, check if he can start the game (waiting status)
Normal Flow:Initialize parameters of round + Start broadcasting start, after broadcasting change the status to playing (host can type)
*/
async function runRound(){
    // only with unavailable will it quit
    const canStart = game.canStartGame();
    if (!canStart) return;
    await beginningRound();
    await answeringRound();
    await votingRound();
    // stillPlaying = endRound();
    await endRound();
    const stillPlaying = game.newRound();
    if (stillPlaying){
        runRound();
    }
    else{
        // maybe change this is just for not instant end game
        handleEndGame();
        const winner = game.getWinner();
        broadcastAll(`Game finished. Player ${winner.id} won with score ${winner.score}.`);
        game.reset();
    }
}


console.log("WebSocket server running on ws://localhost:8080");