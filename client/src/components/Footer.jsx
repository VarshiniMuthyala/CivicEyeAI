import React from 'react';
import { Eye, ShieldCheck, Cpu, Database, MapPin, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-20 pt-12 pb-8 text-slate-400 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-cyan-400">
                <Eye size={18} />
              </div>
              <span className="text-xl font-bold text-white font-['Outfit']">CivicEye AI</span>
            </div>
            <p className="text-cyan-400 font-semibold text-xs tracking-wide">
              "See the Problem. Report It. Resolve It."
            </p>
            <p className="text-slate-400 text-xs max-w-md leading-relaxed">
              An intelligent, transparent civic grievance & municipal infrastructure triage platform powered by Google Gemini multimodal vision. Built for the IDEA//FORGE Hackathon (Track 1: Civic Pulse, Digital Governance & Public Information).
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Platform Features</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li><a href="/report" className="hover:text-cyan-400 transition-colors">AI Issue Report</a></li>
              <li><a href="/dashboard" className="hover:text-cyan-400 transition-colors">Public Civic Dashboard</a></li>
              <li><a href="/track" className="hover:text-cyan-400 transition-colors">Complaint Audit Tracker</a></li>
              <li><a href="/admin" className="hover:text-cyan-400 transition-colors">Municipal Triage Console</a></li>
            </ul>
          </div>

          {/* Architecture & AI */}
          <div className="space-y-2">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider">Engineered With</h4>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="text-[11px] bg-blue-950/60 border border-blue-700/50 text-blue-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Cpu size={11} /> Google Gemini AI
              </span>
              <span className="text-[11px] bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                <Database size={11} /> Supabase PostgreSQL
              </span>
              <span className="text-[11px] bg-slate-900 border border-slate-700 text-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                <MapPin size={11} /> Leaflet Maps
              </span>
              <span className="text-[11px] bg-purple-950/60 border border-purple-700/50 text-purple-300 px-2 py-0.5 rounded flex items-center gap-1">
                <ShieldCheck size={11} /> Role-Based Access
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 CivicEye AI — Transparent Civic Grievance & Infrastructure Triage System.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Built for IDEA//FORGE Online Hackathon</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
