// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BitFuelToken is ERC20, Ownable {

	uint256 private _totalSupply = 6000000000 * 10**decimals();
	uint public circulatingSupply;
	uint256 private _rate =  0.0001 ether;	 // 0.0001 eth

	constructor() ERC20("BitFuel", "BFUEL") {
		_mint(msg.sender, 1000000000 * 10**decimals());
		circulatingSupply = 1000000000 * 10**decimals();
	}

	receive() external payable {
		buyTokens(_msgSender());
	}

	function buyTokens(address addr) private  {
		uint256 weiAmount = msg.value;
		// calculate token amount to be created
		uint256 tokens = _getTokenAmount(weiAmount);
        require(circulatingSupply + tokens <= _totalSupply,"can't mint more than Total Supply");
		circulatingSupply = circulatingSupply + tokens;
		_mint(addr, tokens);
	}

	function totalSupply() public view virtual override returns (uint256) {
        return _totalSupply;
    }

	function _getTokenAmount(uint256 weiAmount)	internal view returns (uint256)
	{
		return (weiAmount / _rate) * 10**decimals();
	}

	function withdraw() public onlyOwner {
        require(address(this).balance > 0, "Balance must be positive");
            
        uint256 _balance = address(this).balance;
        payable(msg.sender).transfer(_balance);
    }

	function rate() public view returns(uint256){
		return _rate;
	}
	
}
