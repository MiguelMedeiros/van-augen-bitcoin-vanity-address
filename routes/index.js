var express = require('express');
var router = express.Router();
const spawn = require('threads').spawn;
var vanity = require('./../components/vanity');
// helper variables to keep current search state
var thread = null
var oldResponse = null

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/generateWallet', function(req, res, next) {
        try {
		// save response to be used on /cancelWallet
		oldResponse = res

		// kill any old thread
		if(thread) {
			thread.kill()
		}
		// spawn a new search
		thread = spawn(function(input, done) {
			var vanity = require('./../../../../components/vanity');
			var result = vanity.generateVanityWallet(input);
			done(result);
		});
		thread.send(req.body.textVanity)
			.on('message', function(response) {
				res.send(response)
			});
	} catch (err) {
		console.log(err)
	}
});

router.get('/cancelWallet', function(req, res, next) {
	// stop current thread if any
	if (thread) {
		thread.kill()
		thread = null
	}
	// inform ui the old search was cancelled
	if (oldResponse && oldResponse.send) {
		oldResponse.send(false)
		oldResponse = null
	}
	res.send(true);
});

module.exports = router;
