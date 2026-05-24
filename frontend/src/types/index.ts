export interface Employee {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joiningDate: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  createdAt: string;
}

export interface Attendance {
  _id: string;
  employee: Employee | string;
  date: string;
  status: 'Present' | 'Absent' | 'Half-day';
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export interface Leave {
  _id: string;
  employee: Employee | string;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  reviewNote?: string;
  createdAt: string;
}

export interface Schedule {
  _id: string;
  employee: Employee | string;
  shift: string;
  startTime: string;
  endTime: string;
  date: string;
  notes?: string;
}

export interface MonthlyReport {
  month: number;
  year: number;
  totalEmployees: number;
  activeEmployees: number;
  attendance: { total: number; present: number; absent: number; halfDay: number };
  leaves: { total: number; approved: number; pending: number };
  dailyBreakdown: { day: number; present: number; absent: number; halfDay: number }[];
  departmentBreakdown: { department: string; count: number }[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}
