// const twilio = require('twilio');

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const PHONE_NUMBER = "+917569764379";

// async function sendOTP() {
//     const message = await twilio(accountSid, authToken).messages.create({
//         body: 'Your OTP is 1234',
//         from: process.env.TWILIO_PHONE_NUMBER,
//         to: PHONE_NUMBER,
//     });

//     console.log(message);
// }

// sendOTP();


// const { votingContract } = require("./utils/votingContract")

// const get = async () => {
//     try {
//         console.log(votingContract.address);
//         const election = await votingContract.getElection(20);
//         console.log("Election details:", election);
//     } catch (error) {
//         console.error("Error fetching election details:", error);
//     }
// };

// get();

const { initializeEthereum } = require('./utils/votingContract');

async function test() {
    try {
        const { provider,votingContract } = await initializeEthereum();
        const network = await provider.getNetwork();
        console.log("Connected to network:", network);
        console.log(votingContract.address);
        const election = await votingContract.getElection(25);
        console.log("Election details:", election);
    } catch (error) {
        console.error("Test failed:", error);
    }
}

test();