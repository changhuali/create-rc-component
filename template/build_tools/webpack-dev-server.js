const open = require('open');
const express = require('express');
const webpack = require('webpack');
const devMiddleWare = require('webpack-dev-middleware');
const hotMiddleWare = require('webpack-hot-middleware');
const webpackConfig = require('./webpack.dev.config');

const compiler = webpack(webpackConfig);
const PORT = 8080;
const HOST = 'localhost';
const PUBLIC_PATH = webpackConfig.output.publicPath;

const app = express();
const devMiddleWareInstance = devMiddleWare(compiler, {
  publicPath: PUBLIC_PATH,
  lazy: false,
  stats: {
    colors: true,
    assets: true,
    children: false,
    modules: false,
  },
});
devMiddleWareInstance.waitUntilValid(() => {
  open(`http://${HOST}:${PORT}${PUBLIC_PATH}index.html`);
});
const hotMiddleWareInstance = hotMiddleWare(compiler);
app.use(devMiddleWareInstance);
app.use(hotMiddleWareInstance);
app.listen(PORT, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.info(`development server listening on ${PORT}`);
  }
});

