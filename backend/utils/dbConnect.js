const mysql = require('mysql2/promise');


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

module.exports = connectToDatabase;
