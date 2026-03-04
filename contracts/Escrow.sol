// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract SynapseEscrow {

    address public platformWallet;

    struct Task {
        address creator;
        uint256 amount;
        bool locked;
        bool paid;
    }

    mapping(bytes32 => Task) public tasks;

    constructor(address _platformWallet) {
        platformWallet = _platformWallet;
    }

    function lockTask(bytes32 taskId) external payable {
        require(msg.value > 0, "No funds sent");
        require(!tasks[taskId].locked, "Already locked");

        tasks[taskId] = Task({
            creator: msg.sender,
            amount: msg.value,
            locked: true,
            paid: false
        });
    }

    function releasePayment(
        bytes32 taskId,
        address winner,
        uint256 winnerAmount,
        uint256 platformAmount
    ) external {
        Task storage task = tasks[taskId];

        require(task.locked, "Not locked");
        require(!task.paid, "Already paid");
        require(task.amount == winnerAmount + platformAmount, "Invalid split");

        task.paid = true;

        (bool sentWinner, ) = payable(winner).call{value: winnerAmount}("");
        require(sentWinner, "Transfer to winner failed");

        (bool sentPlatform, ) = payable(platformWallet).call{value: platformAmount}("");
        require(sentPlatform, "Transfer to platform failed");
    }

    function cancelTask(bytes32 taskId) external {
        Task storage task = tasks[taskId];

        require(task.locked, "Not locked");
        require(!task.paid, "Already paid");

        task.paid = true;

        (bool sent, ) = payable(task.creator).call{value: task.amount}("");
        require(sent, "Refund to creator failed");
    }
}
