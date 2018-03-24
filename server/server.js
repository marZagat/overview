require('newrelic');

const express = require('express');
const cors = require('cors');
const db = require('../db/mongo/mongoController');

const app = express();
db.connect();

app.use(cors());
app.use('/restaurants/:id', express.static('client/dist'));

app.get('/api/restaurants/:id/overview', async (req, res) => {
  try {
    const result = await db.findOneById(req.params.id);
    res.send(result);
  } catch (error) {
    res.status(404).send(error);
  }
});

app.get('/', (req, res) => {
  const randomId = Math.floor(Math.random() * 10000000);
  res.redirect(`/restaurants/${randomId}`);
});

app.listen(3002, () => {
  console.log('Listening on port 3002');
});

// const webpack = require('webpack');
// const webpackDevMiddleware = require('webpack-dev-middleware');
// const config = require('../webpack.config.js');
// const compiler = webpack(config);

// app.use(webpackDevMiddleware(compiler, {
//   publicPath: config.output.publicPath,
// }));

// =============================================================== //
// ===== webpack lines commented for proxy server purposes ======= //
// =============================================================== //
