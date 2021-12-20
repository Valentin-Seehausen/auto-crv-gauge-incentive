// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

interface erc20 {
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

    function decimals() external view returns (uint8);

    function balanceOf(address) external view returns (uint256);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);
}

interface BribeV2 {
    function active_period(address gauge, address reward_token)
        external
        view
        returns (uint256);

    function add_reward_amount(
        address gauge,
        address reward_token,
        uint256 amount
    ) external returns (bool);
}

contract BribeAutomater {
    uint256 constant WEEK = 86400 * 7;
    uint256 constant PRECISION = 10**18;

    function fill() external {}

    function bribe() external {}
}

contract BribeFactory {
    struct Bribe {
        address token;
        address gauge;
        uint256 amount_per_vote;
    }

    function create_bribe() external {}

    function get_bribes() external view returns (Bribe[] memory) {}
}
