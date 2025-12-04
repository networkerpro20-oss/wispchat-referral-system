const { v4: uuidv4 } = require('uuid');

class Reward {
  constructor(userId, amount, type, description) {
    this.id = uuidv4();
    this.userId = userId;
    this.amount = amount;
    this.type = type; // referral, bonus, promotion
    this.description = description;
    this.status = 'pending'; // pending, approved, redeemed
    this.createdAt = new Date().toISOString();
    this.redeemedAt = null;
  }

  approve() {
    this.status = 'approved';
  }

  redeem() {
    this.status = 'redeemed';
    this.redeemedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      amount: this.amount,
      type: this.type,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      redeemedAt: this.redeemedAt
    };
  }
}

module.exports = Reward;
