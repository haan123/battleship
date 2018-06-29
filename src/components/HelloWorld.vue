<template>
  <div class="container">
    <div class="widgets">
      <button v-on:click="newGame" class="btn btn-danger btn-lg play">New Game</button>&nbsp;
      <button v-on:click="lazy" class="btn btn-outline-secondary btn-lg play">Lazy</button>
      <button v-on:click="ready" class="btn btn-success btn-lg play ml-auto">Ready</button>
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
        display: 'block'
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

      <div class="board board--baseship">
        <template v-for="ship in ships">
          <div :key="ship.name" :id="`hook-${ship.name}`" :class="`ship-hook hook-${ship.name}`"></div>
        </template>
      </div>
    </div>

    <div id="sprite-container">
      <div class="sprite bomb"></div>
      <div class="sprite fire_opp"></div>
      <template v-for="type in shipTypes">
        <template v-for="suf in ['', '_opp']">
          <div :key="`${type}${suf}`" :class="`sprite fire_${type}${suf}`"></div>
        </template>
      </template>
    </div>

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
import { SHIPS, Game } from '../core/game';
// import WinnerModal from './WinnerModal';
// import LooseModal from './LooseModal';
import UserConfigModal from './UserConfigModal';
import modal from '../core/modal';

import '../svg/x';
import '../svg/o';

const socket = io(window.SOCKET_URL);

export default {
  name: 'HelloWorld',
  components: {
    UserConfigModal
  },

  directives: {
    Draggable
  },

  data() {
    socket.on('miss', (data) => {
      if (!data) return;

      const { cell } = data;
      const elem = this.getActCell(cell);

      if (elem) {
        this.game.fire(cell, elem, 'miss');
      }
    });

    socket.on('onTarget', (data) => {
      if (!data) return;

      const { cell, isDestroyed, shipType } = data;
      const elem = this.getActCell(cell);

      if (elem) {
        this.game.fire(cell, elem, {
          name: isDestroyed ? 'destroyed' : 'onTarget',
          isDestroyed,
          shipType
        });
      }
    });

    socket.on('hit', (data) => {
      if (!data) return;

      const elem = this.$refs[data.cell];

      if (elem && elem[0]) {
        this.game.fire(cell, elem);
        this.game.getFired(data.cell);
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
        resetInitialPos: false
      }

      return ship;
    });

    return {
      game: this.game,
      rowNo,
      colNo,
      cells: this.game.cells,
      ships,
      shipTypes: Object.keys(SHIPS)
    };
  },

  mounted() {
    this.checkUser();
    this.game.hookShip();
  },

  methods: {
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

      return this.$refs[`map[${this.game.createCoord(coord.x, coord.y)}]`][0];
    },

    getActCell(coord) {
      if (typeof coord === 'string') {
        coord = this.game.parseCoord(coord);
      }

      return this.$refs[`act[${this.game.createCoord(coord.x, coord.y)}]`][0];
    },

    getMapShip(name) {
      return document.getElementById(name);
    },

    lazy() {
      const randomCoord = () => [
        Math.floor(Math.random() * this.rowNo),
        Math.floor(Math.random() * this.colNo)
      ];

      this.game.ships.map((ship) => {
        let c;
        const container = document.getElementById('board-container');
        const containerRect = container.getBoundingClientRect();

        do {
          c = randomCoord();
          const cell = this.game.createCoord(...c);
          const cellElem = this.getMapCell(cell);
          const coord = this.game.parseCoord(cell);
          const shipElem = this.getMapShip(ship.name);
          const rect = cellElem.getBoundingClientRect();

          this.game.setPosition(ship, coord);
          this.placeShip(cellElem, shipElem, {
            relLeft: rect.left - containerRect.left,
            relTop: rect.top - containerRect.top
          });
        } while(c[0] + ship.decker > this.rowNo);
      });
    },

    dragEnd(elem, event) {
      const shipName = event.dragElem.getAttribute('data-ship-name');
      const ship = this.game.getShip(shipName);

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
          this.resetPos(ship);
          return;
        }

        elem = this.getMapCell(coord);
        dropELemRect = event.getRectPosition(elem);

        this.placeShip(elem, event.dragElem, dropELemRect);

        event.setState({
          initialMousePos: undefined,
          startDragPosition: dropELemRect,
          currentDragPosition: dropELemRect
        });

        this.game.setPosition(ship, coord);
      } else {
        this.resetPos(ship);
      }
    },

    placeShip(cellElem, shipElem, rect) {
      const dx = (cellElem.clientWidth / 2) - (shipElem.clientWidth / 2);

      shipElem.style.left = `${rect.relLeft + dx}px`;
      shipElem.style.top = `${rect.relTop}px`;
    },

    resetPos(ship) {
      ship.draggable.resetInitialPos = true;

      setTimeout(() => {
          ship.draggable.resetInitialPos = false;
      }, 0);
    },

    newGame() {
      modal.showModal('user-config-modal');
    },

    ready() {
      const { user, ships, } = this.game;

      socket.emit('ready', {
        user,
        ships
      });
    },

    fire(e, status) {
      const elem = e.nodeType === 1 ? e : e.currentTarget;
      const cell = elem.getAttribute('data-cell');
      const { user } = this.game;

      if (!status || !status.theirTurn) {
        socket.emit('fire', {
          user,
          cell
        });
      }
    }
  }
};
</script>
