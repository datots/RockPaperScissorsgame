const crypto = require("crypto");
const readline = require("readline-sync");

class HMACGenerator {
  static generateKey() {
    return crypto.randomBytes(32).toString("hex");
  }

  static calculateHMAC(key, message) {
    return crypto.createHmac("sha256", key).update(message).digest("hex");
  }
}

class GameLogic {
  static determineWinner(userMoveIndex, computerMoveIndex, moves) {
    const half = Math.floor(moves.length / 2);
    if (userMoveIndex === computerMoveIndex) {
      return "Draw";
    }

    if (
      (computerMoveIndex > userMoveIndex &&
        computerMoveIndex <= userMoveIndex + half) ||
      (computerMoveIndex < userMoveIndex &&
        computerMoveIndex + moves.length <= userMoveIndex + half)
    ) {
      return "Computer Wins";
    } else {
      return "User Wins";
    }
  }
}

class HelpTable {
  static displayHelp(moves) {
    const table = [];
    table.push([""].concat(moves));

    moves.forEach((move, i) => {
      const row = [move];
      moves.forEach((opponentMove, j) => {
        if (i === j) {
          row.push("Draw");
        } else if (GameLogic.determineWinner(i, j, moves) === "User Wins") {
          row.push("Win");
        } else {
          row.push("Lose");
        }
      });
      table.push(row);
    });

    if (typeof console.table === "function") {
      console.table(table);
    } else {
      console.log("Help Table:");
      table.forEach((row) => {
        console.log(row.join(" | "));
      });
    }
  }
}

class Game {
  constructor(moves) {
    if (new Set(moves).size !== moves.length) {
      console.error("Error: Moves must be unique.");
      process.exit(1);
    }
    if (moves.length % 2 === 0 || moves.length < 3) {
      console.error(
        "Error: Please provide an odd number (≥ 3) of non-repeating moves."
      );
      process.exit(1);
    }

    this.moves = moves;
    this.key = HMACGenerator.generateKey();
    this.computerMoveIndex = Math.floor(Math.random() * this.moves.length);
    this.hmac = HMACGenerator.calculateHMAC(
      this.key,
      this.moves[this.computerMoveIndex]
    );
  }

  play() {
    console.log("HMAC (before move):", this.hmac);
    while (true) {
      this.showMenu();
      const choice = this.getUserChoice();
      if (choice === 0) {
        console.log("Exiting the game...");
        break;
      } else if (choice === "?") {
        HelpTable.displayHelp(this.moves);
      } else if (
        Number.isInteger(choice) &&
        choice > 0 &&
        choice <= this.moves.length
      ) {
        this.revealResult(choice - 1);
      } else {
        console.log(
          "Invalid choice. Please enter a valid number or '?' for help."
        );
      }
    }
  }

  showMenu() {
    console.log("Available moves:");
    this.moves.forEach((move, index) => {
      console.log(`${index + 1} - ${move}`);
    });
    console.log("0 - exit");
    console.log("? - help");
  }

  getUserChoice() {
    const choice = readline.question("Enter your move: ");
    if (choice === "?") {
      return choice;
    }
    const parsedChoice = parseInt(choice, 10);
    return isNaN(parsedChoice) ? -1 : parsedChoice;
  }

  revealResult(userMoveIndex) {
    const userMove = this.moves[userMoveIndex];
    const computerMove = this.moves[this.computerMoveIndex];
    console.log(`Your move: ${userMove}`);
    console.log(`Computer move: ${computerMove}`);
    console.log(
      GameLogic.determineWinner(
        userMoveIndex,
        this.computerMoveIndex,
        this.moves
      )
    );
    console.log("HMAC key (reveal):", this.key);
  }
}

const args = process.argv.slice(2);
if (args.length < 3 || args.length % 2 === 0) {
  console.error("Usage: node script.js <move1> <move2> ... <moveN>");
  console.error("Ensure the number of moves is odd and ≥ 3.");
  process.exit(1);
}

const game = new Game(args);
game.play();
