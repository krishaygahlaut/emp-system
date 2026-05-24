const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
    shift: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Night', 'Flexible'],
      required: true,
    },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    date: { type: Date, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Schedule', scheduleSchema);
