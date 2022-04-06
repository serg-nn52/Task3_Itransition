const randomNumber = require("random-number-csprng");
const { createHmac } = require("crypto");
const { createECDH } = require("crypto");
const prompt = require("prompt-sync")({ sigint: true });
const cTable = require("console.table");

const ecdh = createECDH("secp256k1");
const secretKey = ecdh.generateKeys("hex");

const moves = process.argv.slice(2);

const getRequest = () => {
  let request = "";
  while (true) {
    console.log(
      "Available moves: \n" +
        moves.map((el, i) => `${i + 1} - ${el} `).join("\n") +
        `\n0 - exit \n? - help`
    );
    request = prompt("Please enter your choice: ");
    if (request === "?") getTable();
    if (+request <= moves.length) break;
    if (+request < 0) break;
    if (+request === 0) break;
  }
  return request;
};

function getTable() {
  let arr = [];
  for (let i = 0; i < moves.length; i++) {
    arr[0] = "Draw";
    if (i > 0 && i < moves.length / 2) {
      arr[i] = "Lose";
    } else if (i > moves.length / 2) {
      arr[i] = "Win";
    }
  }

  let doubleArr = [];
  for (let i = 0; i < moves.length; i++) {
    arr.unshift(moves[i]);
    doubleArr.push([...arr]);
    arr.shift();
    arr.unshift(arr.pop());
  }
  console.table([`vertical - user, gorizontal -computer`, ...moves], doubleArr);
}

const rnd = async () => {
  if (moves.length < 3 || moves.length % 2 === 0) {
    console.log("the number of elements must be odd greater than 3");
    return;
  }
  const numberCompMove = await randomNumber(0, moves.length - 1);

  const hmac = createHmac("SHA3-256", secretKey)
    .update(moves[numberCompMove])
    .digest("hex");

  console.log(`HMAC: ${hmac}`);
  const request = getRequest();
  if (+request === 0) return;
  console.log(`Your move: ${moves[request - 1]}`);
  console.log(`Computer move: ${moves[numberCompMove]}`);

  if (+request - 1 === numberCompMove) {
    console.log("Draw!");
  } else if (
    (+request - 1 - numberCompMove > 0 &&
      +request - 1 - numberCompMove < moves.length / 2) ||
    (numberCompMove - +request + 1 > 0 &&
      numberCompMove - +request + 1 > moves.length / 2)
  ) {
    console.log("You Win! :-)");
  } else {
    console.log("You Lose! :-(");
  }
  console.log(`HMAC key: ${secretKey}`);
};

rnd();
