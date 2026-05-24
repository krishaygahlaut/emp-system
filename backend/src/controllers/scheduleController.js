const Schedule = require('../models/Schedule');

exports.assign = async (req, res) => {
  try {
    const { employee, shift, startTime, endTime, date, notes } = req.body;
    const schedule = await Schedule.create({ employee, shift, startTime, endTime, date, notes });
    await schedule.populate('employee', 'name employeeId department');
    res.status(201).json(schedule);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { employeeId, date } = req.query;
    const query = {};
    if (employeeId) query.employee = employeeId;
    if (date) {
      const d = new Date(date);
      query.date = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    const schedules = await Schedule.find(query)
      .populate('employee', 'name employeeId department')
      .sort({ date: 1 });

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
