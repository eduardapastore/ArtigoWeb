const express = require('express');
const router = express.Router();
const pool = require('../bd');

// GET todos Autores
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM artigo');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar artigo' });
  }
});