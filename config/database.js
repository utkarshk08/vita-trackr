// Database Configuration
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://utkarshk0804:utkarshK%4008@vitatrackr.vakekfy.mongodb.net/vitaTrackr?retryWrites=true&w=majority');
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;

