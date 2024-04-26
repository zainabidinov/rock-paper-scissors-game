const readlineSync = require("readline-sync");
const crypto = require("crypto");
const { exit, argv } = require('node:process');

class KeyGenerator {
  generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }
}

class ComputerMove {
  constructor(moves) {
    this.moves = moves;
  }

  selectMove() {
    const randomIndex = Math.floor(Math.random() * this.moves.length);
    return this.moves[randomIndex];
  }
}

class HMACGenerator {
  calculateHMAC(message, key) {
    const hmac = crypto.createHmac("sha3-256", key);
    hmac.update(message);
    return hmac.digest("hex");
  }
}

class Rules {
  constructor(moves) {
    this.moves = moves;
  }

  determineOutcome(userMove, computerMove) {
    const n = this.moves.length;
    const p = Math.floor(n / 2);

    const userIndex = this.moves.indexOf(userMove);
    const computerIndex = this.moves.indexOf(computerMove);

    const difference = Math.sign(((userIndex - computerIndex + p + n) % n) - p);

    if (difference === 0) {
      return "Draw";
    } else if (difference === 1) {
      return "You win!";
    } else {
      return "You lose!";
    }
  }
}

class GameEngine {
  constructor() {
    this.keyGenerator = new KeyGenerator();
    this.computerMove = null;
    this.hmacGenerator = new HMACGenerator();
    this.rules = null;
    this.userMove = null;
  }

  startGame() {

    while (true) {
      const moves = this.getUserMoves();
      console.log("Welcome!");
      this.computerMove = new ComputerMove(moves);
      this.rules = new Rules(moves);
      const key = this.keyGenerator.generateKey();
      const computerMove = this.computerMove.selectMove();
      const hmac = this.hmacGenerator.calculateHMAC(computerMove, key);

      console.log("HMAC:", hmac);
      console.log("Available moves:");
      moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
      console.log("0 - Exit");
      console.log("? - Help");

      this.getUserMove(key, computerMove, hmac, moves);
    }
  }

  getUserMoves() {
    let moves;
    while (true) {
      moves = argv.slice(2);

      if (moves.length % 2 === 0 || moves.length < 3) {
        console.log("Please enter an odd number of moves starting from 3.");
        exit(1);
      }

      const uniqueMoves = new Set(moves);

      if (uniqueMoves.size !== moves.length) {
        console.log("Please enter unique moves without repetition.");
        exit(1);
      }

      break;
    }
    return moves;
  }

  getUserMove(key, computerMove, hmac, moves) {
    while (true) {
      const moveIndex = readlineSync.question(
        `Enter your move from 1 to ${this.computerMove.moves.length} (0 for Exit, ? for Help): `
      );
      if (moveIndex === "0" || moveIndex.toLowerCase() === "exit") {
        exit(0);
      } else if (moveIndex === "?") {
        this.generateAndDisplayGameTable();
        console.log("HMAC:", hmac);
        console.log("Available moves:");
        moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
        console.log("0 - Exit");
        console.log("? - Help");
        continue;
      }
      const index = parseInt(moveIndex) - 1;
      if (
        isNaN(index) ||
        index < 0 ||
        index >= this.computerMove.moves.length
      ) {
        console.log(
          "Invalid move. Please enter a number between 1 and",
          this.computerMove.moves.length
        );
        console.log("HMAC:", hmac);
        console.log("Available moves:");
        moves.forEach((move, index) => console.log(`${index + 1} - ${move}`));
        console.log("0 - Exit");
        console.log("? - Help");
        continue;
      }
      this.userMove = this.computerMove.moves[index];
      this.displayResults(key, computerMove);
      break;
    }
  }

  displayResults(key, computerMove) {
    console.log("Your move:", this.userMove);
    console.log("Computer move:", computerMove);
    const outcome = this.rules.determineOutcome(this.userMove, computerMove);
    console.log("Outcome:", outcome);
    console.log("HMAC key:", key);
  }

  generateAndDisplayGameTable() {
    const moves = this.computerMove.moves;
    const maxMoveLength = Math.max(...moves.map((move) => move.length));
    const cellWidth = maxMoveLength + 2;

    console.log(
      `+-----------${Array(moves.length)
        .fill(`+${"-".repeat(cellWidth)}`)
        .join("")}+`
    );
    console.log(
      `|  PC\\User  | ${moves
        .map((move) => move.padEnd(maxMoveLength))
        .join(" | ")} |`
    );
    console.log(
      `+-----------${Array(moves.length)
        .fill(`+${"-".repeat(cellWidth)}`)
        .join("")}+`
    );

    for (let i = 0; i < moves.length; i++) {
      let row = `| ${moves[i].padEnd(maxMoveLength)}  |`;

      for (let j = 0; j < moves.length; j++) {
        const result = Math.sign(
          ((i - j + Math.floor(moves.length / 2) + moves.length) %
            moves.length) -
            Math.floor(moves.length / 2)
        );

        let outcome;
        if (result === 1) {
          outcome = "Lose";
        } else if (result === -1) {
          outcome = "Win";
        } else {
          outcome = "Draw";
        }

        row += ` ${outcome.padEnd(maxMoveLength)} |`;
      }

      console.log(row);

      console.log(
        `+-----------${Array(moves.length)
          .fill(`+${"-".repeat(cellWidth)}`)
          .join("")}+`
      );
    }
  }
}

const game = new GameEngine();
game.startGame();
