import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Eye,
  PlusCircle,
  BarChart3,
  Search,
  Shield,
  Briefcase,
  User,
  LogOut,
  Globe,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  Layers
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const Navbar = () => {
  const { user, isAuthenticated, role, logout, quickLogin } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [dashboardsOpen, setDashboardsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleQuickLogin = async (roleType) => {
    try {
      await quickLogin(roleType);
      setDemoMenuOpen(false);
      setMobileMenuOpen(false);
      if (roleType === 'citizen') navigate('/citizen');
      else if (roleType === 'admin') navigate('/admin');
      else if (roleType === 'department') navigate('/department');
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-800/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Eye className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white font-['Outfit']">CivicEye</span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-cyan-300 border border-blue-500/30">AI</span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block tracking-wide">Digital Governance & Triage</p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive('/') ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            {t('navHome')}
          </Link>
          <Link
            to="/report"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/report') ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            <PlusCircle size={15} className="text-blue-400" />
            {t('navReport')}
          </Link>

          {/* Dashboards Dropdown / Nav Menu */}
          <div className="relative">
            <button
              onClick={() => setDashboardsOpen(!dashboardsOpen)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                isActive('/dashboard') || isActive('/admin') || isActive('/citizen') || isActive('/department')
                  ? 'text-cyan-400 bg-slate-800/60'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
              }`}
            >
              <LayoutDashboard size={15} className="text-cyan-400" />
              <span>Dashboards</span>
              <ChevronDown size={13} className={`transition-transform ${dashboardsOpen ? 'rotate-180' : ''}`} />
            </button>

            {dashboardsOpen && (
              <div
                className="absolute left-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50 animate-in fade-in"
                onMouseLeave={() => setDashboardsOpen(false)}
              >
                <Link
                  to="/dashboard"
                  onClick={() => setDashboardsOpen(false)}
                  className="px-3.5 py-2.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-3 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600/20 text-cyan-400 flex items-center justify-center shrink-0">
                    <BarChart3 size={15} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Public Civic Dashboard</div>
                    <div className="text-[10px] text-slate-400">Open metrics & interactive map</div>
                  </div>
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setDashboardsOpen(false);
                    if (!isAuthenticated || role !== 'citizen') {
                      handleQuickLogin('citizen');
                    } else {
                      navigate('/citizen');
                    }
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-3 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <User size={15} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Citizen Grievance Portal</div>
                    <div className="text-[10px] text-slate-400">My reports & personal tracking</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDashboardsOpen(false);
                    if (!isAuthenticated || role !== 'admin') {
                      handleQuickLogin('admin');
                    } else {
                      navigate('/admin');
                    }
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-3 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                    <Shield size={15} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Admin Command Console</div>
                    <div className="text-[10px] text-slate-400">Triage, AI verify & dispatch</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDashboardsOpen(false);
                    if (!isAuthenticated || role !== 'department') {
                      handleQuickLogin('department');
                    } else {
                      navigate('/department');
                    }
                  }}
                  className="w-full text-left px-3.5 py-2.5 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-3 transition-colors"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-600/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Briefcase size={15} />
                  </div>
                  <div>
                    <div className="font-semibold text-white">Department Field Operations</div>
                    <div className="text-[10px] text-slate-400">Squad repair tasks & proof</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          <Link
            to="/track"
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
              isActive('/track') ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/30'
            }`}
          >
            <Search size={15} className="text-slate-400" />
            {t('navTrack')}
          </Link>
        </nav>

        {/* Action Controls & Authentication */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Multilingual Selector */}
          <button
            onClick={toggleLanguage}
            title="Toggle English / Telugu"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-medium text-slate-200 hover:border-cyan-500 transition-colors"
          >
            <Globe size={14} className="text-cyan-400" />
            <span>{language === 'en' ? 'తెలుగు' : 'English'}</span>
          </button>

          {/* Instant Demo Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setDemoMenuOpen(!demoMenuOpen)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/50 text-xs font-semibold text-cyan-300 hover:bg-blue-600/30 transition-all shadow-md"
            >
              <Sparkles size={13} className="text-cyan-400 animate-pulse" />
              <span className="hidden sm:inline">1-Click Demo Login</span>
              <ChevronDown size={12} />
            </button>

            {demoMenuOpen && (
              <div
                className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-2 z-50"
                onMouseLeave={() => setDemoMenuOpen(false)}
              >
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Switch Test Account Instantly
                </div>
                <button
                  onClick={() => handleQuickLogin('citizen')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-blue-400" />
                    <div>
                      <div className="font-semibold text-white">Citizen Portal</div>
                      <div className="text-[10px] text-slate-400">Priya Sharma</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">Citizen</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('admin')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-purple-400" />
                    <div>
                      <div className="font-semibold text-white">Admin Command</div>
                      <div className="text-[10px] text-slate-400">City Director Rajesh Varma</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded">Admin</span>
                </button>
                <button
                  onClick={() => handleQuickLogin('department')}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-amber-400" />
                    <div>
                      <div className="font-semibold text-white">Roads Department Lead</div>
                      <div className="text-[10px] text-slate-400">Vikram Reddy</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">Dept</span>
                </button>
              </div>
            )}
          </div>

          {/* User Status / Login Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-semibold text-white leading-tight">{user.name}</span>
                <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">{user.role}</span>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-900/50 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="btn btn-primary text-xs py-1.5 px-3.5 rounded-lg font-bold"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile menu hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            {t('navHome')}
          </Link>
          <Link
            to="/report"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-cyan-400 hover:bg-slate-800"
          >
            {t('navReport')}
          </Link>
          <Link
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Public Civic Dashboard
          </Link>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleQuickLogin('citizen');
            }}
            className="w-full text-left block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-slate-800"
          >
            Citizen Grievance Portal
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleQuickLogin('admin');
            }}
            className="w-full text-left block px-3 py-2 rounded-lg text-sm font-medium text-purple-400 hover:bg-slate-800"
          >
            Admin Command Console
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleQuickLogin('department');
            }}
            className="w-full text-left block px-3 py-2 rounded-lg text-sm font-medium text-amber-400 hover:bg-slate-800"
          >
            Department Field Operations
          </button>
          <Link
            to="/track"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Track by ID
          </Link>
          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-white"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 text-center py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
