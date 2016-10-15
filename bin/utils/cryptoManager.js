var _ = require('lodash');
var Promise = require('bluebird');
var crypto = require('crypto');
var bcrypt = Promise.promisifyAll(require('bcrypt-nodejs'));

var cipherText = function(text, secretKey, algorithm, inputEncoding, outputEncoding) {
  return new Promise(function(resolve, reject) {
    try {
      if (algorithm.toLowerCase() === 'md5') {
        var crypted = crypto.createHash(algorithm).update(text).digest(outputEncoding);
      }
      else {
        var cipher = crypto.createCipher(algorithm, secretKey);
        var crypted = cipher.update(text, inputEncoding, outputEncoding);
        crypted += cipher.final(outputEncoding);
      }
      return resolve(crypted);
    }
    catch (err) {
      return reject(err);
    }
  });
}

var decipherText = function(text, secretKey, algorithm, inputEncoding, outputEncoding) {
  return new Promise(function(resolve, reject) {
    try {
      var decipher = crypto.createDecipher(algorithm, secretKey);
      var decrypted = decipher.update(text, inputEncoding, outputEncoding);
      decrypted += decipher.final(outputEncoding);

      return resolve(decrypted);
    }
    catch (err) {
      return reject(err);
    }
  });
}

var cryptText = function(text) {
  return bcrypt.genSaltAsync(5)
  .then(function (salt) {
    return bcrypt.hashAsync(text, salt, null);
  })
  .then(function (hash) {
    return hash;
  });
}

module.exports.cipher = cipherText;
module.exports.decipher = decipherText;
module.exports.crypt = cryptText;
