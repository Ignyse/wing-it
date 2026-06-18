// game.test.js
const game = require("./game");

// helper to print pass/fail
function test(description, fn) {
  try {
    fn();
    console.log("✓", description);
  } catch (e) {
    console.log("✗", description);
    console.log("  →", e.message);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || "assertion failed");
}

// --- tests ---
test("getPlayer with wrong id throws an error", () => {
  try {
    game.getPlayer("wrongid");
    // if we reach this line, it didn't throw — that's a failure
    assert(false, "should have thrown an error");
  } catch (e) {
    assert(e.message === "Player wrongid not found", `unexpected message: ${e.message}`);
  }
});
test("addPlayer creates a player with score 0", () => {
  const id = game.addPlayer();
  const player = game.getPlayer(id);
  assert(player.score === 0, `expected 0 got ${player.score}`);
});

test("checkMinPlayer, 3 player are connected, correct status change", () => {
  game.reset();
  game.addPlayer();
  game.addPlayer();
  game.addPlayer();
  game.checkMinPlayers()
  const status = game.getGameState().status;
  assert(status === 'waiting', `expected waiting status got ${status}`);
});


test("checkMinPlayer, Not enough player to start a game", () => {
  game.reset();
  game.addPlayer();
  game.addPlayer();
  const status = game.getGameState().status;
  assert(status === 'unavailable', `expected unavailable status got ${status}`);
});


test("resetGameSamePlayers, Scores and round should be all 0", () => {
    game.reset();
    game.addPlayer();
    game.addPlayer();
    const id = game.addPlayer();
    game.getGameState().players[id].score=1;
    game.resetGameSamePlayers();
    const allZero = Object.values(game.getGameState().players)
    .every(player => player.score === 0);

    assert(allZero, "all scores should be 0");
    assert(game.getGameState().round === 1, "round should be 1");
});


test("top score", () =>{
    game.reset();
    playerID= game.addPlayer();
    game.addPlayer();
    game.getGameState().players[playerID].score ++;
    p = {id: playerID, score:game.getGameState().players[playerID].score }
    assert(game.getWinner().id==p.id && game.getWinner().score == p.score, `wrong top scorer?, ${JSON.stringify(game.getWinner())} and ${JSON.stringify(p)}`)
})

test("test resetVotes ", ()=>{
    game.reset();
    id = game.addPlayer();
    game.addPlayer();
    game.getGameState().players[id].vote ++;
    game.resetVotes();
    const allZero = Object.values(game.getGameState().players)
    .every(player => player.vote === 0);
     assert(allZero, "all votes should be 0");
    })