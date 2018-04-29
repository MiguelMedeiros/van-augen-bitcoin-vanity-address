var bitcoin = require('bitcoinjs-lib');

var generateVanityWallet = function(options, progress){
	i = 0;
	while(1) {
		i++;
		var keyPair = bitcoin.ECPair.makeRandom();
		var address;
		var startAddress;
		var result = false;
		if (options.walletType == "segwit") {
			var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(keyPair.getPublicKeyBuffer()));
			var scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript))
			address = bitcoin.address.fromOutputScript(scriptPubKey);
			startAddress = address.substr(1,options.query.length);
		} else {
			address = keyPair.getAddress();
			startAddress = address.substr(1,options.query.length);
		}
		if (options.stringEnd != 'start') {
			startAddress = address.substr(address.length-options.query.length, options.query.length);
		}
		if (options.caseSensitive) {
			result = (startAddress == options.query);
		} else {
			result = (startAddress.toUpperCase() == options.query.toUpperCase());
		}

		if(result) {
			console.log("Number of created addresses to find your vanity address: "+i);
			return ([address, keyPair.toWIF(), i]);
		}
	}
}

module.exports = {
	generateVanityWallet : generateVanityWallet
}
