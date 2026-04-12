// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {MockOracle} from "../src/MockOracle.sol";

contract MockOracleTest is Test {
    MockOracle public oracle;
    bytes32 matchId = keccak256("atleti-vs-real-2024");

    function setUp() public {
        oracle = new MockOracle();
    }

    function test_SetAndGetResult() public {
        (uint8 r, bool resolved) = oracle.getResult(matchId);
        assertEq(r, 0);
        assertFalse(resolved);

        vm.prank(oracle.owner());
        oracle.setResult(matchId, 1);
        (r, resolved) = oracle.getResult(matchId);
        assertEq(r, 1);
        assertTrue(resolved);
    }

    function test_RevertInvalidResult() public {
        vm.prank(oracle.owner());
        vm.expectRevert("MockOracle: invalid result (0, 1 or 2)");
        oracle.setResult(matchId, 3);
    }
}
