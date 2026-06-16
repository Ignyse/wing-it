let gameState = { players: {}, round: 0, status: 'unavailable'};

function reset(){
    gameState = { players: {}, round: 0, status: 'unavailable'};
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
function handleAction(message){

}


module.exports = { reset, addPlayer, getPlayer,checkMinPlayers,getGameState, canStartGame, removePlayer, handleAction };