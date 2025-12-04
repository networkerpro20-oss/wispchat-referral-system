const db = require('../utils/database');

class RewardController {
  // Get reward by ID
  getRewardById(req, res) {
    try {
      const { id } = req.params;
      const reward = db.getRewardById(id);

      if (!reward) {
        return res.status(404).json({
          error: 'Reward not found'
        });
      }

      res.json({
        reward: reward.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve reward',
        details: error.message
      });
    }
  }

  // Get all rewards for a user
  getRewardsByUser(req, res) {
    try {
      const { userId } = req.params;
      const user = db.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      const rewards = db.getRewardsByUserId(userId);
      const totalRewards = rewards.reduce((sum, r) => sum + r.amount, 0);
      
      res.json({
        count: rewards.length,
        totalAmount: totalRewards,
        rewards: rewards.map(r => r.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve rewards',
        details: error.message
      });
    }
  }

  // Get all rewards
  getAllRewards(req, res) {
    try {
      const rewards = db.getAllRewards();
      const totalAmount = rewards.reduce((sum, r) => sum + r.amount, 0);
      
      res.json({
        count: rewards.length,
        totalAmount,
        rewards: rewards.map(r => r.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve rewards',
        details: error.message
      });
    }
  }

  // Redeem a reward
  redeemReward(req, res) {
    try {
      const { id } = req.params;
      const reward = db.getRewardById(id);

      if (!reward) {
        return res.status(404).json({
          error: 'Reward not found'
        });
      }

      if (reward.status === 'redeemed') {
        return res.status(400).json({
          error: 'Reward has already been redeemed'
        });
      }

      if (reward.status !== 'approved') {
        return res.status(400).json({
          error: 'Reward must be approved before it can be redeemed'
        });
      }

      reward.redeem();

      res.json({
        message: 'Reward redeemed successfully',
        reward: reward.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to redeem reward',
        details: error.message
      });
    }
  }
}

module.exports = new RewardController();
