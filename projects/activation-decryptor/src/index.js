// const { aesEncrypt } = require('./encrypt');
const { parseCaptcha } = require('./decrypt');

const kukaUrl = process.argv[2];

const captcha = parseCaptcha(kukaUrl);

console.log(captcha);