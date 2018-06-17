/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

class Ship {
  constructor(options) {
    const { bluePrint, position } = options;

    this.buildShip(bluePrint);

    this.damage = 0;
    this.isDestroyed = false;
    this.position = position;
  }

  buildShip(bluePrint) {
    Object.keys(bluePrint).map((prop) => {
      this.prop = bluePrint[prop];
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
