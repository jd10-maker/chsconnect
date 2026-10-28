import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  FoundItem,
  OwnershipClaim,
  UnclaimedRequest,
  DonationRequest,
} from '../types';
import { HandoverModal } from '../components/HandoverModal';
import {
  Clock,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  Sparkles,
  QrCode,
  MapPin,
  Calendar,
} from 'lucide-react';

interface PEDepartmentViewProps {
  onSelectItem: (item: FoundItem) => void;
  onOpenTeacherLogin: () => void;
}

export const PEDepartmentView: React.FC<PEDepartmentViewProps> = ({
  onSelectItem,
  onOpenTeacherLogin,
}) => {
  const { user, isTeacher, settings } = useAuth();

  const [activeTab, setActiveTab] = useState<'approved-pickup' | 'unclaimed-15' | 'new-items' | 'handovers'>('approved-pickup');

  // Scanner / Quick Lookup state
  const [lookupQuery, setLookupQuery] = useState('');
  const [lookupResult, setLookupResult] = useState<any | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Collections Data
  const [items, setItems] = useState<FoundItem[]>([]);
  const [claims, setClaims] = useState<OwnershipClaim[]>([]);
  const [unclaimedRequests, setUnclaimedRequests] = useState<UnclaimedRequest[]>([]);
  const [summary, setSummary] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Handover modal trigger
  const [selectedClaimForHandover, setSelectedClaimForHandover] = useState<OwnershipClaim | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allItems, allClaims, allUnclaimed, sum] = await Promise.all([
        api.getFoundItems(),
        isTeacher ? api.getAllClaims() : Promise.resolve([]),
        isTeacher ? api.getUnclaimedRequests() : Promise.resolve([]),
        isTeacher ? api.getPEDeskSummary() : Promise.resolve(null),
      ]);
      setItems(allItems);
      setClaims(allClaims);
      setUnclaimedRequests(allUnclaimed);
      setSummary(sum);
    } catch (err) {
      console.error('Failed to load P.E. Desk data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isTeacher]);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await api.lookupCode(lookupQuery.trim());
      setLookupResult(res);
    } catch (err: any) {
      setLookupError(err.message || 'No matching record found for this reference code.');
    } finally {
      setLookupLoading(false);
    }
  };

  const holdingDays = settings?.holdingPeriodDays || 15;
  const approvedClaims = claims.filter((c) => c.status === 'Approved (Ready for Pickup)');
  const unclaimedItemsPast15 = items.filter((i) => i.daysUnclaimed >= holdingDays && i.status !== 'Claimed / Collected' && i.status !== 'Redistributed');
  const collectedItems = items.filter((i) => i.status === 'Claimed / Collected' || i.status === 'Redistributed');

  // If student visits this view, show student-friendly collection desk hours & lookup info
  if (!isTeacher) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-16">
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
              Campus Collection Point
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            P.T. Department Collection Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            All secured belongings, approved ownership claims, and student donations are physically stored and collected at the P.T. Department in the School Ground.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 text-xs">
              <span className="font-bold text-amber-300 block mb-1">Office Location</span>
              <p>{settings?.collectionPointLocation || 'P.T. Department, School Ground'}</p>
            </div>
            <div className="bg-white/10 p-3.5 rounded-2xl border border-white/20 text-xs">
              <span className="font-bold text-amber-300 block mb-1">Operating Hours</span>
              <p>{settings?.collectionHours || 'Mon - Fri: 12:30 PM - 1:30 PM & 3:30 PM - 4:15 PM'}</p>
            </div>
          </div>
        </div>

        {/* Collection Checklist for Students */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">What to Bring for Collection</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1.5">
              <span className="font-bold text-blue-950 text-sm block">1. Student ID Card</span>
              <p className="text-slate-600">Physical student identification is mandatory for staff sign-off.</p>
            </div>
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 space-y-1.5">
              <span className="font-bold text-indigo-950 text-sm block">2. Reference Code</span>
              <p className="text-slate-600">Your approved claim voucher code (e.g. CLM-2026-XXXX).</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5">
              <span className="font-bold text-emerald-950 text-sm block">3. Scheduled Hours</span>
              <p className="text-slate-600">Visit during designated lunch or after-school service windows.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Are you a faculty member or P.T. staff?</span>
            <button
              onClick={onOpenTeacherLogin}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs transition"
            >
              Sign In to Staff Desk Workstation
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Teacher / Staff Workstation View
  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Staff Collection Point
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            P.T. Department Collection Desk Workstation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Command view for verifying student identity, processing pickup claims, and managing 15-day unclaimed inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            Duty Officer: {user?.name}
          </span>
        </div>
      </div>

      {/* Quick Lookup Bar (Barcode / Reference Code Scanner) */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-xl space-y-3 border border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
            <QrCode className="w-4 h-4 text-amber-400" />
            Quick Reference Scanner &amp; Student Lookup
          </div>
          <span className="text-[11px] text-slate-400">
            Accepts Claim (CLM-...), Redistribution (RED-...), or Donation (DON-...) Codes
          </span>
        </div>

        <form onSubmit={handleLookup} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Enter student reference code (e.g. CLM-2026-1049, RED-2026-0814)..."
              value={lookupQuery}
              onChange={(e) => setLookupQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs font-mono text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
            />
          </div>
          <button
            type="submit"
            disabled={lookupLoading}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow disabled:opacity-50"
          >
            {lookupLoading ? 'Searching...' : 'Lookup Voucher'}
          </button>
        </form>

        {/* Lookup Result Card */}
        {lookupError && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{lookupError}</span>
          </div>
        )}

        {lookupResult && (
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2">
              <span className="font-bold text-amber-300 uppercase tracking-wider text-[11px]">
                Matching Record Found
              </span>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-900 text-blue-200 font-bold">
                {lookupResult.claim?.referenceCode || lookupResult.redistributionRequest?.referenceCode || lookupResult.donationRequest?.referenceCode}
              </span>
            </div>

            {lookupResult.type === 'claim' && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-white text-sm block">
                    Item: {lookupResult.claim.foundItemName}
                  </span>
                  <span className="text-slate-300">
                    Student: <strong>{lookupResult.claim.studentName}</strong> ({lookupResult.claim.studentClass}) • Status: <strong className="text-emerald-400">{lookupResult.claim.status}</strong>
                  </span>
                </div>
                {lookupResult.canHandover ? (
                  <button
                    onClick={() => setSelectedClaimForHandover(lookupResult.claim)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Process Physical Handover
                  </button>
                ) : (
                  <span className="text-slate-400 italic text-[11px]">
                    Current status: {lookupResult.claim.status}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desk Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">
            Awaiting Collection
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1 block">
            {approvedClaims.length}
          </span>
          <span className="text-[11px] text-slate-500">Approved student claims</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">
            15+ Day Unclaimed
          </span>
          <span className="text-2xl font-black text-amber-700 mt-1 block">
            {unclaimedItemsPast15.length}
          </span>
          <span className="text-[11px] text-slate-500">Ready for redistribution</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">
            Redistribution Reqs
          </span>
          <span className="text-2xl font-black text-blue-700 mt-1 block">
            {unclaimedRequests.filter((r) => r.status === 'Pending Review').length}
          </span>
          <span className="text-[11px] text-slate-500">Pending staff decision</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">
            Total Handed Over
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {collectedItems.length}
          </span>
          <span className="text-[11px] text-slate-500">Signed desk handovers</span>
        </div>
      </div>

      {/* Workstation Queue Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('approved-pickup')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'approved-pickup'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Approved Claims Awaiting Pickup ({approvedClaims.length})
        </button>

        <button
          onClick={() => setActiveTab('unclaimed-15')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'unclaimed-15'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          15-Day Unclaimed Review ({unclaimedItemsPast15.length})
        </button>

        <button
          onClick={() => setActiveTab('new-items')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'new-items'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active Custody Items ({items.length})
        </button>

        <button
          onClick={() => setActiveTab('handovers')}
          className={`py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'handovers'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Handover Sign-off Ledger ({collectedItems.length})
        </button>
      </div>

      {/* Queue Content */}
      {loading ? (
        <div className="h-40 bg-slate-100 rounded-2xl animate-pulse"></div>
      ) : activeTab === 'approved-pickup' ? (
        approvedClaims.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-xs text-slate-500">
            No approved claims waiting for student collection right now.
          </div>
        ) : (
          <div className="space-y-4">
            {approvedClaims.map((claim) => (
              <div
                key={claim.id}
                className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 text-xs">
                      {claim.referenceCode}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{claim.foundItemName}</span>
                  </div>
                  <div className="text-slate-600">
                    Claimant: <strong>{claim.studentName}</strong> ({claim.studentClass}) • Email: {claim.studentEmail}
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Approved: {new Date(claim.updatedAt).toLocaleDateString()} by {claim.reviewedByTeacherName}
                  </div>
                </div>

                <button
                  onClick={() => setSelectedClaimForHandover(claim)}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-1.5"
                >
                  <FileCheck className="w-4 h-4" />
                  Confirm Handover (Verify ID)
                </button>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'unclaimed-15' ? (
        /* 15-DAY UNCLAIMED ITEMS */
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900">
            <strong>Staff Notice:</strong> Items below have been in school custody for {holdingDays}+ days without an owner claim. Per school policy, they may be evaluated for student redistribution or school donation.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {unclaimedItemsPast15.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="bg-white rounded-2xl border border-amber-200 shadow-xs p-4 cursor-pointer hover:border-amber-400 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                      {item.daysUnclaimed} Days Held
                    </span>
                    <span className="text-xs text-slate-400">{item.category}</span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.description}</p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{item.storageLocation}</span>
                  <span className="text-amber-700 font-bold flex items-center gap-0.5">
                    Inspect <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'new-items' ? (
        /* ACTIVE CUSTODY ITEMS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 cursor-pointer hover:border-blue-300 transition space-y-2"
            >
              <div className="flex justify-between items-center text-xs">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                  {item.category}
                </span>
                <span className="text-slate-400">{item.daysUnclaimed}d ago</span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{item.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2">{item.description}</p>
              <div className="text-[11px] text-blue-700 font-semibold pt-1">
                Storage: {item.storageLocation}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* HANDOVER RECORDS */
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3">Reference</th>
                <th className="p-3">Item Name</th>
                <th className="p-3">Recipient</th>
                <th className="p-3">Staff Verifier</th>
                <th className="p-3">Date Handed Over</th>
                <th className="p-3">ID Inspected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {collectedItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono font-bold text-blue-700">
                    {item.handoverDetails?.referenceCode || item.id}
                  </td>
                  <td className="p-3 font-semibold text-slate-900">{item.name}</td>
                  <td className="p-3">
                    {item.handoverDetails?.recipientName} ({item.handoverDetails?.recipientClass})
                  </td>
                  <td className="p-3">{item.handoverDetails?.staffName || 'Staff'}</td>
                  <td className="p-3 text-slate-500">
                    {item.handoverDetails ? new Date(item.handoverDetails.handoverDate).toLocaleDateString() : 'Recorded'}
                  </td>
                  <td className="p-3 text-emerald-600 font-bold">✓ Verified</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Handover Modal */}
      {selectedClaimForHandover && (
        <HandoverModal
          claim={selectedClaimForHandover}
          isOpen={!!selectedClaimForHandover}
          onClose={() => setSelectedClaimForHandover(null)}
          onHandoverComplete={loadData}
        />
      )}
    </div>
  );
};
