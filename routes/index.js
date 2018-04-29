var express = require('express');
var router = express.Router();
const spawn = require('threads').spawn;
const Pool = require('threads').Pool;
var os = require('os')

// helper variables to keep current search state
var oldResponse = null
var pool = null;

function killPool() {
	if (pool) {
		pool.killAll()
		pool = null
	}
}

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index', { title: 'Express' });
});

router.post('/generateWallet', function(req, res, next) {
	// save response to be used on /cancelWallet
	oldResponse = res

	// kill any old thread pool
	killPool()
	pool = new Pool()
	// spawn a new search
	const job = pool.run(function(input, done, progress) {
		var vanity = require('./../../../../components/vanity');
		var result = vanity.generateVanityWallet(input, progress);
		done(result);
	});
	for (var i=0; i < os.cpus().length; i++) {
		var task = pool.send(req.body.textVanity);
		task.on('done', function(response) {
			res.send(response)
			killPool()
		}).on('progress', function(progress) {
		});
	}
});

router.get('/cancelWallet', function(req, res, next) {
	// stop current thread if any
	killPool()

	// inform ui the old search was cancelled
	if (oldResponse && oldResponse.send) {
		oldResponse.send(false)
		oldResponse = null
	}
	res.send(true);
});

module.exports = router;
