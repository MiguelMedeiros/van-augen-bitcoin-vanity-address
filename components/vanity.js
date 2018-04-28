var express = require('express');
var CryptoJS = require('cryptojs').Crypto;
var bs58 = require('bs58');
var bitcoin = require('bitcoinjs-lib');
var ec = require('eccrypto');
var variables = require('./../variables');

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

var generateVanityWallet = function(textVanity){

	i = 0;

	while(1) {
		result = getBitcoinWallet();
		i++
		walletAddress = result[0].substr(1,textVanity.length);
		if(walletAddress.toUpperCase() == textVanity.toUpperCase()){
			result[1] = generateWIF(result[1])
			result[2] = i;
			console.log("Number of created addresses to find your vanity address: "+i);
			return (result);
		}
	}

}

module.exports = {
	getBitcoinWallet: getBitcoinWallet,
	generateWIF: generateWIF,
	generateVanityWallet : generateVanityWallet
}
