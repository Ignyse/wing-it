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