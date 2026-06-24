require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');
const AttendanceHistory = require('../models/AttendanceHistory');

const FIRST_NAMES = [
  'Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan',
  'Krishna', 'Ishaan', 'Shaurya', 'Dhruv', 'Kabir', 'Ritvik', 'Aaryan',
  'Laksh', 'Pranav', 'Advait', 'Rohan', 'Nikhil', 'Karan', 'Dev', 'Raj',
  'Amit', 'Suresh', 'Vikram', 'Manish', 'Rahul', 'Sanjay', 'Deepak',
  'Harsh', 'Gaurav', 'Tushar', 'Prateek', 'Akash', 'Vishal', 'Sumit',
  'Varun', 'Ankit', 'Mohit', 'Yash', 'Kunal', 'Sahil', 'Tarun', 'Nitin',
  'Alok', 'Ravi', 'Vinay', 'Siddharth', 'Parth',
];
const LAST_NAMES = [
  'Sharma', 'Verma', 'Singh', 'Kumar', 'Patel', 'Gupta', 'Joshi', 'Mehta',
  'Reddy', 'Nair', 'Pandey', 'Yadav', 'Mishra', 'Tiwari', 'Chauhan',
  'Malhotra', 'Kapoor', 'Bose', 'Iyer', 'Sinha', 'Bajaj', 'Shah', 'Pillai',
];

let studentCounter = 0;
const allStudents = [];

function randPhone() {
  return `9${Math.floor(Math.random() * 900000000 + 100000000)}`;
}

function makeStudents(floor, roomNo, roomType, beds) {
  beds.forEach(bed => {
    const fn = FIRST_NAMES[studentCounter % FIRST_NAMES.length];
    const ln = LAST_NAMES[Math.floor(studentCounter / 3) % LAST_NAMES.length];
    studentCounter++;
    allStudents.push({
      name: `${fn} ${ln}`,
      enrollmentNo: `EN${floor}${roomNo}${bed}${String(studentCounter).padStart(3, '0')}`,
      phoneNo: randPhone(),
      parentPhone: randPhone(),
      floor,
      roomNo,
      roomType,
      bed,
      photoPath: 'uploads/photos/avatar.jpg',
    });
  });
}

// Floor 1: rooms 101-120 (16 sharing, 4 single)
for (let r = 101; r <= 116; r++) makeStudents(1, String(r), 'sharing', ['A', 'B', 'C', 'D']);
for (let r = 117; r <= 120; r++) makeStudents(1, String(r), 'single', ['A']);

// Floor 2: rooms 201-215 (12 sharing, 3 single)
for (let r = 201; r <= 212; r++) makeStudents(2, String(r), 'sharing', ['A', 'B']);
for (let r = 213; r <= 215; r++) makeStudents(2, String(r), 'single', ['A']);

// Floor 3: rooms 301-318 (14 sharing, 4 single)
for (let r = 301; r <= 314; r++) makeStudents(3, String(r), 'sharing', ['A', 'B', 'C']);
for (let r = 315; r <= 318; r++) makeStudents(3, String(r), 'single', ['A']);

// Floor 4: rooms 401-412 (10 sharing, 2 single)
for (let r = 401; r <= 410; r++) makeStudents(4, String(r), 'sharing', ['A', 'B']);
for (let r = 411; r <= 412; r++) makeStudents(4, String(r), 'single', ['A']);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Student.deleteMany({});
    await AttendanceHistory.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const passwordHash = await bcrypt.hash('hostel123', 10);
    await User.create({ 
      username: 'admin', 
      passwordHash, 
      name: 'Admin Warden', 
      firstName: 'Admin', 
      lastName: 'Warden', 
      hostelType: 'boys', 
      role: 'admin' 
    });
    console.log('✅ Admin user created: admin / hostel123');

    // Create students
    const insertedStudents = await Student.insertMany(allStudents);
    console.log(`✅ Seeded ${insertedStudents.length} students across 4 floors`);

    // Create fake history for the past 5 days
    const historyData = [];
    const now = new Date();
    
    for (let i = 1; i <= 5; i++) {
      const historyDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));

      insertedStudents.forEach(student => {
        const rand = Math.random();
        let status = 'present';
        if (rand > 0.9) status = 'absent';
        else if (rand > 0.85) status = 'leave';

        let leaveStart = null;
        let leaveEnd = null;
        if (status === 'leave') {
          leaveStart = new Date(historyDate);
          leaveEnd = new Date(historyDate);
          leaveEnd.setUTCDate(leaveEnd.getUTCDate() + 2); // 2 days leave
        }

        historyData.push({
          studentId: student._id,
          date: historyDate,
          status,
          leaveStart,
          leaveEnd,
          archivedAt: new Date()
        });
      });
    }

    await AttendanceHistory.insertMany(historyData);
    console.log(`✅ Seeded ${historyData.length} attendance history records for the past 5 days`);

    console.log('\n🎉 Seed complete! Run the server and log in with:');
    console.log('   Username: admin');
    console.log('   Password: hostel123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
