exports.getBytes = function(x) {
  var buff = Buffer.alloc(4);
  buff.writeInt32LE(x);
  return buff;
};
  
exports.IntToHex = function(num) {
  if (num < 0)
    num += 256;
  return num.toString(16);
};

exports.hexToInt = function(hex) {
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }
  var num = parseInt(hex, 16);
  var maxVal = Math.pow(2, hex.length / 2 * 8);
  if (num > maxVal / 2 - 1) {
      num = num - maxVal;
  }
  return num;
};