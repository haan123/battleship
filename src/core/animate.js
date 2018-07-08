/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

const Animate = {
  init(config) {
    const {
      elem,
      shipName,
      image,
      frameWidth,
      frameHeight,
      isHorizontal,
      ext
    } = config;


    const boardContainer = document.getElementById('board-container');
    const clone = image.cloneNode(true);

    clone.style.height = `${frameHeight}px`;
    clone.style.width = `${frameWidth}px`;

    clone.className += ` anime-image-${shipName}`;

    const containerRect = boardContainer.getBoundingClientRect();
    const rect = elem.getBoundingClientRect();

    boardContainer.appendChild(clone);

    clone.style.left = `${Math.floor((rect.left - containerRect.left) + (ext.dx || 0))}px`;
    clone.style.top = `${Math.floor((rect.top - containerRect.top) + (ext.dy || 0))}px`;

    const obj = this.sprite({
      elem,
      image: clone,
      isHorizontal,
      numberOfFrames: ext.numberOfFrames
    });

    this.animate(obj);
  },

  sprite(options) {
    const {
      image,
      loop,
      isHorizontal,
      ticksPerFrame = 4,
      numberOfFrames = 1
    } = options;

    let frameIndex = 0;
    let tickCount = 0;
    const that = this;

    return {
      image,
      update() {
        tickCount += 1;

        if (tickCount > ticksPerFrame) {
          tickCount = 0;

          if (frameIndex < numberOfFrames - 1) {
            frameIndex += 1;
          } else if (loop) {
            frameIndex = 0;
          }
        }
      },
      render() {
        if (frameIndex === numberOfFrames - 1) {
          window.cancelAnimationFrame(that.req);
        }

        // Draw the animation
        if (isHorizontal) {
          image.style.backgroundPosition = `0px -${(frameIndex * image.clientHeight) / numberOfFrames}px`;
        } else {
          image.style.backgroundPosition = `-${(frameIndex * image.clientWidth) / numberOfFrames}px 0px`;
        }
      }
    };
  },

  animate(obj) {
    this.req = window.requestAnimationFrame(() => {
      this.animate(obj);
    });

    obj.update();
    obj.render();
  }
};


export default Animate;
