const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const generateToken = (id) =>
  jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await admin.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = generateToken(admin._id);
    res.json({
      token,
      user: { id: admin._id, name: admin.name, email: admin.email, role: 'admin' },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password');
    if (!admin) return res.status(404).json({ message: 'User not found' });
    res.json(admin);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.seedAdmin = async () => {
  const exists = await Admin.findOne({ email: 'admin@company.com' });
  if (!exists) {
    await Admin.create({ name: 'Admin', email: 'admin@company.com', password: 'admin123' });
    console.log('Default admin seeded: admin@company.com / admin123');
  }
};
