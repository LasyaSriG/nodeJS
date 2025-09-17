const express = require('express');
const app = express();

// Root endpoint
app.get('/', (req, res) => {
  res.send('Hello from Feature Branch!');
});

// Another sample endpoint
app.get('/status', (req, res) => {
  res.json({ status: 'ok', message: 'App is running fine!' });
});

module.exports = app;
