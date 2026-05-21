import React, { useState, useEffect } from 'react';
import { Employee, DEPARTMENTS } from '../types';
import { X, UserPlus, Save, Briefcase } from 'lucide-react';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onSave: (employee: Omit<Employee, 'id'> & { id?: string }) => void;
}

const DEFAULT_EMPLOYEE_STATE: Omit<Employee, 'id'> = {
  name: '',
  email: '',
  phone: '',
  role: '',
  department: 'Engineering',
  status: 'Active',
  joinDate: new Date().toISOString().split('T')[0],
};

export function EmployeeModal({ isOpen, onClose, employee, onSave }: EmployeeModalProps) {
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>(DEFAULT_EMPLOYEE_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        department: employee.department,
        status: employee.status,
        joinDate: employee.joinDate,
      });
    } else {
      setFormData({
        ...DEFAULT_EMPLOYEE_STATE,
        joinDate: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [employee, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.role.trim()) newErrors.role = 'Job title/role is required';
    if (!formData.joinDate) newErrors.joinDate = 'Join date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(employee ? { ...formData, id: employee.id } : formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        id="modal-backdrop"
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
      />

      {/* Modal Box */}
      <div 
        id="modal-container"
        className="glass-panel rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative z-10 transition-transform scale-100 border border-white/15"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/5 text-indigo-400 border border-white/10 rounded-xl">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-sans">
                {employee ? 'Edit Employee Profile' : 'Register New Employee'}
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                {employee ? 'Modify record fields for the select directory entry' : 'Add a new member to the company roster'}
              </p>
            </div>
          </div>
          <button 
            id="modal-btn-close"
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-350 font-sans">Full Name *</label>
            <input
              id="input-full-name"
              type="text"
              className={`w-full px-3 py-2 text-sm glass-input rounded-xl focus:bg-slate-950/80 transition-all text-white font-sans ${
                errors.name ? 'border-rose-400/80 ring-2 ring-rose-500/10' : ''
              }`}
              placeholder="e.g. Jane Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-[11px] text-rose-400 font-sans">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-355 font-sans">Email Address *</label>
              <input
                id="input-email"
                type="email"
                className={`w-full px-3 py-2 text-sm glass-input rounded-xl focus:bg-slate-950/80 transition-all text-white font-mono ${
                  errors.email ? 'border-rose-400/80 ring-2 ring-rose-500/10' : ''
                }`}
                placeholder="jane.doe@skycorp.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {errors.email && <p className="text-[11px] text-rose-400 font-sans">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-355 font-sans">Phone Number *</label>
              <input
                id="input-phone"
                type="tel"
                className={`w-full px-3 py-2 text-sm glass-input rounded-xl focus:bg-slate-950/80 transition-all text-white font-mono ${
                  errors.phone ? 'border-rose-400/80 ring-2 ring-rose-500/10' : ''
                }`}
                placeholder="+1 (555) 0123"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              {errors.phone && <p className="text-[11px] text-rose-400 font-sans">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Department */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-355 font-sans">Department</label>
              <select
                id="select-department"
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-white cursor-pointer focus:bg-slate-900"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value as Employee['department'] })}
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept} className="bg-slate-900 text-slate-200">
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Role Job Title */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-355 font-sans">Role / Job Title *</label>
              <input
                id="input-role"
                type="text"
                className={`w-full px-3 py-2 text-sm glass-input rounded-xl focus:bg-slate-950/80 transition-all text-white font-sans ${
                  errors.role ? 'border-rose-400/80 ring-2 ring-rose-500/10' : ''
                }`}
                placeholder="Senior Product Manager"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              />
              {errors.role && <p className="text-[11px] text-rose-400 font-sans">{errors.role}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Join Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-355 font-sans">Onboarding / Join Date *</label>
              <input
                id="input-join-date"
                type="date"
                className={`w-full px-3 py-2 text-sm glass-input rounded-xl focus:bg-slate-950/80 transition-all text-white font-mono ${
                  errors.joinDate ? 'border-rose-400/80 ring-2 ring-rose-500/10' : ''
                }`}
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              />
              {errors.joinDate && <p className="text-[11px] text-rose-400 font-sans">{errors.joinDate}</p>}
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-355 font-sans">Employment Status</label>
              <select
                id="select-status"
                className="w-full px-3 py-2 text-sm glass-input rounded-xl text-white cursor-pointer focus:bg-slate-900"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Employee['status'] })}
              >
                <option value="Active" className="bg-slate-900 text-slate-200">Active</option>
                <option value="On Leave" className="bg-slate-900 text-slate-200">On Leave</option>
                <option value="Suspended" className="bg-slate-900 text-slate-200">Suspended</option>
                <option value="Terminated" className="bg-slate-900 text-slate-200">Terminated</option>
              </select>
            </div>
          </div>

          {/* Dialog Action Buttons */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 bg-black/15 -mx-6 -mb-6 p-4">
            <button
              id="modal-btn-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="modal-btn-save"
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-550 rounded-xl shadow-lg cursor-pointer transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{employee ? 'Update Profile' : 'Register Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
