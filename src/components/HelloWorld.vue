<template>
  <div class="container">
    <div class="widgets">
      <button v-on:click="newGame" class="btn btn-danger btn-lg play">New Game</button>
    </div>

    <div class="board-container">
      <div class="board" v-bind:style="{ width: `${40 * colNo}px` }">
        <draggable :options="{group:'people'}" @start="drag=true" @end="drag=false">
        </draggable>
        <div class="table">
          <div class="row" v-for="(_, row) in rowNo" :key="row">
            <div v-for="(_, col) in colNo" :key="col" v-bind:ref="`${row}:${col}`" :data-cell="`${row}:${col}`" v-bind:class="{
              'col': true,
              'is-win': cells[`${row}:${col}`].isWin,
              'is-current': cells[`${row}:${col}`].isCurrent
            }" :title="`${row}:${col}`" style="width:40px;height:40px;">
            </div>
          </div>
        </div>
      </div>

      <div class="board" v-bind:style="{
        width: `${40 * colNo}px`,
        display: 'none'
      }">
        <div class="table">
          <div class="row" v-for="(_, row) in rowNo" :key="row">
            <div v-for="(_, col) in colNo" :key="col" v-bind:ref="`${row}:${col}`" v-on:click="fire" :data-cell="`${row}:${col}`" v-bind:class="{
                'col': true,
                'is-win': cells[`${row}:${col}`].isWin,
                'is-current': cells[`${row}:${col}`].isCurrent
            }" :title="`${row}:${col}`" style="width:40px;height:40px;">
            </div>
          </div>
        </div>
      </div>

      <div class="board board--baseship">
        <draggable :options="{group:'people'}" @start="drag=true" @end="drag=false">
          <img class="ship aircraft-carrier" src="../assets/aircraftCarrier.png" v-bind:ref="`aircraftCarrier`"/>
          <img class="ship battleship-1" src="../assets/battleship.png" v-bind:ref="`battleship`"/>
          <img class="ship battleship-2" src="../assets/battleship.png" v-bind:ref="`battleship`"/>
          <img class="ship destroyer-1" src="../assets/destroyer.png" v-bind:ref="`destroyer`"/>
          <img class="ship destroyer-2" src="../assets/destroyer.png" v-bind:ref="`destroyer`"/>
          <img class="ship destroyer-3" src="../assets/destroyer.png" v-bind:ref="`destroyer`"/>
          <img class="ship cruiser-1" src="../assets/cruiser.png" v-bind:ref="`cruiser`"/>
          <img class="ship cruiser-2" src="../assets/cruiser.png" v-bind:ref="`cruiser`"/>
          <img class="ship cruiser-3" src="../assets/cruiser.png" v-bind:ref="`cruiser`"/>
          <img class="ship cruiser-4" src="../assets/cruiser.png" v-bind:ref="`cruiser`"/>
          <img class="ship cruiser-5" src="../assets/cruiser.png" v-bind:ref="`destroyer`"/>
        </draggable>
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

import draggable from 'vuedraggable';
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
    draggable
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

    this.game.addShip({
      type: 'aircraftCarrier',
      coordinate: '4:4',
      arrange: 'vertical'
    });

    this.game.setup({
      isMyTurn: true
    });

    socket.emit('setupGame', {
    });

    return {
      game: this.game,
      rowNo,
      colNo,
      cells: this.game.cells
    };
  },

  mounted() {
  },

  methods: {
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
