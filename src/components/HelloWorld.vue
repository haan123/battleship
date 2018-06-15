<template>
  <div class="container">
    <div class="board">
      <div class="table">
        <div class="table-inner">
          <span class="table__goal-crease circle"></span>
          <span class="table__faceoff table__faceoff--top-left circle"></span>
          <span class="table__faceoff table__faceoff--bottom-left circle"></span>
          <span class="table__blue-line"></span>
          <span class="table__center-line"></span>
          <span class="circle"></span>
          <span class="table__blue-line table__blue-line--two"></span>
          <span class="table__faceoff table__faceoff--top-right circle"></span>
          <span class="table__faceoff table__faceoff--bottom-right circle"></span>
          <span class="table__goal-crease table__goal-crease--two circle"></span>
          </div>
      </div>
      <canvas id="canvas" class="table table--canvas" tabindex="0"></canvas>
    </div>
  </div>
</template>

<script>
/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

import AH from '../core/ah';
import modal from '../core/modal';

const socket = io(window.SOCKET_URL);

export default {
  name: 'HelloWorld',
  components: {
  },

  data() {
    this.ah = new AH({
    });

    return {
    };
  },
  methods: {

  }
};
</script>
