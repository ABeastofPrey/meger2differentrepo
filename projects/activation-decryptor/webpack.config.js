const path = require('path');

module.exports = {
    entry: {
        decrypt: './src/decrypt.js',
        encrypt: './src/encrypt.js',
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "umd",
        globalObject: "this",
    },
    mode: "production"
};
