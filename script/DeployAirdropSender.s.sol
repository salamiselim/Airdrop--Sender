// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import "forge-std/Script.sol";
import "../src/AirdropSender.sol";

contract DeployAirdropSender is Script {
    function run() external {
        vm.startBroadcast();
        new AirdropSender();
        vm.stopBroadcast();
    }
}
