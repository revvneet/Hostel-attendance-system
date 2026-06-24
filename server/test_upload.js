const fs = require('fs');
const FormData = require('form-data');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const User = require('./models/User');
  const user = await User.findOne({ username: 'admin' });
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  fs.writeFileSync('test.jpg', 'fake image data');
  const form = new FormData();
  form.append('photo', fs.createReadStream('test.jpg'));

  const uploadRes = await fetch('http://localhost:5001/api/auth/upload-profile-picture', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });

  const uploadData = await uploadRes.text();
  console.log('UPLOAD STATUS:', uploadRes.status);
  console.log('UPLOAD DATA:', uploadData);
  process.exit();
}
test();
