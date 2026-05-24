const Leave = require('../models/Leave');
const EmployeeUser = require('../models/EmployeeUser');

exports.apply = async (req, res) => {
  try {
    const { employee, type, startDate, endDate, reason } = req.body;
    const leave = await Leave.create({ employee, type, startDate, endDate, reason });
    await leave.populate('employee', 'name employeeId department');
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.applyOwn = async (req, res) => {
  try {
    const empUser = await EmployeeUser.findById(req.user.id);
    if (!empUser) return res.status(404).json({ message: 'Not found' });
    const { type, startDate, endDate, reason } = req.body;
    const leave = await Leave.create({
      employee: empUser.employee, type, startDate, endDate, reason,
    });
    await leave.populate('employee', 'name employeeId department');
    res.status(201).json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { employeeId, status } = req.query;
    const query = {};
    if (employeeId) query.employee = employeeId;
    if (status) query.status = status;
    const leaves = await Leave.find(query)
      .populate('employee', 'name employeeId department')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status, reviewNote } = req.body;
    if (!['Approved', 'Rejected'].includes(status))
      return res.status(400).json({ message: 'Status must be Approved or Rejected' });
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, reviewNote, reviewedBy: req.user.id },
      { new: true }
    ).populate('employee', 'name employeeId department');
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
