var bitcoin = require('bitcoinjs-lib');
var bs58 = require('bs58');
var ec = require('eccrypto');
var randomBytes = require('randombytes')
var crypto = require('crypto')

function SHA256(data) {
	return crypto.createHash('sha256').update(data, 'utf8').digest();
}

var getBitcoinWallet = function (){

	// passo 1 - criar uma variavel com 32 bytes randomicos
	var privateKey = randomBytes(32);

	var publicKey = ec.getPublic(Buffer(privateKey));

	// P2PKH na rede principal é 0x00, P2PKH na rede de testes é 0x6F
	// P2SH na rede principal é 0x05, P2SH na rede de testes é 0xC4
	// lista completa em https://en.bitcoin.it/wiki/List_of_address_prefixes
	var versao = Buffer.from('00', 'hex');

	// passo 2
	var publicKeySHA256 = SHA256(publicKey);

	// passo 3
	var hash160 = bitcoin.crypto.ripemd160(publicKeySHA256);

	// passo 4 - adicionar versao na frente
	var hashEBytes = Buffer.concat([versao,hash160]);

	// passo 5 - primeiro hash sha256 do passo 4
	var firstSHA = SHA256(hashEBytes);

	// passo 6 - hash sha256 do passo 5
	var secondSHA = SHA256(firstSHA);

	// passo 7 - extrai os 4 primeiros bytes para utilizar como checksum
	var checksum = secondSHA.slice(0,4);

	// passo 8 - versão + passo 3 + passo7
	var publicAddress = Buffer.concat([versao, hash160, checksum]);

	// passo 9 - codificar resultado do passo 8 em base58
	publicAddress = bs58.encode(publicAddress);

	return [ publicAddress, privateKey ];
}

var generateWIF = function (privateKey){
	var version = Buffer.from('80', 'hex');

	// passo 1 - adicionar versao no comeco da chave privada: https://en.bitcoin.it/wiki/List_of_address_prefixes
	var versionAndPrivateKey = Buffer.concat([version,privateKey]);

	// passo 2 - hash sha256 do passo anterior
	var firstSHA = SHA256(versionAndPrivateKey);

	// passo 3 - hash sha256 do passo anterior (de novo)
	var secondSHA = SHA256(firstSHA);

	// passo 4 - retirar os 4 primeiros bytes do passo 4 e salvar como checksum
	var checksum = secondSHA.slice(0,4);

	// passo 5 - juntar '80' com a chave privada e adicionar o checksum ao final
	var versionAndPrivateKeyAndChecksum = Buffer.concat([versionAndPrivateKey, checksum]);

	// passo 6 - codificar para base58
	var wif =  bs58.encode(versionAndPrivateKeyAndChecksum);

	return wif
}

var generateVanityWalletCustom = function(options, progress) {
	i = 0;
	var start = (options.stringLocation == 'start');
	var caseSensitive = (options.caseSensitive == '1');
	var upperCaseQuery = options.query.toUpperCase();
	while(1) {
		i++;
		var found = false;
		var startAddress;
		result = getBitcoinWallet();
		if (!start) {
			startAddress = result[0].substr(result[0].length-options.query.length, options.query.length);
		} else {
			startAddress = result[0].substr(1,options.query.length);
		}
		if (caseSensitive) {
			found = (startAddress == options.query);
		} else {
			found = (startAddress.toUpperCase() == upperCaseQuery);
		}

		if(found) {
			console.log("Number of created addresses to find your vanity address: "+i);
			return ([result[0], generateWIF(result[1]), i]);
		}
		if (i>1000) {
			progress(i);
			i = 0;
		}
	}
}

var generateVanityWalletBitcoinJS = function(options, progress) {
	i = 0;
	var start = (options.stringLocation == 'start');
	var caseSensitive = (options.caseSensitive == '1');
	var upperCaseQuery = options.query.toUpperCase();
	while(1) {
		i++;
		var keyPair = bitcoin.ECPair.makeRandom();
		var address;
		var startAddress;
		var found = false;
		var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(keyPair.getPublicKeyBuffer()));
		var scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript));
		address = bitcoin.address.fromOutputScript(scriptPubKey);

		if (!start) {
			startAddress = address.substr(address.length-options.query.length, options.query.length);
		} else {
			startAddress = address.substr(1,options.query.length);
		}
		if (caseSensitive) {
			found = (startAddress == options.query);
		} else {
			found = (startAddress.toUpperCase() == upperCaseQuery);
		}

		if(found) {
			console.log("Number of created addresses to find your vanity address: "+i);
			return ([address, keyPair.toWIF(), i]);
		}
		if (i>1000) {
			progress(i);
			i = 0;
		}
	}
}

var generateVanityWallet = function(options, progress){

	if (options.walletType == "segwit") {
		return generateVanityWalletBitcoinJS(options, progress);
	}
	return generateVanityWalletCustom(options, progress);
}

var generateVanityWallet = function(options, progress){
	console.log(options)
	if (options.walletType == "segwit") {
		return generateVanityWalletBitcoinJS(options, progress);
	}
	return generateVanityWalletCustom(options, progress);
}

module.exports = {
	generateVanityWallet : generateVanityWallet
}
