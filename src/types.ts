export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Suspended' | 'Terminated';
  joinDate: string;
}

export interface AttendanceLog {
  id: string;
  employeeId: string;
  employeeName: string; // denormalized for search & easy display
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:MM
  clockOut?: string; // HH:MM
  status: 'Present' | 'Late' | 'Half Day' | 'Absent';
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Sick Leave' | 'Annual Leave' | 'Maternity/Paternity' | 'Compassionate' | 'Unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

export interface ReimbursementClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  claimType: 'Medical Checkup' | 'Prescription' | 'Dental Care' | 'Vision Care' | 'Hospitalization';
  amount: number;
  claimDate: string;
  description: string;
  receiptNumber: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface PayrollSlip {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  role: string;
  payPeriod: string; // e.g. "May 2026"
  baseSalary: number;
  bonus: number;
  allowance: number;
  deductions: number;
  netSalary: number;
  status: 'Pending' | 'Paid';
  paymentDate?: string;
}

export type Department = 'Engineering' | 'HR' | 'Design' | 'Marketing' | 'Sales' | 'Finance' | 'Operations';

export const DEPARTMENTS: Department[] = [
  'Engineering',
  'HR',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Operations'
];

