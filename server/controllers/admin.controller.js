const User = require('../models/User');

exports.getWardens = async (req, res) => {
  try {
    const wardens = await User.find({ role: 'warden' }).select('-passwordHash').sort({ createdAt: -1 });
    res.json(wardens);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteWarden = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedWarden = await User.findByIdAndDelete(id);
    if (!deletedWarden) {
      return res.status(404).json({ message: 'Warden not found' });
    }
    res.json({ message: 'Warden deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createWarden = async (req, res) => {
  try {
    const { username, firstName, lastName, password, email, hostelType } = req.body;
    
    // Basic validation
    if (!username || !firstName || !lastName || !password || !hostelType) {
      return res.status(400).json({ message: 'Please fill all required fields' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const newWarden = new User({
      username,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`, // for backwards compatibility
      passwordHash,
      email,
      hostelType,
      role: 'warden',
    });

    await newWarden.save();
    
    // Return without password hash
    const wardenResponse = newWarden.toObject();
    delete wardenResponse.passwordHash;

    res.status(201).json(wardenResponse);
  } catch (err) {
    console.error('Error creating warden:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateWarden = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, firstName, lastName, password, email, hostelType } = req.body;

    const warden = await User.findById(id);
    if (!warden) {
      return res.status(404).json({ message: 'Warden not found' });
    }

    if (username && username !== warden.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      warden.username = username;
    }

    if (firstName) warden.firstName = firstName;
    if (lastName) warden.lastName = lastName;
    if (firstName || lastName) warden.name = `${warden.firstName} ${warden.lastName}`;
    if (email !== undefined) warden.email = email;
    if (hostelType) warden.hostelType = hostelType;

    if (password) {
      const bcrypt = require('bcryptjs');
      warden.passwordHash = await bcrypt.hash(password, 10);
    }

    await warden.save();

    const wardenResponse = warden.toObject();
    delete wardenResponse.passwordHash;

    res.json(wardenResponse);
  } catch (err) {
    console.error('Error updating warden:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
