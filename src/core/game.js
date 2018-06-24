/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

import Ship from './ship';

export const SHIPS = {
  aircraftCarrier: {
    name: 'aircraft-carrier',
    count: 1,
    bluePrint: {
      decker: 4
    }
  },
  battleship: {
    name: 'battleship',
    count: 2,
    bluePrint: {
      decker: 3
    }
  },
  destroyer: {
    name: 'destroyer',
    count: 3,
    bluePrint: {
      decker: 2
    }
  },
  cruiser: {
    name: 'cruiser',
    count: 5,
    bluePrint: {
      decker: 1
    }
  }
};

class Game {
  constructor(options) {
    this.cells = {};
    this.ships = [];

    this.createGrid(options);
  }

  addShip({ type, name, arrange }) {
    const shipType = SHIPS[type];
    const { bluePrint } = shipType;

    // const position = this.getPosition(coordinate, ARRANGER[arrange], bluePrint.decker);

    const ship = new Ship({
      type,
      name,
      bluePrint,
      arrange
    });

    this.ships.push(ship);
  }

  getShip(shipName) {
    return this.ships.find(ship => ship.name === shipName);
  }

  fire(coordinate) {

  }

  getFired(coordinate) {
    this.ships.map((ship, index) => {
      const { position } = ship;

      ship.getFired(coordinate);

      if (ship.isDestroyed()) {
        console.log(`${ship.name} is destroyed`);
        this.ships.splice(index, 1);
      }
    });
  }

  isLost() {
    return !!this.ships.length;
  }

  getPosition(coordinate, arrange, decker) {
    let { x, y } = this.parseCoord(coordinate);
    const pos = [coordinate];

    for (let i = 1; i < decker; i++) {
      x = arrange.x(x);
      y = arrange.y(y);

      const nextCoor = this.createCoord(x, y);
      pos.push(nextCoor);
    }

    return pos;
  }

  setup() {
    Object.keys(SHIPS).map((type) => {
      const s = SHIPS[type];

      for (let i = 0; i < s.count; i++) {
        const name = `${s.name}-${i + 1}`;
        this.addShip({
          type,
          name,
          arrange: 'vertical'
        });
      }
    });
  }

  createCoord(x, y) {
    return `${x}:${y}`;
  }

  parseCoord(coordinate) {
    let [x, y] = coordinate.split(':');

    x = +x;
    y = +y;

    return {
      x,
      y
    };
  }

  createGrid({ rowNo, colNo }) {
    for (let row = 0; row < rowNo; row++) {
      for (let col = 0; col < colNo; col++) {
        this.cells[`${row}:${col}`] = {
          isFired: false
        };
      }
    }
  }
}

export default Game;
