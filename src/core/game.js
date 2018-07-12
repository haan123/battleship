/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

import Ship from './ship';
import Animate from './animate';
import Particle from './particle';

const COORDER = [
  (x, y) => [--x, --y],
  (x, y) => [--x, y],
  (x, y) => [--x, ++y],
  (x, y) => [x, --y],
  (x, y) => [x, ++y],
  (x, y) => [++x, --y],
  (x, y) => [++x, y],
  (x, y) => [++x, ++y],
];

export const ARRANGER = {
  horizontal: (x, y) => [x, ++y],
  vertical: (x, y) => [++x, y]
};

export const SHIPS = {
  aircraft_carrier: {
    name: 'aircraft-carrier',
    count: 1,
    bluePrint: {
      decker: 4
    },
    ext: {
      oppDestroyed: {
        horizontal: {
          numberOfFrames: 11,
          dx: -11,
          dy: -15
        },
        vertical: {
          numberOfFrames: 11,
          dx: -15,
          dy: -10
        }
      },
      destroyed: {
        horizontal: {
          numberOfFrames: 11,
          dx: -11,
          dy: -15
        },
        vertical: {
          numberOfFrames: 11,
          dx: -15,
          dy: -10
        }
      },
      hit: {
        horizontal: {
          numberOfFrames: 7,
          dx: -14,
          dy: -12
        },
        vertical: {
          numberOfFrames: 7,
          dx: -14,
          dy: -12
        }
      },
      size: ''
    }
  },
  battleship: {
    name: 'battleship',
    count: 2,
    bluePrint: {
      decker: 3
    },
    ext: {
      oppDestroyed: {
        horizontal: {
          numberOfFrames: 11,
          dx: -7,
          dy: -15
        },
        vertical: {
          numberOfFrames: 11,
          dx: -14,
          dy: -9
        }
      },
      destroyed: {
        horizontal: {
          numberOfFrames: 11,
          dx: -7,
          dy: -15
        },
        vertical: {
          numberOfFrames: 11,
          dx: -15,
          dy: -9
        }
      },
      hit: {
        horizontal: {
          numberOfFrames: 7,
          dx: -6,
          dy: -6
        },
        vertical: {
          numberOfFrames: 7,
          dx: -6,
          dy: -6
        }
      },
      size: '_small'
    }
  },
  destroyer: {
    name: 'destroyer',
    count: 3,
    bluePrint: {
      decker: 2
    },
    ext: {
      oppDestroyed: {
        horizontal: {
          numberOfFrames: 9,
          dx: -2,
          dy: -7
        },
        vertical: {
          numberOfFrames: 9,
          dx: -8,
          dy: -3
        }
      },
      destroyed: {
        horizontal: {
          numberOfFrames: 9,
          dx: -2,
          dy: -7
        },
        vertical: {
          numberOfFrames: 9,
          dx: -8,
          dy: -3
        }
      },
      hit: {
        horizontal: {
          numberOfFrames: 7,
          dx: -7,
          dy: -8
        },
        vertical: {
          numberOfFrames: 7,
          dx: -7,
          dy: -8
        }
      },
      numberOfFrames: 9,
      size: '_small'
    }
  },
  cruiser: {
    name: 'cruiser',
    count: 4,
    bluePrint: {
      decker: 1
    },
    ext: {
      oppDestroyed: {
        horizontal: {
          numberOfFrames: 7,
          dx: 0,
          dy: -7
        },
        vertical: {
          numberOfFrames: 7,
          dx: -7,
          dy: -3
        }
      },
      destroyed: {
        horizontal: {
          numberOfFrames: 7,
          dx: 0,
          dy: -7
        },
        vertical: {
          numberOfFrames: 7,
          dx: -7,
          dy: -3
        }
      },
      hit: {
        horizontal: {
          numberOfFrames: 7,
          dx: 0,
          dy: 6
        },
        vertical: {
          numberOfFrames: 7,
          dx: 0,
          dy: 6
        }
      },
      size: '_small'
    }
  }
};

export class Game {
  constructor(options) {
    this.cells = {};
    this.ships = [];
    this.allCoords = [];
    this.isPlayerReady = false;
    this.isMyTurn = false;

    this.createGrid(options);
  }

  setTurn(user) {
    this.turn = user;

    if (this.user === this.turn) {
      this.isMyTurn = true;
    } else {
      this.isMyTurn = false;
    }
  }

  isAllShipsReady() {
    return !this.ships.find(ship => !ship.position || !ship.position.length);
  }

  isReady() {
    return this.isPlayerReady;
  }

  ready(ready) {
    this.isPlayerReady = ready;
  }

  setUser(user) {
    this.user = user;
  }

  getUserName() {
    return this.user.name;
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
    const { ship } = status;
    const { arrange } = ship;
    const { ext } = SHIPS[ship.type] || {};
    const { fireStatus } = status;
    const animExt = ext && ext[fireStatus] && ext[fireStatus][arrange];
    const { name, type } = ship;

    switch (fireStatus) {
      case 'onTarget':
        config = this.getCommonAnimateConfig(`opp-${name}`, '.fire_opp', {
          numberOfFrames: 7,
          dx: -14,
          dy: -16
        });
        this.createParticle({
          elem,
          name: `opp-${name}`
        });
        break;
      case 'oppDestroyed':
        config = this.getCommonAnimateConfig(name, `.fire_${type}_opp${arrange === 'horizontal' ? '_hor' : ''}`, animExt);
        this.clearAnimeImages(`opp-${name}`);
        this.clearParticle(`opp-${name}`);
        break;
      case 'destroyed':
        config = this.getCommonAnimateConfig(name, `.fire_${type}${arrange === 'horizontal' ? '_hor' : ''}`, animExt);
        this.clearAnimeImages(`hit-${name}`);
        this.clearParticle(`hit-${name}`);
        this.hideShip(name);
        break;
      case 'hit':
        config = this.getCommonAnimateConfig(`hit-${name}`, `.fire_hole${ext.size}`, animExt);
        this.createParticle({
          elem,
          name: `hit-${name}`
        });
        break;
      default:
        config = this.getCommonAnimateConfig('bomb', '.bomb', {
          numberOfFrames: 9,
          dx: -5,
          dy: -7
        });
    }

    Animate.init({
      elem,
      ...config
    });
  }

  createParticle(options) {
    Particle.add(options);
  }

  clearParticle(name) {
    this.clearAnime(`.flame-${name}`);
    Particle.remove(name);
  }

  setArrange(ship, arrange) {
    ship.setArrange(arrange);
  }

  rotate(ship) {
    ship.rotate();
  }

  hideShip(name) {
    const elem = document.getElementById(name);
    elem.style.display = 'none';
  }

  showShip(name) {
    const elem = document.getElementById(name);
    elem.style.display = 'block';
  }

  clearAnimeImages(name) {
    this.clearAnime(`.anime-image-${name}`);
  }

  clearAllAnimeImages() {
    this.ships.map(({ name }) => {
      this.clearAnimeImages(`opp-${name}`);
      this.clearAnimeImages(`hit-${name}`);
      this.clearParticle(`opp-${name}`);
      this.clearParticle(`hit-${name}`);
    });
    this.clearAnimeImages('bomb');
  }

  clearAnime(query) {
    const elems = document.querySelectorAll(query);

    elems.forEach((elem) => {
      const parent = elem.parentNode;
      parent.removeChild(elem);
    });
  }

  getCommonAnimateConfig(shipName, imageName, ext) {
    const spriteContainer = document.getElementById('sprite-container');
    const image = spriteContainer.querySelector(imageName);
    const isHorizontal = imageName.indexOf('hor') !== -1;
    const frameWidth = isHorizontal ? image.clientWidth : image.clientWidth / ext.numberOfFrames;
    const frameHeight = isHorizontal ? image.clientHeight / ext.numberOfFrames : image.clientHeight;

    return {
      image,
      shipName,
      frameWidth,
      frameHeight,
      isHorizontal,
      ext
    };
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

  isPosTooClose(pos, allCoords, oldPos = []) {
    const nextByCoords = [pos[0]];

    pos.map((c) => {
      const { x: x1, y: y1 } = this.parseCoord(c);

      COORDER.map((fn) => {
        const [x, y] = fn(x1, y1);
        const coord = this.createCoord(x, y);

        if (c !== coord && nextByCoords.indexOf(coord) < 0 && oldPos.indexOf(coord) < 0) {
          nextByCoords.push(coord);
        }
      });
    });

    return nextByCoords.find(coord => allCoords.indexOf(coord) !== -1);
  }

  resetShipPos(ship) {
    this.allCoords = this.allCoords.filter(coord => ship.position.indexOf(coord) < 0);

    ship.resetPosition();
  }

  resetAllCoords() {
    this.allCoords = [];
    this.ships.map(ship => ship.resetPosition());
  }

  setPosition(ship, { x, y }) {
    const { decker, arrange, position } = ship;
    const ar = ARRANGER[arrange];

    const startPos = this.createCoord(x, y);
    const pos = [startPos];

    for (let i = 1; i < decker; i++) {
      [x, y] = ar(x, y);

      const nextCoor = this.createCoord(x, y);
      pos.push(nextCoor);
    }

    const coords = this.allCoords.filter(coord => !position || position.indexOf(coord) < 0);

    if (this.allCoords.length && this.isPosTooClose(pos, coords, position)) {
      return false;
    }

    this.allCoords = [...coords, ...pos];

    ship.setPosition(pos.reverse());

    return true;
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
