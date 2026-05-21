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
