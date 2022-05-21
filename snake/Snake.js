/// <reference path="../P5/TSDef/p5.global-mode.d.ts" />

class Snake {
  requiredKeys = [38, 40, 37, 39];
  /**
   * @param {number} boxWidth
   * @param {p5.Vector} boardSize
   */
  constructor(boxWidth, boardSize) {
    this.tail = [
      createVector(
        Math.floor(boardSize.x * 0.5),
        Math.floor(boardSize.y * 0.5)
      ),
    ];
    this.boxWidth = boxWidth;
    this.boardSize = boardSize.copy();
    this.speed = createVector(1, 0);
    this.gameOver = false;
    this.food = new Food(boxWidth, boardSize);
    this.isTurning = false;
    this.score = 0;
  }

  /**
   * @param {(arg0: p5.Vector, arg1: string) => void} drawBox
   */
  draw(drawBox) {
    for (let i = 1; i < this.tail.length; i++) {
      drawBox(this.tail[i], "green");
    }
    drawBox(this.tail[0], "red");
    this.food.draw();
  }

  /**
   * @param {(arg0: number) => void} [updateScore]
   * @param {() => void} [handleGameOver]
   *
   */
  update(updateScore, handleGameOver) {
    let newHead = this.tail[0].copy();
    newHead.add(this.speed);
    this.tail.unshift(newHead);
    // if(this.checkWallCollision()){
    //   this.gameOver = true
    //   handleGameOver()
    //   return
    // }
    this.edges();
    if (this.checkSelfCollision()) {
      this.gameOver = true;
      handleGameOver();
      return;
    }
    if (this.checkFoodCollision()) {
      this.food.respawn();
      this.score = this.tail.length - 1;
      updateScore?.(this.score);
    } else {
      this.tail.pop();
    }
    this.isTurning = false;
  }

  checkSelfCollision() {
    for (let i = 1; i < this.tail.length; i++) {
      if (this.tail[0].equals(this.tail[i])) {
        return true;
      }
    }
    return false;
  }

  checkWallCollision() {
    if (this.tail[0].x < 0 || this.tail[0].x >= this.boardSize.x) {
      return true;
    }
    if (this.tail[0].y < 0 || this.tail[0].y >= this.boardSize.y) {
      return true;
    }
    return false;
  }

  checkFoodCollision() {
    if (this.food.checkCollision(this.tail[0])) {
      return true;
    }
    return false;
  }

  edges() {
    if (this.tail[0].x >= this.boardSize.x) {
      this.tail[0].x = 0;
    } else if (this.tail[0].x < 0) {
      this.tail[0].x = this.boardSize.x - 1;
    } else if (this.tail[0].y >= this.boardSize.y) {
      this.tail[0].y = 0;
    } else if (this.tail[0].y < 0) {
      this.tail[0].y = this.boardSize.y - 1;
    }
  }

  /**
   * @param {number} key
   */
  handleKeyPress(key) {
    if (this.requiredKeys.indexOf(key) == -1) return false;
    this.changeDirection(key);
    return true;
  }

  /**
   * @param {number} key
   */
  changeDirection(key) {
    if (this.isTurning) return;
    this.isTurning = true;
    switch (key) {
      case 38:
        if (this.speed.y !== 1) {
          this.speed.x = 0;
          this.speed.y = -1;
        }
        break;
      case 40:
        if (this.speed.y !== -1) {
          this.speed.x = 0;
          this.speed.y = 1;
        }
        break;
      case 37:
        if (this.speed.x !== 1) {
          this.speed.x = -1;
          this.speed.y = 0;
        }
        break;
      case 39:
        if (this.speed.x !== -1) {
          this.speed.x = 1;
          this.speed.y = 0;
        }
    }
  }
}

class Food {
  /**
   * @param {number} boxWidth
   * @param {p5.Vector} boardSize
   */
  constructor(boxWidth, boardSize) {
    this.boxWidth = boxWidth;
    this.boardSize = boardSize.copy();
    this.pos = createVector(
      Math.floor(Math.random() * this.boardSize.x),
      Math.floor(Math.random() * this.boardSize.y)
    );
  }

  draw() {
    fill("yellow");
    rect(
      this.pos.x * this.boxWidth,
      this.pos.y * this.boxWidth,
      this.boxWidth,
      this.boxWidth
    );
  }

  /**
   * @param {p5.Vector} pos
   */
  checkCollision(pos) {
    return this.pos.equals(pos);
  }

  respawn() {
    this.pos = createVector(
      Math.floor(Math.random() * this.boardSize.x),
      Math.floor(Math.random() * this.boardSize.y)
    );
  }
}
