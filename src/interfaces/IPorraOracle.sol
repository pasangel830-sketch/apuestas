// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title Interfaz del oráculo para resultados de partidos
/// @notice 0 = Atlético gana, 1 = Empate, 2 = Atlético pierde
interface IPorraOracle {
    function requestMatchResult(bytes32 matchId) external;
    function getResult(bytes32 matchId) external view returns (uint8 result, bool resolved);
}
