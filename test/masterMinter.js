/* global artifacts contract before assert it describe */

import log from './helpers/logger'
import assertRevert from './helpers/assertRevert'

const MasterMinter = artifacts.require('MasterMinter')
const Proxy = artifacts.require('Proxy')

contract('MasterMinter', (accounts) => {
  let masterMinterContract
  let proxyContract
  const name = 'MasterMinter'
  const symbol = 'MM'
  const decimals = 18
  const owner = accounts[0]
  const validMinter = accounts[1]
  const inValidMinter = accounts[2]
  const validInvestorAddress = accounts[3]
  const inValidInvestorAddress = '0x0000000000000000000000000000000000000000'
  const validTokenAmount = 100000000
  const inValidTokenAmount = 0
  const higherInValidTokenAmount = 1000000000

  before(async () => {
    const masterMinter = await MasterMinter.new({ from: owner })
    log(`masterMinter: deployment gasUsed: ${masterMinter.constructor.class_defaults.gas}`)

    proxyContract = await Proxy.new(masterMinter.address, { from: owner })
    log(`proxyContract: deployment gasUsed: ${proxyContract.constructor.class_defaults.gas}`)

    masterMinterContract = await MasterMinter.at(proxyContract.address)
    await masterMinterContract.setup(name, symbol, decimals, { from: owner })
  })

  describe('MasterMinter Token contract', async () => {
    it('Deployer is set as the owner', async () => {
      const _owner = await masterMinterContract.owner()

      assert.equal(_owner, owner)
    })

    it('Name is set properly', async () => {
      const _name = await masterMinterContract.name()

      assert.equal(_name, name)
    })

    it('Symbol is set properly', async () => {
      const _symbol = await masterMinterContract.symbol()

      assert.equal(_symbol, symbol)
    })

    it('Decimals are set properly', async () => {
      const _decimals = await masterMinterContract.decimals()

      assert.equal(+_decimals, decimals)
    })
  })

  describe('MasterMinter::registerMinter()', async () => {
    it('Rejects when not called by owner', async () => {
      try {
        await masterMinterContract.registerMinter(validMinter, { from: accounts[9] })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Registers new minter successfully', async () => {
      const tx = await masterMinterContract.registerMinter(validMinter, { from: owner })

      const isRegistered = await masterMinterContract.registeredMinter(validMinter)

      assert.equal(isRegistered, true)
      log(`registerMinter gasUsed: ${tx.receipt.gasUsed}`)
    })

    it('Rejects when minter is already registered', async () => {
      try {
        await masterMinterContract.registerMinter(validMinter, { from: owner })
      } catch (error) {
        assertRevert(error)
      }
    })
  })

  describe('MasterMinter::requestMint()', async () => {
    it('Rejects when minter is not registered', async () => {
      try {
        await masterMinterContract.requestMint(validInvestorAddress, validTokenAmount, { from: inValidMinter })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Rejects when investor is invalid', async () => {
      try {
        await masterMinterContract.requestMint(inValidInvestorAddress, validTokenAmount, { from: validMinter })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Rejects when token amount is invalid', async () => {
      try {
        await masterMinterContract.requestMint(validInvestorAddress, inValidTokenAmount, { from: validMinter })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Registers mint request', async () => {
      const tx = await masterMinterContract.requestMint(validInvestorAddress, validTokenAmount, { from: validMinter })

      const event = tx.logs.find(e => e.event === 'MintTokenRequested')
      const requestedTokenAmount = await masterMinterContract.requestedTokenAmount(validMinter, validInvestorAddress)

      assert.equal(requestedTokenAmount, validTokenAmount)
      assert.exists(event)
      log(`requestMint gasUsed: ${tx.receipt.gasUsed}`)
    })
  })

  describe('MasterMinter::approveMintTokens()', async () => {
    it('Rejects when not called by owner', async () => {
      try {
        await masterMinterContract.approveMintTokens(validMinter, validInvestorAddress, validTokenAmount, { from: accounts[9] })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Rejects when minter is not registered', async () => {
      try {
        await masterMinterContract.approveMintTokens(inValidMinter, validInvestorAddress, validTokenAmount, { from: owner })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Rejects when investor is invalid', async () => {
      try {
        await masterMinterContract.approveMintTokens(validMinter, inValidInvestorAddress, validTokenAmount, { from: owner })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Mints token to investor', async () => {
      const initialBalance = await masterMinterContract.balanceOf(validInvestorAddress)
      const initialPermittedTokenAmount = await masterMinterContract.requestedTokenAmount(validMinter, validInvestorAddress)

      const tx = await masterMinterContract.approveMintTokens(validMinter, validInvestorAddress, validTokenAmount, { from: owner })

      const finalBalance = await masterMinterContract.balanceOf(validInvestorAddress)
      const finalPermittedTokenAmount = await masterMinterContract.requestedTokenAmount(validMinter, validInvestorAddress)
      const event = tx.logs.find(e => e.event === 'Transfer')

      assert.equal((+initialBalance + validTokenAmount), +finalBalance)
      assert.equal(+initialPermittedTokenAmount, (+finalPermittedTokenAmount + validTokenAmount))
      assert.exists(event)
      log(`approveMintTokens gasUsed: ${tx.receipt.gasUsed}`)
    })

    it('Rejects when permitted mint amount is exhausted', async () => {
      try {
        await masterMinterContract.approveMintTokens(validMinter, validInvestorAddress, validTokenAmount, { from: owner })
      } catch (error) {
        assertRevert(error)
      }
    })
  })

  describe('MasterMinter::rejectMintTokens()', async () => {
    it('Rejects when not called by owner', async () => {
      try {
        await masterMinterContract.rejectMintTokens(validMinter, validInvestorAddress, validTokenAmount, { from: accounts[9] })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Rejects when minter is not registered', async () => {
      try {
        await masterMinterContract.rejectMintTokens(inValidMinter, validInvestorAddress, validTokenAmount, { from: owner })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Rejects when investor is invalid', async () => {
      try {
        await masterMinterContract.rejectMintTokens(validMinter, inValidInvestorAddress, validTokenAmount, { from: owner })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Mints token to investor', async () => {
      const initialBalance = await masterMinterContract.balanceOf(validInvestorAddress)

      const tx1 = await masterMinterContract.requestMint(validInvestorAddress, validTokenAmount, { from: validMinter })

      const initialPermittedTokenAmount = await masterMinterContract.requestedTokenAmount(validMinter, validInvestorAddress)

      const tx2 = await masterMinterContract.rejectMintTokens(validMinter, validInvestorAddress, validTokenAmount, { from: owner })

      const event = tx2.logs.find(e => e.event === 'MintTokenRejected')
      const finalBalance = await masterMinterContract.balanceOf(validInvestorAddress)
      const finalPermittedTokenAmount = await masterMinterContract.requestedTokenAmount(validMinter, validInvestorAddress)

      assert.exists(event)
      assert.equal(+initialBalance, +finalBalance)
      assert.equal(+initialPermittedTokenAmount, (+finalPermittedTokenAmount + validTokenAmount))
      log(`requestMint gasUsed: ${tx1.receipt.gasUsed}`)
      log(`rejectMintTokens gasUsed: ${tx2.receipt.gasUsed}`)
    })

    it('Rejects when permitted mint amount is exhausted', async () => {
      try {
        await masterMinterContract.rejectMintTokens(validMinter, validInvestorAddress, validTokenAmount, { from: owner })
      } catch (error) {
        assertRevert(error)
      }
    })
  })

  describe('MasterMinter::mintTokens()', async () => {
    it('Rejects when not called by owner', async () => {
      try {
        await masterMinterContract.mintTokens(validInvestorAddress, validTokenAmount, { from: accounts[9] })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Rejects when investor address in invalid', async () => {
      try {
        await masterMinterContract.mintTokens(inValidInvestorAddress, validTokenAmount, { from: owner })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Rejects when token amount in invalid', async () => {
      try {
        await masterMinterContract.mintTokens(validInvestorAddress, inValidTokenAmount, { from: owner })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Mint token amount successfully', async () => {
      const initialBalance = await masterMinterContract.balanceOf(validInvestorAddress)

      const tx = await masterMinterContract.mintTokens(validInvestorAddress, validTokenAmount, { from: owner })

      const finalBalance = await masterMinterContract.balanceOf(validInvestorAddress)
      const event = tx.logs.find(e => e.event === 'Transfer')

      assert.equal((+initialBalance + validTokenAmount), +finalBalance)
      assert.exists(event)
      log(`mintTokens gasUsed: ${tx.receipt.gasUsed}`)
    })
  })

  describe('MasterMinter::burnTokens()', async () => {
    it('Rejects when token amount is higher than balance', async () => {
      try {
        await masterMinterContract.burnTokens(higherInValidTokenAmount, { from: validInvestorAddress })
      } catch (error) {
        assertRevert(error)
      }
    })

    it('Burn token amount successfully', async () => {
      const initialBalance = await masterMinterContract.balanceOf(validInvestorAddress)

      const tx = await masterMinterContract.burnTokens(validTokenAmount, { from: validInvestorAddress })

      const finalBalance = await masterMinterContract.balanceOf(validInvestorAddress)
      const event = tx.logs.find(e => e.event === 'Transfer')

      assert.equal(+initialBalance, (+finalBalance + validTokenAmount))
      assert.exists(event)
      log(`burnTokens gasUsed: ${tx.receipt.gasUsed}`)
    })
  })
})
