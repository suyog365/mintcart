// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LoyaltyToken is ERC20, Ownable {
    mapping(address => bool) public minters;

    event PointsAwarded(address indexed user, uint256 amount);
    event PointsRedeemed(address indexed user, uint256 amount);

    constructor() ERC20("LoyaltyPoints", "LPTS") Ownable(msg.sender) {
        minters[msg.sender] = true;
    }

    function setMinter(address _minter, bool _status) external onlyOwner {
        minters[_minter] = _status;
    }

    // Award points to a user (called by the backend)
    function awardPoints(address _user, uint256 _amount) external {
        require(minters[msg.sender], "Not authorized to mint");
        _mint(_user, _amount);
        emit PointsAwarded(_user, _amount);
    }

    // Redeem points from the caller's own balance (user calls directly)
    function redeemPoints(uint256 _amount) external {
        _burn(msg.sender, _amount);
        emit PointsRedeemed(msg.sender, _amount);
    }

    // Admin redeems points on behalf of a user (backend calls)
    function adminRedeem(address _user, uint256 _amount) external {
        require(minters[msg.sender], "Not authorized to mint");
        _burn(_user, _amount);
        emit PointsRedeemed(_user, _amount);
    }
}