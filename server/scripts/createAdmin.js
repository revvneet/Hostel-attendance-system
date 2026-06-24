require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const connectDB = require('../config/db');

async function createAdmin() {
  await connectDB();

  try {
    const existingAdmin = await User.findOne({ username: 'revneet' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'revneet',
      passwordHash,
      firstName: 'Ravneet',
      lastName: 'Singh',
      name: 'Super Admin',
      hostelType: 'boys', // Doesn't matter much for admin
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user created successfully: username "revneet", password "admin123"');
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

createAdmin();
