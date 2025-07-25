pragma solidity 0.8.20; //Do not change the solidity version as it negatively impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "./YourToken.sol";

contract Vendor is Ownable{
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event SellTokens(address seller, uint256 amountOfETH, uint256 amountOfTokens);

    YourToken public yourToken;
    uint public constant tokensPerEth = 100;

    constructor(address tokenAddress) Ownable (msg.sender) {
        yourToken = YourToken(tokenAddress);
    }

    // ToDo: create a payable buyTokens() function:
    function buyTokens() payable public {
        // msg.sender is the buyer of the tokens, they will pay some ETH in msg.data
        uint ethInput = msg.value;
        uint256 tokensBought = tokensPerEth * ethInput;
        // check if vendor has enough
        require(tokensBought<= yourToken.balanceOf(address(this)), " insuffcient tokens to dispense");
        yourToken.transfer(msg.sender, tokensBought); //transfer token from 
        emit BuyTokens(msg.sender, ethInput, tokensBought);
    }

    // ToDo: create a withdraw() function that lets the owner withdraw ETH
    // function withdraw
    // ToDo: create a sellTokens(uint256 _amount) function:
}
