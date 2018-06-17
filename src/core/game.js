/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

import Ship from './ship';

const ARRANGER = {
  horrizontal: {
    row: row => row,
    col: col => ++col
  },
  vertical: {
    row: row => ++row,
    col: col => col
  }
}

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
    this.ships = {};

    this.createGrid(options);
  }

  addShip({ type, coordinate, arrange }) {
    const shipType = SHIP_TYPE[type];
    const bluePrint = shipType.bluePrint;

    const position = this.getPosition(coordinate, ARRANGER[arrange], bluePrint.decker);

    const ship = new Ship({
      bluePrint,
      position
    });

  }

  getPosition(coordinate, arrange, decker) {
    let { row, col } = this.parseCoord(coordinate);
    let pos = [coordinate];

    Object.keys(arrange).map((name) => {
      row = arrange.row(row);
      col = arrange.col(col);

      const nextCoor = this.createCoord(row, col);
      pos.push(nextCoor);
    })

    return pos;
  }

  setup() {
    // this.reset();
  }

  createCoord(row, col) {
    return `${row}:${col}`;
  }

  parseCoord(coordinate) {
    let [row, col] = coordinate.split(':');

    row = +row;
    col = +col;

    return {
      row,
      col
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
