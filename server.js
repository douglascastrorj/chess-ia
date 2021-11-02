const app = require('./config/express')();
const port = app.get('port');

// RODANDO NOSSA APLICAÇÃO NA PORTA SETADA
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`)
});


app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});