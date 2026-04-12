// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PorraGame.sol";
import "./WhitelistManager.sol";
import "./utils/Ownable.sol";

/// @title Factory para crear porras
/// @notice Despliega WhitelistManager + PorraGame y registra la porra
contract PorraFactory is Ownable {
    address public oracle;
    PorraGame[] public porras;
    mapping(address => address[]) public porrasByCreator;
    /// @notice Porras en las que la dirección está en la whitelist (incluye al creador si está en la lista)
    mapping(address => address[]) private porrasByParticipant;

    event PorraCreated(
        address indexed game,
        address indexed whitelistManager,
        address indexed creator,
        bytes32 matchId,
        uint256 bettingDeadline
    );

    constructor(address _oracle) Ownable(msg.sender) {
        require(_oracle != address(0), "PorraFactory: zero oracle");
        oracle = _oracle;
    }

    function createPorra(
        address[] calldata participants,
        string[] calldata nicknames,
        bytes32 matchId,
        uint256 bettingDeadline,
        uint256 matchEndTime,
        uint256 stakeAmount
    ) external returns (address game, address whitelistManagerAddr) {
        WhitelistManager wl = new WhitelistManager(participants, nicknames);
        whitelistManagerAddr = address(wl);

        PorraGame g = new PorraGame(
            whitelistManagerAddr,
            oracle,
            matchId,
            bettingDeadline,
            matchEndTime,
            stakeAmount
        );
        game = address(g);

        porras.push(g);
        porrasByCreator[msg.sender].push(game);
        for (uint256 i = 0; i < participants.length; i++) {
            porrasByParticipant[participants[i]].push(game);
        }

        emit PorraCreated(game, whitelistManagerAddr, msg.sender, matchId, bettingDeadline);
        return (game, whitelistManagerAddr);
    }

    function getPorrasCount() external view returns (uint256) {
        return porras.length;
    }

    function getPorraAt(uint256 index) external view returns (address) {
        require(index < porras.length, "PorraFactory: index out of bounds");
        return address(porras[index]);
    }

    function getPorrasByCreator(address creator) external view returns (address[] memory) {
        return porrasByCreator[creator];
    }

    function getPorrasByParticipant(address participant) external view returns (address[] memory) {
        return porrasByParticipant[participant];
    }

    function setOracle(address _oracle) external onlyOwner {
        require(_oracle != address(0), "PorraFactory: zero oracle");
        oracle = _oracle;
    }
}
