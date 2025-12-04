const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/reward.controller');

// Get all rewards
router.get('/', rewardController.getAllRewards.bind(rewardController));

// Get reward by ID
router.get('/:id', rewardController.getRewardById.bind(rewardController));

// Get rewards by user ID
router.get('/user/:userId', rewardController.getRewardsByUser.bind(rewardController));

// Redeem a reward
router.post('/:id/redeem', rewardController.redeemReward.bind(rewardController));

module.exports = router;
