// routes/radioStats.js
const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8000/status.xsl');
    const html = response.data;

    const matches = html.match(/Current Listeners: <td>(\d+)<\/td>/);
    const listenerCount = matches ? parseInt(matches[1]) : 0;

    res.json({ listeners: listenerCount });
  } catch (err) {
    res.status(500).json({ error: 'Unable to fetch stats' });
  }
});

module.exports = router;
