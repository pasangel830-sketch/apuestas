// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {PorraGame} from "../src/PorraGame.sol";
import {WhitelistManager} from "../src/WhitelistManager.sol";
import {MockOracle} from "../src/MockOracle.sol";

contract PorraGameTest is Test {
    PorraGame public game;
    WhitelistManager public wl;
    MockOracle public oracle;

    address alice = address(0x1);
    address bob = address(0x2);
    address carol = address(0x3);

    bytes32 matchId = keccak256("match-1");
    uint256 bettingDeadline;
    uint256 matchEndTime;

    function setUp() public {
        oracle = new MockOracle();
        address[] memory participants = new address[](3);
        participants[0] = alice;
        participants[1] = bob;
        participants[2] = carol;
        string[] memory nicknames = new string[](3);
        nicknames[0] = "Alice";
        nicknames[1] = "Bob";
        nicknames[2] = "Carol";
        wl = new WhitelistManager(participants, nicknames);
        bettingDeadline = block.timestamp + 1 days;
        matchEndTime = block.timestamp + 2 days;

        game = new PorraGame(
            address(wl),
            address(oracle),
            matchId,
            bettingDeadline,
            matchEndTime,
            0.001 ether
        );
    }

    function test_PlaceBet() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        game.placeBet{value: 0.001 ether}(0);
        assertEq(game.bets(alice), 0);
        assertEq(game.totalPot(), 0.001 ether);
        assertEq(game.getPlayersWhoBet().length, 1);
    }

    function test_RevertWrongStake() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        vm.expectRevert("PorraGame: stake amount mismatch");
        game.placeBet{value: 0.002 ether}(0);
    }

    function test_RevertNotWhitelisted() public {
        address stranger = address(0x99);
        vm.deal(stranger, 1 ether);
        vm.prank(stranger);
        vm.expectRevert("PorraGame: not whitelisted");
        game.placeBet{value: 0.001 ether}(0);
    }

    function test_RevertDoubleBet() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        game.placeBet{value: 0.001 ether}(0);
        vm.prank(alice);
        vm.expectRevert("PorraGame: already bet");
        game.placeBet{value: 0.001 ether}(1);
    }

    function test_FullFlow_WinnersClaim() public {
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
        vm.deal(carol, 1 ether);

        vm.prank(alice);
        game.placeBet{value: 0.001 ether}(0);
        vm.prank(bob);
        game.placeBet{value: 0.001 ether}(0);
        vm.prank(carol);
        game.placeBet{value: 0.001 ether}(2);

        assertEq(game.totalPot(), 0.003 ether);
        assertEq(uint256(game.gameState()), uint256(PorraGame.GameState.Betting));

        vm.warp(matchEndTime + 1);
        game.startResolution();
        assertEq(uint256(game.gameState()), uint256(PorraGame.GameState.Resolving));

        vm.prank(oracle.owner());
        oracle.setResult(matchId, 0);

        game.resolveWithOracle();
        assertEq(uint256(game.gameState()), uint256(PorraGame.GameState.Claiming));
        assertEq(game.finalResult(), 0);

        uint256 aliceClaim = game.getClaimableAmount(alice);
        uint256 bobClaim = game.getClaimableAmount(bob);
        uint256 carolClaim = game.getClaimableAmount(carol);
        assertEq(aliceClaim, 0.0015 ether);
        assertEq(bobClaim, 0.0015 ether);
        assertEq(carolClaim, 0);

        uint256 aliceBefore = alice.balance;
        vm.prank(alice);
        game.claimReward();
        assertEq(alice.balance, aliceBefore + 0.0015 ether);

        uint256 bobBefore = bob.balance;
        vm.prank(bob);
        game.claimReward();
        assertEq(bob.balance, bobBefore + 0.0015 ether);

        assertEq(game.getClaimableAmount(carol), 0);
        vm.prank(carol);
        vm.expectRevert("PorraGame: nothing to claim");
        game.claimReward();
    }

    function test_NoWinners_Refund() public {
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
        vm.prank(alice);
        game.placeBet{value: 0.001 ether}(0);
        vm.prank(bob);
        game.placeBet{value: 0.001 ether}(1);

        vm.warp(matchEndTime + 1);
        game.startResolution();
        vm.prank(oracle.owner());
        oracle.setResult(matchId, 2);

        game.resolveWithOracle();

        assertEq(game.getClaimableAmount(alice), 0.001 ether);
        assertEq(game.getClaimableAmount(bob), 0.001 ether);

        vm.prank(alice);
        game.claimReward();
        assertEq(alice.balance, 1 ether);
        vm.prank(bob);
        game.claimReward();
        assertEq(bob.balance, 1 ether);
    }

    function test_ManualResolution() public {
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
        vm.prank(alice);
        game.placeBet{value: 0.001 ether}(1);
        vm.prank(bob);
        game.placeBet{value: 0.001 ether}(1);

        vm.warp(matchEndTime + 1);
        game.startResolution();
        vm.prank(game.owner());
        game.setManualResult(1);

        assertEq(game.finalResult(), 1);
        assertEq(uint256(game.gameState()), uint256(PorraGame.GameState.Claiming));
        assertEq(game.getClaimableAmount(alice), 0.001 ether);
        assertEq(game.getClaimableAmount(bob), 0.001 ether);
    }

    function test_RevertClaimTwice() public {
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
        vm.prank(alice);
        game.placeBet{value: 0.001 ether}(0);
        vm.prank(bob);
        game.placeBet{value: 0.001 ether}(2);
        vm.warp(matchEndTime + 1);
        game.startResolution();
        vm.prank(oracle.owner());
        oracle.setResult(matchId, 0);
        game.resolveWithOracle();

        vm.prank(alice);
        game.claimReward();
        vm.prank(alice);
        vm.expectRevert("PorraGame: already claimed");
        game.claimReward();
    }

    function test_RevertStartResolutionBeforeMatchEnd() public {
        vm.deal(alice, 1 ether);
        vm.deal(bob, 1 ether);
        vm.prank(alice);
        game.placeBet{value: 0.001 ether}(0);
        vm.prank(bob);
        game.placeBet{value: 0.001 ether}(1);
        vm.expectRevert("PorraGame: match not ended");
        game.startResolution();
    }

    function test_RevertMinPlayersToResolve() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        game.placeBet{value: 0.001 ether}(0);
        vm.warp(matchEndTime + 1);
        vm.expectRevert("PorraGame: min 2 players to resolve");
        game.startResolution();
    }

    /// Simula el caso del frontend: porra con 5 ETH de stake, segunda cuenta (bob) apuesta "Atlético gana" (0)
    function test_PlaceBet_5Eth_SecondAccount_AtletiGana() public {
        PorraGame game5 = new PorraGame(
            address(wl),
            address(oracle),
            matchId,
            bettingDeadline,
            matchEndTime,
            5 ether
        );
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(carol, 10 ether);

        vm.prank(alice);
        game5.placeBet{value: 5 ether}(1);
        vm.prank(bob);
        game5.placeBet{value: 5 ether}(0); // Atlético gana
        vm.prank(carol);
        game5.placeBet{value: 5 ether}(2);

        assertEq(game5.stake(), 5 ether);
        assertEq(game5.bets(bob), 0);
        assertEq(game5.totalPot(), 15 ether);
        assertEq(game5.getPlayersWhoBet().length, 3);
    }
}
