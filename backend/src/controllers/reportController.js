const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');

exports.monthly = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const [totalEmployees, activeEmployees, attendance, leaves] = await Promise.all([
      Employee.countDocuments(),
      Employee.countDocuments({ status: 'Active' }),
      Attendance.find({ date: { $gte: startDate, $lt: endDate } }),
      Leave.find({ startDate: { $gte: startDate, $lt: endDate } }),
    ]);

    const presentCount = attendance.filter((a) => a.status === 'Present').length;
    const absentCount = attendance.filter((a) => a.status === 'Absent').length;
    const halfDayCount = attendance.filter((a) => a.status === 'Half-day').length;

    const approvedLeaves = leaves.filter((l) => l.status === 'Approved').length;
    const pendingLeaves = leaves.filter((l) => l.status === 'Pending').length;

    // daily attendance breakdown for chart
    const dailyMap = {};
    attendance.forEach((a) => {
      const day = new Date(a.date).getDate();
      if (!dailyMap[day]) dailyMap[day] = { present: 0, absent: 0, halfDay: 0 };
      if (a.status === 'Present') dailyMap[day].present++;
      else if (a.status === 'Absent') dailyMap[day].absent++;
      else dailyMap[day].halfDay++;
    });

    const dailyBreakdown = Object.entries(dailyMap).map(([day, counts]) => ({
      day: parseInt(day),
      ...counts,
    }));

    // department-wise headcount
    const deptAgg = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 } } },
    ]);

    res.json({
      month,
      year,
      totalEmployees,
      activeEmployees,
      attendance: { total: attendance.length, present: presentCount, absent: absentCount, halfDay: halfDayCount },
      leaves: { total: leaves.length, approved: approvedLeaves, pending: pendingLeaves },
      dailyBreakdown,
      departmentBreakdown: deptAgg.map((d) => ({ department: d._id, count: d.count })),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
