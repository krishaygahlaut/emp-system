const jwt = require('jsonwebtoken');
const EmployeeUser = require('../models/EmployeeUser');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Schedule = require('../models/Schedule');

const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { employeeId, email, password } = req.body;
    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    const existing = await EmployeeUser.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Login already exists for this email' });
    const user = await EmployeeUser.create({ employee: employeeId, email, password });
    res.status(201).json({ message: 'Employee login created', userId: user._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await EmployeeUser.findOne({ email }).populate('employee');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account disabled. Contact admin.' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id, 'employee');
    res.json({
      token,
      role: 'employee',
      user: {
        id: user._id,
        name: user.employee.name,
        email: user.email,
        employeeId: user.employee.employeeId,
        department: user.employee.department,
        position: user.employee.position,
        employeeObjectId: user.employee._id,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyProfile = async (req, res) => {
  try {
    const user = await EmployeeUser.findById(req.user.id).populate('employee');
    if (!user) return res.status(404).json({ message: 'Not found' });
    res.json({
      name: user.employee.name,
      email: user.email,
      employeeId: user.employee.employeeId,
      department: user.employee.department,
      position: user.employee.position,
      joiningDate: user.employee.joiningDate,
      status: user.employee.status,
      phone: user.employee.phone,
      employeeObjectId: user.employee._id,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyAttendance = async (req, res) => {
  try {
    const user = await EmployeeUser.findById(req.user.id);
    const { month, year } = req.query;
    const query = { employee: user.employee };
    if (month && year) {
      query.date = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    }
    const records = await Attendance.find(query).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const user = await EmployeeUser.findById(req.user.id);
    const leaves = await Leave.find({ employee: user.employee }).sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMySchedule = async (req, res) => {
  try {
    const user = await EmployeeUser.findById(req.user.id);
    const schedules = await Schedule.find({ employee: user.employee }).sort({ date: 1 });
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
