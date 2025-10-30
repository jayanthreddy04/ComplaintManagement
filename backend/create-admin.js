/**
 * Admin User Creation Script for Complaint Management System
 *
 * Usage:
 * 1. Ensure .env has:
 *    MONGODB_URI=your_atlas_or_local_uri
 *    ADMIN_EMAIL=your_admin_email (optional, defaults to admin@college.com)
 *    ADMIN_PASSWORD=your_admin_password (optional, defaults to admin123)
 * 2. Run: node create-admin.js
 *
 * The script connects to the database and ensures that ONE admin exists with the email and password specified.
 * If the admin exists, it prints credentials. If not, it creates it and prints credentials.
 */
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

// Use Atlas or fallback to localhost
const connectionURI = process.env.MONGODB_URI || 'mongodb+srv://Jayanthreddy:Jayanthreddy321@complaintplatform.hyiurm2.mongodb.net/?appName=ComplaintPlatform';

mongoose.connect(connectionURI)
  .then(() => console.log('MongoDB Connected Successfully'))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@college.com' });
    if (existingAdmin) {
      console.log('Admin user already exists.');
      console.log('\nLOGIN WITH:');
      console.log('Email: ' + existingAdmin.email);
      console.log('Password: (your original password)');
      return;
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@college.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    // Create admin user
    const admin = new User({
      name: 'System Administrator',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created successfully!');
    console.log('\nLOGIN WITH:');
    console.log('Email: ' + ADMIN_EMAIL);
    console.log('Password: ' + ADMIN_PASSWORD);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdminUser();

