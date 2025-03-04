// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Election {
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isPublished;
        mapping(uint256 => uint256) candidateVotes; // candidateId => votes
    }
    
    mapping(uint256 => Election) public elections; // electionId => Election
    mapping(string => mapping(uint256 => bool)) public hasVoted; // aadhar => electionId => hasVoted
    
    event VoteCast(uint256 indexed electionId, uint256 indexed candidateId);
    event ElectionCreated(uint256 indexed electionId, uint256 startTime, uint256 endTime);
    event ResultsPublished(uint256 indexed electionId);
    
    modifier electionExists(uint256 electionId) {
        require(elections[electionId].isActive, "Election does not exist");
        _;
    }

    function getElection(uint256 electionId)
        external
        view
        returns (
            uint256 startTime,
            uint256 endTime,
            bool isActive,
            bool isPublished
        )
    {
        require(elections[electionId].isActive, "Election does not exist");
        Election storage e = elections[electionId];
        return (e.startTime, e.endTime, e.isActive, e.isPublished);
    }
    
    function createElection(
        uint256 electionId,
        uint256 startTime,
        uint256 endTime
    ) external {
        require(!elections[electionId].isActive, "Election already exists");
        require(startTime < endTime, "Invalid election duration");
        
        Election storage newElection = elections[electionId];
        newElection.startTime = startTime;
        newElection.endTime = endTime;
        newElection.isActive = true;
        newElection.isPublished = false;
        
        emit ElectionCreated(electionId, startTime, endTime);
    }
    
    function vote(
        uint256 electionId,
        uint256 candidateId,
        string memory aadhar,
        uint256 currentTime
    ) external electionExists(electionId) {
        require(
            currentTime >= elections[electionId].startTime,
            "Election has not started"
        );
        require(
            currentTime <= elections[electionId].endTime,
            "Election has ended"
        );
        require(
            !hasVoted[aadhar][electionId],
            "Already voted in this election"
        );
        
        elections[electionId].candidateVotes[candidateId]++ ;
        hasVoted[aadhar][electionId] = true;
        
        emit VoteCast(electionId, candidateId);
    }
    
    function publishResults(uint256 electionId, uint256 currentTime) external electionExists(electionId) {
        require(
            currentTime > elections[electionId].endTime,
            "Election is still ongoing"
        );
        require(
            !elections[electionId].isPublished,
            "Results already published"
        );
        
        elections[electionId].isPublished = true;
        emit ResultsPublished(electionId);
    }
    
    function getVoteCount(uint256 electionId, uint256 candidateId)
        external
        view
        electionExists(electionId)
        returns (uint256)
    {
        require(
            elections[electionId].isPublished,
            "Results not published yet"
        );
        return elections[electionId].candidateVotes[candidateId];
    }
    
    function checkVotingStatus(string memory aadhar, uint256 electionId)
        external
        view
        returns (bool)
    {
        return hasVoted[aadhar][electionId];
    }
}