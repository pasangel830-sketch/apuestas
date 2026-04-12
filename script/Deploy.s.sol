// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MockOracle} from "../src/MockOracle.sol";
import {PorraFactory} from "../src/PorraFactory.sol";

contract DeployScript is Script {
    function run() public {
        vm.startBroadcast();
        MockOracle oracle = new MockOracle();
        PorraFactory factory = new PorraFactory(address(oracle));
        vm.stopBroadcast();
        console.log("MockOracle:", address(oracle));
        console.log("PorraFactory:", address(factory));
    }
}
