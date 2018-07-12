/* eslint no-plusplus: 0 */
/* eslint comma-dangle: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint consistent-return: 0 */
/* eslint array-callback-return: 0 */

const COLORS = ['#4c4c4c', '#4c4c4c', '#4c4c4c', '#4c4c4c', '#4c4c4c', '#dc5326', '#dc5326', '#dc5326', '#dc5326', '#fcaf4a'];

function roll(face = 2) {
  return Math.floor(Math.random() * face);
}

class Flame {
  constructor(options) {
    const { elem, name } = options;

    this.elem = document.createElement('span');
    this.elem.className = `flame flame-${name}`;
    this.width = elem.clientWidth;
    this.height = elem.clientHeight;

    this.init(options);
  }

  init() {
    this.speed = {
      x: -1.5 + (Math.random() * 5),
      y: -5 + (Math.random() * 10)
    };

    this.location = {
      x: (Math.random() * (this.width / 2)),
      y: (Math.random() * (this.height / 2))
    };

    this.radius = Math.random() * 15;
    this.life = 20 + (Math.random() * 10);
    this.remaining_life = this.life;
  }
}

const Particle = {
  add(options) {
    if (!this.parts) this.parts = {};

    const { elem, name } = options;
    const part = this.parts[`${name}${new Date().getTime()}`] = {};

    part.particles = [];
    part.tickCount = 0;
    part.ticksPerFrame = 4;

    for (let i = 0; i < 6; i++) {
      const flame = new Flame(options);
      part.particles.push(flame);
      elem.appendChild(flame.elem);
    }

    if (Object.keys(this.parts).length === 1) {
      this.animate();
    }
  },

  remove(name) {
    if (!this.parts) return;

    const keys = Object.keys(this.parts);

    keys.map((n) => {
      if (n.indexOf(name) !== -1) {
        delete this.parts[n];
      }
    });

    if (!keys.length) {
      window.cancelAnimationFrame(this.req);
    }
  },

  render() {
    Object.keys(this.parts).map((name) => {
      const part = this.parts[name];

      part.tickCount += 1;

      if (part.tickCount > part.ticksPerFrame) {
        part.tickCount = 0;

        const { length } = part.particles;

        for (let i = 0; i < length; i++) {
          const p = part.particles[i];
          const coin = roll(10);
          const c = COLORS[coin];
          const hasBoxShadow = roll();

          p.elem.style.cssText = `
            left: ${p.location.x}px;
            top: ${p.location.y}px;
            width: ${coin > 1 ? p.radius * 0.7 : p.radius}px;
            height: ${coin > 1 ? p.radius * 0.7 : p.radius}px;
          `;

          if (!hasBoxShadow && coin > 5) {
            p.elem.style.background = c;
          } else {
            p.elem.style.boxShadow = `${p.radius}px 0 ${p.radius}px 1px ${c}`;
          }

          p.remaining_life--;
          p.radius--;
          p.location.x += p.speed.x;
          p.location.y += p.speed.y;

          if (p.remaining_life < 0 || p.radius < 0) {
            p.init();
          }
        }
      }
    });
  },

  animate() {
    this.req = window.requestAnimationFrame(() => {
      this.animate();
    });

    this.render();
  }
};

export default Particle;
