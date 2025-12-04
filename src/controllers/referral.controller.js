const db = require('../utils/database');

class ReferralController {
  // Get referral by ID
  getReferralById(req, res) {
    try {
      const { id } = req.params;
      const referral = db.getReferralById(id);

      if (!referral) {
        return res.status(404).json({
          error: 'Referral not found'
        });
      }

      res.json({
        referral: referral.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve referral',
        details: error.message
      });
    }
  }

  // Get all referrals for a user
  getReferralsByUser(req, res) {
    try {
      const { userId } = req.params;
      const user = db.getUserById(userId);

      if (!user) {
        return res.status(404).json({
          error: 'User not found'
        });
      }

      const referrals = db.getReferralsByReferrerId(userId);
      
      res.json({
        count: referrals.length,
        referrals: referrals.map(r => r.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve referrals',
        details: error.message
      });
    }
  }

  // Get all referrals
  getAllReferrals(req, res) {
    try {
      const referrals = db.getAllReferrals();
      res.json({
        count: referrals.length,
        referrals: referrals.map(r => r.toJSON())
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve referrals',
        details: error.message
      });
    }
  }

  // Get referral statistics
  getReferralStats(req, res) {
    try {
      const stats = db.getStatistics();
      res.json(stats);
    } catch (error) {
      res.status(500).json({
        error: 'Failed to retrieve statistics',
        details: error.message
      });
    }
  }
}

module.exports = new ReferralController();
