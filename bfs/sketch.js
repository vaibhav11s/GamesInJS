/// <reference path="../P5/TSDef/p5.global-mode.d.ts" />

let rows, columns;
let rowWidth, columnHeight;
let obstacles, visited;
let ground;
let start, target;
let algo;
let stack;
let found;
let path;

function setup() {
  const w = windowWidth - 40;
  const h = windowHeight - 100;
  createCanvas(w, h);
  [rows, columns] = [floor(w / 20), floor(h / 20)];
  [rowWidth, columnHeight] = [w / rows, h / columns];
  algo = false;
  obstacles = [];
  visited = [];
  found = false;
  start = [5, 5];
  path = [];
  target = [0, 0];
  stack = [[5, 5]];
  initGround();
  frameRate(20);
}

const startButtonClick = () => {
  noLoop();
  stack = [];
  stack.push(start);
  loop();
  algo = !algo;
};

const initGround = () => {
  ground = [];
  for (var i = 0; i < rows; i += 1) {
    ground.push([]);
    for (var j = 0; j < columns; j += 1) {
      ground[i].push(new NODE(i, j));
    }
  }
};

function draw() {
  background(200);
  drawGround(); // visited,obstcles
  drawTarget();
  drawCurrent();
  drawStart();
  if (mouseIsPressed && !algo) {
    const [x, y] = [floor(mouseX / rowWidth), floor(mouseY / columnHeight)];
    if (x > rows - 1 || y > columns - 1) return;
    if (mouseButton === LEFT) {
      if (keyIsDown(17)) {
        start = [x, y];
        stack = [[x, y]];
      } else {
        try {
          ground[x][y].type = -2;
        } catch (e) {}
      }
    } else if (mouseButton === RIGHT) {
      if (keyIsDown(17)) {
        target = [x, y];
      } else {
        try {
          ground[x][y].type = 0;
        } catch (e) {}
      }
    }
  }
  if (found) {
    drawPath();
  }
  next();
}

const drawPath = () => {
  const point = path.pop();
  if (!point) {
    noLoop();
    return;
  }
  ground[point[0]][point[1]].type = 1;
};

const drawGround = () => {
  ground.forEach((row, i) => {
    row.forEach((node, j) => {
      node.render();
    });
  });
};

const tracePath = () => {
  let current = target;
  while (current[0] !== start[0] || current[1] !== start[1]) {
    path.push(current);
    current = ground[current[0]][current[1]].parent;
  }
};

const next = () => {
  if (!algo) return;
  let current = stack[0];
  if (!current) {
    algo = false;
    return;
  }
  ground[current[0]][current[1]].type = -1;
  if (current[0] === target[0] && current[1] === target[1]) {
    algo = false;
    found = true;
    tracePath();
    return;
  }
  let nextPoints = getPoints(current[0], current[1]);
  for (let i = 0; i < nextPoints.length; i++) {
    const [x, y] = nextPoints[i];
    if (
      ground[x][y].type === -1 ||
      ground[x][y].type === -2 ||
      ground[x][y].type === 2
    )
      continue;
    ground[x][y].parent = current;
    stack.push([x, y]);
    ground[x][y].type = 2;
  }
  stack.shift();
};

const drawCurrent = () => {
  let current = stack[0];
  if (!current) return;
  dd(...current, 255, 0, 255, 5);
};

const drawStart = () => {
  dd(...start, 0, 200, 200);
};

const drawTarget = () => {
  dd(...target, 0, 200, 0, 10);
};

const dd = (x, y, r = 255, g = 255, b = 255, ra = 0) => {
  fill(r, g, b);
  rect(x * rowWidth, y * columnHeight, rowWidth, columnHeight, ra);
};

class NODE {
  colors = {
    [0]: [210, 210, 210],
    [-1]: [250, 150, 150],
    [-2]: [100, 100, 100],
    [1]: [0, 255, 0],
    [2]: [255, 0, 0],
  };

  constructor(x, y, type = 0) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.parent = null;
  }

  render() {
    const [r, g, b] = this.colors[this.type];
    fill(r, g, b);
    rect(this.x * rowWidth, this.y * columnHeight, rowWidth, columnHeight);
  }
}

const getPoints = (i, j) => {
  let points = [];
  if (i > 0) points.push([i - 1, j]);
  if (j > 0) points.push([i, j - 1]);
  if (i < rows - 1) points.push([i + 1, j]);
  if (j < columns - 1) points.push([i, j + 1]);
  return points;
};
