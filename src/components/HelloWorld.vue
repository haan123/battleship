<template>
  <div class="container">
    <div class="widgets">
      <button v-on:click="newGame" class="btn btn-danger btn-lg play">New Game</button>
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

  </div>
</template>

<script>
/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

import { Draggable } from '../core/draggable';
import Game from '../core/game';
// import WinnerModal from './WinnerModal';
// import LooseModal from './LooseModal';
// import UserConfigModal from './UserConfigModal';
import modal from '../core/modal';

import '../svg/x';
import '../svg/o';

const socket = io(window.SOCKET_URL);

export default {
  name: 'HelloWorld',
  components: {
  },

  directives: {
    Draggable
  },

  data() {
    socket.on('getFired', (data) => {
      if (!data) return;

      const elem = this.$refs[data.cell];

      if (elem && elem[0]) {
        this.game.getFired(data.cell);
      }
    });

    const rowNo = 10;
    const colNo = 10;

    this.game = new Game({
      rowNo,
      colNo
    });

    // this.game.addShip({
    //   type: 'aircraftCarrier',
    //   coordinate: '4:4',
    //   arrange: 'vertical'
    // });

    this.game.setup({
      isMyTurn: true
    });

    socket.emit('setupGame', {
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
      ships
    };
  },

  mounted() {
    this.game.hookShip();
  },

  methods: {
    getMapCell(coord) {
      return this.$refs[`map[${this.game.createCoord(coord.x, coord.y)}]`][0];
    },

    getActCell(coord) {
      return this.$refs[`act[${this.game.createCoord(coord.x, coord.y)}]`][0];
    },

    dragEnd(elem, event) {
      const shipName = event.dragElem.getAttribute('data-ship-name');
      const ship = this.game.getShip(shipName);

      if (elem && elem.closest('.droppable')) {
        const cell = elem.getAttribute('data-cell');
        const coord = this.game.parseCoord(cell);
        const dragELemRect = event.getRectPosition();
        const dropElemWidth = elem.clientWidth;
        const dropElemHeight = elem.clientHeight;
        const dragElemWidth = event.dragElem.clientWidth;
        const containerRect = event.getContainerRect();

        let dropELemRect = event.getRectPosition(elem);

        if ((dragELemRect.left - dropELemRect.left) / dropElemWidth > 0.7) {
          coord.y += 1;
        }

        if ((dragELemRect.top - dropELemRect.top) / dropElemHeight > 0.7) {
          coord.x += 1;
        }

        elem = this.getMapCell(coord);
        dropELemRect = event.getRectPosition(elem);

        const dx = (elem.clientWidth / 2) - (event.dragElem.clientWidth / 2);

        event.dragElem.style.left = `${dropELemRect.relLeft + dx}px`;
        event.dragElem.style.top = `${dropELemRect.relTop}px`;

        event.setState({
          initialMousePos: undefined,
          startDragPosition: dropELemRect,
          currentDragPosition: dropELemRect
        });

        ship.setPosition(coord);
      } else {
        ship.draggable.resetInitialPos = true;

        setTimeout(() => {
            ship.draggable.resetInitialPos = false;
        }, 0);
      }
    },

    newGame() {
      modal.showModal('user-config-modal');
    },

    fire(e, status) {
      const elem = e.nodeType === 1 ? e : e.currentTarget;
      const cell = elem.getAttribute('data-cell');

      if (!status || !status.theirTurn) {
        socket.emit('fire', {
          cell
        });
      }
    }
  }
};
</script>
