const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars from the server directory
dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const checkUsers = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI not found in server/.env');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    // Define a minimal User model for querying
    const userSchema = new mongoose.Schema({
      name: String,
      email: String,
      googleId: String,
      createdAt: Date
    });
    const User = mongoose.model('User', userSchema);

    const users = await User.find({}, 'name email googleId createdAt');
    
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log(`\nFound ${users.length} user(s):`);
      console.table(users.map(u => ({
        Name: u.name,
        Email: u.email,
        'Google Auth': u.googleId ? 'Yes' : 'No',
        Joined: u.createdAt
      })));
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

checkUsers();
