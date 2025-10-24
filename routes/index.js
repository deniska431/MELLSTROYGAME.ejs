var express = require('express');
var router = express.Router();

// Главная страница
router.get('/', function(req, res) {
    res.render('index'); 
  });

  router.get('/prize', function(req, res) {
    res.render('prize'); 
  });

module.exports = router;