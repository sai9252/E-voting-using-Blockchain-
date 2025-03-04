const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 8000;
const API_URL = process.env.API_URL;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());


// MySQL Connection
const connectToDatabase = async () => {
    try {
        const db = await mysql.createConnection({
            host: 'localhost',
            user: 'root', // Replace with your MySQL username
            password: '0000', // Replace with your MySQL password
            database: 'e_voting',
        });

        console.log('Connected to MySQL database');
        await db.connect();
        return db;
    } catch (err) {
        console.error('Error connecting to MySQL:', err);
        throw err;
    }
};

connectToDatabase();



// Serve static files from the uploads folder
app.use('/uploads', express.static('uploads'));

// Routes
const authRoute = require('./routes/authRoute');
const fileRoutes = require('./routes/fileRoutes');
const verifyRoute = require('./routes/verifyRoute');
const usersRoute = require('./routes/usersRoute');
const candidateRoute = require('./routes/candidateRoute');

// blockchain
const electionsRoute = require('./routes/electionsRoute');
const voteRoute = require('./routes/voteRoute');
const publishRoute = require('./routes/publishRoute');

app.use('/api', fileRoutes);
app.use('/api', verifyRoute);
app.use('/api', authRoute);
app.use('/api', candidateRoute);
app.use('/api', electionsRoute);
app.use('/api', publishRoute);
app.use('/api', usersRoute);
app.use('/api', voteRoute);



app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});