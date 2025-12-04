const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referral.controller');

// Get referral statistics
router.get('/stats', referralController.getReferralStats.bind(referralController));

// Get all referrals
router.get('/', referralController.getAllReferrals.bind(referralController));

// Get referral by ID
router.get('/:id', referralController.getReferralById.bind(referralController));

// Get referrals by user ID
router.get('/user/:userId', referralController.getReferralsByUser.bind(referralController));

module.exports = router;
