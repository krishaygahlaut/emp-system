const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    department: {
      type: String,
      required: true,
      enum: ['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Design'],
    },
    position: { type: String, required: true },
    joiningDate: { type: Date, required: true },
    status: { type: String, enum: ['Active', 'Inactive', 'On Leave'], default: 'Active' },
    employeeId: { type: String, unique: true },
  },
  { timestamps: true }
);

// Auto-generate employeeId like EMP-0001
employeeSchema.pre('save', async function (next) {
  if (this.isNew && !this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);
