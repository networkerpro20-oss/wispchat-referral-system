// In-memory database for demo purposes
// In production, this should be replaced with a proper database (PostgreSQL, MongoDB, etc.)

class Database {
  constructor() {
    this.users = new Map();
    this.referrals = new Map();
    this.rewards = new Map();
    this.referralCodeIndex = new Map(); // Maps referral codes to user IDs
    this.emailIndex = new Map(); // Maps emails to user IDs
  }

  // User operations
  saveUser(user) {
    // Check for referral code collision
    if (this.referralCodeIndex.has(user.referralCode)) {
      // Regenerate referral code if collision occurs
      const crypto = require('crypto');
      const prefix = 'EA';
      user.referralCode = `${prefix}-${crypto.randomBytes(4).toString('hex').substring(0, 6).toUpperCase()}`;
      
      // Recursively check until we get a unique code (extremely unlikely to loop)
      if (this.referralCodeIndex.has(user.referralCode)) {
        return this.saveUser(user);
      }
    }
    
    this.users.set(user.id, user);
    this.referralCodeIndex.set(user.referralCode, user.id);
    this.emailIndex.set(user.email.toLowerCase(), user.id);
    return user;
  }

  getUserById(id) {
    return this.users.get(id);
  }

  getUserByEmail(email) {
    const userId = this.emailIndex.get(email.toLowerCase());
    return userId ? this.users.get(userId) : null;
  }

  getUserByReferralCode(code) {
    const userId = this.referralCodeIndex.get(code);
    return userId ? this.users.get(userId) : null;
  }

  getAllUsers() {
    return Array.from(this.users.values());
  }

  updateUser(id, updates) {
    const user = this.users.get(id);
    if (user) {
      Object.assign(user, updates);
      return user;
    }
    return null;
  }

  // Referral operations
  saveReferral(referral) {
    this.referrals.set(referral.id, referral);
    return referral;
  }

  getReferralById(id) {
    return this.referrals.get(id);
  }

  getReferralsByReferrerId(referrerId) {
    return Array.from(this.referrals.values())
      .filter(ref => ref.referrerId === referrerId);
  }

  getAllReferrals() {
    return Array.from(this.referrals.values());
  }

  // Reward operations
  saveReward(reward) {
    this.rewards.set(reward.id, reward);
    return reward;
  }

  getRewardById(id) {
    return this.rewards.get(id);
  }

  getRewardsByUserId(userId) {
    return Array.from(this.rewards.values())
      .filter(reward => reward.userId === userId);
  }

  getAllRewards() {
    return Array.from(this.rewards.values());
  }

  // Statistics
  getStatistics() {
    const totalUsers = this.users.size;
    const totalReferrals = this.referrals.size;
    const completedReferrals = Array.from(this.referrals.values())
      .filter(ref => ref.status === 'completed').length;
    const totalRewards = Array.from(this.rewards.values())
      .reduce((sum, reward) => sum + reward.amount, 0);

    return {
      totalUsers,
      totalReferrals,
      completedReferrals,
      totalRewards
    };
  }

  // Clear all data (for testing)
  clear() {
    this.users.clear();
    this.referrals.clear();
    this.rewards.clear();
    this.referralCodeIndex.clear();
    this.emailIndex.clear();
  }
}

// Export singleton instance
module.exports = new Database();
