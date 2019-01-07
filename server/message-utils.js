const bitOperations = require('./bit-operations.js');
const consts = require('./const.js');

var decoderPhase;
var StaticSerialBytesArr = [];
for (var b of consts.StaticSerialBytes)
  StaticSerialBytesArr.push(bitOperations.hexToInt(b.toString(16)));

// Message decoding variables
var currFrameType = 'INVALID_FRAME';
var headerBytes = Buffer.alloc(consts.MsgHeaderLength);
var lastByte;
var buffIdx = 0;
var expectedDataLen = 0;
var frameBuffer = null;
var decoderPhase = 0; // current phase: 0 - waiting, 1 - header, 2 - data

exports.decodeMessage = function(inByte) {
  const byteAsInt = bitOperations.hexToInt(inByte.toString(16));
  switch (decoderPhase) {
    case 0: // wait for message start
      if (byteAsInt === StaticSerialBytesArr[0]) {
        headerBytes[0] = lastByte;
        headerBytes[1] = inByte;
        buffIdx = 2;
        decoderPhase = 1;
      }
      break;
    case 1: // message start detected, trying ot decode header
      headerBytes[buffIdx++] = inByte;
      if (buffIdx === consts.MsgHeaderLength) { // probably filled header
        // check magic number
        var frameOk
                = bitOperations.hexToInt(headerBytes[1].toString(16)) === StaticSerialBytesArr[0] && bitOperations.hexToInt(headerBytes[2].toString(16)) === StaticSerialBytesArr[1]
                && bitOperations.hexToInt(headerBytes[3].toString(16)) === StaticSerialBytesArr[2] && bitOperations.hexToInt(headerBytes[4].toString(16)) === StaticSerialBytesArr[3];
        var ftIdx = consts.FrameTypeBytes.indexOf(headerBytes[0]);
        frameOk = frameOk && ftIdx > 0;
        if (!frameOk) {
          decoderPhase = 0;
          buffIdx = 0;
          return;
        }
        currFrameType = consts.FrameTypes[ftIdx];
        decoderPhase = 2;
        try {
          expectedDataLen = headerBytes.readInt16LE(5);
        } catch (e) {
          return;
        }
        if (expectedDataLen === 0) {
          decoderPhase = 0;
          buffIdx = 0;
          return;
        }
        frameBuffer = Buffer.alloc(expectedDataLen);
        headerBytes.copy(frameBuffer);
        buffIdx = consts.MsgHeaderLength;
      }
      break;
    case 2: // retrieving message data and looking for message end
      frameBuffer[buffIdx++] = inByte;
      if (buffIdx === expectedDataLen) {
        var calcedCrc = makeCRC(frameBuffer, expectedDataLen - 2);
        var inCrc = 0;
        try {
          var tbts = Buffer.from([frameBuffer[expectedDataLen - 2], frameBuffer[expectedDataLen - 1], 0, 0]);
          inCrc = tbts.readInt32LE();
        } catch (e) {
          return;
        }
        if (calcedCrc !== inCrc) { // message was finished but with an error
          currFrameType = 'INVALID_FRAME';
          decoderPhase = 0;
          buffIdx = 0;
          return;
        }
        //if (callBacks!=null) {
        // message received OK
        var msg = B2String(frameBuffer,consts.MsgHeaderLength,expectedDataLen-consts.MsgHeaderLength-2);
        if (currFrameType === 'DATA_FRAME' || currFrameType === 'ERROR_FRAME')
          console.log(msg);
        //}
        decoderPhase = 0;
        buffIdx = 0;
      }
      break;
  }
  lastByte = byteAsInt;
};

function B2String(data, start, len) {
  var startIdx = start ? start : 0;
  var runLength= len ? len : data.length-startIdx;
  var endIdx = startIdx + runLength;
  var s = data.toString();
  return s.substring(startIdx,endIdx);
}

exports.makeMessage = function(msg) {
  // build basic header
  msg = msg + '\n';
  var msgBytes = Buffer.from(msg);
  var serNum = consts.StaticSerialNum; // (INT)
  var useCount = msgBytes.length + consts.MsgHeaderLength + 1; // (INT)
  var totLen = useCount + 2; // save place for the CRC (SHORT)
  // convert to byte array
  var outBuff = Buffer.alloc(totLen);
  outBuff[0] = consts.FrameTypeBytes[2];
  outBuff.writeInt32LE(serNum, 1, 4);
  outBuff.writeInt16LE(totLen, 5, 2);
  outBuff.writeInt32LE(123, 7, 4);
  outBuff.writeInt32LE(0, 11, 4);
  outBuff.writeInt16LE(1, 15, 2);
  outBuff.writeInt16LE(1, 17, 2);
  msgBytes.copy(outBuff,consts.MsgHeaderLength);
  outBuff[consts.MsgHeaderLength + msgBytes.length + 1] = 0;
  var crc = makeCRC(outBuff, useCount);
  // convert crc to buffer, and write first 2 bytes into outBuff
  var crcToBuff = bitOperations.getBytes(crc);
  crcToBuff.copy(outBuff,outBuff.length - 2);
  return outBuff;
};

function makeCRC(buff, useCount) {
  // CRC calculator
  var usCrc = consts.CRCInit;
  var buffIdx = 0;
  while (useCount > 0) { //Start from end to begin
    useCount--;
    var index = ((usCrc & 0xffff) >>> 8 ^ buff[buffIdx++]) & 0xff;
    usCrc = (consts.CRCTable[index] ^ usCrc << 8) & 0xffff;   //Compute usCrc
  }
  return usCrc & 0xffff;
}