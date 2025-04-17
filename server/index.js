const path = require('path');
const express = require('express');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config.js');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');

const app = express();
const compiler = webpack(webpackConfig);

app.use(
  webpackDevMiddleware(compiler, {
    publicPath: webpackConfig.output.publicPath,
  })
);

app.use(webpackHotMiddleware(compiler));

// Catch-all to serve index.html for React Router
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, '/public/index.html'));
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
