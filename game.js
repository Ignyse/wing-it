let gameState = { players: {}, round: 0, status: 'unavailable'};

function getGameState(){
    return gameState;
}
function addPlayer(){
    const id = Math.random().toString(36).slice(2);
    gameState.players[id] = {score:0};
    checkMinPlayers();
    return id;
}
function checkMinPlayers(){
    if ( Object.keys(gameState.players).length >=3){
        gameState.status = 'waiting'
    };
}
function getPlayer(id){
    const player = gameState.players[id];
    if (!player) throw new Error(`Player ${id} not found`);
    return player;
}
function handleAction(message){

}


module.exports = { addPlayer, getPlayer,checkMinPlayers,getGameState, handleAction };