import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  Camera,
  Cpu,
  ShieldCheck,
  Send,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Flame,
  Droplets,
  Trash2,
  Lightbulb,
  Building2,
  Sparkles,
  MapPin,
  TrendingUp,
  FileCheck,
  LayoutDashboard,
  Shield,
  User,
  Briefcase,
  HelpCircle,
  CloudRain
} from 'lucide-react';
import { complaintService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage = () => {
  const { t } = useLanguage();
  const { quickLogin } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    total: 5,
    resolved: 1,
    resolutionRate: 20,
    inProgress: 3
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await complaintService.getPublicStats();
        if (data) {
          setStats({
            total: data.total || 0,
            resolved: data.resolved || 0,
            resolutionRate: data.resolutionRate || 0,
            inProgress: data.inProgress || 0
          });
        }
      } catch (err) {
        console.warn('Using baseline stats for landing preview:', err.message);
      }
    };
    loadStats();
  }, []);

  const handleLaunchRole = async (roleType, targetPath) => {
    try {
      await quickLogin(roleType);
      navigate(targetPath);
    } catch (e) {
      navigate(targetPath);
    }
  };

  const categories = [
    { title: t('cat1'), icon: <Flame className="text-orange-400" />, desc: 'Potholes, surface cracks, craters, eroded asphalt.' },
    { title: t('cat2'), icon: <Trash2 className="text-emerald-400" />, desc: 'Unattended waste dumps, overflowing municipal bins.' },
    { title: t('cat3'), icon: <Droplets className="text-blue-400" />, desc: 'Burst water mains, pipeline fractures, valve leaks.' },
    { title: t('cat4'), icon: <CloudRain className="text-cyan-400" />, desc: 'Blocked stormwater drains, sewage overflow.' },
    { title: t('cat5'), icon: <Lightbulb className="text-yellow-400" />, desc: 'Non-functional streetlights, damaged lamp poles.' },
    { title: t('cat6'), icon: <Building2 className="text-purple-400" />, desc: 'Broken sidewalks, damaged road dividers, bent railings.' },
    { title: t('cat7'), icon: <AlertTriangle className="text-rose-400" />, desc: 'Industrial runoff, illegal dumping, air/water hazards.' },
    { title: t('cat8'), icon: <HelpCircle className="text-slate-400" />, desc: 'General municipal infrastructure grievances.' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden gradient-dark border-b border-slate-800/80">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="container mx-auto px-4 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner">
            <Sparkles size={14} className="text-cyan-400 animate-pulse" />
            <span>IDEA//FORGE Track 1 — Civic Pulse & Digital Governance</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-[1.1] mb-6">
            Smarter Cities Begin With <span className="gradient-text">Every Report.</span>
          </h1>

          {/* Tagline & Subheadline */}
          <p className="text-cyan-400 font-bold text-base sm:text-xl tracking-wide mb-3">
            "{t('tagline')}"
          </p>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            {t('heroSubheadline')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-14">
            <Link
              to="/report"
              className="btn btn-primary w-full sm:w-auto px-8 py-3.5 text-base rounded-xl shadow-lg shadow-blue-600/30 group"
            >
              <span>{t('reportAnIssue')}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="btn btn-secondary w-full sm:w-auto px-8 py-3.5 text-base rounded-xl border-slate-700 hover:border-slate-500"
            >
              {t('exploreDashboard')}
            </Link>
          </div>

          {/* Live Statistics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="card p-5 text-center">
              <div className="text-3xl font-extrabold text-white mb-1 font-['Outfit']">{stats.total}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('statTotal')}</div>
            </div>
            <div className="card p-5 text-center border-emerald-900/40 bg-emerald-950/10">
              <div className="text-3xl font-extrabold text-emerald-400 mb-1 font-['Outfit']">{stats.resolved}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('statResolved')}</div>
            </div>
            <div className="card p-5 text-center border-blue-900/40 bg-blue-950/10">
              <div className="text-3xl font-extrabold text-cyan-400 mb-1 font-['Outfit']">{stats.resolutionRate}%</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('statRate')}</div>
            </div>
            <div className="card p-5 text-center border-amber-900/40 bg-amber-950/10">
              <div className="text-3xl font-extrabold text-amber-400 mb-1 font-['Outfit']">{stats.inProgress}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t('statActive')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Portals & Dashboards Showcase */}
      <section className="py-20 bg-slate-950/60 border-b border-slate-800/80">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-2">
              <LayoutDashboard size={14} />
              <span>Multi-Role Governance Ecosystem</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 font-['Outfit']">
              Explore Live Dashboards & Portals
            </h2>
            <p className="text-slate-400 text-sm">
              CivicEye AI provides dedicated role-based portals for the public, citizens, city administrators, and field repair departments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Public Civic Dashboard */}
            <div className="card p-6 flex flex-col justify-between hover:border-blue-500/50 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Public Civic Dashboard</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Open governance view with real-time issue statistics, category distributions, and interactive Leaflet map pins.
                </p>
              </div>
              <Link
                to="/dashboard"
                className="btn btn-secondary text-xs py-2.5 w-full rounded-xl flex items-center justify-center gap-1.5 font-bold text-cyan-300 hover:text-white"
              >
                <span>Open Public Map</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* 2. Citizen Grievance Portal */}
            <div className="card p-6 flex flex-col justify-between hover:border-emerald-500/50 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Citizen Portal</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Personal complaint tracker, timeline audit histories, and quick grievance reporting for registered citizens.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole('citizen', '/citizen')}
                className="btn btn-secondary text-xs py-2.5 w-full rounded-xl flex items-center justify-center gap-1.5 font-bold text-emerald-300 hover:text-white"
              >
                <span>Launch Citizen View</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 3. Municipal Admin Command Console */}
            <div className="card p-6 flex flex-col justify-between hover:border-purple-500/50 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Admin Command Console</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Review Gemini AI triage recommendations, allocate departments, update statuses, and inspect resolution proofs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole('admin', '/admin')}
                className="btn btn-secondary text-xs py-2.5 w-full rounded-xl flex items-center justify-center gap-1.5 font-bold text-purple-300 hover:text-white"
              >
                <span>Launch Admin Console</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 4. Department Field Operations */}
            <div className="card p-6 flex flex-col justify-between hover:border-amber-500/50 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Briefcase size={24} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Department Field Portal</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Field operations queue for municipal squads (Roads, Sanitation, Water) to mark progress and upload photo proof.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleLaunchRole('department', '/department')}
                className="btn btn-secondary text-xs py-2.5 w-full rounded-xl flex items-center justify-center gap-1.5 font-bold text-amber-300 hover:text-white"
              >
                <span>Launch Squad Board</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-slate-900/40 border-b border-slate-800/80">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-white mb-3 font-['Outfit']">{t('howItWorksTitle')}</h2>
            <p className="text-slate-400 text-sm">{t('howItWorksSubtitle')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6 relative group hover:border-blue-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Camera size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Live Camera or Upload</h3>
              <p className="text-xs text-slate-400 leading-relaxed">Citizens open the live camera viewfinder directly in the browser or upload photos of road damage, waste, or electrical faults.</p>
            </div>

            <div className="card p-6 relative group hover:border-cyan-500/50 transition-all border-cyan-900/30">
              <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Cpu size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('step2Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('step2Desc')}</p>
            </div>

            <div className="card p-6 relative group hover:border-purple-500/50 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('step3Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('step3Desc')}</p>
            </div>

            <div className="card p-6 relative group hover:border-emerald-500/50 transition-all border-emerald-900/30">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{t('step4Title')}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{t('step4Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Civic Categories */}
      <section className="py-20 border-b border-slate-800/80">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-bold text-white mb-3 font-['Outfit']">{t('catTitle')}</h2>
            <p className="text-slate-400 text-sm">
              Comprehensive municipal infrastructure taxonomy automatically classified by Gemini Vision.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat, idx) => (
              <div key={idx} className="card p-5 hover:border-slate-700 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-4">
                  {cat.icon}
                </div>
                <h3 className="font-bold text-sm text-white mb-1.5">{cat.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features & Triage Highlights */}
      <section className="py-20 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-widest">
                <Cpu size={14} /> AI-Powered Governance Engine
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight font-['Outfit']">
                Precision Multimodal Analysis with Google Gemini
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                CivicEye AI eliminates bureaucratic lag. When a citizen submits a photo, Google Gemini analyzes the visual scene to identify root causes, severity metrics, and the precise municipal department equipped to fix it.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Automated Severity Prioritization</h4>
                    <p className="text-xs text-slate-400">Classifies issues into Critical, High, Medium, or Low to triage life-safety hazards instantly.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Intelligent Department Recommendation</h4>
                    <p className="text-xs text-slate-400">Directs complaints directly to Roads, Sanitation, Water, Electrical, or Drainage squads.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Geospatial Duplicate Detection</h4>
                    <p className="text-xs text-slate-400">Haversine formula cross-references nearby issues to avoid spam while preserving unique citizen voice.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Bilingual Accessibility (English & Telugu)</h4>
                    <p className="text-xs text-slate-400">AI descriptions and recommendations generated natively in English or Telugu script.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Preview Card */}
            <div className="card p-6 border-blue-500/40 bg-slate-900/90 shadow-2xl relative">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold text-cyan-400">LIVE TRIAGE PREVIEW</span>
                </div>
                <span className="badge badge-critical">Critical Severity</span>
              </div>

              <div className="space-y-4">
                <div className="h-44 rounded-xl overflow-hidden bg-slate-800 relative">
                  <img
                    src="https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80"
                    alt="Pothole sample"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] text-cyan-300 font-mono">
                    Google Gemini 2.5 Vision
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Detected Grievance:</span>
                    <span className="text-white font-semibold">Potholes and damaged roads</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Assigned Department:</span>
                    <span className="text-blue-400 font-semibold">Roads and Infrastructure Department</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800">
                    <span className="text-slate-400">Recommended Action:</span>
                    <span className="text-emerald-400 font-semibold">Deploy Bitumen Patching Squad</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to="/report"
                    className="btn btn-primary w-full text-xs py-2.5 rounded-lg flex items-center justify-center gap-2"
                  >
                    <span>Test Your Own Image Now</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
