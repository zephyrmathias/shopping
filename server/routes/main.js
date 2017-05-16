var router = require('express').Router();

router.get('/', function(req,res){
  res.render('main/home');
});

router.get('/howto', function(req,res){
	res.render('main/howto');
});

router.get('/promotion', function(req,res){
  res.render('main/promotion');
});

module.exports = router;
