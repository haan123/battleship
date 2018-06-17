<template>
  <div class="container">
    <div class="widgets">
      <button v-on:click="newGame" class="btn btn-danger btn-lg play">New Game</button>
    </div>
    <div class="board">
      <table v-bind:style="{ width: `${45 * colNo}px` }">
        <tbody>
          <tr v-for="(_, row) in rowNo" :key="row">
            <td v-for="(_, col) in colNo" :key="col" v-bind:ref="`${row}:${col}`" v-on:click="fire" :data-cell="`${row}:${col}`" v-bind:class="{
               'is-win': cells[`${row}:${col}`].isWin,
               'is-current': cells[`${row}:${col}`].isCurrent
            }" :title="`${row}:${col}`" style="width:45px;height:45px;">
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <img src="../assets/aircraftCarrier.png" v-bind:ref="`aircraftCarrier`" style="position:absolute;"/>
  </div>
</template>

<script>
/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

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

  data() {
    socket.on('enemyFiring', (data) => {
      if (!data) return;

      const elem = this.$refs[data.cell];

      if (elem && elem[0]) {
        this.fire(elem[0], {
          theirTurn: true
        });
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
    console.log(this)
    this.$refs.aircraftCarrier.style.left = `${45 * 4}px`;
    this.$refs.aircraftCarrier.style.top = `${45 * 4}px`;
  },

  methods: {
    newGame() {
      modal.showModal('user-config-modal');
    },

    fire(e, status) {
      const elem = e.nodeType === 1 ? e : e.currentTarget;
      const cell = elem.getAttribute('data-cell');

      console.log(status)

      if (!status || !status.theirTurn) {
        socket.emit('fire', {
          cell
        });
      }
    }
  }
};
</script>
