/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

const board = document.getElementById('canvas');
const boardContext = board.getContext('2d');
const boardWidth = 770;
const boardHeight = 520;
const boardCenterX = boardWidth / 2;
const boardCenterY = boardHeight / 2;
const controllers = [];
const goal = document.getElementsByClassName('table__goal-crease');
const goalHeight = goal[0].clientHeight;
const goalPosTop = (boardHeight - goalHeight) / 2;
const score = [];

// Set width & height for canvas
board.width = boardWidth;
board.height = boardHeight;

// Set focus to canvas so keyboard events work
board.focus();

function rotate(x, y, sin, cos, reverse) {
  return {
    x: (reverse) ? ((x * cos) + (y * sin)) : ((x * cos) - (y * sin)),
    y: (reverse) ? ((y * cos) - (x * sin)) : ((y * cos) + (x * sin))
  };
}

// Disc
class Disc {
  constructor() {
    this.startingPosX = boardCenterX;
    this.startingPosY = boardCenterY;
    this.x = this.startingPosX;
    this.y = this.startingPosY;
    this.radius = 34;
    this.mass = 15;
    this.velocityX = 0;
    this.velocityY = 0;
    this.maxSpeed = 10;
    this.frictionX = 0.997;
    this.frictionY = 0.997;
    this.acceleration = 1;
    this.color = '#000000';
  }
}

// Run game functions
function updateGame(controller, controllerTwo, puck) {
  // Clear board
  boardContext.clearRect(0, 0, boardWidth, boardHeight);
  // Draw & contain puck
  puck.draw();
  puck.move();
  puck.discCollision();
  puck.keepPuckInBoard(puck);
  // Controllers
  controller.draw();
  controller.move();
  controller.keepControllerInBoard(controller, controllerTwo);
  controllerTwo.draw();
  controllerTwo.computerPlayer(controller, controllerTwo, puck);
  controllerTwo.move();
  controllerTwo.keepControllerInBoard();

  // Loop
  requestAnimationFrame(() => updateGame(controller, controllerTwo));
}

// Keyboard events
function moveController(key, controller) {
  // Up
  if (key === 38 && controller.velocityY < controller.maxSpeed) {
    controller.velocityY -= controller.acceleration;
  }

  // Down
  if (key === 40 && controller.velocityY < controller.maxSpeed) {
    controller.velocityY += controller.acceleration;
  }

  // Right
  if (key === 39 && controller.velocityX < controller.maxSpeed) {
    controller.velocityX += controller.acceleration;
  }

  // Left, decrease acceleration
  if (key === 37 && controller.acceleration < controller.maxSpeed) {
    controller.velocityX -= controller.acceleration;
  }
}

// Start game
updateGame(controller, controllerTwo);

class AH {
  constructor(options) {
    this.controllers = [];
  }

  setup() {
    // Add puck
    const puck = new Disc();

    // Add controller & adjust settings
    const controller = new Disc();
    controller.color = '#2132CC';
    controller.radius += 10;
    controller.acceleration = 5;
    controller.startingPosX = 125;
    controller.mass = 50;
    controller.x = controller.startingPosX;

    // Add controller two
    const controllerTwo = new Disc();
    controllerTwo.color = '#2132CC';
    controllerTwo.radius += 10;
    controllerTwo.mass = 50;
    controllerTwo.startingPosX = (boardWidth - 155);
    controllerTwo.acceleration = 0.2;
    controllerTwo.x = controllerTwo.startingPosX;

    // Store controllers
    this.controllers.push(controller, controllerTwo);
  }

  keepControllerInBoard(controller, controllerTwo) {
    // Need to determine if goal scored on x axis as well
    if (this.x > (boardWidth - this.radius) || this.x < this.radius) {
      if (this.x < this.radius) {
        this.velocityX = 2;
      } else {
        this.velocityX = -2;
      }
    }

    // Determine if disc is to far up or down
    if (this.y > (boardHeight - this.radius) || this.y < this.radius) {
      if (this.y < this.radius) {
        this.velocityY = 2;
      } else {
        this.velocityY = -2;
      }
    }

    // Keep player one controller on left hand side of screen
    if (controller.x > (boardCenterX - controller.radius) && controller.x < boardCenterX) {
      controller.velocityX = -3;
    }

    // Keep player two controller on right hand side of screen
    if (controllerTwo.x > boardCenterX
      && controllerTwo.x < (boardCenterX + (controllerTwo.radius / 2))) {
      controllerTwo.velocityX = +3;
    }
  }

  // Keep disc inside board
  keepPuckInBoard(puck) {
    // Determine if disc is to far right or left
    // Need to determine if goal scored on x axis as well
    if (this.x > (boardWidth - this.radius) || this.x < this.radius) {
      // Stop puck from getting stuck
      if (this.x > (boardWidth - this.radius)) {
        this.x = boardWidth - this.radius;
      } else {
        this.x = this.radius;
      }

      // Check to see if goal scored
      if (this.y > (goalPosTop + puck.radius) && this.y < (goalPosTop + goalHeight) - puck.radius) {
        // Add new puck
        puck = new Disc(boardCenterX, boardCenterY);
      } else {
        // Reverse X direction
        this.velocityX = -this.velocityX;
      }
    }

    // Determine if disc is to far up or down
    if (this.y > (boardHeight - this.radius) || this.y < this.radius) {
      // Stop puck from getting stuck
      if (this.y > (boardHeight - this.radius)) {
        this.y = boardHeight - this.radius;
      } else {
        this.y = this.radius;
      }

      // Reverse direction
      this.velocityY = -this.velocityY;
    }
  }

  // Collide discs if in same spot
  discCollision() {
    // Loop over two controllers to see if puck has come in contact
    for (let i = 0; i < controllers.length; i++) {
      // Minus the x pos of one disc from the x pos of the other disc
      const distanceX = this.x - controllers[i].x;
      // Minus the y pos of one disc from the y pos of the other disc
      const distanceY = this.y - controllers[i].y;
      // Multiply each of the distances by this
      // Squareroot that number, which gives you the distance between the two disc's
      const distance = Math.sqrt((distanceX * distanceX) + (distanceY * distanceY));
      // Add the two disc radius together
      const addedRadius = this.radius + controllers[i].radius;

      // Check to see if the distance between the two circles is smaller than the added radius
      // If it is then we know the circles are overlapping
      if (distance < addedRadius) {
        // Had help from Reddit user Kraft_Punk on the below collision math

        // calculate angle, sine, and cosine
        const angle = Math.atan2(distanceY, distanceX);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);
        // rotate controllers[i]'s position
        const pos0 = {
          x: 0,
          y: 0
        };
        // rotate this's position
        const pos1 = rotate(distanceX, distanceY, sin, cos, true);
        // rotate controllers[i]'s velocity
        const vel0 = rotate(controllers[i].velocityX, controllers[i].velocityY, sin, cos, true);
        // rotate this's velocity
        const vel1 = rotate(this.velocityX, this.velocityY, sin, cos, true);
        // collision reaction
        const velocityXTotal = vel0.x - vel1.x;

        vel0.x = (((controllers[i].mass - this.mass) * vel0.x) + (2 * this.mass * vel1.x)) /
          (controllers[i].mass + this.mass);
        vel1.x = velocityXTotal + vel0.x;

        // update position - to avoid objects becoming stuck together
        const absV = Math.abs(vel0.x) + Math.abs(vel1.x);
        const overlap = (controllers[i].radius + this.radius) - Math.abs(pos0.x - pos1.x);

        pos0.x += (vel0.x / absV) * overlap;
        pos1.x += (vel1.x / absV) * overlap;

        // rotate positions back
        const pos0F = rotate(pos0.x, pos0.y, sin, cos, false);
        const pos1F = rotate(pos1.x, pos1.y, sin, cos, false);

        // adjust positions to actual screen positions
        this.x = controllers[i].x + pos1F.x;
        this.y = controllers[i].y + pos1F.y;
        controllers[i].x += pos0F.x;
        controllers[i].y += pos0F.y;

        // rotate velocities back
        const vel0F = rotate(vel0.x, vel0.y, sin, cos, false);
        const vel1F = rotate(vel1.x, vel1.y, sin, cos, false);

        controllers[i].velocityX = vel0F.x;
        controllers[i].velocityY = vel0F.y;

        this.velocityX = vel1F.x;
        this.velocityY = vel1F.y;
      }
    }
  }

  // Draw disc
  draw() {
    boardContext.shadowColor = 'rgba(50, 50, 50, 0.25)';
    boardContext.shadowOffsetX = 0;
    boardContext.shadowOffsetY = 3;
    boardContext.shadowBlur = 6;

    boardContext.beginPath();
    boardContext.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
    boardContext.fillStyle = this.color;
    boardContext.fill();
  }

  // Move disc with physic's applied
  move() {
    // Apply friction
    this.velocityX *= this.frictionX;
    this.velocityY *= this.frictionY;

    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
  }

  // Play against a computer
  computerPlayer(controller, controllerTwo, puck) {
    // If pucks about to move into right hand side of screen
    // And controller isnt pushed up against the center line
    if (puck.x > (boardCenterX - 30)
      && controllerTwo.x > (boardCenterX + (controllerTwo.radius * 2))) {
      // Work out if puck is infront or behind controller
      // Try to hit the puck on right hand side and at the center.

      // If puck is infront on controller
      if ((puck.x + puck.radius) < controllerTwo.x) {
        controllerTwo.velocityX -= controllerTwo.acceleration;
      } else {
        controllerTwo.velocityX += controllerTwo.acceleration;
      }

      // Do same on y axis
      if (puck.y < controllerTwo.y) {
        controllerTwo.velocityY -= controllerTwo.acceleration;
      } else {
        // Is behind
        controllerTwo.velocityY += controllerTwo.acceleration;
      }
    // Move back to its starting position so its not stuck at center line.
    // Give it a range to top in
    } else if (controllerTwo.x > (controllerTwo.startingPosX - 50)
      && controllerTwo.x < (controllerTwo.startingPosX + 50)) {
      controllerTwo.velocityX = 0;
    } else if (controllerTwo.x < (controllerTwo.startingPosX - 80)) {
      controllerTwo.velocityX += controllerTwo.acceleration;
    } else {
      controllerTwo.velocityX -= controllerTwo.acceleration;
    }
  }
}

// Events
document.addEventListener('keydown', (e) => {
  moveController(e.keyCode, controller);
});

export default AH;
