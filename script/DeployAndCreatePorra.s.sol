// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MockOracle} from "../src/MockOracle.sol";
import {PorraFactory} from "../src/PorraFactory.sol";
import {PorraGame} from "../src/PorraGame.sol";

/// @notice Despliega Oracle + Factory y crea una porra con 3 participantes y 5 ETH de stake (mismo caso que el frontend)
contract DeployAndCreatePorraScript is Script {
    function run() public {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address[] memory participants = new address[](3);
        participants[0] = vm.addr(deployerPrivateKey);
        participants[1] = vm.addr(1);
        participants[2] = vm.addr(2);
        string[] memory nicknames = new string[](3);
        nicknames[0] = "Cuenta0";
        nicknames[1] = "Cuenta1";
        nicknames[2] = "Cuenta2";
        bytes32 matchId = keccak256("atleti-vs-rival");
        uint256 bettingDeadline = block.timestamp + 1 days;
        uint256 matchEndTime = block.timestamp + 2 days;
        uint256 stakeAmount = 5 ether;

        vm.startBroadcast(deployerPrivateKey);
        MockOracle oracle = new MockOracle();
        PorraFactory factory = new PorraFactory(address(oracle));
        (address gameAddr, address wlAddr) = factory.createPorra(
            participants,
            nicknames,
            matchId,
            bettingDeadline,
            matchEndTime,
            stakeAmount
        );
        PorraGame g = PorraGame(payable(gameAddr));
        g.placeBet{value: 5 ether}(0);
        vm.stopBroadcast();

        console.log("MockOracle:", address(oracle));
        console.log("PorraFactory:", address(factory));
        console.log("Porra (game):", gameAddr);
        console.log("WhitelistManager:", wlAddr);
        console.log("Stake:", g.stake());
        console.log("PlaceBet OK, totalPot:", g.totalPot());
    }
}
