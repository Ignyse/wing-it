
# Purpose
Building and experimenting with Node.js, JavaScript, and WebSockets to gain more hands-on experience with real-time applications.

# Main Idea
A game where one user writes a sentence. Other connected players receive only part of it and try to improvise an ending. Players then guess which sentence was the original one. More advanced rules and scoring will be added later.
# Commands
Run server: `node server`
Run tests for game logic: `node game.test.js`
# Installation
websockets plugin: `npm install ws`


# Game Logic

The game can be in one of the following states:

* **Unavailable** – Not enough players are connected to start a game. (Min. 3)
* **Waiting** – Enough players are connected and the game is waiting to start.
* **Playing** – A round has started and the host is writing the original sentence.
* **Answering** – Players receive part of the sentence and submit their own endings.
* **Voting** – Players vote on which sentence they believe is the original.

## State Flow

```text
Unavailable → Waiting → Playing → Answering → Voting → Playing / End
```
