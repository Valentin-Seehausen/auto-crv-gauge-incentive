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

    function reward_per_token(address gauge, address reward_token)
        external
        view
        returns (uint256);
}

contract BribeAutomation {
    BribeV2 bribev2 = BribeV2(0x7893bbb46613d7a4FbcC31Dab4C9b823FfeE1026);
    address gauge;
    address reward_token;
    uint256 amount_per_vote;
    uint256 active_period;

    constructor(
        address _gauge,
        address _reward_token,
        uint256 _amount_per_vote
    ) {
        gauge = _gauge;
        reward_token = _reward_token;
        amount_per_vote = _amount_per_vote;
    }

    uint256 constant WEEK = 86400 * 7;
    uint256 constant PRECISION = 10**18;

    function fill(uint256 amount) external {
        erc20(reward_token).transferFrom(msg.sender, address(this), amount);
    }

    function bribe() external {
        require(
            block.timestamp >= active_period + WEEK,
            "already bribed in this period"
        );
        erc20(reward_token).approve(address(bribev2), amount_per_vote);
        require(
            erc20(reward_token).balanceOf(address(this)) >= amount_per_vote,
            "not enough funds"
        );
        require(
            bribev2.add_reward_amount(gauge, reward_token, amount_per_vote),
            "add_reward_amount failed"
        );
        active_period = bribev2.active_period(gauge, reward_token);
    }
}

contract BribeFactory {
    struct Bribe {
        address smart_contract;
        address gauge;
        address reward_token;
        uint256 amount_per_vote;
    }

    Bribe[] _bribe_automations;

    function create_bribe_automation(
        address gauge,
        address reward_token,
        uint256 amount_per_vote
    ) external {
        BribeAutomation bribe_address = new BribeAutomation(
            gauge,
            reward_token,
            amount_per_vote
        );
        Bribe memory bribe = Bribe(
            address(bribe_address),
            gauge,
            reward_token,
            amount_per_vote
        );
        _bribe_automations.push(bribe);
    }

    function get_bribe_automations()
        external
        view
        returns (Bribe[] memory bribe_automations)
    {
        return _bribe_automations;
    }
}
