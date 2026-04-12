// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IPorraOracle.sol";
import "./utils/Ownable.sol";

/// @title Oráculo simulado para desarrollo y tests
/// @notice Permite establecer el resultado manualmente (0=Atleti gana, 1=Empate, 2=Atleti pierde)
contract MockOracle is IPorraOracle, Ownable {
    struct Result {
        uint8 value;
        bool resolved;
    }
    mapping(bytes32 => Result) private _results;

    event ResultRequested(bytes32 indexed matchId);
    event ResultSet(bytes32 indexed matchId, uint8 result);

    constructor() Ownable(msg.sender) {}

    function requestMatchResult(bytes32 matchId) external override {
        emit ResultRequested(matchId);
    }

    /// @notice Solo el owner puede establecer el resultado (para simular respuesta del oráculo)
    function setResult(bytes32 matchId, uint8 result) external onlyOwner {
        require(result <= 2, "MockOracle: invalid result (0, 1 or 2)");
        _results[matchId] = Result({ value: result, resolved: true });
        emit ResultSet(matchId, result);
    }

    function getResult(bytes32 matchId) external view override returns (uint8 result, bool resolved) {
        Result memory r = _results[matchId];
        return (r.value, r.resolved);
    }
}
