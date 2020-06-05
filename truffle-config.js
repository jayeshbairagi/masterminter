require('babel-register')
require('babel-polyfill')

module.exports = {
  networks: {
    test: {
      host: 'localhost',
      port: 8545,
      network_id: '*' // eslint-disable-line camelcase
    }
  },
  compilers: {
    solc: {
      version: '0.5.17'
    }
  }
}
