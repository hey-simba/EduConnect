const express = require('express');
const router = express.Router();
const { getTokens, initPayment, paymentSuccess, paymentFail, paymentCancel } = require('../controllers/walletController');

router.get('/tokens/:userId', getTokens);
router.post('/buy', initPayment);
router.all('/success/:userId/:amount', paymentSuccess);
router.post('/fail', paymentFail);
router.post('/cancel', paymentCancel);

module.exports = router;
