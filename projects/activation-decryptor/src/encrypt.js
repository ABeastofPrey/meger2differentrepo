const CryptoJS = require('crypto-js');
const key = CryptoJS.enc.Utf8.parse('kukalbsqrcode123');
const iv = CryptoJS.enc.Utf8.parse('lbsqrcodekuka123');

const aesEncrypt = rawText => {
    const parse2Utf8 = CryptoJS.enc.Utf8.parse(rawText);
    const aesOptions = { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Iso10126 };
    const aesEcrypted = CryptoJS.AES.encrypt(parse2Utf8, key, aesOptions);
    const convert2Base64 = CryptoJS.enc.Base64.stringify(aesEcrypted.ciphertext);
    return convert2Base64;
};

module.exports = { aesEncrypt };
