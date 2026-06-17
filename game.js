let gameState = { players: {}, round: 1, status: 'unavailable', host: -1, hostSentence: "", shortSentence: "",playerSentences: [] };
let constants = {answerTime: 9, voteTime: 4, startTime: 1, scoreTime:10,afkTime: 20, totalRounds:2}
let stillNotVoted = {};
// let scores = {}; // by id hmap
function reset(){
    gameState = { players: {}, round: 1, status: 'unavailable', host: -1, hostSentence: "",shortSentence:"", playerSentences: []};
}

function getConstants(){
    return constants;
}
function resetGameSamePlayers(){
    gameState.status = 'waiting'
    gameState.round = 1
    // reset scores
    Object.entries(gameState.players).forEach(([id, player]) => {
        gameState.players[id].score =0;
    });
}
function getRound(){
    // well i do -1 because i immediately increment after new round happens...
    if (gameState.round == 1){
        return 1
    }
    else return gameState.round - 1 
}
function newRound(){
    if (gameState.round <= constants.totalRounds){
        gameState.round++;
        gameState.hostSentence = "";
        gameState.shortSentence = "";
        gameState.playerSentences = [];
        gameState.status="playing";
        selectHost();
        return true;
    }
    else {
        reset();
        return false;
    }
}
function endGame(){
    reset()
}
function getGameState(){
    return gameState;
}

function addPlayer(){
    const id = Math.random().toString(36).slice(2);
    gameState.players[id] = {score:0};
    checkMinPlayers();
    return id;
}
function removePlayer(id){
    delete gameState.players[id];
}
function checkMinPlayers(){
    if ( Object.keys(gameState.players).length >=3){
        gameState.status = 'waiting'
    };
    return Object.keys(gameState.players).length;
}
function getPlayer(id){
    const player = gameState.players[id];
    if (!player) throw new Error(`Player ${id} not found`);
    return player;
}
function canStartGame(){
    if (gameState.status == 'waiting'){
        console.log('Starting the game')
        return true
    }
    else return false
}

function selectHost(){
    keys = Object.keys(gameState.players);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    gameState.host = randomKey;
    return gameState.host
}

function getHost(){
    // if -1 no host
    return gameState.host
}

function createGameSentence(sentence){
    gameState.hostSentence = sentence;
    let words = sentence.split(" ");
    console.log(`words: ${words}`)
    let len = words.length
    let gameSentence = words.slice(0,Math.floor(len/2)).join(" ");
    gameState.shortSentence = gameSentence;
    gameState.status= "answering";
    return gameSentence
}
function startVoting(){
    gameState.status="voting"
    stillNotVoted = Object.fromEntries(
        Object.keys(gameState.players).map(id => [id, 1])
    );
    scores = Object.fromEntries(
        Object.keys(gameState.players).map(id => [id, 0])
    );
}
function addPlayerEnding(ending, playerId){
    const sentence = gameState.shortSentence + ending;
    gameState.playerSentences.push({sentence, host: playerId})
    console.log(`Added new sentence: ${sentence}`);
}

function getAllEndings(){
    // add the host sentence too
    gameState.playerSentences.push({sentence: gameState.hostSentence, host: gameState.host});
    // const sentences = gameState.playerSentences.map(item => item.sentence);
    const sentencesWithIds = gameState.playerSentences;
    return sentencesWithIds;
}

function manageVotes(playerId, votedForId){
    // need startvoting called before 
    if (stillNotVoted[playerId]==1){
        stillNotVoted[playerId]=0;
        gameState.players[votedForId].score++;
    }
}

function showVotes(){
    return gameState.players;
}
function handleAction(message){

}


module.exports = { reset, addPlayer, getPlayer,checkMinPlayers,getGameState, canStartGame, removePlayer, 
    getHost, selectHost, newRound, addPlayerEnding, handleAction,resetGameSamePlayers,createGameSentence, startVoting, manageVotes, getConstants,getRound, showVotes, getAllEndings};