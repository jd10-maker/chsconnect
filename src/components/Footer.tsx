import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, MapPin, Clock, Phone, Mail, HelpCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useAuth();

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                LF
              </div>
              <span className="text-white font-extrabold text-base tracking-tight">
                {settings?.schoolName || 'Cathedral High'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official school lost property repository, teacher verification system, and community donation portal.
            </p>
            <p className="text-[11px] text-slate-500 italic">
              "{settings?.schoolMotto || 'Integrity, Respect, Excellence'}"
            </p>
          </div>

          {/* Col 2: Collection Desk */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Collection Desk
            </h4>
            <p className="text-xs text-slate-300 font-semibold">{settings?.collectionPointName || 'P.T. Department Office'}</p>
            <p className="text-xs text-slate-400">{settings?.collectionPointLocation || 'P.T. Department, School Ground'}</p>
            <div className="text-[11px] text-slate-400 flex items-start gap-1.5 pt-1">
              <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <span>{settings?.collectionHours || 'Mon - Fri: 12:30 PM - 1:30 PM & 3:30 PM - 4:15 PM'}</span>
            </div>
          </div>

          {/* Col 3: Policy */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Ownership Policy
            </h4>
            <ul className="text-xs text-slate-400 space-y-1.5">
              <li>• Private identifying markings required for proof</li>
              <li>• Student ID verification required at collection</li>
              <li>• {settings?.holdingPeriodDays || 15}-day holding period for rightful owners</li>
              <li>• Teacher-supervised redistribution &amp; donations</li>
            </ul>
          </div>

          {/* Col 4: Help */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-blue-400" /> School Support
            </h4>
            <p className="text-xs text-slate-400">
              For urgent lost valuables (keys, medical devices, eyeglasses), visit the P.T. Department counter immediately.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <p className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-500" /> lostfound@{settings?.schoolDomain || 'cathedral.edu'}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" /> Ext. 104 (P.T. Administration)
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} {settings?.schoolName || 'Cathedral High School'}. All rights reserved.</p>
          <div className="flex gap-4">
            <span>Secure Student Privacy Enforced</span>
            <span>•</span>
            <span>Teacher Controlled Verification</span>
            <span>•</span>
            <span>No Public Markings Disclosed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
