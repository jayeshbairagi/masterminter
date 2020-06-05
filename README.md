# Master Minter

## Dependencies

| Dependency | Version                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------- |
| Metamask   | [7.7.9](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en-GB) |
| Node       | v11.0.0                                                                                               |

## Steps to execute contract functionalities

**Note:** Deployed contract address: [0x32aB83680353EEF7083C772D74BB7CDAFbBdf1C6](https://ropsten.etherscan.io/address/0x32aB83680353EEF7083C772D74BB7CDAFbBdf1C6)

1. Install the dependencies

```sh
npm install
```

1. Run,

```sh
npm run remixd
```

1. Login to the `Metamask` with mnemonic `pig skull wine supply april fluid thing emerge pistol crucial crush cactus` and select the first account to execute the owner authorised functionalities.

1. Open [Remix solidity browser](https://remix.ethereum.org/)

1. Attach remixd to the solidity browser to set up the contracts.

1. Select compiler version `0.5.17+commit.d19bba13` and compile the contracts.

1. Select the `MasterMinter` contract from the sidebar

1. Instead of deploying the contract click on `At Address` with the `MasterMinter` deployed contract address in parameters(deployed contract address: [0x32aB83680353EEF7083C772D74BB7CDAFbBdf1C6](https://ropsten.etherscan.io/address/0x32aB83680353EEF7083C772D74BB7CDAFbBdf1C6))

1. Execute functions, to

- register a new minter as a owner, execute the function `registerMinter` with minter address in parameters.
- request mint as a minter, execute the function `requestMint` with the investor address and token amount in parameters.
- approve mint as a owner, execute the function `approveMintTokens` with the minter address, investor address and token amount as parameters.
- reject mint as a owner, execute the function `rejectMintTokens` with the minter address, investor address and token amount as parameters.
- mint tokens as a owner, execute the function `mintTokens` with the investor address and token amount as parameters.
- burn tokens as a user, execute the function `burnTokens` with the token amount as the parameter.
- check the balance of an investor, execute the function `balanceOf` with the investor address as the parameter.
- check if the minter is registered or not, execute the function `registeredMinter` with the minter address as the parameter
- check the remaining requested token amount, execute the function `requestedTokenAmount` with the minter address and investor address as parameters.</br>
  **Note:** All the rest of the ERC20 functions can be performed as usual.

## Steps to run test-cases

1. Install the dependencies

```sh
npm install
```

1. Compile the contracts, run

```sh
npm run compile
```

1. Run test-cases

```sh
npm run test
```
