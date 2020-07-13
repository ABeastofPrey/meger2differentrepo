const CryptoJS = require('crypto-js');
const key = CryptoJS.enc.Utf8.parse('kukalbsqrcode123');
const iv = CryptoJS.enc.Utf8.parse('lbsqrcodekuka123');

const aesDecrypt = encText => {
    const aesOptions = { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Iso10126 };
    const aesDerypted = CryptoJS.AES.decrypt(encText, key, aesOptions);
    return aesDerypted.toString(CryptoJS.enc.Utf8);
};


const getKukaPar = url => {
    const lastIndex = url.lastIndexOf('deviceactivation/') + 'deviceactivation/'.length;
    const parameter = url.slice(lastIndex);
    return parameter;
};

const getKukaKey = par => par.split(',').pop().split(':').pop();


const parseCaptcha = url => getKukaKey(aesDecrypt(getKukaPar(url)));

module.exports = { aesDecrypt, parseCaptcha };
