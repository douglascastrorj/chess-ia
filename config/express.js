const express    = require('express');
const bodyParser = require('body-parser');
const config     = require('config');


module.exports = () => {
  const app = express();

  app.use(express.static('public'));

  // SETANDO VARIÁVEIS DA APLICAÇÃO
  app.set('port', process.env.PORT || config.get('server.port'));

  // MIDDLEWARES
  app.use(bodyParser.json());

  return app;
};


