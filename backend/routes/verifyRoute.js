const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const connectToDatabase = require('../utils/dbConnect');

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Check if phone exists
router.post('/check-phone', async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        const db = await connectToDatabase();
        const [rows] = await db.execute(
            'SELECT phoneNumber FROM users WHERE phoneNumber = ?',
            [phoneNumber]
        );
        await db.end();

        return res.json({
            exists: rows.length > 0
        });
    } catch (error) {
        console.error('Phone check error:', error);
        return res.status(500).json({
            message: 'Error checking phone number'
        });
    }
});

// Send OTP
router.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    try {
        // First check if phone exists
        const db = await connectToDatabase();
        const [existingUsers] = await db.execute(
            'SELECT phoneNumber FROM users WHERE phoneNumber = ?',
            [phoneNumber]
        );

        if (existingUsers.length > 0) {
            await db.end();
            return res.status(400).json({
                message: 'Phone number already registered'
            });
        }

        // Generate and store OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Delete any existing OTPs for this phone number
        await db.execute(
            'DELETE FROM otps WHERE phone_number = ?',
            [phoneNumber]
        );

        // Store new OTP with expiration (5 minutes from now)
        await db.execute(
            'INSERT INTO otps (phone_number, otp, expiry) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))',
            [phoneNumber, otp]
        );

        await db.end();

        // Send SMS
        await twilioClient.messages.create({
            body: `Your OTP is ${otp}`,
            to: phoneNumber,
            from: twilioPhoneNumber
        });

        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('OTP send error:', error);
        res.status(500).json({
            message: error.message || 'Failed to send OTP'
        });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
        return res.status(400).json({
            message: 'Phone number and OTP are required'
        });
    }

    try {
        const db = await connectToDatabase();

        // Get latest non-expired OTP
        const [rows] = await db.execute(
            'SELECT otp FROM otps WHERE phone_number = ? AND expiry > NOW() ORDER BY created_at DESC LIMIT 1',
            [phoneNumber]
        );

        if (rows.length === 0) {
            await db.end();
            return res.status(400).json({
                message: 'OTP expired or not found'
            });
        }

        const storedOTP = rows[0].otp;

        if (otp !== storedOTP) {
            await db.end();
            return res.status(401).json({
                message: 'Invalid OTP'
            });
        }

        // Delete verified OTP
        await db.execute(
            'DELETE FROM otps WHERE phone_number = ?',
            [phoneNumber]
        );

        await db.end();
        return res.status(200).json({
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        return res.status(500).json({
            message: error.message || 'Error verifying OTP'
        });
    }
});

module.exports = router;