const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const EmployeeUser = require('../models/EmployeeUser');

exports.mark = async (req, res) => {
  try {
    const { employee, date, status, checkIn, checkOut, notes } = req.body;
    const emp = await Employee.findById(employee);
    if (!emp) return res.status(404).json({ message: 'Employee not found' });
    const record = await Attendance.findOneAndUpdate(
      { employee, date: new Date(date) },
      { status, checkIn, checkOut, notes, markedBy: 'admin' },
      { upsert: true, new: true }
    );
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.markSelfie = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const empUser = await EmployeeUser.findById(req.user.id);
    if (!empUser) return res.status(404).json({ message: 'Employee not found' });
    const selfieUrl = req.file?.path || null;
    const selfiePublicId = req.file?.filename || null;
    if (status === 'Present' && !selfieUrl) {
      return res.status(400).json({ message: 'Selfie is required to mark Present' });
    }
    const now = new Date();
    const checkIn = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const record = await Attendance.findOneAndUpdate(
      { employee: empUser.employee, date: today },
      { status, checkIn, notes, selfieUrl, selfiePublicId, markedBy: 'employee' },
      { upsert: true, new: true }
    );
    res.status(201).json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { employeeId, date, month, year } = req.query;
    const query = {};
    if (employeeId) query.employee = employeeId;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    } else if (month && year) {
      query.date = {
        $gte: new Date(year, month - 1, 1),
        $lt: new Date(year, month, 1),
      };
    }
    const records = await Attendance.find(query)
      .populate('employee', 'name employeeId department')
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
