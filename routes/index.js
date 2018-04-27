var express = require('express');
var vanity = require('./../components/vanity');
//var variables = require('./../variables');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/generateWallet', function(req, res, next) {
	//variables.cancel = false;
	var result = vanity.generateVanityWallet(req.body.textVanity);
	res.send(result);
});

router.get('/cancelWallet', function(req, res, next) {
	//variables.cancel = true;
	res.send(true);
});

module.exports = router;
