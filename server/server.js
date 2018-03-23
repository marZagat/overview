require('newrelic');
const db = require('../db/mongo/mongoController');
// const webpack = require('webpack');
// const webpackDevMiddleware = require('webpack-dev-middleware');
// const config = require('../webpack.config.js');
const app = require('./app');

db.connect();
// const compiler = webpack(config);

// app.use(webpackDevMiddleware(compiler, {
//   publicPath: config.output.publicPath,
// }));

app.listen(3002, () => {
  console.log('Listening on port 3002');
});

// =============================================================== //
// ===== webpack lines commented for proxy server purposes ======= //
// =============================================================== //
