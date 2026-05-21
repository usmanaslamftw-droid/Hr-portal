import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  UserCheck, 
  MapPin, 
  Plus, 
  Database, 
  Filter, 
  Building2, 
  Calendar, 
  Award, 
  Compass, 
  Search, 
  Clock,
  RotateCcw,
  RefreshCw,
  UserCheck2,
  AlertCircle
} from 'lucide-react';

import { Employee, AttendanceLog, DEPARTMENTS } from './types';
import { INITIAL_EMPLOYEES, INITIAL_ATTENDANCE } from './initialData';
import { MetricCard } from './components/MetricCard';
import { EmployeeRow } from './components/EmployeeRow';
import { EmployeeModal } from './components/EmployeeModal';
import { PunchCard } from './components/PunchCard';
import { AttendanceList } from './components/AttendanceList';

export default function App() {
  // Load state from local storage or defaults
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('hr_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [attendance, setAttendance] = useState<AttendanceLog[]>(() => {
    const saved = localStorage.getItem('hr_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  // UI state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Time ticker state
  const [currentTime, setCurrentTime] = useState<string>('');

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem('hr_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('hr_attendance', JSON.stringify(attendance));
  }, [attendance]);

  // Keep digital clock running
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute stats
  const todayStr = new Date().toISOString().split('T')[0];
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.status === 'Active');
  const activeCount = activeEmployees.length;

  // Clock-ins today
  const todaysLogs = attendance.filter(log => log.date === todayStr);
  const clockedInToday = Array.from(new Set(todaysLogs.map(log => log.employeeId))).length;
  const lateCountToday = todaysLogs.filter(log => log.status === 'Late').length;

  // Calculate rate
  const attendanceRate = activeCount > 0 
    ? Math.round((clockedInToday / activeCount) * 100) 
    : 0;

  // Handlers
  const handleAddOrEditEmployee = (empData: Omit<Employee, 'id'> & { id?: string }) => {
    if (empData.id) {
      // Edit existing
      setEmployees(prev => prev.map(e => e.id === empData.id ? { ...e, ...empData as Employee } : e));
      
      // Cascade name update with existing attendances
      setAttendance(prev => prev.map(log => 
        log.employeeId === empData.id 
          ? { ...log, employeeName: empData.name } 
          : log
      ));
    } else {
      // Create new
      const newId = `emp-${Date.now().toString().slice(-6)}`;
      const newEmployee: Employee = {
        id: newId,
        ...empData,
      };
      setEmployees(prev => [newEmployee, ...prev]);
    }
  };

  const handleEditTrigger = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCreateTrigger = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleClockIn = (employeeId: string, time: string, status: AttendanceLog['status'], notes?: string) => {
    const targetEmployee = employees.find(e => e.id === employeeId);
    if (!targetEmployee) return;

    const newLog: AttendanceLog = {
      id: `att-${Date.now().toString().slice(-6)}`,
      employeeId,
      employeeName: targetEmployee.name,
      date: todayStr,
      clockIn: time,
      status,
      notes: notes?.trim() || undefined,
    };

    setAttendance(prev => [newLog, ...prev]);
  };

  const handleClockOut = (logId: string, time: string, notes?: string) => {
    setAttendance(prev => prev.map(log => {
      if (log.id === logId) {
        return {
          ...log,
          clockOut: time,
          notes: notes?.trim() ? (log.notes ? `${log.notes} | ${notes.trim()}` : notes.trim()) : log.notes
        };
      }
      return log;
    }));
  };

  const handleDeleteLog = (id: string) => {
    setAttendance(prev => prev.filter(log => log.id !== id));
  };

  // Reset factory presets diagnostic
  const handleResetStorage = () => {
    if (window.confirm('Reset directory and attendance to original sandbox metrics? Custom entries will be removed.')) {
      setEmployees(INITIAL_EMPLOYEES);
      setAttendance(INITIAL_ATTENDANCE);
      setSelectedEmployeeId('');
      setSearchQuery('');
      setDeptFilter('All');
      setStatusFilter('All');
    }
  };

  // Filter Employees
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div id="hr-portal-root" className="min-h-screen mesh-bg text-slate-200 pb-12 flex flex-col font-sans">
      {/* Upper Brand Info Bar */}
      <header className="border-b border-white/5 glass-panel sticky top-0 z-40 bg-transparent shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg flex items-center justify-center border border-indigo-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight font-sans">
                SkyCorp HR Console
              </h1>
              <p className="text-[11px] text-slate-400 font-sans flex items-center gap-1.5">
                <span>Enterprise Registry Suite</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                <span className="text-slate-500 font-mono text-[10px]">Local-Sandbox</span>
              </p>
            </div>
          </div>

          {/* Time & Clock widgets */}
          <div className="flex items-center gap-4 text-right">
            <div className="hidden md:block">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block font-sans">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span className="text-sm font-bold text-slate-150 font-mono block tracking-wider">
                {currentTime || '--:--:--'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 space-y-6">
        
        {/* Welcome Block */}
        <div className="md:flex md:items-center md:justify-between py-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Centralized Workstation Dashboard
            </h2>
            <p className="text-slate-400 text-sm">
              Keep records of payroll registry staff, monitor clock logs, and inspect check-in activities.
            </p>
          </div>
          <button
            id="btn-register-employee-top"
            onClick={handleCreateTrigger}
            className="mt-4 md:mt-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-505 rounded-xl text-white font-bold text-xs transition-colors cursor-pointer shadow-lg flex items-center gap-2 border border-indigo-500/30 hover:scale-[1.01]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>

        {/* Header Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            id="stat-headcount"
            title="Registered Roster"
            value={totalEmployees}
            subtext="Total members in catalog"
            icon={<Users className="w-5 h-5 text-indigo-400" />}
          />
          <MetricCard
            id="stat-active"
            title="Active Force"
            value={activeCount}
            subtext="Excludes suspended or leave"
            icon={<UserCheck className="w-5 h-5 text-emerald-400" />}
            trend={{ value: `${Math.round((activeCount / (totalEmployees || 1)) * 100)}%`, isPositive: true }}
          />
          <MetricCard
            id="stat-attendance"
            title="Clocked-In Today"
            value={clockedInToday}
            subtext="Punch entries for today"
            icon={<Clock className="w-5 h-5 text-amber-500" />}
          />
          <MetricCard
            id="stat-rate"
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            subtext="Active staff on duty today"
            icon={<Award className="w-5 h-5 text-indigo-400" />}
            trend={{ value: `${lateCountToday} late`, isPositive: lateCountToday === 0 }}
          />
        </div>

        {/* Dashboard Columns split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* L: Employee Directory Column (7/12) */}
          <section id="directory-col" className="lg:col-span-7 space-y-4">
            <div className="glass-panel rounded-2xl p-5 shadow-xl space-y-4">
              
              {/* Directory Filter Panel */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/5 text-indigo-300 rounded-lg border border-white/10">
                    <Compass className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-bold text-white text-sm">Personnel Directory</h3>
                </div>
                <div className="text-xs text-indigo-300 font-bold font-mono bg-indigo-500/10 px-2.5 py-0.5 rounded-lg border border-indigo-500/25">
                  {filteredEmployees.length} registered match
                </div>
              </div>

              {/* Filters Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pb-1">
                {/* Search */}
                <div className="relative font-sans col-span-1">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    id="search-employee-query"
                    type="text"
                    placeholder="Search name, job role..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs glass-input rounded-xl text-white outline-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Department filter */}
                <select
                  id="department-select-filter"
                  className="px-3 py-1.5 text-xs glass-input rounded-xl text-white font-sans cursor-pointer focus:bg-slate-900"
                  value={deptFilter}
                  onChange={(e) => setDeptFilter(e.target.value)}
                >
                  <option value="All" className="bg-slate-900 text-slate-200">All Departments</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept} className="bg-slate-900 text-slate-200">{dept}</option>
                  ))}
                </select>

                {/* Status filter */}
                <select
                  id="status-select-filter"
                  className="px-3 py-1.5 text-xs glass-input rounded-xl text-white font-sans cursor-pointer focus:bg-slate-900"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All" className="bg-slate-900 text-slate-400">All Statuses</option>
                  <option value="Active" className="bg-slate-900 text-slate-200">Active</option>
                  <option value="On Leave" className="bg-slate-900 text-slate-200">On Leave</option>
                  <option value="Suspended" className="bg-slate-900 text-slate-200">Suspended</option>
                  <option value="Terminated" className="bg-slate-900 text-slate-200">Terminated</option>
                </select>
              </div>

              {/* Roster list */}
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map(emp => (
                    <EmployeeRow
                      key={emp.id}
                      employee={emp}
                      onEdit={handleEditTrigger}
                      onSelectPunch={(e) => setSelectedEmployeeId(e.id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 px-4 border border-dashed border-white/10 rounded-xl bg-white/[0.01] space-y-3">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-slate-450 shadow-sm">
                      <Users className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-200">No personnel found</p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                        We couldn&apos;t find any records matching that specific filter. Try adding a member.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* R: Attendance Logger Column (5/12) */}
          <section id="attendance-col" className="lg:col-span-5 space-y-6">
            
            {/* Interactive check-in/out module */}
            <PunchCard
              employees={employees}
              attendanceLogs={attendance}
              selectedEmployeeId={selectedEmployeeId}
              onSelectEmployee={setSelectedEmployeeId}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
            />

            {/* Attendance logs lists */}
            <AttendanceList
              logs={attendance}
              onDeleteLog={handleDeleteLog}
            />

          </section>

        </div>
      </main>

      {/* Footer System Diagnostics status line */}
      <footer className="mt-auto border-t border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sandbox diagnostics: <strong className="text-slate-200">{totalEmployees}</strong> corporate records | <strong className="text-slate-200">{attendance.length}</strong> logged intervals</span>
          </div>
          <button
            id="btn-purge-database"
            onClick={handleResetStorage}
            className="text-[11px] font-bold text-rose-450 hover:text-rose-350 bg-rose-500/10 hover:bg-rose-500/18 border border-rose-500/22 px-3 py-1 rounded-lg cursor-pointer transition-all flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            Reset Initial Database
          </button>
        </div>
      </footer>

      {/* Roster Add/Edit Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={editingEmployee}
        onSave={handleAddOrEditEmployee}
      />
    </div>
  );
}
