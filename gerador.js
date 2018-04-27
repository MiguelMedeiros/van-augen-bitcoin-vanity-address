var CryptoJS = require('cryptojs').Crypto
var bs58 = require('bs58')
var bitcoin = require('bitcoinjs-lib')
var ec = require('eccrypto')

// passo 1 - criar uma variavel com 32 bytes randomicos

var chavePrivada = CryptoJS.util.randomBytes(32)

var chavePrivadaHex = CryptoJS.util.bytesToHex(chavePrivada).toUpperCase()

console.log(chavePrivadaHex)

var chavePrivada = chavePrivadaHex

var chavePublica = ec.getPublic(Buffer(CryptoJS.util.hexToBytes(chavePrivada)))

console.log(CryptoJS.util.bytesToHex(chavePublica))

// P2PKH na rede principal é 0x00, P2PKH na rede de testes é 0x6F
// P2SH na rede principal é 0x05, P2SH na rede de testes é 0xC4
// lista completa em https://en.bitcoin.it/wiki/List_of_address_prefixes
versao = '00'

// passo 2
var chavePublicaSHA256 = CryptoJS.SHA256(chavePublica)

// passo 3
var hash160 = bitcoin.crypto.ripemd160(Buffer(CryptoJS.util.hexToBytes(chavePublicaSHA256)))

// passo 4 - adicionar versao na frente
var hashEBytes = Array.prototype.slice.call(hash160, 0)
hashEBytes.unshift(CryptoJS.util.hexToBytes(versao))

// passo 5 - primeiro hash sha256 do passo 4
var primeiroSHA = CryptoJS.SHA256(hashEBytes)

// passo 6 - hash sha256 do passo 5
var segundoSHA = CryptoJS.SHA256(CryptoJS.util.hexToBytes(primeiroSHA))

// passo 7 - extrai os 4 primeiros bytes para utilizar como checksum
var checksum = segundoSHA.substr(0,8)

// passo 8 - versão + passo 3 + passo7
var endereco = versao + CryptoJS.util.bytesToHex(hash160) + checksum

// passo 9 - codificar resultado do passo 8 em base58
var enderecoFinal = bs58.encode(CryptoJS.util.hexToBytes(endereco))

console.log(enderecoFinal)
