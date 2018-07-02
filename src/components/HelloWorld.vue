<template>
  <div class="container">
    <div class="widgets">
      <button v-on:click="newGame" class="btn btn-danger btn-lg play">New Game</button>&nbsp;
      <button v-on:click="lazy" class="btn btn-outline-secondary btn-lg play" :disabled="!this.enableLazyButton">Lazy</button>
      <button v-on:click="ready" class="btn btn-success btn-lg play ml-auto" :disabled="!this.enableReadyButton">Ready</button>
    </div>

    <div id="board-container" class="board-container">
      <div class="board" v-bind:style="{ width: `${40 * colNo}px` }">
        <div class="table">
          <div class="row" v-for="(_, row) in rowNo" :key="row">
            <div class="droppable" v-for="(_, col) in colNo" :key="col" v-bind:ref="`map[${row}:${col}]`" :data-cell="`${row}:${col}`" v-bind:class="{
              'col': true,
              'is-win': cells[`${row}:${col}`].isWin,
              'is-current': cells[`${row}:${col}`].isCurrent
            }" :title="`${row}:${col}`" style="width:40px;height:40px;">
            </div>
          </div>
        </div>

        <template v-for="ship in ships">
          <div :key="ship.name" :id="ship.name" v-draggable="ship.draggable" :class="`ship ${ship.name}`" :data-ship-name="ship.name" ></div>
        </template>
      </div>

      <div class="board" v-bind:style="{
        width: `${40 * colNo}px`,
        display: game.isReady() ? 'block' : 'none'
      }">
        <div class="table">
          <div class="row" v-for="(_, row) in rowNo" :key="row">
            <div v-for="(_, col) in colNo" :key="col" v-bind:ref="`act[${row}:${col}]`" v-on:click="fire" :data-cell="`${row}:${col}`" v-bind:class="{
                'col': true,
                'is-win': cells[`${row}:${col}`].isWin,
                'is-current': cells[`${row}:${col}`].isCurrent
            }" :title="`${row}:${col}`" style="width:40px;height:40px;">
            </div>
          </div>
        </div>
      </div>

      <div class="board board--baseship" v-bind:style="{
        display: !game.isReady() ? 'block' : 'none'
      }">
        <template v-for="ship in ships">
          <div :key="ship.name" :id="`hook-${ship.name}`" :class="`ship-hook hook-${ship.name}`"></div>
        </template>
      </div>
    </div>

    <div id="sprite-container" class="sprite-container">
      <div class="sprite bomb"></div>
      <div class="sprite fire_opp"></div>
      <div class="sprite fire_hole"></div>
      <div class="sprite fire_hole_small"></div>
      <template v-for="type in shipTypes">
        <template v-for="suf in ['', '_opp']">
          <div :key="`${type}${suf}`" :class="`sprite fire_${type}${suf}`"></div>
        </template>
      </template>
    </div>

    <WinnerModal></WinnerModal>
    <LooseModal></LooseModal>
    <UserConfigModal v-bind:game="game"></UserConfigModal>
  </div>
</template>

<script>
/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

import { Draggable } from '../core/draggable';
import { SHIPS, ARRANGER, Game } from '../core/game';
import WinnerModal from './WinnerModal';
import LooseModal from './LooseModal';
import UserConfigModal from './UserConfigModal';
import modal from '../core/modal';

import '../svg/x';
import '../svg/o';

const socket = io(window.SOCKET_URL);

export default {
  name: 'HelloWorld',
  components: {
    WinnerModal,
    UserConfigModal,
    LooseModal
  },

  directives: {
    Draggable
  },

  data() {
    socket.on('newGame', (data) => {
      this.newGame(null, true);
    });

    socket.on('ready', (data) => {
      this.game.ready(true);
      this.game.setTurn(data.turn);
    });

    socket.on('fired', (data) => {
      if (!data) return;

      const {
        cell,
        isDestroyed,
        fireStatus,
        hasWinner,
        winner,
        currentTurn,
        nextTurn,
        ship
      } = data;

      const isMyTurn = currentTurn === this.game.user;
      const elem = isMyTurn ? this.getActCell(cell) : this.getMapCell(cell);

      if (elem) {
        this.game.fire(cell, elem, {
          fireStatus,
          isDestroyed,
          ship
        });

        this.game.setTurn(nextTurn);

        if (hasWinner) {
          if (winner === this.game.user) {
            modal.showModal('modal-winner');
          } else {
            modal.showModal('modal-loose');
          }
        }
      }
    });

    const rowNo = 10;
    const colNo = 10;

    this.game = new Game({
      rowNo,
      colNo
    });

    this.game.setup({
      isMyTurn: true
    });

    const ships = this.game.ships.map((ship) => {
      ship.draggable = {
        container: 'board-container',
        onDragEnd: this.dragEnd,
        resetInitialPos: false,
        resetPreviousPos: false
      }

      return ship;
    });

    return {
      game: this.game,
      rowNo,
      colNo,
      cells: this.game.cells,
      ships,
      enableReadyButton: false,
      enableLazyButton: true,
      shipTypes: Object.keys(SHIPS)
    };
  },

  mounted() {
    this.checkUser();
    this.game.hookShip();
    this.game.ships.map(ship => this.resetPos(ship));
  },

  methods: {
    newGame(e, isEmitted) {
      this.enableReadyButton = false;
      this.enableLazyButton = true;

      this.game.ships.map(ship => {
        this.resetPos(ship);
        this.game.clearAllAnimeImages();
        this.game.showShip(ship.name);
      });

      this.game.ready(false);

      if (!isEmitted) {
        socket.emit('newGame', {
          user: this.game.user
        });
      }
    },

    checkUser() {
      const user = localStorage.getItem('user');

      if (!user) {
        modal.showModal('user-config-modal');
      } else {
        this.game.setUser(user);
      }
    },

    getMapCell(coord) {
      if (typeof coord === 'string') {
        coord = this.game.parseCoord(coord);
      }

      const arr = this.$refs[`map[${this.game.createCoord(coord.x, coord.y)}]`];

      return arr && arr[0];
    },

    getActCell(coord) {
      if (typeof coord === 'string') {
        coord = this.game.parseCoord(coord);
      }

      const arr = this.$refs[`act[${this.game.createCoord(coord.x, coord.y)}]`];

      return arr && arr[0];
    },

    getMapShip(name) {
      return document.getElementById(name);
    },

    lazy() {
      const arranger = Object.keys(ARRANGER);

      const randomCoord = () => [
        Math.floor(Math.random() * this.rowNo),
        Math.floor(Math.random() * this.colNo)
      ];

      const randomArrange = () => arranger[Math.floor(Math.random() * 2)];
      const isShipOverBound = (c, ship) => {
        const isOverBound = c[0] + ship.decker > this.rowNo;

        if (isOverBound) {
          this.game.resetShipPos(ship);
        }

        return isOverBound;
      };

      this.game.resetAllCoords();

      this.game.ships.map((ship) => {
        let c;
        let isShipPlaced;
        const container = document.getElementById('board-container');
        const containerRect = container.getBoundingClientRect();

        do {
          c = randomCoord();
          const cell = this.game.createCoord(...c);
          const cellElem = this.getMapCell(cell);
          const coord = this.game.parseCoord(cell);

          // ship.setArrange(randomArrange());

          isShipPlaced = this.game.setPosition(ship, coord);

          if (isShipPlaced) {
            const shipElem = this.getMapShip(ship.name);
            const rect = cellElem.getBoundingClientRect();

            this.placeShip(cellElem, shipElem, {
              relLeft: rect.left - containerRect.left,
              relTop: rect.top - containerRect.top
            });
          }
        } while(!isShipPlaced || isShipOverBound(c, ship));
      });

      if (this.game.isAllShipsReady()) {
        this.enableReadyButton = true;
      }
    },

    dragEnd(elem, event) {
      const shipName = event.dragElem.getAttribute('data-ship-name');
      const ship = this.game.getShip(shipName);
      const targetShipName = elem.getAttribute('data-ship-name');
      const targetShip = this.game.getShip(targetShipName);

      if (elem && elem.closest('.droppable')) {
        const dragElemWidth = event.dragElem.clientWidth;
        const dragElemHeight = event.dragElem.clientHeight;
        const dragELemRect = event.getRectPosition();
        const containerRect = event.getContainerRect();
        const cell = elem.getAttribute('data-cell');
        const coord = this.game.parseCoord(cell);
        const dropElemWidth = elem.clientWidth;
        const dropElemHeight = elem.clientHeight;

        let dropELemRect = event.getRectPosition(elem);

        if ((dragELemRect.left - dropELemRect.left) / dropElemWidth > 0.7) {
          coord.y += 1;
        }

        if ((dragELemRect.top - dropELemRect.top) / dropElemHeight > 0.7) {
          coord.x += 1;
        }

        if (coord.x + ship.decker > this.rowNo) {
          this.resetPreviousPos(ship);
          return;
        }

        elem = this.getMapCell(coord);
        dropELemRect = event.getRectPosition(elem);

        const isShipPlaced = this.game.setPosition(ship, coord);

        if (elem && isShipPlaced) {
          this.placeShip(elem, event.dragElem, dropELemRect);

          event.setState({
            initialMousePos: undefined,
            startDragPosition: dropELemRect,
            currentDragPosition: dropELemRect,
            prevPosition: dropELemRect
          });

          if (this.game.isAllShipsReady()) {
            this.enableReadyButton = true;
          }

        } else if (ship.position && ship.position.length) {
          this.resetPreviousPos(ship);
        } else {
          this.resetPos(ship);
        }
      } else {
        if (ship.position && ship.position.length && targetShip && targetShip.position && targetShip.position.length) {
          this.resetPreviousPos(ship);
        } else {
          this.resetPos(ship);
        }
      }
    },

    placeShip(cellElem, shipElem, rect) {
      if (!cellElem || !shipElem) return;

      const dx = (cellElem.clientWidth / 2) - (shipElem.clientWidth / 2);

      shipElem.style.left = `${Math.floor(rect.relLeft + dx)}px`;
      shipElem.style.top = `${Math.floor(rect.relTop)}px`;
    },

    resetPos(ship) {
      this.game.resetShipPos(ship);

      ship.draggable.resetInitialPos = true;

      setTimeout(() => {
          ship.draggable.resetInitialPos = false;
      }, 0);
    },

    resetPreviousPos(ship) {
      ship.draggable.resetPreviousPos = true;

      setTimeout(() => {
          ship.draggable.resetPreviousPos = false;
      }, 0);
    },

    ready() {
      const { user, ships, } = this.game;

      this.enableReadyButton = false;
      this.enableLazyButton = false;

      socket.emit('ready', {
        user,
        ships
      });
    },

    fire(e) {
      const elem = e.nodeType === 1 ? e : e.currentTarget;
      const cell = elem.getAttribute('data-cell');
      const { user } = this.game;

      if (!this.game.isMyTurn()) {
        return;
      }

      socket.emit('fire', {
        user,
        cell
      });
    }
  }
};
</script>
