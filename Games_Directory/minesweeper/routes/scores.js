const express = require('express');
const router = express.Router();
const db = require('./db')

router.get('/top10', function(req, res, next) {
  let subjectwords = [];
  db.getHighScores((err, rows) =>{
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(rows));
  });
});

router.post('/insert', function(req, res, next) {
  db.addScore(req.body.player, req.body.score);
  res.sendStatus(200);
});

module.exports = router;
