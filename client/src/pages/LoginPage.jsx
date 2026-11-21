import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Eye,
  Lock,
  Mail,
  Shield,
  User,
  Briefcase,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'department') navigate('/department');
      else navigate(redirect === '/admin' || redirect === '/department' ? '/citizen' : redirect);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuick = async (roleType) => {
    setLoading(true);
    setError('');
    try {
      await quickLogin(roleType);
      if (roleType === 'citizen') navigate('/citizen');
      else if (roleType === 'admin') navigate('/admin');
      else if (roleType === 'department') navigate('/department');
    } catch (err) {
      setError('Quick login failed: ' + err.message);
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
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Access CivicEye AI</h1>
        <p className="text-sm text-slate-400 mt-1">
          Select an instant evaluation role or enter your credentials
        </p>
      </div>

      <div className="card p-6 sm:p-8 border-slate-800 shadow-2xl space-y-6">
        {/* Tab Switcher between Sign In and Sign Up */}
        <div className="grid grid-cols-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            type="button"
            className="py-2.5 rounded-lg bg-blue-600 text-white shadow-md transition-all text-center"
          >
            Sign In
          </button>
          <Link
            to="/register"
            className="py-2.5 rounded-lg text-slate-400 hover:text-white transition-all text-center"
          >
            Sign Up / Register
          </Link>
        </div>

        {/* 1-Click Instant Evaluation Accounts */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
              <Sparkles size={14} className="text-cyan-400 animate-pulse" />
              <span>1-Click Hackathon Demo Logins</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">No typing required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Citizen */}
            <button
              type="button"
              onClick={() => handleQuick('citizen')}
              className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/50 hover:bg-blue-900/40 hover:border-blue-500 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <User size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Citizen</span>
              </div>
              <div className="font-bold text-white text-xs">Priya Sharma</div>
              <div className="text-[10px] text-slate-400 truncate">citizen@civiceye.org</div>
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => handleQuick('admin')}
              className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 hover:bg-purple-900/40 hover:border-purple-500 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Shield size={16} className="text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Admin</span>
              </div>
              <div className="font-bold text-white text-xs">Rajesh Varma</div>
              <div className="text-[10px] text-slate-400 truncate">admin@civiceye.org</div>
            </button>

            {/* Department */}
            <button
              type="button"
              onClick={() => handleQuick('department')}
              className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 hover:bg-amber-900/40 hover:border-amber-500 text-left transition-all group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Briefcase size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Roads Dept</span>
              </div>
              <div className="font-bold text-white text-xs">Vikram Reddy</div>
              <div className="text-[10px] text-slate-400 truncate">roads@civiceye.org</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-900/80 text-xs text-red-200 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Manual Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="text-center relative my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <span className="relative bg-[#111827] px-3 text-[11px] text-slate-500 uppercase font-semibold">Or Sign In with Email</span>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Email Address</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="email"
                placeholder="citizen@civiceye.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10 text-xs py-2.5"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10 text-xs py-2.5"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800">
          New citizen?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
