/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

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

  setArrange(arrange) {
    this.arrange = arrange;
  }

  setPosition(pos) {
    this.position = pos;
  }

  buildShip(bluePrint) {
    Object.keys(bluePrint).map((prop) => {
      this[prop] = bluePrint[prop];
    });
  }
}

export default Ship;
