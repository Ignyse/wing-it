let gameState = { players: {}, round: 0, status: 'waiting'};

function addPlayer(){
    const id = Math.random().toString(36).slice(2);
    gameState.players[id] = {score:0};
    return id;
}

function getPlayer(id){
    const player = gameState.players[id];
    if (!player) throw new Error(`Player ${id} not found`);
    return player;
}
function handleAction(message){

}


module.exports = { addPlayer, getPlayer, handleAction };