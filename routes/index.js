var express = require('express');
var router = express.Router();
const spawn = require('threads').spawn;
const Pool = require('threads').Pool;
var os = require('os');
var colors = require('colors');

// helper variables to keep current search state
var oldResponse = null;
var pool = null;
var coresAllowed = 1;
var attempts = 0;

function killPool() {
	if (pool) {
		pool.killAll();
		pool = null;
	}
	attempts = 0;
}

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.get('/coreNumbers', function(req, res, next) {
	cores = os.cpus();
	res.send(cores);
});

router.post('/generateWallet', function(req, res, next) {

	console.log("Searching for Vanity Address!".green);

	// invalidate any old request
	if (oldResponse != null) {
		console.log('Cancel old thread!'.red);
		oldResponse.send(false);
	}

	// prevent your request to fail
	req.setTimeout(0);
	
	// save response to be used on /cancelWallet
	oldResponse = res;
	coresAllowed = req.body.coresAllowed;
	caseSensitive = req.body.caseSensitive;
	stringLocation = req.body.stringLocation;
	walletType = req.body.walletType;

	// kill any old thread pool
	killPool();
	pool = new Pool();

	// spawn a new search
	const job = pool.run(function(input, done, progress) {
		var vanity = require('./../../../../components/vanity');
		var result = vanity.generateVanityWallet(input, progress);
		done(result);
	});
	for (var i=0; i < coresAllowed; i++) {
		var task = pool.send({
			query: req.body.textVanity, 
			caseSensitive: caseSensitive, 
			stringLocation: stringLocation, 
			walletType: walletType });
		
		task.on('done', function(response) {
			if (attempts > 1000) {
				response[2] = attempts + response[2];
			}
			if (oldResponse) {
				oldResponse = null;
				res.send(response);
			}
			killPool();
		}).on('progress', function(progress) {
			attempts += progress;
		});
	}
	req.on('close', function (err){
		console.log("Process closed!".red);
		killPool();
	});
});

router.get('/cancelWallet', function(req, res, next) {
	// stop current thread if any
	console.log("Cancel Process!".red);
	killPool();

	// inform ui the old search was cancelled
	if (oldResponse && oldResponse.send) {
		oldResponse.send(false);
		oldResponse = null;
	}
	res.send(true);
});

module.exports = router;
