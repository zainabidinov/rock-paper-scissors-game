const readlineSync = require("readline-sync");
const crypto = require("crypto");

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
      return "User wins";
    } else {
      return "Computer wins";
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
    console.log("Welcome!");

    while (true) {
      const moves = this.getUserMoves();
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

      this.getUserMove(key, computerMove);
    }
  }

  getUserMoves() {
    let moves;
    while (true) {
      moves = readlineSync
        .question("Enter your moves separated by spaces: ")
        .trim()
        .split(/\s+/);
      if (moves.length % 2 === 0 || moves.length < 3) {
        console.log("Please enter an odd number of moves starting from 3.");
        continue;
      }
      break;
    }
    return moves;
  }

  getUserMove(key, computerMove) {
    while (true) {
      const moveIndex = readlineSync.question(
        `Enter your move from 1 to ${this.computerMove.moves.length} (0 for Exit, ? for Help): `
      );
      if (moveIndex === "0" || moveIndex.toLowerCase() === "exit") {
        process.exit();
      } else if (moveIndex === "?") {
        this.generateAndDisplayGameTable();
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
    // Determine the width of each cell based on the length of the longest move name
    const maxMoveLength = Math.max(...moves.map(move => move.length));
    const cellWidth = maxMoveLength + 2; // Add 2 for padding

    // Display the table header
    console.log(`+-----------${Array(moves.length).fill(`+${'-'.repeat(cellWidth)}`).join('')}+`);
    console.log(`|  PC\\User  | ${moves.map(move => move.padEnd(maxMoveLength)).join(' | ')} |`);
    console.log(`+-----------${Array(moves.length).fill(`+${'-'.repeat(cellWidth)}`).join('')}+`);

    // Loop through each move to generate and display the table rows
    for (let i = 0; i < moves.length; i++) {
        // Initialize an empty row string
        let row = `| ${moves[i].padEnd(maxMoveLength)}  |`;

        // Loop through each move again to determine the result for each combination
        for (let j = 0; j < moves.length; j++) {
            // Calculate the result using the elegant formula provided
            const result = Math.sign((i - j + Math.floor(moves.length / 2) + moves.length) % moves.length - Math.floor(moves.length / 2));

            // Determine the outcome based on the result
            let outcome;
            if (result === 1) {
                outcome = 'Win';
            } else if (result === -1) {
                outcome = 'Lose';
            } else {
                outcome = 'Draw';
            }

            // Add the outcome to the row string
            row += ` ${outcome.padEnd(maxMoveLength)} |`;
        }

        // Display the row
        console.log(row);
        // Display the bottom border of the table after the last row
       
            console.log(`+-----------${Array(moves.length).fill(`+${'-'.repeat(cellWidth)}`).join('')}+`);
    }
}
}

const game = new GameEngine();
game.startGame();
