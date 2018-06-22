/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

class Ship {
  constructor(options) {
    const { name, bluePrint, position } = options;

    this.buildShip(bluePrint);

    this.name = name;
    this.damage = 0;
    this.position = position;
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
