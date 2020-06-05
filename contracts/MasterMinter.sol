pragma solidity ^0.5.17;

import "./math/SafeMath.sol";
import "./access/Ownable.sol";
import "./proxy/Implementation.sol";
import "./token/ERC20/ERC20.sol";


/**
 * @title MasterMinter
 * @dev The MasterMinter contract is an ERC20 standard based token implementation
 * It extends the Implementation(for proxy based upgradeability), Ownable, ERC20 functionality
 */
contract MasterMinter is Implementation, Ownable, ERC20 {


    /* Usings */

    using SafeMath for uint256;


    /* Events */

    event MinterRegistered(address indexed registeredMinter);
    event MintTokenRequested(
        address indexed registeredMinter,
        address indexed investorAddress,
        uint256 tokenAmount
    );
    event MintTokenRejected(
        address indexed registeredMinter,
        address indexed investorAddress,
        uint256 tokenAmount
    );


    /* Modifiers */

    modifier isMasterMinterSetup() {
        require(isSetup);
        _;
    }

    modifier isRegisteredMinter(address minter) {
        require(registeredMinter[minter]);
        _;
    }

    modifier isAddressValid(address addr) {
        require(addr != address(0x0));
        _;
    }


    /* Storage */

    // Mapping to store the approved registered minters by the owner.
    mapping (address /* minterAddress */ => bool) public registeredMinter;

    // Mapping to store the requested token amount by the minter for an investor.
    mapping (address /* minterAddress */ =>
        mapping(address /* investorAddress */ => uint256)
    ) public requestedTokenAmount;

    string private name_;
    string private symbol_;
    uint8 private decimals_;


    /* External functions */

    /**
     * @dev Allows setting up of MasterMinter, sets the isSetup to true.
     *      Only the proxy owner can setup the master minter setup.
     * @param _name string The name of the token.
     * @param _symbol string The symbol of the token.
     * @param _decimals uint The decimals for the token.
     */
    function setup(
        string calldata _name,
        string calldata _symbol,
        uint8 _decimals
    )
        external
        onlyOwner
    {
        require(bytes(name_).length == 0 && bytes(_name).length > 0);
        require(bytes(symbol_).length == 0 && bytes(_symbol).length > 0);
        require(decimals_ == 0 && _decimals > 0);

        name_ = _name;
        symbol_ = _symbol;
        decimals_ = _decimals;

        isSetup = true;
    }

    /**
     * @return the name of the token.
     */
    function name() external view returns (string memory) {
        return name_;
    }

    /**
     * @return the symbol of the token.
     */
    function symbol() external view returns (string memory) {
        return symbol_;
    }

    /**
     * @return the decimals value of the token.
     */
    function decimals() external view returns (uint8) {
        return decimals_;
    }

    /**
     * @dev Allows registration of minter.
     *      Only the owner can register new minter.
     * @param minterAddress address The address of the minter.
     */
    function registerMinter(
        address minterAddress
    )
        external
        onlyOwner
        isMasterMinterSetup
        isAddressValid(minterAddress)
    {
        require(!registeredMinter[minterAddress]);

        registeredMinter[minterAddress] = true;

        emit MinterRegistered(minterAddress);
    }

    /**
     * @dev Allows to request for minting by registered minters.
     *      Can be called by the registered minters only.
     * @param investorAddress address The address of the investor.
     * @param tokenAmount uint The requested MasterMinter token amount for minting.
     */
    function requestMint(
        address investorAddress,
        uint256 tokenAmount
    )
        external
        isMasterMinterSetup
        isRegisteredMinter(msg.sender)
        isAddressValid(investorAddress)
    {
        require(tokenAmount > 0);

        requestedTokenAmount[msg.sender][investorAddress] = requestedTokenAmount[msg.sender][investorAddress].add(tokenAmount);

        emit MintTokenRequested(msg.sender, investorAddress, tokenAmount);
    }

    /**
     * @dev Approve minting of MasterMinter Token to investors.
     *      Can be called by the owner only.
     * @param minter address The address of the minter.
     * @param investorAddress address The address of the investor.
     * @param tokenAmount uint The MasterMinter token amount to be allocated.
     */
    function approveMintTokens(
        address minter,
        address investorAddress,
        uint tokenAmount
    )
        external
        onlyOwner
        isMasterMinterSetup
        isRegisteredMinter(minter)
    {
        require(requestedTokenAmount[minter][investorAddress].sub(tokenAmount) >= 0);

        requestedTokenAmount[minter][investorAddress] = requestedTokenAmount[minter][investorAddress].sub(tokenAmount);

        _mint(investorAddress, tokenAmount);
    }

    /**
     * @dev Reject minting of MasterMinter Token to investors by minters.
     *      Can be called by the owner only.
     * @param minter address The address of the minter.
     * @param investorAddress address The address of the investor.
     * @param tokenAmount uint The MasterMinter token amount to be allocated.
     */
    function rejectMintTokens(
        address minter,
        address investorAddress,
        uint tokenAmount
    )
        external
        onlyOwner
        isMasterMinterSetup
        isRegisteredMinter(minter)
    {
        require(requestedTokenAmount[minter][investorAddress].sub(tokenAmount) >= 0);

        requestedTokenAmount[minter][investorAddress] = requestedTokenAmount[minter][investorAddress].sub(tokenAmount);

        emit MintTokenRejected(minter, investorAddress, tokenAmount);
    }

    /**
     * @dev Allows minting of investor MasterMinter Token directly.
     *      Can only be called by the owner.
     * @param amount uint The MasterMinter token amount to be minter.
     */
    function mintTokens(
        address investorAddress,
        uint amount
    )
        external
        onlyOwner
        isMasterMinterSetup
    {
        _mint(investorAddress, amount);
    }

    /**
     * @dev Allows burning of investor MasterMinter Token.
     * @param amount uint The MasterMinter token amount to be burned.
     */
    function burnTokens(uint amount) external {
        _burn(msg.sender, amount);
    }
}
