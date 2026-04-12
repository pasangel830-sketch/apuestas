// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {PorraFactory} from "../src/PorraFactory.sol";
import {MockOracle} from "../src/MockOracle.sol";
import {PorraGame} from "../src/PorraGame.sol";

contract PorraFactoryTest is Test {
    PorraFactory public factory;
    MockOracle public oracle;

    address alice = address(0x1);
    address bob = address(0x2);
    address carol = address(0x3);

    bytes32 matchId = keccak256("match-1");
    uint256 bettingDeadline;
    uint256 matchEndTime;

    function setUp() public {
        oracle = new MockOracle();
        factory = new PorraFactory(address(oracle));
        bettingDeadline = block.timestamp + 1 days;
        matchEndTime = block.timestamp + 2 days;
    }

    function test_CreatePorra() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;
        string[] memory nicknames = new string[](2);
        nicknames[0] = "Alice";
        nicknames[1] = "Bob";
        vm.prank(alice);
        (address gameAddr, address wlAddr) = factory.createPorra(
            participants,
            nicknames,
            matchId,
            bettingDeadline,
            matchEndTime,
            0.001 ether
        );
        assertTrue(gameAddr != address(0));
        assertTrue(wlAddr != address(0));
        assertEq(factory.getPorrasCount(), 1);
        assertEq(factory.getPorraAt(0), gameAddr);

        address[] memory created = factory.getPorrasByCreator(alice);
        assertEq(created.length, 1);
        assertEq(created[0], gameAddr);

        address[] memory forAlice = factory.getPorrasByParticipant(alice);
        address[] memory forBob = factory.getPorrasByParticipant(bob);
        assertEq(forAlice.length, 1);
        assertEq(forAlice[0], gameAddr);
        assertEq(forBob.length, 1);
        assertEq(forBob[0], gameAddr);

        PorraGame g = PorraGame(payable(gameAddr));
        assertEq(g.matchId(), matchId);
        assertEq(g.bettingDeadline(), bettingDeadline);
        assertEq(g.stake(), 0.001 ether);
        assertEq(uint256(g.gameState()), uint256(PorraGame.GameState.Betting));
    }

    function test_MultiplePorras() public {
        address[] memory p1 = new address[](2);
        p1[0] = alice;
        p1[1] = bob;
        address[] memory p2 = new address[](2);
        p2[0] = bob;
        p2[1] = carol;
        string[] memory n1 = new string[](2);
        n1[0] = "A";
        n1[1] = "B";
        string[] memory n2 = new string[](2);
        n2[0] = "B";
        n2[1] = "C";
        vm.prank(alice);
        factory.createPorra(p1, n1, matchId, bettingDeadline, matchEndTime, 0.001 ether);
        vm.prank(bob);
        factory.createPorra(p2, n2, keccak256("match-2"), bettingDeadline, matchEndTime, 0.001 ether);
        assertEq(factory.getPorrasCount(), 2);
        assertEq(factory.getPorrasByCreator(alice).length, 1);
        assertEq(factory.getPorrasByCreator(bob).length, 1);
    }

    /// Simula exactamente lo que hace el frontend: 3 participantes, 5 ETH de stake
    function test_CreatePorra_ThreeParticipants_5Eth() public {
        address[] memory participants = new address[](3);
        participants[0] = alice;
        participants[1] = bob;
        participants[2] = carol;
        string[] memory nicknames = new string[](3);
        nicknames[0] = "Alice";
        nicknames[1] = "Bob";
        nicknames[2] = "Carol";
        vm.prank(alice);
        (address gameAddr, address wlAddr) = factory.createPorra(
            participants,
            nicknames,
            matchId,
            bettingDeadline,
            matchEndTime,
            5 ether
        );
        assertTrue(gameAddr != address(0));
        assertTrue(wlAddr != address(0));
        PorraGame g = PorraGame(payable(gameAddr));
        assertEq(g.stake(), 5 ether);
        assertEq(uint256(g.gameState()), uint256(PorraGame.GameState.Betting));
    }

    /// Flujo completo: crear porra 5 ETH, cuenta 2 (bob) hace placeBet "Atlético gana"
    function test_CreatePorra_5Eth_ThenPlaceBet_FromSecondAccount() public {
        address[] memory participants = new address[](3);
        participants[0] = alice;
        participants[1] = bob;
        participants[2] = carol;
        vm.deal(alice, 20 ether);
        vm.deal(bob, 20 ether);
        vm.deal(carol, 20 ether);

        string[] memory nicknames = new string[](3);
        nicknames[0] = "Alice";
        nicknames[1] = "Bob";
        nicknames[2] = "Carol";
        vm.prank(alice);
        (address gameAddr, ) = factory.createPorra(
            participants,
            nicknames,
            matchId,
            bettingDeadline,
            matchEndTime,
            5 ether
        );
        PorraGame g = PorraGame(payable(gameAddr));

        vm.prank(alice);
        g.placeBet{value: 5 ether}(1);
        vm.prank(bob);
        g.placeBet{value: 5 ether}(0); // Atlético gana
        vm.prank(carol);
        g.placeBet{value: 5 ether}(2);

        assertEq(g.totalPot(), 15 ether);
        assertEq(g.bets(bob), 0);
    }
}
