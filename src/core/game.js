/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

import Ship from './ship';
import Animate from './animate';

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

export const SHIPS = {
  aircraft_carrier: {
    name: 'aircraft-carrier',
    count: 1,
    bluePrint: {
      decker: 4
    },
    ext: {
      numberOfFrames: 11,
      dx: 0,
      dy: 6
    }
  },
  battleship: {
    name: 'battleship',
    count: 2,
    bluePrint: {
      decker: 3
    },
    ext: {
      numberOfFrames: 11,
      dx: 0,
      dy: 6
    }
  },
  destroyer: {
    name: 'destroyer',
    count: 3,
    bluePrint: {
      decker: 2
    },
    ext: {
      numberOfFrames: 9,
      dx: 0,
      dy: 6
    }
  },
  cruiser: {
    name: 'cruiser',
    count: 5,
    bluePrint: {
      decker: 1
    },
    ext: {
      numberOfFrames: 11,
      dx: 0,
      dy: 6
    }
  }
};

export class Game {
  constructor(options) {
    this.cells = {};
    this.ships = [];

    this.createGrid(options);
  }

  setUser(user) {
    this.user = user;
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

    return ship;
  }

  getShip(shipName) {
    return this.ships.find(ship => ship.name === shipName);
  }

  fire(coordinate, elem, status) {
    let config = {};
    const { shipType } = status;

    switch (status.name) {
      case 'onTarget':
        config = this.getCommonAnimateConfig('.fire_opp', 7, {
          dx: -14,
          dy: -16
        });
        break;
      case 'destroyed':
        config = this.getCommonAnimateConfig(`.fire_${shipType}_opp`, 11, SHIPS[shipType].bluePrint.decker);
        break;
      case 'hit':
        break;
      default:
        config = this.getCommonAnimateConfig('.bomb', 9, {
          dx: -5,
          dy: -7
        });
    }

    Animate.init({
      elem,
      ...config
    });
  }

  getCommonAnimateConfig(imageName, numberOfFrames, ext) {
    const spriteContainer = document.getElementById('sprite-container');
    const image = spriteContainer.querySelector(imageName);
    const imgWidth = image.clientWidth;
    const frameWidth = imgWidth / numberOfFrames;
    const frameHeight = image.clientHeight;

    return {
      image,
      imgWidth,
      frameWidth,
      frameHeight,
      numberOfFrames,
      ext
    };
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

  setPosition(ship, { x, y }) {
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

    ship.setPosition(pos.reverse());
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

  hookShip() {
    const boardContainer = document.getElementById('board-container');
    const containerRect = boardContainer.getBoundingClientRect();

    this.ships.map((ship) => {
      const shipElem = document.getElementById(ship.name);
      const shipHook = document.getElementById(`hook-${ship.name}`);
      const hookRect = shipHook.getBoundingClientRect();

      shipElem.style.left = `${hookRect.left - containerRect.left}px`;
      shipElem.style.top = `${hookRect.top - containerRect.top}px`;
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
          hasShipOn: false
        };
      }
    }
  }
}
