// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract JobPortal is Ownable, ReentrancyGuard {

    uint256 public jobPostingFee = 0.01 ether;

    struct Job {
        uint256 id;
        address employer;
        string title;
        string company;
        uint256 timestamp;
        bool isActive;
    }

    uint256 public jobCount = 0;

    mapping(uint256 => Job) public jobs;

    event JobPosted(
        uint256 indexed jobId,
        address indexed employer,
        string title,
        string company,
        uint256 timestamp
    );

    event FeeUpdated(uint256 newFee);
    event FundsWithdrawn(address owner, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function postJob(
        string memory _title,
        string memory _company
    ) external payable nonReentrant {
        require(msg.value >= jobPostingFee, "Insufficient payment");
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_company).length > 0, "Company cannot be empty");

        jobCount++;

        jobs[jobCount] = Job({
            id: jobCount,
            employer: msg.sender,
            title: _title,
            company: _company,
            timestamp: block.timestamp,
            isActive: true
        });

        emit JobPosted(
            jobCount,
            msg.sender,
            _title,
            _company,
            block.timestamp
        );

        if (msg.value > jobPostingFee) {
            payable(msg.sender).transfer(msg.value - jobPostingFee);
        }
    }

    function getJob(uint256 _jobId) external view returns (Job memory) {
        require(_jobId > 0 && _jobId <= jobCount, "Job does not exist");
        return jobs[_jobId];
    }

    function updateFee(uint256 _newFee) external onlyOwner {
        jobPostingFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    function withdrawFunds() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
        emit FundsWithdrawn(owner(), balance);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}