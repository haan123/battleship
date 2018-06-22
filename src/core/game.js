/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

import Ship from './ship';

const ARRANGER = {
  horrizontal: {
    x: x => x,
    y: y => ++y
  },
  vertical: {
    x: x => --x,
    y: y => y
  }
};

const SHIP_TYPE = {
  aircraftCarrier: {
    count: 1,
    bluePrint: {
      decker: 4
    }
  },
  battleship: {
    count: 2,
    bluePrint: {
      decker: 3
    }
  },
  destroyer: {
    count: 3,
    bluePrint: {
      decker: 2
    }
  },
  cruiser: {
    count: 4,
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

  addShip({ type, coordinate, arrange }) {
    const shipType = SHIP_TYPE[type];
    const { bluePrint } = shipType;

    const position = this.getPosition(coordinate, ARRANGER[arrange], bluePrint.decker);

    const ship = new Ship({
      name: `${type}-${+new Date()}`,
      bluePrint,
      position
    });

    this.ships.push(ship);
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
    // this.reset();
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
