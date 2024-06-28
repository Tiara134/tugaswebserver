let mario, marioImage, marioJumpImage, marioWalkImage, backgroundImage, kotakImage, enemiesImage;
let platforms = [];
let enemies = [];
const gravity = 0.6;
const jumpForce = 15;
let score = 0;
let isGameOver = false;

function preload() {
  marioImage = loadImage('img/mario.png');
  backgroundImage = loadImage('img/backgroundjpg.jpg');
  kotakImage = loadImage('img/kotak.png');
  marioJumpImage = loadImage('img/mariolompat.png');
  marioWalkImage = loadImage('img/marioberjalan.png');
  enemiesImage = loadImage('img/enemies.png');
}

function setup() {
  createCanvas(800, 400);
  mario = new Mario(200, height - 50);
  platforms.push(new Platform(200, 300, 100, 10), new Platform(600, 200, 100, 10));
  enemies.push(new Enemy(width, height - 50));
}

function draw() {
  background(backgroundImage);
  displayScore();
  if (isGameOver) {
    displayGameOver();
    return;
  }
  
  mario.applyGravity(gravity);
  mario.update();
  mario.updateFrame();
  mario.display();

  for (let platform of platforms) {
    mario.checkCollision(platform);
    platform.display();
  }

  handleEnemies();
  handleMovement();
}

function displayScore() {
  fill(255);
  textSize(20);
  text(`Score: ${score}`, width - 100, 30);
}

function displayGameOver() {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  text("Game Over", width / 2, height / 2);
  textSize(20);
  text("Press ENTER to restart", width / 2, height / 2 + 40);
}

function handleEnemies() {
  for (let enemy of enemies) {
    if (mario.checkCollisionWithEnemy(enemy)) {
      score += 100;
      enemy.reset();
    } else if (mario.checkPassedEnemy(enemy)) {
      score += 1;
    }
    enemy.update();
    enemy.display();
  }
}

function handleMovement() {
  if (keyIsDown(LEFT_ARROW)) {
    mario.moveLeft();
  }
  if (keyIsDown(RIGHT_ARROW)) {
    mario.moveRight();
  }
}

function keyPressed() {
  if (isGameOver && keyCode === ENTER) {
    restartGame();
  } else if (!isGameOver && keyCode === UP_ARROW) {
    mario.jump();
  }
}

function restartGame() {
  score = 0;
  isGameOver = false;
  mario = new Mario(200, height - 50);
  platforms = [new Platform(0, height, width, 0), new Platform(200, 300, 100, 10), new Platform(600, 200, 100, 10)];
  enemies = [new Enemy(width, height - 50)];
}

class Mario {
  constructor(x, y) {
    Object.assign(this, { x, y, width: 40, height: 40, xSpeed: 0, ySpeed: 0, isJumping: false, isMoving: false, currentFrame: 0 });
    this.walkFrames = [marioWalkImage];
  }

  applyGravity(gravity) {
    this.ySpeed += gravity;
    this.y += this.ySpeed;
    if (this.y > height - this.height) {
      Object.assign(this, { y: height - this.height, ySpeed: 0, isJumping: false });
    }
  }

  jump() {
    if (!this.isJumping) {
      this.ySpeed = -jumpForce;
      this.isJumping = true;
    }
  }

  moveLeft() {
    this.xSpeed = -5;
    this.isMoving = true;
  }

  moveRight() {
    this.xSpeed = 5;
    this.isMoving = true;
  }

  update() {
    this.x += this.xSpeed;
    this.x = constrain(this.x, 0, width - this.width);
    this.xSpeed *= 0.8;
    if (abs(this.xSpeed) < 0.1) {
      this.xSpeed = 0;
      this.isMoving = false;
    }
  }

  checkCollision(platform) {
    if (this.y + this.height >= platform.y && this.y + this.height <= platform.y + 10 && this.x + this.width >= platform.x && this.x <= platform.x + platform.width) {
      Object.assign(this, { y: platform.y - this.height, ySpeed: 0, isJumping: false });
    }
  }

  checkCollisionWithEnemy(enemy) {
    if (this.x + this.width >= enemy.x && this.x <= enemy.x + enemy.width && this.y + this.height >= enemy.y && this.y <= enemy.y + enemy.height) {
      if (this.isJumping) {
        return true;
      } else {
        gameOver();
      }
    }
    return false;
  }

  checkPassedEnemy(enemy) {
    if (this.x > enemy.x + enemy.width && !enemy.passed) {
      enemy.passed = true;
      return true;
    }
    return false;
  }

  updateFrame() {
    if (this.isMoving && frameCount % 8 === 0) {
      this.currentFrame = (this.currentFrame + 1) % this.walkFrames.length;
    }
  }

  display() {
    fill(255, 0, 0);
    push();
    translate(this.x, this.y);
    if (this.xSpeed < 0) scale(-1, 1);
    if (this.isJumping) {
      image(marioJumpImage, 0, 0, this.width, this.height);
    } else if (this.isMoving) {
      image(this.walkFrames[this.currentFrame], 0, 0, this.width, this.height);
    } else {
      image(marioImage, 0, 0, this.width, this.height);
    }
    pop();
  }
}

class Platform {
  constructor(x, y, width, height) {
    Object.assign(this, { x, y, width, height: 30 });
  }

  display() {
    fill(255);
    image(kotakImage, this.x, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor(x, y) {
    Object.assign(this, { x, y, width: 40, height: 40, xSpeed: -2, passed: false });
  }

  update() {
    this.x += this.xSpeed;
    if (this.x < -this.width) {
      this.reset();
    }
  }

  reset() {
    Object.assign(this, { x: width, passed: false });
  }

  display() {
    fill(0, 255, 0);
    image(enemiesImage, this.x, this.y, this.width, this.height);
  }
}

function gameOver() {
  isGameOver = true;
}
