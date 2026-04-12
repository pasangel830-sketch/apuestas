// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./utils/Ownable.sol";

/// @title Gestión de participantes autorizados para una porra
/// @notice Entre 2 y 20 jugadores; solo direcciones autorizadas pueden participar; cada uno tiene un mote visible
contract WhitelistManager is Ownable {
    address[] private _participants;
    string[] private _nicknames;
    mapping(address => bool) private _isWhitelisted;
    uint256 public constant MIN_PARTICIPANTS = 2;
    uint256 public constant MAX_PARTICIPANTS = 20;
    uint256 public constant MAX_NICKNAME_BYTES = 128;

    event ParticipantAdded(address indexed participant);
    event ParticipantRemoved(address indexed participant);

    constructor(address[] memory participants, string[] memory nicknames) Ownable(msg.sender) {
        require(
            participants.length >= MIN_PARTICIPANTS && participants.length <= MAX_PARTICIPANTS,
            "WhitelistManager: invalid number of participants"
        );
        require(participants.length == nicknames.length, "WhitelistManager: nicknames length mismatch");
        for (uint256 i = 0; i < participants.length; i++) {
            address p = participants[i];
            require(p != address(0), "WhitelistManager: zero address");
            require(!_isWhitelisted[p], "WhitelistManager: duplicate participant");
            require(bytes(nicknames[i]).length > 0, "WhitelistManager: empty nickname");
            require(bytes(nicknames[i]).length <= MAX_NICKNAME_BYTES, "WhitelistManager: nickname too long");
            _isWhitelisted[p] = true;
            _participants.push(p);
            _nicknames.push(nicknames[i]);
            emit ParticipantAdded(p);
        }
    }

    function addParticipant(address participant, string memory nickname) external onlyOwner {
        require(participant != address(0), "WhitelistManager: zero address");
        require(!_isWhitelisted[participant], "WhitelistManager: already whitelisted");
        require(_participants.length < MAX_PARTICIPANTS, "WhitelistManager: max participants reached");
        require(bytes(nickname).length > 0, "WhitelistManager: empty nickname");
        require(bytes(nickname).length <= MAX_NICKNAME_BYTES, "WhitelistManager: nickname too long");
        _isWhitelisted[participant] = true;
        _participants.push(participant);
        _nicknames.push(nickname);
        emit ParticipantAdded(participant);
    }

    function removeParticipant(address participant) external onlyOwner {
        require(_isWhitelisted[participant], "WhitelistManager: not whitelisted");
        _isWhitelisted[participant] = false;
        for (uint256 i = 0; i < _participants.length; i++) {
            if (_participants[i] == participant) {
                uint256 last = _participants.length - 1;
                _participants[i] = _participants[last];
                _participants.pop();
                _nicknames[i] = _nicknames[last];
                _nicknames.pop();
                break;
            }
        }
        emit ParticipantRemoved(participant);
    }

    function isWhitelisted(address account) external view returns (bool) {
        return _isWhitelisted[account];
    }

    function getParticipants() external view returns (address[] memory) {
        return _participants;
    }

    /// @notice Motes en el mismo orden que `getParticipants()`
    function getNicknames() external view returns (string[] memory) {
        string[] memory out = new string[](_nicknames.length);
        for (uint256 i = 0; i < _nicknames.length; i++) {
            out[i] = _nicknames[i];
        }
        return out;
    }

    function participantCount() external view returns (uint256) {
        return _participants.length;
    }
}
