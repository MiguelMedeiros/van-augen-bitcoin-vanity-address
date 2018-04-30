var bitcoin = require('bitcoinjs-lib');
var CryptoJS = require('cryptojs').Crypto;
var bs58 = require('bs58');
var ec = require('eccrypto');
var sodium = require('sodium').api;

var getBitcoinWallet = function (){

	// passo 1 - criar uma variavel com 32 bytes randomicos
	var privateKey = CryptoJS.util.randomBytes(32);
	privateKey = CryptoJS.util.bytesToHex(privateKey).toUpperCase();

	var publicKey = ec.getPublic(Buffer(CryptoJS.util.hexToBytes(privateKey)));

	// P2PKH na rede principal é 0x00, P2PKH na rede de testes é 0x6F
	// P2SH na rede principal é 0x05, P2SH na rede de testes é 0xC4
	// lista completa em https://en.bitcoin.it/wiki/List_of_address_prefixes
	versao = '00';

	// passo 2
	var publicKeySHA256 = CryptoJS.SHA256(publicKey);

	// passo 3
	var hash160 = bitcoin.crypto.ripemd160(Buffer(CryptoJS.util.hexToBytes(publicKeySHA256)));

	// passo 4 - adicionar versao na frente
	var hashEBytes = Array.prototype.slice.call(hash160, 0);
	hashEBytes.unshift(CryptoJS.util.hexToBytes(versao));

	// passo 5 - primeiro hash sha256 do passo 4
	var firstSHA = CryptoJS.SHA256(hashEBytes);

	// passo 6 - hash sha256 do passo 5
	var secondSHA = CryptoJS.SHA256(CryptoJS.util.hexToBytes(firstSHA));

	// passo 7 - extrai os 4 primeiros bytes para utilizar como checksum
	var checkSum = secondSHA.substr(0,8);

	// passo 8 - versão + passo 3 + passo7
	var publicAddress = versao + CryptoJS.util.bytesToHex(hash160) + checkSum;

	// passo 9 - codificar resultado do passo 8 em base58
	publicAddress = bs58.encode(CryptoJS.util.hexToBytes(publicAddress));

	return [ publicAddress, privateKey ];
}

var generateWIF = function (privateKey){
	var version = '80'

	// passo 1 - adicionar versao no comeco da chave privada: https://en.bitcoin.it/wiki/List_of_address_prefixes
	var versionAndPrivateKey = version + privateKey

	// passo 2 - hash sha256 do passo anterior
	var firstSHA = CryptoJS.SHA256(CryptoJS.util.hexToBytes(versionAndPrivateKey))

	// passo 3 - hash sha256 do passo anterior (de novo)
	var secondSHA = CryptoJS.SHA256(CryptoJS.util.hexToBytes(firstSHA))

	// passo 4 - retirar os 4 primeiros bytes do passo 4 e salvar como checksum
	var checksum = secondSHA.substr(0, 8).toUpperCase()

	// passo 5 - juntar '80' com a chave privada e adicionar o checksum ao final
	var versionAndPrivateKeyAndChecksum = versionAndPrivateKey + checksum

	// passo 6 - codificar para base58
	var wif =  bs58.encode(CryptoJS.util.hexToBytes(versionAndPrivateKeyAndChecksum));

	return wif
}

var generateVanityWalletCustom = function(options, progress) {
	i = 0;
	var start = (options.stringLocation == 'start');
	var caseSensitive = (options.caseSensitive == 'true');
	while(1) {
		i++;
		var found = false;
		var startAddress
		result = getBitcoinWallet();
		if (!start) {
			startAddress = result[0].substr(result[0].length-options.query.length, options.query.length);
		} else {
			startAddress = result[0].substr(1,options.query.length);
		}
		if (caseSensitive) {
			found = (startAddress == options.query);
		} else {
			found = (startAddress.toUpperCase() == options.query.toUpperCase());
		}

		if(found) {
			console.log("Number of created addresses to find your vanity address: "+i);
			return ([result[0], generateWIF(result[1]), i]);
		}
	}
}

var generateVanityWalletBitcoinJS = function(options, progress) {
	i = 0;
	var start = (options.stringLocation == 'start');
	var caseSensitive = (options.caseSensitive == 'true');
	console.log(options)
	while(1) {
		i++;
		var keyPair = bitcoin.ECPair.makeRandom();
		var address;
		var startAddress;
		var result = false;
		var redeemScript = bitcoin.script.witnessPubKeyHash.output.encode(bitcoin.crypto.hash160(keyPair.getPublicKeyBuffer()));
		var scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript));
		address = bitcoin.address.fromOutputScript(scriptPubKey);

		if (!start) {
			startAddress = address.substr(address.length-options.query.length, options.query.length);
		} else {
			startAddress = address.substr(1,options.query.length);
		}
		if (caseSensitive) {
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

var generateVanityWallet = function(options, progress){

	if (options.walletType == "segwit") {
		return generateVanityWalletBitcoinJS(options, progress);
	}
	return generateVanityWalletCustom(options, progress);
}

module.exports = {
	generateVanityWallet : generateVanityWallet
}
