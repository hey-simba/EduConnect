const User = require('../models/User');
const Notification = require('../models/Notification');
const SSLCommerzPayment = require('sslcommerz-lts');
const mongoose = require('mongoose');
require('dotenv').config();

const store_id = process.env.STORE_ID || 'testbox';
const store_passwd = process.env.STORE_PASSWD || 'testpass@ssl';
const is_live = false; // true for live, false for sandbox

const getTokens = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ tokens: user.tokens });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

const initPayment = async (req, res) => {
    const { userId, amount, email, name } = req.body; // Amount in BDT
    const tokenAmount = amount / 100; // e.g. 100 BDT = 1 token
    const tran_id = 'REF' + new Date().getTime();

    const data = {
        total_amount: amount,
        currency: 'BDT',
        tran_id: tran_id, // use unique tran_id for each api call
        success_url: `http://localhost:5000/api/wallet/success/${userId}/${tokenAmount}`,
        fail_url: `http://localhost:5000/api/wallet/fail`,
        cancel_url: `http://localhost:5000/api/wallet/cancel`,
        ipn_url: `http://localhost:5000/api/wallet/ipn`,
        shipping_method: 'Courier',
        product_name: `${tokenAmount} Tuition Hub Tokens`,
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: name || 'Tutor',
        cus_email: email || 'tutor@educonnect.com',
        cus_add1: 'Dhaka',
        cus_add2: 'Dhaka',
        cus_city: 'Dhaka',
        cus_state: 'Dhaka',
        cus_postcode: '1000',
        cus_country: 'Bangladesh',
        cus_phone: '01711111111',
        cus_fax: '01711111111',
        ship_name: name || 'Tutor',
        ship_add1: 'Dhaka',
        ship_add2: 'Dhaka',
        ship_city: 'Dhaka',
        ship_state: 'Dhaka',
        ship_postcode: 1000,
        ship_country: 'Bangladesh',
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
    sslcz.init(data).then(apiResponse => {
        if (apiResponse?.GatewayPageURL) {
            res.status(200).json({ paymentUrl: apiResponse.GatewayPageURL });
        } else {
            // Mock Fallback for local testing when testbox is deactivated
            if (store_id === 'testbox') {
                return res.status(200).json({ paymentUrl: data.success_url });
            }
            // If SSLCommerz fails (e.g. invalid store credentials)
            return res.status(400).json({ message: apiResponse?.failedreason || 'Payment gateway failed to generate URL' });
        }
    }).catch(err => {
        console.error(err);
        res.status(500).json({ message: 'Payment gateway initialization failed' });
    });
};

const paymentSuccess = async (req, res) => {
    const { userId, amount } = req.params;
    const tokensBought = parseInt(amount);
    
    try {
        const user = await User.findById(userId);
        if (user) {
            user.tokens += tokensBought;
            await user.save();

            // Notify user
            const newNotification = new Notification({
                userId,
                type: 'PAYMENT_SUCCESS',
                message: `Successfully purchased ${tokensBought} tokens!`,
                link: '/tuitions'
            });
            await newNotification.save();
        }
        // Redirect to frontend tuition hub
        res.redirect('http://localhost:5173/tuition-hub?payment=success');
    } catch (error) {
        console.error(error);
        res.redirect('http://localhost:5173/tuition-hub?payment=error');
    }
};

const paymentFail = async (req, res) => {
    res.redirect('http://localhost:5173/tuition-hub?payment=fail');
};

const paymentCancel = async (req, res) => {
    res.redirect('http://localhost:5173/tuition-hub?payment=cancel');
};

module.exports = { getTokens, initPayment, paymentSuccess, paymentFail, paymentCancel };
