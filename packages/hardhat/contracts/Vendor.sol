pragma solidity 0.8.20; //Do not change the solidity version as it negatively impacts submission grading
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./YourToken.sol";

contract Vendor is Ownable, ReentrancyGuard{
    event BuyTokens(address buyer, uint256 amountOfETH, uint256 amountOfTokens);
    event SellTokens(address seller, uint256 amountOfETH, uint256 amountOfTokens);

    YourToken public yourToken;
    uint public constant tokensPerEth = 100;

    constructor(address tokenAddress) Ownable (msg.sender) {
        yourToken = YourToken(tokenAddress);
    }

    // create a payable buyTokens() function:
    function buyTokens() payable external {
        // msg.sender is the buyer of the tokens, they will use ETH amt sent in msg.data to buy tokens
        uint256 ethInput = msg.value;
        uint256 tokensVendorDispense = tokensPerEth * ethInput * 10 ** 18;
        // check if vendor has enough
        require(tokensVendorDispense <= yourToken.balanceOf(address(this)), " insuffcient tokens to dispense");
        // transfer token to user
        yourToken.transfer(msg.sender, tokensVendorDispense); //transfer token from Vendor (already transfer all 1000 tokens to vendor in deploy scripts) to msg sender 
        // user can pay eth to this vendor contract because this function is payable, hence can receive eth
        emit BuyTokens(msg.sender, ethInput, tokensVendorDispense);
    }

    // create a withdraw() function that lets the owner withdraw  ALL ETH belonging to vendor contract
    function withdraw() external  onlyOwner  nonReentrant(){
        uint256 balance = address(this).balance;
        require(balance >0, "No eth to withdraw");
        (bool sent, ) = owner().call{value: balance}("");
        require(sent, "Withdrawal failed");
    }

    //  create a sellTokens(uint256 _amount) function, user sell token to vendor
    function sellTokens(uint256 tokenInput) external {
        require( tokenInput > 0, "token input must be positive");
        uint ethVendorToDispense = tokenInput / tokensPerEth * 10 ** 18; 
        //check if vendor has enough ETH to return to caller
        require(ethVendorToDispense <= address(this).balance, " insufficient ETH to dispense");

        //vendor transfer token from user back to vendor , can only succeed if user already approved vendor as a spender to transfer tokens on their behalf
        yourToken.transferFrom( msg.sender, address(this), tokenInput * 10 ** 18);
        
        // transfer eth to user
        (bool sent, ) = msg.sender.call{value: ethVendorToDispense}("");
        require(sent, " ETH transfer failed");


    }
}
