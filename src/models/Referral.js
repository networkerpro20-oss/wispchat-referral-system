const { v4: uuidv4 } = require('uuid');

class Referral {
  constructor(referrerId, referredUserId) {
    this.id = uuidv4();
    this.referrerId = referrerId;
    this.referredUserId = referredUserId;
    this.status = 'pending'; // pending, completed, cancelled
    this.rewardAmount = 0;
    this.createdAt = new Date().toISOString();
    this.completedAt = null;
  }

  complete(rewardAmount) {
    this.status = 'completed';
    this.rewardAmount = rewardAmount;
    this.completedAt = new Date().toISOString();
  }

  cancel() {
    this.status = 'cancelled';
  }

  toJSON() {
    return {
      id: this.id,
      referrerId: this.referrerId,
      referredUserId: this.referredUserId,
      status: this.status,
      rewardAmount: this.rewardAmount,
      createdAt: this.createdAt,
      completedAt: this.completedAt
    };
  }
}

module.exports = Referral;
