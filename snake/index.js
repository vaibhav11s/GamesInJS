/// <reference path="../P5/TSDef/p5.global-mode.d.ts" />
/// <reference path="Snake.js" />

/**
 * @type {{
 *    game: Snake,
 *    score: number
 *    scoreDiv: HTMLElement,
 *    menuDiv: HTMLElement,
 *    gameOver: boolean
 *    side: number
 * }}
 */
const EL = {
  game: undefined,
  score: undefined,
  scoreDiv: undefined,
  menuDiv: undefined,
  gameOver: false,
  side: 20,
};

function setup() {
  frameRate(5);
  createCanvas(windowWidth, windowHeight);
  createScoreDiv();
  createMenuDiv();

  newGame();
  handleGamePause();
}

const drawBox = (/** @type {p5.Vector} */ pos, /** @type {string} */ color) => {
  fill(color);
  rect(pos.x * EL.side, pos.y * EL.side, EL.side, EL.side);
};

const updateScore = (/** @type {number} */ score) => {
  EL.score = score;
  EL.scoreDiv.innerHTML = `Score: ${score}`;
};

const newGame = () => {
  const H = Math.floor(windowHeight / EL.side);
  const W = Math.floor(windowWidth / EL.side);
  resizeCanvas(W * EL.side, H * EL.side);

  EL.game = new Snake(EL.side, createVector(W, H));
  EL.gameOver = false;
  EL.score = 0;
  updateScore(0);
};

function draw() {
  EL.game.update(updateScore, handleGameOver);
  if (EL.game.gameOver) {
    return;
  }
  background(25);
  EL.game.draw(drawBox);
}

const handleGamePause = () => {
  noLoop();
  showMenu();
};

const handleGameOver = () => {
  EL.gameOver = true;
  handleGamePause();
};

const handleNewGame = () => {
  newGame();
  handleGamePlay();
};

const handleGamePlay = () => {
  EL.gameOver && handleNewGame();
  hideMenu();
  loop();
};

const handlePauseButton = () => {
  // @ts-ignore
  if (isLooping()) {
    handleGamePause();
  } else {
    handleGamePlay();
  }
};

function keyPressed() {
  if (EL.game.handleKeyPress(keyCode)) return;
  switch (keyCode) {
    case 27: // esc
      handlePauseButton();
      break;
    case 13: // enter
      handlePauseButton();
      break;
  }
}

const createScoreDiv = () => {
  const scoreDiv = document.createElement("div");
  scoreDiv.className = "score";
  scoreDiv.innerText = "Score: 0";
  EL.scoreDiv = scoreDiv;
  document.body.appendChild(scoreDiv);
};

const createMenuDiv = () => {
  const modalContainer = document.createElement("div");
  modalContainer.className = "modal fade";
  modalContainer.innerHTML = `
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Snake</h5>
        </div>
        <div class="modal-body">
          <button class="btn btn-outline-primary" id="new-game-button">New Game</button>
          <button class="btn btn-outline-primary" id="play-button">Play</button>
        </div>
        <p id="score">Score: 0</p>
      </div>
    </div>
  `;
  const newGameButton = modalContainer.querySelector("#new-game-button");
  newGameButton.addEventListener("click", handleNewGame);
  const playButton = modalContainer.querySelector("#play-button");
  playButton.addEventListener("click", handleGamePlay);
  document.body.appendChild(modalContainer);
  EL.menuDiv = modalContainer;
};

const showMenu = () => {
  EL.menuDiv.classList.add("show");
  EL.menuDiv.setAttribute("style", "display: block;");
  const playButton = EL.menuDiv.querySelector("#play-button");
  if (EL.gameOver) playButton.setAttribute("style", "display: none;");
  else playButton.setAttribute("style", "display: block;");
  EL.menuDiv.querySelector("#score").innerHTML = `Score: ${EL.score}`;
};

const hideMenu = () => {
  EL.menuDiv.classList.remove("show");
  EL.menuDiv.setAttribute("style", "display: none;");
};
