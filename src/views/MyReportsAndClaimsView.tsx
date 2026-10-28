import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  LostReport,
  OwnershipClaim,
  DonationRequest,
  UnclaimedRequest,
  FoundItem,
} from '../types';
import {
  Layers,
  FileText,
  ShieldAlert,
  HeartHandshake,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Upload,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface MyReportsAndClaimsViewProps {
  onSelectFoundItem: (item: FoundItem) => void;
  onNavigateLostFound: () => void;
}

export const MyReportsAndClaimsView: React.FC<MyReportsAndClaimsViewProps> = ({
  onSelectFoundItem,
  onNavigateLostFound,
}) => {
  const { user, settings } = useAuth();
  const [activeTab, setActiveTab] = useState<'claims' | 'reports' | 'donations' | 'unclaimed'>('claims');

  const [myClaims, setMyClaims] = useState<OwnershipClaim[]>([]);
  const [myReports, setMyReports] = useState<LostReport[]>([]);
  const [myDonationRequests, setMyDonationRequests] = useState<DonationRequest[]>([]);
  const [myUnclaimedRequests, setMyUnclaimedRequests] = useState<UnclaimedRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Evidence modal state
  const [selectedClaimForEvidence, setSelectedClaimForEvidence] = useState<OwnershipClaim | null>(null);
  const [extraEvidence, setExtraEvidence] = useState('');
  const [extraPhoto, setExtraPhoto] = useState('');
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [claims, reports, donReqs] = await Promise.all([
        api.getMyClaims(),
        api.getMyLostReports(),
        api.getMyDonationRequests(),
      ]);
      setMyClaims(claims);
      setMyReports(reports);
      setMyDonationRequests(donReqs);
    } catch (err) {
      console.error('Failed to load user records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSendExtraEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClaimForEvidence || !extraEvidence.trim()) return;

    setSubmittingEvidence(true);
    try {
      await api.addClaimEvidence(selectedClaimForEvidence.id, extraEvidence, extraPhoto);
      setSelectedClaimForEvidence(null);
      setExtraEvidence('');
      setExtraPhoto('');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to submit additional evidence.');
    } finally {
      setSubmittingEvidence(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Campus Reports &amp; Claims
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Track the live review status of your lost item reports, ownership claims, and donation requests.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('claims')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'claims'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-blue-600" />
          My Ownership Claims ({myClaims.length})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'reports'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-indigo-600" />
          My Lost Reports ({myReports.length})
        </button>

        <button
          onClick={() => setActiveTab('donations')}
          className={`flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'donations'
              ? 'bg-white text-blue-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-emerald-600" />
          My Donation Requests ({myDonationRequests.length})
        </button>
      </div>

      {/* Content for Tabs */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 bg-slate-100 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : activeTab === 'claims' ? (
        /* OWNERSHIP CLAIMS */
        myClaims.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3">
            <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Ownership Claims Submitted Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              If you spotted a found item that matches your lost belonging, submit a claim with your private evidence markings.
            </p>
            <button
              onClick={onNavigateLostFound}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow"
            >
              Search Found Items
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myClaims.map((claim) => {
              const isApproved = claim.status === 'Approved (Ready for Pickup)';
              const isEvidenceRequested = claim.status === 'Additional Evidence Requested';
              const isCollected = claim.status === 'Collected';
              const isRejected = claim.status === 'Rejected';

              return (
                <div
                  key={claim.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 transition ${
                    isApproved
                      ? 'border-emerald-300 ring-2 ring-emerald-100'
                      : isEvidenceRequested
                      ? 'border-amber-300 ring-2 ring-amber-100'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                        {claim.referenceCode}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{claim.foundItemName}</h3>
                    </div>

                    <span
                      className={`self-start sm:self-auto text-xs px-2.5 py-1 rounded-full font-bold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isEvidenceRequested
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : isCollected
                          ? 'bg-slate-100 text-slate-700'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {claim.status}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Your Submitted Evidence
                      </span>
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed font-mono text-[11px]">
                        {claim.privateDetailsEvidence}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Teacher Feedback / Instructions */}
                      {claim.teacherFeedback && (
                        <div
                          className={`p-3 rounded-xl border text-xs ${
                            isApproved
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : isEvidenceRequested
                              ? 'bg-amber-50 border-amber-200 text-amber-950'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <span className="font-bold block text-[11px] mb-0.5">Faculty Feedback:</span>
                          <p>{claim.teacherFeedback}</p>
                          {claim.reviewedByTeacherName && (
                            <span className="text-[10px] text-slate-500 block mt-1">
                              Reviewed by {claim.reviewedByTeacherName} on {new Date(claim.reviewedAt || '').toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Collection Instructions voucher */}
                      {isApproved && (
                        <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl space-y-1 text-emerald-950">
                          <span className="font-bold text-[11px] uppercase tracking-wider block text-emerald-900">
                            Collection Point Pass
                          </span>
                          <p className="text-xs font-semibold">
                            {claim.collectionInstructions || 'Please collect at the P.T. Department in the School Ground with your Student ID card.'}
                          </p>
                          <p className="text-[10px] text-emerald-700">
                            Present Reference Code: <strong>{claim.referenceCode}</strong> to the staff on duty.
                          </p>
                        </div>
                      )}

                      {/* Action to provide extra evidence */}
                      {isEvidenceRequested && (
                        <button
                          onClick={() => setSelectedClaimForEvidence(claim)}
                          className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition"
                        >
                          Submit Additional Evidence Now
                        </button>
                      )}

                      {isCollected && claim.handoverRecord && (
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                          ✓ Handed over by <strong>{claim.handoverRecord.staffName}</strong> on{' '}
                          {new Date(claim.handoverRecord.handoverDate).toLocaleDateString()} (ID Verified).
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : activeTab === 'reports' ? (
        /* MY LOST REPORTS */
        myReports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Lost Reports Filed</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Submit a report describing your lost belongings so teachers can match them against logged items.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700">
                      {report.category}
                      {report.customCategory ? ` • ${report.customCategory}` : ''}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{report.itemName}</h3>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      report.status === 'Potential Match Found'
                        ? 'bg-amber-100 text-amber-900'
                        : report.status === 'Resolved / Claimed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {report.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Lost: {report.dateLost}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" /> Loc: {report.locationLost}
                  </span>
                  <span>Reported: {new Date(report.createdAt).toLocaleDateString()}</span>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {report.description}
                </p>

                <div className="text-[11px] text-slate-500">
                  <strong className="text-slate-700">Private Features:</strong> {report.distinctiveFeatures}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* MY DONATION REQUESTS */
        myDonationRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3">
            <HeartHandshake className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Donation Requests</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explore available textbooks, revision guides, and equipment in the Donations section.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {myDonationRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                      {req.referenceCode}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{req.donationTitle}</h3>
                  </div>

                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      req.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : req.status === 'Collected'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="font-semibold block text-[11px] text-slate-500">Your Requested Need:</span>
                  <p>{req.reason}</p>
                </div>

                {req.status === 'Approved' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950">
                    <span className="font-bold block">Pickup Authorized:</span>
                    Please visit the P.T. Department in the School Ground with your student ID and quote Reference: <strong>{req.referenceCode}</strong>.
                  </div>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal to Provide Extra Evidence */}
      {selectedClaimForEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">
              Provide Additional Evidence for {selectedClaimForEvidence.referenceCode}
            </h3>
            <p className="text-xs text-slate-500">
              The teacher requested further proof to verify item markings.
            </p>

            <form onSubmit={handleSendExtraEvidence} className="space-y-3">
              <textarea
                required
                rows={3}
                placeholder="Describe further specific identifying details..."
                value={extraEvidence}
                onChange={(e) => setExtraEvidence(e.target.value)}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedClaimForEvidence(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEvidence}
                  className="px-5 py-2 bg-blue-700 text-white rounded-xl text-xs font-bold shadow"
                >
                  {submittingEvidence ? 'Sending...' : 'Send to Teacher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
