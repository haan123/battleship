/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

const ARRANGER = {
  horrizontal: {
    x: x => x,
    y: y => --y
  },
  vertical: {
    x: x => ++x,
    y: y => y
  }
};

class Ship {
  constructor(options) {
    const {
      name,
      type,
      bluePrint,
      arrange
    } = options;

    this.buildShip(bluePrint);

    this.type = type;
    this.name = name;
    this.damage = 0;
    this.arrange = arrange;
  }

  createCoord(x, y) {
    return `${x}:${y}`;
  }

  setPosition({ x, y }) {
    const arrange = ARRANGER[this.arrange];
    const { decker } = this;

    const startPos = this.createCoord(x, y);
    const pos = [startPos];

    for (let i = 1; i < decker; i++) {
      x = arrange.x(x);
      y = arrange.y(y);

      const nextCoor = this.createCoord(x, y);
      pos.push(nextCoor);
    }

    this.position = pos.reverse();
  }

  getFired(coordinate) {
    for (let i = 0; i < this.decker; i++) {
      if (this.position[i] === coordinate) {
        console.log(`${this.name} is hitted at ${coordinate}`);
        this.setHit();
        break;
      }
    }
  }

  buildShip(bluePrint) {
    Object.keys(bluePrint).map((prop) => {
      this[prop] = bluePrint[prop];
    });
  }

  setHit() {
    this.damage++;
  }

  isDestroyed() {
    return this.decker === this.damage;
  }
}

export default Ship;
