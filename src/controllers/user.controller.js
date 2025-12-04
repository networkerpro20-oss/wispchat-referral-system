const User = require('../models/User');
const Referral = require('../models/Referral');
const Reward = require('../models/Reward');
const db = require('../utils/database');

const REWARD_PER_REFERRAL = parseInt(process.env.REWARD_PER_REFERRAL) || 100;

class UserController {
  // Create a new user
  createUser(req, res) {
    try {
      const { name, email, phone, referralCode } = req.body;

      // Validate required fields
      if (!name || !email || !phone) {
        return res.status(400).json({
          error: 'Name, email, and phone are required'
        });
      }

      // Check if user already exists
      if (db.getUserByEmail(email)) {
        return res.status(409).json({
          error: 'User with this email already exists'
        });
      }

      // Create new user
      const user = new User(name, email, phone);

      // If referral code is provided, link the referrer
      if (referralCode) {
        const referrer = db.getUserByReferralCode(referralCode);
        if (referrer) {
          user.referredBy = referrer.id;
          
          // Create referral record
          const referral = new Referral(referrer.id, user.id);
          db.saveReferral(referral);
          
          // Complete the referral and award points
          referral.complete(REWARD_PER_REFERRAL);
          
          // Update referrer's stats
          referrer.incrementReferralCount();
          referrer.addReward(REWARD_PER_REFERRAL);
          
          // Create reward record
          const reward = new Reward(
            referrer.id,
            REWARD_PER_REFERRAL,
            'referral',
            `Referral reward for ${user.name}`
          );
          reward.approve();
          db.saveReward(reward);
        }
      }

      db.saveUser(user);

      res.status(201).json({
        message: 'User created successfully',
        user: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create user',
        details: error.message
      });
    }
  }

  // Get user by ID
  getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = db.getUserById(id);

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      res.json({
        user: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve user',
        details: error.message
      });
    }
  }

  // Get all users
  getAllUsers(req, res) {
    try {
      const users = db.getAllUsers();
      res.json({
        count: users.length,
        users: users.map(u => u.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve users',
        details: error.message
      });
    }
  }

  // Get user by referral code
  getUserByReferralCode(req, res) {
    try {
      const { code } = req.params;
      const user = db.getUserByReferralCode(code);

      if (!user) {
        return res.status(404).json({
          error: 'User not found with this referral code'
        });
      }

      res.json({
        user: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve user',
        details: error.message
      });
    }
  }
}

module.exports = new UserController();
