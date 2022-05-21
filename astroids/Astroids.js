/// <reference path="../P5/TSDef/p5.global-mode.d.ts" />

class AstroidsGame {
  /**
   * @param {number} W
   * @param {number} H
   */
  constructor(W, H) {
    this.W = W;
    this.H = H;
    this.ship = new Ship(createVector(W / 2, H / 2), 20);
    /** @type {Astroid[]} */
    this.astroids = [];
    /** @type {Laser[]} */
    this.lasers = [];
    /** @type {Particle[]} */
    this.particles = [];
    this.laserTimeout = 100;
    /** @type {number} */
    this.score = 0;
    this.gameOver = false;
    for (let i = 0; i < 15; i++) {
      this.astroids.push(new Astroid());
    }
  }

  /**
   * @param {(arg0: number) => void} [updateScore]
   * @param {() => void} [handleGameOver]
   */
  update(updateScore, handleGameOver) {
    if (this.gameOver) return;
    keyChecks(this);
    const addParticle = () => {
      this.particles.push(new Particle(this.ship));
    };
    this.ship.update(addParticle);
    this.astroids.forEach((astroid) => {
      astroid.update();
    });
    this.lasers.forEach((laser) => {
      laser.update();
    });
    this.lasers = this.lasers.filter((laser) => {
      return laser.time < this.laserTimeout;
    });
    this.particles.forEach((particle) => {
      particle.update();
    });
    this.particles = this.particles.filter((particle) => {
      return (
        particle.time < random(this.laserTimeout / 5, this.laserTimeout / 10)
      );
    });

    // check for collisions
    this.astroids.forEach((astroid) => {
      if (this.ship.isCollision(astroid)) {
        this.gameOver = true;
        handleGameOver?.();
        return;
      }
    });

    // destroy astroids
    const newAstroids = [];
    this.astroids = this.astroids.filter((astroid) => {
      let alive = true;
      this.lasers = this.lasers.filter((laser) => {
        if (laser.isCollision(astroid)) {
          newAstroids.push(...astroid.destroy());
          alive = false;
          this.score += 10;
          updateScore?.(this.score);
          return false;
        }
        return true;
      });
      return alive;
    });
    this.astroids.push(...newAstroids);
    if (this.astroids.length === 0) {
      this.gameOver = true;
      handleGameOver?.();
    }
  }

  handleKeyPress(key) {
    if (key === 32) {
      this.lasers.unshift(new Laser(this.ship));
      return true;
    }
    if (key === 68) {
      this.ship.setRotation(0.05);
      return true;
    }
    if (key === 65) {
      this.ship.setRotation(-0.05);
      return true;
    }
    if (key === 87) {
      this.ship.setAcc(1);
    }
    return false;
  }

  handleKeyRelease(key) {
    if (key === 87) {
      this.ship.setAcc(0);
    }
  }

  draw() {
    this.ship.show();
    this.astroids.forEach((astroid) => {
      astroid.show();
    });
    this.lasers.forEach((laser) => {
      laser.show();
    });
    this.particles.forEach((particle) => {
      particle.show();
    });
  }
}

const keyChecks = (game) => {
  let right = keyIsDown(68);
  let left = keyIsDown(65);
  if (!left && !right) {
    game.ship.setRotation(0);
  }
};

class Body {
  /**
   * @param {p5.Vector} pos
   * @param {p5.Vector} angle
   */
  constructor(pos, angle, speed = 5, r = 4) {
    this.pos = pos;
    this.velocity = angle.copy();
    this.velocity.setMag(speed);
    this.r = r;
  }

  update() {
    this.pos.add(this.velocity);
    this.edges();
  }

  /**
   * @param {Body} other
   */
  isCollision(other) {
    let d = p5.Vector.dist(this.pos, other.pos);
    return d < this.r + other.r;
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }

  show() {
    push();
    stroke(255, 0, 0);
    strokeWeight(this.r);
    point(this.pos.x, this.pos.y);
    pop();
  }
}

class Astroid extends Body {
  /**
   * @param {Astroid} astroid
   * @param {number} m
   */
  constructor(astroid = undefined, m = undefined) {
    if (astroid) {
      super(
        astroid.pos.copy(),
        astroid.velocity.copy().rotate(m),
        astroid.velocity.mag() * 0.8,
        astroid.r / 1.4
      );
      return;
    }
    super(
      createVector(random(width), random(height)),
      createVector(random(-1, 1), random(-1, 1)),
      random(1, 3),
      random(10, 50)
    );
  }

  destroy() {
    let astroids = [];
    if (this.r > 10) {
      const d0 = random(PI / 4);
      astroids[0] = new Astroid(this, d0);
      astroids[1] = new Astroid(this, d0 - PI / 4);
    }
    return astroids;
  }

  show() {
    push();
    stroke(255, 255, 255);
    fill(0, 0, 0);
    translate(this.pos.x, this.pos.y);
    beginShape();
    for (let index = 0; index < 8; index++) {
      let angle = map(index, 0, 8, 0, TWO_PI);
      let x = this.r * cos(angle);
      let y = this.r * sin(angle);
      vertex(x, y);
    }
    endShape(CLOSE);
    pop();
  }
}

class Laser extends Body {
  /**
   * @param {Ship} ship
   */
  constructor(ship) {
    let pos = ship.pos.copy().add(p5.Vector.fromAngle(ship.angle).mult(ship.r));
    super(pos, p5.Vector.fromAngle(ship.angle));
    this.time = 0;
  }

  update() {
    super.update();
    this.time += 1;
  }
}

class Particle extends Body {
  /**
   * @param {Ship} ship
   */
  constructor(ship) {
    let pos = ship.pos
      .copy()
      .add(p5.Vector.fromAngle(ship.angle).mult(-ship.r))
      .add(
        p5.Vector.fromAngle(ship.angle + PI / 2).mult(random(-ship.r, ship.r))
      );
    super(
      pos,
      p5.Vector.fromAngle(ship.angle + PI + random(-0.1, 0.1)),
      random(2, 4),
      random(3, 4)
    );
    this.time = 0;
  }

  update() {
    super.update();
    this.time += 1;
  }

  show() {
    push();
    stroke(255, 69, 0);
    fill(255, 69, 0);
    strokeWeight(this.r);
    point(this.pos.x, this.pos.y);
    pop();
  }
}

class Ship {
  /**
   * @param {p5.Vector} pos
   * @param {number} r
   */
  constructor(pos, r) {
    this.pos = pos.copy();
    this.r = r;
    this.vel = createVector(0, 0);
    this.acc = 0;
    this.angle = 0;
    this.rotation = 0;
    this.terminalVelocity = 12;
  }

  drawShip() {
    translate(this.pos.x, this.pos.y);
    rotate(this.angle + PI / 2);
    fill(0, 0, 0);
    stroke(255, 0, 0);
    triangle(-this.r, this.r, this.r, this.r, 0, -this.r);
  }

  drawBoost() {
    fill(255, 69, 0);
    triangle(-this.r, this.r, 0, this.r, -this.r / 2, this.r * 1.3);
    triangle(0, this.r, this.r, this.r, this.r / 2, this.r * 1.3);
    triangle(-this.r / 2, this.r, this.r / 2, this.r, 0, this.r * 1.3);
  }

  show() {
    push();
    this.drawShip();
    if (this.acc > 0) {
      this.drawBoost();
    }
    pop();
  }

  /**
   * @param {() => void} [addParticle]
   */
  update(addParticle) {
    this.position();
    this.edges();
    this.turn();
    this.boost();
    if (this.acc > 0) {
      addParticle?.();
    }
  }

  /**
   * @param {Astroid} body
   */
  isCollision(body) {
    let d = dist(this.pos.x, this.pos.y, body.pos.x, body.pos.y);
    if (d < (this.r + body.r) / 2) {
      return true;
    }
    let p1 = this.pos.copy().add(p5.Vector.fromAngle(this.angle).mult(this.r));
    let d1 = p5.Vector.dist(p1, body.pos);
    if (d1 < body.r) {
      return true;
    }
    let p2 = this.pos.copy().add(
      p5.Vector.fromAngle(this.angle)
        .rotate((3 * PI) / 4)
        .mult(this.r * 1.4)
    );
    let d2 = p5.Vector.dist(p2, body.pos);
    if (d2 < body.r) {
      return true;
    }
    let p3 = this.pos.copy().add(
      p5.Vector.fromAngle(this.angle)
        .rotate(-(3 * PI) / 4)
        .mult(this.r * 1.4)
    );
    let d3 = p5.Vector.dist(p3, body.pos);
    if (d3 < body.r) {
      return true;
    }
    return false;
  }

  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }

  /**
   * @param {number} acc
   */
  setAcc(acc) {
    this.acc = acc;
  }

  setRotation(rotation) {
    this.rotation = rotation;
  }

  // pos, rotation change
  boost() {
    if (this.acc <= 0) {
      this.vel.mult(0.99);
      return;
    }
    let force = p5.Vector.fromAngle(this.angle);
    force.mult(this.acc * 0.1);
    this.vel.add(force);
    if (this.vel.mag() > this.terminalVelocity) {
      this.vel.setMag(this.terminalVelocity);
    }
  }
  turn() {
    this.angle += this.rotation;
  }
  position() {
    this.pos.add(this.vel);
  }
}
