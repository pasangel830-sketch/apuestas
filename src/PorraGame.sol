// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IPorraOracle.sol";
import "./WhitelistManager.sol";
import "./utils/ReentrancyGuard.sol";
import "./utils/Pausable.sol";
import "./utils/Ownable.sol";

/// @title Porra para un partido concreto
/// @notice 0 = Atlético gana, 1 = Empate, 2 = Atlético pierde
contract PorraGame is ReentrancyGuard, Pausable, Ownable {
    enum GameState {
        Betting,
        Resolving,
        Claiming,
        Finished
    }

    uint256 public stake; // Importe en wei que debe apostar cada participante (configurable al crear la porra)
    uint256 public constant MIN_PLAYERS_TO_RESOLVE = 2;

    WhitelistManager public whitelistManager;
    IPorraOracle public oracle;
    bytes32 public matchId;
    uint256 public bettingDeadline;
    uint256 public matchEndTime;

    GameState public gameState;
    uint8 public finalResult; // 0, 1, 2
    uint256 public totalPot;
    mapping(address => uint8) public bets;
    mapping(address => bool) public hasPlacedBet;
    mapping(address => bool) public hasClaimed;
    address[] private _playersWhoBet;

    event BetPlaced(address indexed player, uint8 prediction);
    event ResolutionRequested(bytes32 indexed matchId);
    event GameResolved(uint8 result);
    event RewardClaimed(address indexed player, uint256 amount);
    event ManualResolutionSet(uint8 result);

    constructor(
        address _whitelistManager,
        address _oracle,
        bytes32 _matchId,
        uint256 _bettingDeadline,
        uint256 _matchEndTime,
        uint256 _stake
    ) Ownable(msg.sender) {
        require(_stake > 0, "PorraGame: stake must be > 0");
        whitelistManager = WhitelistManager(payable(_whitelistManager));
        oracle = IPorraOracle(_oracle);
        matchId = _matchId;
        bettingDeadline = _bettingDeadline;
        matchEndTime = _matchEndTime;
        stake = _stake;
        gameState = GameState.Betting;
    }

    /// @notice Apostar: solo en Betting, whitelisted, stake exacto, una vez por jugador
    function placeBet(uint8 prediction) external payable nonReentrant whenNotPaused {
        require(gameState == GameState.Betting, "PorraGame: not in betting phase");
        require(block.timestamp <= bettingDeadline, "PorraGame: betting deadline passed");
        require(msg.value == stake, "PorraGame: stake amount mismatch");
        require(prediction <= 2, "PorraGame: prediction must be 0, 1 or 2");
        require(whitelistManager.isWhitelisted(msg.sender), "PorraGame: not whitelisted");
        require(!hasPlacedBet[msg.sender], "PorraGame: already bet");

        hasPlacedBet[msg.sender] = true;
        bets[msg.sender] = prediction;
        _playersWhoBet.push(msg.sender);
        totalPot += msg.value;

        emit BetPlaced(msg.sender, prediction);
    }

    function _hasBet(address player) internal view returns (bool) {
        for (uint256 i = 0; i < _playersWhoBet.length; i++) {
            if (_playersWhoBet[i] == player) return true;
        }
        return false;
    }

    /// @notice Iniciar resolución: solo después de matchEndTime y con al menos 2 apuestas
    function startResolution() external nonReentrant whenNotPaused {
        require(gameState == GameState.Betting, "PorraGame: not in betting phase");
        require(block.timestamp >= matchEndTime, "PorraGame: match not ended");
        require(_playersWhoBet.length >= MIN_PLAYERS_TO_RESOLVE, "PorraGame: min 2 players to resolve");

        gameState = GameState.Resolving;
        oracle.requestMatchResult(matchId);
        emit ResolutionRequested(matchId);
    }

    /// @notice Resolver con respuesta del oráculo
    function resolveWithOracle() external nonReentrant whenNotPaused {
        require(gameState == GameState.Resolving, "PorraGame: not in resolving phase");
        (uint8 result, bool resolved) = oracle.getResult(matchId);
        require(resolved, "PorraGame: oracle has not responded");

        finalResult = result;
        gameState = GameState.Claiming;
        emit GameResolved(result);
    }

    /// @notice Fallback manual: owner puede fijar resultado si el oráculo no responde
    function setManualResult(uint8 result) external onlyOwner whenNotPaused {
        require(gameState == GameState.Resolving, "PorraGame: not in resolving phase");
        require(result <= 2, "PorraGame: result must be 0, 1 or 2");

        finalResult = result;
        gameState = GameState.Claiming;
        emit ManualResolutionSet(result);
    }

    /// @notice Reclamar premio (pull-payment)
    function claimReward() external nonReentrant whenNotPaused {
        require(gameState == GameState.Claiming || gameState == GameState.Finished, "PorraGame: not in claiming phase");
        require(hasPlacedBet[msg.sender], "PorraGame: did not participate");
        require(!hasClaimed[msg.sender], "PorraGame: already claimed");

        hasClaimed[msg.sender] = true;

        uint256 amount = _claimableAmount(msg.sender);
        require(amount > 0, "PorraGame: nothing to claim");

        if (gameState == GameState.Claiming) {
            gameState = GameState.Finished;
        }

        (bool sent, ) = msg.sender.call{ value: amount }("");
        require(sent, "PorraGame: transfer failed");
        emit RewardClaimed(msg.sender, amount);
    }

    function _claimableAmount(address player) internal view returns (uint256) {
        uint256 winners = 0;
        for (uint256 i = 0; i < _playersWhoBet.length; i++) {
            if (bets[_playersWhoBet[i]] == finalResult) winners++;
        }
        if (winners == 0) {
            return hasPlacedBet[player] ? stake : 0;
        }
        uint8 prediction = bets[player];
        if (prediction != finalResult) return 0;
        return totalPot / winners;
    }

    /// @notice Ver cuánto puede reclamar una dirección
    function getClaimableAmount(address player) external view returns (uint256) {
        if (gameState != GameState.Claiming && gameState != GameState.Finished) return 0;
        if (hasClaimed[player]) return 0;
        if (!hasPlacedBet[player]) return 0;
        return _claimableAmount(player);
    }

    /// @notice Obtener lista de jugadores que apostaron
    function getPlayersWhoBet() external view returns (address[] memory) {
        return _playersWhoBet;
    }

    /// @notice Obtener apuestas (índice = jugador en getPlayersWhoBet)
    function getBets() external view returns (uint8[] memory) {
        uint8[] memory b = new uint8[](_playersWhoBet.length);
        for (uint256 i = 0; i < _playersWhoBet.length; i++) {
            b[i] = bets[_playersWhoBet[i]];
        }
        return b;
    }

    function getContractState() external view returns (
        GameState state,
        uint256 pot,
        uint256 deadline,
        uint8 result,
        bool resolved
    ) {
        bool isResolved = (gameState == GameState.Claiming || gameState == GameState.Finished);
        return (gameState, totalPot, bettingDeadline, finalResult, isResolved);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
