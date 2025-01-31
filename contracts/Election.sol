// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Election {
    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    struct Voter {
        bool registered;
        bool voted;
    }

    address public admin;

    mapping(uint => Candidate) public candidates;
    mapping(address => Voter) public voters;
    mapping(address => uint) public votes;

    uint public candidatesCount;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    event CandidateRegistered(uint id, string name, string party);
    event Voted(uint candidateId, address voter);
    event AdminAdded(address admin);

    constructor() {
        admin = msg.sender;
        emit AdminAdded(admin);
    }

    function registerCandidate(string memory _name, string memory _party) public onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, _party, 0);
        emit CandidateRegistered(candidatesCount, _name, _party);
    }

    function vote(uint _candidateId) public {
        require(!voters[msg.sender].voted, "Already voted");
        require(voters[msg.sender].registered, "Not registered to vote");

        candidates[_candidateId].voteCount++;
        voters[msg.sender].voted = true;
        votes[msg.sender] = _candidateId;

        emit Voted(_candidateId, msg.sender);
    }

    function addVoter(address _voter) public onlyAdmin {
        voters[_voter].registered = true;
    }

    function getCandidatesCount() public view returns (uint) {
        return candidatesCount;
    }

    function getCandidate(uint _id) public view returns (uint, string memory, string memory, uint) {
        return (candidates[_id].id, candidates[_id].name, candidates[_id].party, candidates[_id].voteCount);
    }

    function getVoter(address _voter) public view returns (bool, bool) {
        return (voters[_voter].registered, voters[_voter].voted);
    }
}