// SPDX-License-Identifier: MIT
pragma solidity 0.8.6;

interface erc20 {
    function transfer(address recipient, uint256 amount)
        external
        returns (bool);

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

/**
 * @title Bribe Automation
 * @author Valentin Seehausen
 * @notice Bribes once per period (one week). Fillable by everyone.
 * No admin controls.
 */
contract BribeAutomation {
    BribeV2 bribev2 = BribeV2(0x7893bbb46613d7a4FbcC31Dab4C9b823FfeE1026);
    address gauge;
    erc20 reward_token;
    uint256 amount_per_vote;
    uint256 active_period;

    /**
     * @notice These params can not be changed later.
     * @param _gauge `LiquidityGauge` contract address
     * @param _reward_token `ERC20` contract address
     * @param _amount_per_vote uint256
     */
    constructor(
        address _gauge,
        address _reward_token,
        uint256 _amount_per_vote
    ) {
        gauge = _gauge;
        reward_token = erc20(_reward_token);
        amount_per_vote = _amount_per_vote;
    }

    uint256 constant WEEK = 86400 * 7;

    /**
     * @notice Fill with reward_token. Sender has to approve amount first.
     * All amounts welcome.
     * @param amount uint256
     */
    function fill(uint256 amount) external {
        reward_token.transferFrom(msg.sender, address(this), amount);
    }

    /**
     * @notice Can only bribe once per week. Can only bribe when balance is
     * higher than amount_per_vote. Possible a small refill is required to be
     * able to vote again.
     */
    function bribe() external {
        require(
            block.timestamp >= active_period + WEEK,
            "already bribed in this period"
        );
        reward_token.approve(address(bribev2), amount_per_vote);
        require(balance() >= amount_per_vote, "not enough funds");
        require(
            bribev2.add_reward_amount(
                gauge,
                address(reward_token),
                amount_per_vote
            ),
            "add_reward_amount failed"
        );
        active_period = bribev2.active_period(gauge, address(reward_token));
    }

    /**
     * @notice Returns token balance.
     */
    function balance() public view returns (uint256) {
        return reward_token.balanceOf(address(this));
    }
}

/**
 * @title Bribe Factory
 * @author Valentin Seehausen
 * @notice Creates BribeAutomations. Keeps record of BribeAutomations on chain.
 */
contract BribeFactory {
    struct Bribe {
        // Represents a BribeAutomation
        address smart_contract;
        address gauge;
        address reward_token;
        uint256 amount_per_vote;
    }

    Bribe[] _bribe_automations;

    /**
     * @notice Deploys a new smart contract for the BribeAutomation.
     * Safes details on chain. Filling up BribeAutomation has to happen in a
     * seperate call.
     */
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

    /**
     * @notice Returns all deployed BribeAutomations
     */
    function get_bribe_automations()
        external
        view
        returns (Bribe[] memory bribe_automations)
    {
        return _bribe_automations;
    }
}
