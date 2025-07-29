pragma solidity 0.8.20; //Do not change the solidity version as it negatively impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// learn more: https://docs.openzeppelin.com/contracts/4.x/erc20

contract YourToken is ERC20 {

    constructor() ERC20("Group9", "G9") {
        address initialTokenOwner = msg.sender;
        _mint(initialTokenOwner, 1000* (10**18)); // 1000 tokens, msg sender aka minter will be initial Owner of all tokens
    }


}
