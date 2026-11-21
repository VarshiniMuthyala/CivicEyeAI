import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  Lock,
  Mail,
  User,
  Briefcase,
  ArrowRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../utils/constants';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('citizen');
  const [department, setDepartment] = useState('Roads and Infrastructure Department');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await register({
        name,
        email,
        password,
        role,
        department: role === 'department' ? department : null
      });

      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'department') navigate('/department');
      else navigate('/citizen');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-xl">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-xl shadow-blue-500/20 mx-auto mb-3">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Eye className="w-7 h-7 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Join CivicEye AI</h1>
        <p className="text-sm text-slate-400 mt-1">
          Create an account to submit, triage, and resolve civic grievances
        </p>
      </div>

      <div className="card p-6 sm:p-8 border-slate-800 shadow-2xl space-y-6">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
          <Link
            to="/login"
            className="py-2.5 rounded-lg text-slate-400 hover:text-white transition-all text-center"
          >
            Sign In
          </Link>
          <button
            type="button"
            className="py-2.5 rounded-lg bg-blue-600 text-white shadow-md transition-all text-center"
          >
            Sign Up / Register
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/80 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Role Selection Cards */}
          <div>
            <label className="text-slate-300 font-semibold block mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('citizen')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  role === 'citizen'
                    ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <User size={16} className={role === 'citizen' ? 'text-blue-400' : 'text-slate-400'} />
                  <span className="font-bold text-white text-xs">Citizen</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Report potholes, trash, leaks and track repairs.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setRole('department')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  role === 'department'
                    ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Briefcase size={16} className={role === 'department' ? 'text-amber-400' : 'text-slate-400'} />
                  <span className="font-bold text-white text-xs">Department Staff</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Municipal squad receiving field tasks & proofs.
                </p>
              </button>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Full Name</label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10 text-xs py-2.5"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                placeholder="citizen@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 text-xs py-2.5"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Password (min 6 characters)</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 text-xs py-2.5"
                minLength={6}
                required
              />
            </div>
          </div>

          {role === 'department' && (
            <div>
              <label className="text-slate-300 font-semibold block mb-1">Assigned Municipal Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="input-field text-xs py-2.5"
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 mt-3"
          >
            <span>{loading ? 'Creating Account...' : 'Complete Sign Up'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
