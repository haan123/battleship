const Koa = require('koa');
const path = require('path');
const views = require('koa-nunjucks-next');
const Router = require('koa-router');
const convert = require('koa-convert');
const serveStatic = require('koa-better-static');

// initialize the app
const app = new Koa();
const game = {
  room1: {}
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

function getOppPlayer(players = [], user) {
  return players.find((client) => client.user !== user);
}

function getPlayer(players = [], user) {
  return players.find((client) => client.user === user);
}

function isWin(ships) {
  return !ships.find(ship => ship.decker !== ship.damage);
}

function isReadyToPlay(players) {
  return players.length === 2 && !players.find(player => player.ready === false);
}

function setNextPlayerTurn(room, players, player) {
  const nextPlayer = players.find(p => p.user !== player.user);

  room.turn = nextPlayer.user;
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
  socket.on('newGame', function (data) {
    console.log(`${data.user} set up new game`);

    const { user } = data;
    const { players } = game.room1;
    const oppPlayer = getOppPlayer(players, user);

    if (!players || !players.length || !oppPlayer) return;

    players.map(player => {
      player.ready = false;
    });

    io.sockets.connected[oppPlayer.sid].emit('newGame');
  });

  socket.on('ready', function (data) {
    console.log(`${data.user} is ready`);

    const keys = Object.keys(io.sockets.connected);

    if (!game.room1.players) game.room1.players = [];

    const players = game.room1.players.filter((player) => {
      return (keys.indexOf(player.sid) !== -1) && (data.user !== player.user);
    });

    data.sid = socket.id;
    data.ready = true;
    players.push(data);

    let turn;
    const isReady = isReadyToPlay(players);

    if (isReady) {
      turn = players[0].user;
    }

    game.room1.turn = turn;
    game.room1.players = players;

    if (isReady) {
      const oppPlayer = getOppPlayer(players, data.user);

      io.sockets.emit('ready', {
        turn,
        oppPlayer
      });
    }
  });

  socket.on('fire', function (data) {
    console.log(`${data.user} fired`);

    const { user } = data;
    let { cell } = data;
    const { room1 } = game;
    const { players } = room1;
    const player = getPlayer(players, user);
    const oppPlayer = getOppPlayer(players, user);

    if (!player || !oppPlayer) return;

    const { ships } = oppPlayer;
    const length = ships.length;
    let isMissed = true;

    setNextPlayerTurn(room1, players, player);

    for (let i = 0; i < length; i++) {
      const ship = ships[i];
      const { type, name, arrange, position, decker } = ship;

      if (position && position.indexOf(cell) !== -1) {
        ship.damage++;
        const isDestroyed = decker === ship.damage;
        const hasWinner = isWin(ships);

        players.map((p) => {
          const sock = io.sockets.connected[p.sid];

          if (isDestroyed) {
            cell = position[position.length - 1];
          }

          let fireData = {
            currentTurn: user,
            isDestroyed,
            cell,
            ship: {
              type,
              name,
              arrange
            }
          };

          if (p.sid === player.sid) {
            fireData.fireStatus = 'onTarget';
            fireData.nextTurn = user;

            if (isDestroyed) {
              fireData.fireStatus = 'oppDestroyed';
            }
          } else {
            fireData.fireStatus = 'hit';
            fireData.nextTurn = user;

            if (isDestroyed) {
              fireData.fireStatus = 'destroyed';
            }
          }

          if (hasWinner) {
            fireData.hasWinner = true;
            fireData.winner = user;
          }

          sock.emit('fired', fireData);
        });

        isMissed = false;

        break;
      }
    }

    if (isMissed) {
      io.sockets.emit('fired', {
        currentTurn: user,
        nextTurn: room1.turn,
        cell,
        fireStatus: 'miss',
        ship: {}
      });
    }
  });
});
