const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const connectToDatabase = require('../utils/dbConnect');


const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

router.post('/send-otp', async (req, res) => {
    const { phoneNumber } = req.body;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Validate phoneNumber
    if (!phoneNumber) {
        return res.status(400).send({ message: 'Phone number is required' });
    }

    try {
        // Store OTP in the database
        const db = await connectToDatabase();
        await db.execute(
            'INSERT INTO otps (phone_number, otp) VALUES (?, ?)',
            [phoneNumber, otp]
        );
        await db.end();

        // Send SMS
        await twilioClient.messages.create({
            body: `Your OTP is ${otp}`,
            to: phoneNumber,
            from: twilioPhoneNumber,
        });

        res.status(200).send({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { phoneNumber, otp } = req.body;

    // Validate phoneNumber and otp
    if (!phoneNumber) {
        return res.status(400).send({ message: 'Phone number is required' });
    }
    if (!otp) {
        return res.status(400).send({ message: 'OTP is required' });
    }

    try {
        // Verify OTP from the database
        const db = await connectToDatabase();
        const [rows] = await db.execute(
            'SELECT otp FROM otps WHERE phone_number = ? ORDER BY created_at DESC LIMIT 1',
            [phoneNumber]
        );
        await db.end();

        if (rows.length === 0) {
            return res.status(401).send({ message: 'No OTP found for this phone number' });
        }

        const storedOTP = rows[0].otp;

        if (otp === storedOTP) {
            res.status(200).send({ message: 'OTP verified successfully' });
        } else {
            res.status(401).send({ message: 'Invalid OTP' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
    }
});


module.exports = router;