require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./src/models/Admin');
const Employee = require('./src/models/Employee');

const employees = [
  { name: 'Priya Sharma', email: 'priya@company.com', phone: '9876543210', department: 'Engineering', position: 'Senior Developer', joiningDate: '2022-03-15', status: 'Active' },
  { name: 'Rahul Mehta', email: 'rahul@company.com', phone: '9876543211', department: 'Marketing', position: 'Marketing Manager', joiningDate: '2021-07-01', status: 'Active' },
  { name: 'Ananya Iyer', email: 'ananya@company.com', phone: '9876543212', department: 'HR', position: 'HR Executive', joiningDate: '2023-01-20', status: 'Active' },
  { name: 'Karan Joshi', email: 'karan@company.com', phone: '9876543213', department: 'Finance', position: 'Financial Analyst', joiningDate: '2022-09-05', status: 'Active' },
  { name: 'Sneha Patel', email: 'sneha@company.com', phone: '9876543214', department: 'Design', position: 'UI/UX Designer', joiningDate: '2023-04-11', status: 'On Leave' },
  { name: 'Arjun Nair', email: 'arjun@company.com', phone: '9876543215', department: 'Engineering', position: 'DevOps Engineer', joiningDate: '2020-11-30', status: 'Active' },
  { name: 'Pooja Gupta', email: 'pooja@company.com', phone: '9876543216', department: 'Sales', position: 'Sales Executive', joiningDate: '2023-06-01', status: 'Active' },
  { name: 'Vikram Singh', email: 'vikram@company.com', phone: '9876543217', department: 'Operations', position: 'Operations Lead', joiningDate: '2021-02-14', status: 'Inactive' },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Admin.deleteMany({});
    await Admin.create({ name: 'Admin', email: 'admin@company.com', password: 'admin123' });
    console.log('✓ Admin created: admin@company.com / admin123');

    await Employee.deleteMany({});
    for (const emp of employees) {
      await Employee.create(emp);
    }
    console.log(`✓ ${employees.length} employees seeded`);

    console.log('\nSeeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
