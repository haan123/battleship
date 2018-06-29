const Koa = require('koa');
const path = require('path');
const views = require('koa-nunjucks-next');
const Router = require('koa-router');
const convert = require('koa-convert');
const serveStatic = require('koa-better-static');

// initialize the app
const app = new Koa();
const game = {
  room1: []
};

app.use(convert(serveStatic(path.resolve(__dirname, 'dist'), {
  maxage: 86400000
})));

app.use(views(path.resolve(__dirname, 'dist'), {
  minify: {
    minifyJS: true,
    minifyCSS: true,
    preserveLineBreaks: true,
    conservativeCollapse: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    quoteCharacter: '"'
  },
  autoescape: true,
  globals: {
    env: process.env.NODE_ENV
  }
}));

function getPlayer(user) {
  return game.room1.find((client) => client.user === user);
}

const router = new Router();

router.get('*', async (ctx, next) => {
  await ctx.render('index');
});

app.use(router.routes());

const io = require('socket.io')(app.listen(process.env.PORT || 3000, function() {
  console.log('Listening on http://localhost:' + (process.env.PORT || 3000));
}));

io.on('connection', function (socket) {
  socket.emit('data', { message: 'welcome to the chat' });

  socket.on('ready', function (data) {
    console.log(`${data.user} is ready`)

    const keys = Object.keys(io.sockets.connected);

    game.room1 = game.room1.filter((client) => {
      return (keys.indexOf(client.sid) !== -1) && (data.user !== client.user);
    });

    data.sid = socket.id;
    game.room1.push(data);
  });

  socket.on('fire', function (data) {
    console.log(`${data.user} is firing`);

    const { cell, user } = data;
    const player = getPlayer(user);

    if (!player) return;

    const { ships } = player;
    const length = ships.length;
    let isMissed = true;

    for (let i = 0; i < length; i++) {
      const ship = ships[i];

      if (ship.position && ship.position.indexOf(cell) !== -1) {
        game.room1.map((p) => {
          ship.damage++;

          const isDestroyed = ship.decker === ship.damage;

          if (p.sid === player.sid) {

            io.sockets.connected[p.sid].emit('onTarget', {
              isDestroyed,
              cell,
              shipType: ship.type
            });
          } else {
            io.sockets.connected[p.sid].emit('hit');
          }
        });

        isMissed = false;

        break;
      }
    }

    if (isMissed) {
      io.sockets.emit('miss', {
        cell
      });
    }
  });

  socket.on('setupGame', function (data) {
    console.log('setupGame', data);
    io.sockets.emit('setupGame', data);
  });

  socket.on('setOtherWinningPath', function (data) {
    console.log('setOtherWinningPath', data);
    io.sockets.emit('setOtherWinningPath', data);
  });
});
