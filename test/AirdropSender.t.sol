// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Test.sol";
import "../src/AirdropSender.sol";

contract TSenderTest is Test {
    AirdropSender public Airdropsender;

    function setUp() public {
        Airdropsender = new AirdropSender();
    }

    function testContractDeploys() public view {
        assert(address(Airdropsender) != address(0));
    }
}
