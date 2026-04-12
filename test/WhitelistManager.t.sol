// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {WhitelistManager} from "../src/WhitelistManager.sol";

contract WhitelistManagerTest is Test {
    WhitelistManager public wl;
    address alice = address(0x1);
    address bob = address(0x2);
    address carol = address(0x3);
    address dave = address(0x4);

    function setUp() public {
        address[] memory participants = new address[](2);
        participants[0] = alice;
        participants[1] = bob;
        string[] memory nicknames = new string[](2);
        nicknames[0] = "Alice";
        nicknames[1] = "Bob";
        wl = new WhitelistManager(participants, nicknames);
    }

    function test_InitialParticipants() public view {
        assertTrue(wl.isWhitelisted(alice));
        assertTrue(wl.isWhitelisted(bob));
        assertEq(wl.participantCount(), 2);
        address[] memory p = wl.getParticipants();
        assertEq(p.length, 2);
    }

    function test_AddParticipant() public {
        vm.prank(wl.owner());
        wl.addParticipant(carol, "Carol");
        assertTrue(wl.isWhitelisted(carol));
        assertEq(wl.participantCount(), 3);
    }

    function test_RemoveParticipant() public {
        vm.prank(wl.owner());
        wl.removeParticipant(bob);
        assertFalse(wl.isWhitelisted(bob));
        assertTrue(wl.isWhitelisted(alice));
        assertEq(wl.participantCount(), 1);
    }

    function test_RevertTooFewParticipants() public {
        address[] memory one = new address[](1);
        one[0] = alice;
        string[] memory n1 = new string[](1);
        n1[0] = "A";
        vm.expectRevert("WhitelistManager: invalid number of participants");
        new WhitelistManager(one, n1);
    }

    function test_RevertTooManyParticipants() public {
        address[] memory many = new address[](21);
        string[] memory nm = new string[](21);
        for (uint256 i = 0; i < 21; i++) {
            many[i] = address(uint160(i + 100));
            nm[i] = "X";
        }
        vm.expectRevert("WhitelistManager: invalid number of participants");
        new WhitelistManager(many, nm);
    }

    function test_RevertDuplicateParticipant() public {
        address[] memory dup = new address[](2);
        dup[0] = alice;
        dup[1] = alice;
        string[] memory nd = new string[](2);
        nd[0] = "A";
        nd[1] = "B";
        vm.expectRevert("WhitelistManager: duplicate participant");
        new WhitelistManager(dup, nd);
    }

    function test_RevertZeroAddress() public {
        address[] memory withZero = new address[](2);
        withZero[0] = alice;
        withZero[1] = address(0);
        string[] memory nz = new string[](2);
        nz[0] = "A";
        nz[1] = "B";
        vm.expectRevert("WhitelistManager: zero address");
        new WhitelistManager(withZero, nz);
    }

    function test_RevertNicknamesLengthMismatch() public {
        address[] memory p = new address[](2);
        p[0] = alice;
        p[1] = bob;
        string[] memory n = new string[](1);
        n[0] = "OnlyOne";
        vm.expectRevert("WhitelistManager: nicknames length mismatch");
        new WhitelistManager(p, n);
    }

    function test_RevertEmptyNickname() public {
        address[] memory p = new address[](2);
        p[0] = alice;
        p[1] = bob;
        string[] memory n = new string[](2);
        n[0] = "A";
        n[1] = "";
        vm.expectRevert("WhitelistManager: empty nickname");
        new WhitelistManager(p, n);
    }
}
