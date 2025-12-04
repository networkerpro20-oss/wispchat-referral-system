const { v4: uuidv4 } = require('uuid');

class User {
  constructor(name, email, phone) {
    this.id = uuidv4();
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.referralCode = this.generateReferralCode();
    this.referredBy = null;
    this.totalRewards = 0;
    this.referralCount = 0;
    this.createdAt = new Date().toISOString();
    this.isActive = true;
  }

  generateReferralCode() {
    const prefix = 'EA'; // Easy Access
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${random}`;
  }

  addReward(amount) {
    this.totalRewards += amount;
  }

  incrementReferralCount() {
    this.referralCount += 1;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      phone: this.phone,
      referralCode: this.referralCode,
      totalRewards: this.totalRewards,
      referralCount: this.referralCount,
      createdAt: this.createdAt,
      isActive: this.isActive
    };
  }
}

module.exports = User;
