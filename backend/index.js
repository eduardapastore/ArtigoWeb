const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Rotas
const AutorBd = require('./Autor');
app.use('/Autor', AutorBd);
const Artigo_autorBd = require('./Artigo_autor');
app.use('/Artigo_autor', Artigo_autorBd);
const ArtigoBd = require('./Artigo');
app.use('/Artigo', ArtigoBd);
const ReferenciaBd = require('./Referencia');
app.use('/Referencia', ReferenciaBd);


const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

