import React, { useState, useEffect } from 'react';
import { Employee, AttendanceLog } from '../types';
import { Clock, Play, Square, Award, CheckCircle2, UserCheck, AlertTriangle } from 'lucide-react';

interface PunchCardProps {
  employees: Employee[];
  attendanceLogs: AttendanceLog[];
  selectedEmployeeId: string;
  onSelectEmployee: (id: string) => void;
  onClockIn: (employeeId: string, time: string, status: AttendanceLog['status'], notes?: string) => void;
  onClockOut: (logId: string, time: string, notes?: string) => void;
}

export function PunchCard({
  employees,
  attendanceLogs,
  selectedEmployeeId,
  onSelectEmployee,
  onClockIn,
  onClockOut
}: PunchCardProps) {
  // Find current selected employee
  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
  const activeEmployees = employees.filter(e => e.status === 'Active');

  // Find if today has an active check-in (clocked in but not clocked out)
  const todayStr = new Date().toISOString().split('T')[0];
  const activeLog = attendanceLogs.find(
    log => log.employeeId === selectedEmployeeId && log.date === todayStr && !log.clockOut
  );

  const completedTodayLog = attendanceLogs.find(
    log => log.employeeId === selectedEmployeeId && log.date === todayStr && log.clockOut
  );

  // Form states
  const [punchTime, setPunchTime] = useState('');
  const [status, setStatus] = useState<AttendanceLog['status']>('Present');
  const [notes, setNotes] = useState('');

  // Get current HH:MM
  const getCurrentTimeStr = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Set default times on change
  useEffect(() => {
    setPunchTime(getCurrentTimeStr());
    setNotes('');
    setStatus('Present');
  }, [selectedEmployeeId, activeLog]);

  // Dynamic automatic status adjustment based on clock-in hours (Rule: Standard clock-in is 09:00 AM)
  useEffect(() => {
    if (punchTime && !activeLog) {
      const [hours, minutes] = punchTime.split(':').map(Number);
      if (hours > 9 || (hours === 9 && minutes > 0)) {
        setStatus('Late');
      } else {
        setStatus('Present');
      }
    }
  }, [punchTime, activeLog]);

  const handlePunchAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployeeId) return;

    if (activeLog) {
      // Clock out
      onClockOut(activeLog.id, punchTime, notes);
    } else {
      // Clock in
      onClockIn(selectedEmployeeId, punchTime, status, notes);
    }

    // Reset notes
    setNotes('');
  };

  return (
    <div id="punch-card" className="glass-panel rounded-2xl shadow-xl p-6 space-y-5">
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
        <div className="p-2 bg-white/5 text-indigo-400 border border-white/10 rounded-xl">
          <Clock className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white font-sans">Active Punch Card</h3>
          <p className="text-xs text-slate-400 font-sans">Select staff to record dynamic hours in real-time</p>
        </div>
      </div>

      {/* Select Employee dropdown */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-300 font-sans">Select Active Employee *</label>
        <select
          id="punch-select-employee"
          className="w-full px-3 py-2 text-sm glass-input rounded-xl text-slate-100 font-sans cursor-pointer focus:bg-slate-900"
          value={selectedEmployeeId}
          onChange={(e) => onSelectEmployee(e.target.value)}
        >
          <option value="" className="bg-slate-900 text-slate-400">-- Choose active personnel --</option>
          {activeEmployees.map(emp => (
            <option key={emp.id} value={emp.id} className="bg-slate-900 text-slate-200">
              {emp.name} ({emp.department} - {emp.role})
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee ? (
        <form onSubmit={handlePunchAction} className="space-y-4">
          {/* Card status display */}
          <div className="p-3.5 rounded-xl border border-white/10 flex items-center gap-3.5 bg-white/5">
            <div className={`w-3 h-3 rounded-full ${
              activeLog ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]' : completedTodayLog ? 'bg-slate-400' : 'bg-slate-600'
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate font-sans">
                {selectedEmployee.name}
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {activeLog 
                  ? `Clocked In today at ${activeLog.clockIn}` 
                  : completedTodayLog 
                    ? `Done for today (In: ${completedTodayLog.clockIn} | Out: ${completedTodayLog.clockOut})` 
                    : 'Awaiting first clock-in today'
                }
              </p>
            </div>
            {activeLog && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold shrink-0">
                On Duty
              </span>
            )}
            {completedTodayLog && (
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 font-bold shrink-0">
                Completed
              </span>
            )}
          </div>

          {/* Time & status fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 font-sans">
                {activeLog ? 'Clock Out Time' : 'Clock In Time'}
              </label>
              <input
                id="punch-time-input"
                type="time"
                className="w-full px-3 py-1.5 text-sm glass-input rounded-xl focus:bg-slate-950/80 text-white font-mono"
                value={punchTime}
                onChange={(e) => setPunchTime(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 font-sans">Log Status</label>
              {activeLog ? (
                <div className="w-full px-3 py-1.5 text-sm border border-white/10 bg-white/5 rounded-xl text-indigo-300 font-sans font-semibold">
                  {activeLog.status}
                </div>
              ) : (
                <select
                  id="punch-status-select"
                  className="w-full px-3 py-1.5 text-sm glass-input rounded-xl focus:bg-slate-900 text-white font-sans"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AttendanceLog['status'])}
                  disabled={!!activeLog}
                >
                  <option value="Present" className="bg-slate-900 text-slate-200">Present</option>
                  <option value="Late" className="bg-slate-900 text-slate-200">Late</option>
                  <option value="Half Day" className="bg-slate-900 text-slate-200">Half Day</option>
                  <option value="Absent" className="bg-slate-900 text-slate-200">Absent</option>
                </select>
              )}
            </div>
          </div>

          {!activeLog && status === 'Late' && (
            <div className="px-3 py-2 bg-amber-500/10 text-amber-300 border border-amber-500/25 rounded-xl flex items-start gap-2 text-xs font-sans">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Grace Period exceeded:</strong> standard check-in threshold is set to <strong>09:00 AM</strong>. Auto-flagging as tardy.
              </span>
            </div>
          )}

          {/* Optional notes */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 font-sans">Shift Notes (Optional)</label>
            <input
              id="punch-notes-input"
              type="text"
              placeholder={activeLog ? "Describe work done, handovers..." : "Traffic, doctor visit, comments..."}
              className="w-full px-3 py-1.5 text-xs glass-input rounded-xl focus:bg-slate-950/80 text-white font-sans"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Action button */}
          <button
            id="punch-submit-btn"
            type="submit"
            className={`w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 hover:scale-[1.01] ${
              activeLog
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20 border border-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20 border border-indigo-500/30'
            }`}
          >
            {activeLog ? (
              <>
                <Square className="w-4 h-4 fill-current" />
                <span>CLOCK OUT DIRECTLY</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>CLOCK IN SECURELY</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="py-12 px-4 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center space-y-3 bg-white/[0.01]">
          <div className="p-3 bg-white/5 border border-white/10 text-slate-400 rounded-full">
            <UserCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <div className="space-y-1 max-w-sm">
            <h4 className="text-xs font-bold text-slate-200 font-sans">No staff selected</h4>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Select an active member from the roster or dropdown list to punch and record daily hours.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
