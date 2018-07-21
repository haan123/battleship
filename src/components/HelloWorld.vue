<template>
  <div class="container">
    <div class="user-board">
      <div :class="{
        'user': true,
        'badge': true,
        'badge-warning': game.isReady() && game.isMyTurn,
        'badge-dark': !game.isReady() || !game.isMyTurn
      }">
        {{player}}
        <span v-if="!game.isReady()" @click="editUser"><svgicon class="user__edit" icon="edit" width="12" height="12" color="#f1f1f1"></svgicon></span>
      </div>
      <span v-bind:ref="arrow" class="arrow-icon" :style="{
        'display': game.isReady() ? 'block' : 'none'
      }">
        <span class="left-bar"></span>
        <span class="right-bar"></span>
      </span>
      <div :class="{
        'user': true,
        'badge': true,
        'badge-warning': game.isReady() && !game.isMyTurn,
        'badge-dark': !game.isReady() || game.isMyTurn
      }">{{oppPlayer}}</div>
    </div>
    <div class="widgets">
      <button @click="newGame" class="btn btn-danger btn-lg play">New Game</button>&nbsp;
      <button @click="lazy" class="btn btn-outline-secondary btn-lg play" :disabled="!enableLazyButton">Lazy</button>
      <button @click="ready" class="btn btn-success btn-lg play ml-auto" :disabled="!enableReadyButton">Ready</button>
    </div>

    <p class="game-guide">Ships cannot occupy squares next to each other, horizontally, vertically or diagonally, you can place a ship by dragging the ship from the ship base.</p>

    <div id="board-container" :class="{
      'board-container': true,
      'is-ready': game.isReady()
    }">
      <div class="board__inner">
        <div class="board">
          <div class="table board__table">
            <div class="row board__row-no">
              <div class="board__no col" v-for="(index, col) in colNo" :key="col">{{index}}</div>
            </div>
            <div class="row" v-for="(index, row) in rowNo" :key="row">
              <div class="board__letter">{{letters[index - 1]}}</div>
              <div class="droppable board__map-col" v-for="(_, col) in colNo" :key="col" v-bind:ref="`map[${row}:${col}]`" :data-cell="`${row}:${col}`" v-bind:class="{
                'col': true,
                'is-win': cells[`${row}:${col}`].isWin,
                'is-current': cells[`${row}:${col}`].isCurrent
              }" :title="`${row}:${col}`" style="width:40px;height:40px;">
              </div>
            </div>
            <div v-if="!this.enableReadyButton && !this.enableLazyButton" class="mask"></div>
          </div>

          <template v-for="ship in ships">
            <div :key="ship.name" :id="ship.name" v-draggable="ship.draggable" :data-ship-name="ship.name" :class="`ship ${ship.name}`">
              <div @click="rotate" v-if="ship.position && ship.position.length && enableReadyButton">
                <svgicon class="ship__rotate" icon="rotate" width="22" height="18" color="#f1f1f1" :key="`w${ship.name}`">{{ship.draggable.resetInitialPos}}</svgicon>
              </div>
            </div>
          </template>
        </div>

        <div class="board board--act" v-bind:style="{
          width: `${40 * colNo}px`,
          display: game.isReady() ? 'block' : 'none'
        }">
          <div class="table board__table">
            <div class="row board__row-no">
              <div class="board__no col" v-for="(index, col) in colNo" :key="col">{{index}}</div>
            </div>

            <div class="row" v-for="(index, row) in rowNo" :key="row">
              <div class="board__letter board__letter--act">{{letters[index - 1]}}</div>
              <div v-for="(_, col) in colNo" :key="col" v-bind:ref="`act[${row}:${col}]`" @click="fire" :data-cell="`${row}:${col}`" v-bind:class="{
                  'col': true,
                  'board__act-col': true,
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
    </div>

    <div id="sprite-container" class="sprite-container">
      <div class="sprite bomb"></div>
      <div class="sprite fire_opp"></div>
      <div class="sprite fire_hole"></div>
      <div class="sprite fire_hole_small"></div>
      <template v-for="type in shipTypes">
        <template v-for="suf1 in ['', '_opp']">
          <template v-for="suf2 in ['', '_hor']">
            <div :key="`${type}${suf1}${suf2}`" :class="`sprite fire_${type}${suf1}${suf2}`"></div>
          </template>
        </template>
      </template>
    </div>

    <div class="footer">
      <div class="github">
        <a class="github-button" href="https://github.com/haan123/battleship" data-count-href="/haan123/battleship/stargazers" data-count-api="/repos/haan123/battleship#stargazers_count" data-count-aria-label="# stargazers on GitHub" aria-label="Star haan123/battleship on GitHub">Star</a>
        <a class="github-button" href="https://github.com/haan123/battleship/fork" data-icon="octicon-repo-forked" data-count-href="/haan123/battleship/network" data-count-api="/repos/haan123/battleship#forks_count" data-count-aria-label="# forks on GitHub" aria-label="Fork haan123/battleship on GitHub">Fork</a>
      </div>
      <div class="social">
        <span class="social-button social-button__tw"><a href="https://twitter.com/haquangngocan" target="_blank">
          <svgicon class="" icon="twitter" width="18" height="18" color="#fff"></svgicon>
        </a></span>
        <span class="social-button"><a  href="https://www.facebook.com/hana.printle" target="_blank">
          <svgicon icon="facebook" width="95" height="16" color="#fff"></svgicon>
        </a></span>
      </div>
      <span class="made-with-heart">
        <svgicon icon="pencil" width="16" height="16" color="#fff"></svgicon> with <svgicon icon="heart" width="16" height="16" color="#f1f1f1"></svgicon> by <a href="https://github.com/haan123" target="_blank" style="font-weight:500;color:#fff;">An Ha</a>
      </span>
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

import { setState, Draggable } from '../core/draggable';
import { SHIPS, ARRANGER, Game } from '../core/game';
import WinnerModal from './WinnerModal';
import LooseModal from './LooseModal';
import UserConfigModal from './UserConfigModal';
import modal from '../core/modal';
import dom from '../core/dom';

import '../svg/rotate';
import '../svg/edit';
import '../svg/twitter';
import '../svg/facebook';
import '../svg/pencil';
import '../svg/heart';

const socket = io(window.SOCKET_URL);
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'J', 'H', 'I', 'J'];

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
    socket.on('newGame', () => {
      this.newGame(null, true);
    });

    socket.on('editUser', (data) => {
      this.game.setUser(data.user);
    });

    socket.on('ready', (data) => {
      this.game.ready(true);
      this.game.setTurn(data.turn);

      document.title = document.title.replace(/\s?\([\w\W]+\)/g, '');
      document.title += ` (${data.turn})`;

      if (!this.game.isMyTurn) {
        dom.addClass(this.$refs.arrow, 'open');
        this.oppPlayer = data.turn;
      } else {
        dom.removeClass(this.$refs.arrow, 'open');
        this.oppPlayer = data.oppPlayer;
      }
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

        document.title = document.title.replace(/\s?\([\w\W]+\)/g, '');

        if (this.game.isMyTurn) {
          dom.removeClass(this.$refs.arrow, 'open');
          document.title += ` (${this.game.user})`;
        } else {
          dom.addClass(this.$refs.arrow, 'open');
          document.title += ` (${this.oppPlayer})`;
        }

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
      };

      return ship;
    });

    return {
      game: this.game,
      letters: LETTERS,
      arrow: 'arrow',
      rowNo,
      colNo,
      cells: this.game.cells,
      ships,
      enableReadyButton: false,
      enableLazyButton: true,
      isMyTurn: this.game.isMyTurn,
      oppPlayer: '(ᵔᴥᵔ)',
      player: '(ᵔᴥᵔ)',
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

      this.game.ships.map((ship) => {
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

    editUser() {
      modal.showModal('user-config-modal');
    },

    checkUser() {
      const user = localStorage.getItem('user');

      if (!user) {
        modal.showModal('user-config-modal');
      } else {
        this.game.setUser(user);
      }

      this.player = this.game.user;
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

    rotate(e) {
      const shipName = e.currentTarget.parentNode.getAttribute('data-ship-name');
      const ship = this.game.getShip(shipName);
      const { position } = ship;
      const c = position[position.length - 1];
      const coord = this.game.parseCoord(c);
      const shipElem = this.getMapShip(ship.name);
      const cellElem = this.getMapCell(c);

      const { className } = shipElem;

      dom.removeClass(shipElem, ` ship--${ship.arrange}`);
      this.game.rotate(ship);
      dom.addClass(shipElem, ` ship--${ship.arrange}`);

      const isShipPlaced = this.game.setPosition(ship, coord);

      if (isShipPlaced) {
        this.placeShip(cellElem, shipElem, ship);
      } else {
        shipElem.className = className;
      }
    },

    lazy() {
      const arranger = Object.keys(ARRANGER);

      const randomCoord = () => [
        Math.floor(Math.random() * this.rowNo),
        Math.floor(Math.random() * this.colNo)
      ];

      const randomArrange = () => arranger[Math.floor(Math.random() * 2)];
      const isShipOverBound = (c, ship) => {
        const isOverBound = (c[0] + ship.decker > this.rowNo) || (c[1] + ship.decker > this.colNo);

        if (isOverBound) {
          this.game.resetShipPos(ship);
        }

        return isOverBound;
      };

      this.game.resetAllCoords();

      this.game.ships.map((ship) => {
        let c;
        let isShipPlaced;
        const shipElem = this.getMapShip(ship.name);

        do {
          c = randomCoord();
          const cell = this.game.createCoord(...c);
          const cellElem = this.getMapCell(cell);
          const coord = this.game.parseCoord(cell);

          dom.removeClass(shipElem, ` ship--${ship.arrange}`);
          this.game.setArrange(ship, randomArrange());
          dom.addClass(shipElem, ` ship--${ship.arrange}`);

          isShipPlaced = this.game.setPosition(ship, coord);

          if (isShipPlaced) {
            this.placeShip(cellElem, shipElem, ship);
          }
        } while (!isShipPlaced || isShipOverBound(c, ship));
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
        const dragELemRect = event.getRectPosition();
        const cell = elem.getAttribute('data-cell');
        const coord = this.game.parseCoord(cell);
        const dropElemWidth = elem.clientWidth;
        const dropElemHeight = elem.clientHeight;

        const dropELemRect = event.getRectPosition(elem);

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

        const isShipPlaced = this.game.setPosition(ship, coord);

        if (elem && isShipPlaced) {
          this.placeShip(elem, event.dragElem, ship);

          if (this.game.isAllShipsReady()) {
            this.enableReadyButton = true;
          }
        } else if (ship.position && ship.position.length) {
          this.resetPreviousPos(ship);
        } else {
          this.resetPos(ship);
        }
      } else if (ship.position && ship.position.length
        && targetShip && targetShip.position && targetShip.position.length) {
        this.resetPreviousPos(ship);
      } else {
        this.resetPos(ship);
      }
    },

    placeShip(cellElem, shipElem, ship) {
      if (!cellElem || !shipElem) return;

      const container = document.getElementById('board-container');
      const containerRect = container.getBoundingClientRect();
      const containerScrollLeft = container.scrollLeft;

      const rect = cellElem.getBoundingClientRect();
      let { left, top } = rect;

      if (ship.arrange === 'horizontal') {
        const dy = (cellElem.clientHeight / 2) - (shipElem.clientHeight / 2);
        top += dy;
        left -= 1;
      } else {
        const dx = (cellElem.clientWidth / 2) - (shipElem.clientWidth / 2);
        left += dx;
      }

      const dropELemRect = {
        left,
        top,
        relLeft: Math.round((left - containerRect.left) + containerScrollLeft),
        relTop: Math.round(top - containerRect.top)
      };

      setState({
        initialMousePos: undefined,
        startDragPosition: dropELemRect,
        currentDragPosition: dropELemRect,
        prevPosition: dropELemRect
      }, shipElem);

      shipElem.style.left = `${Math.floor(dropELemRect.relLeft)}px`;
      shipElem.style.top = `${Math.floor(dropELemRect.relTop)}px`;
    },

    resetPos(ship) {
      const shipElem = this.getMapShip(ship.name);
      this.game.resetShipPos(ship);

      dom.removeClass(shipElem, 'ship--horizontal');
      dom.addClass(shipElem, 'ship--vertical');

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

      if (!this.game.isMyTurn) {
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
