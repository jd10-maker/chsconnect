import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import {
  FoundItem,
  OwnershipClaim,
  LostReport,
  DonationItem,
  DonationRequest,
  UnclaimedRequest,
  AuditLog,
  ItemCategory,
  SchoolSettings,
} from '../types';
import { HandoverModal } from '../components/HandoverModal';
import {
  ShieldCheck,
  PlusCircle,
  Package,
  Layers,
  FileText,
  Clock,
  HeartHandshake,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Settings,
  Activity,
  Upload,
  AlertCircle,
  Eye,
  EyeOff,
  Search,
  Filter,
  Check,
  Trash2,
  Edit,
  Save,
} from 'lucide-react';

interface TeacherDashboardViewProps {
  onSelectItem: (item: FoundItem) => void;
  onOpenTeacherLogin: () => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  onSelectItem,
  onOpenTeacherLogin,
}) => {
  const { user, isTeacher, settings, refreshSettings } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [activeModule, setActiveModule] = useState<
    'add-found' | 'manage-found' | 'claims' | 'lost-reports' | 'unclaimed' | 'donations' | 'audit' | 'settings'
  >('claims');

  // Data states
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [claims, setClaims] = useState<OwnershipClaim[]>([]);
  const [lostReports, setLostReports] = useState<LostReport[]>([]);
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [donationRequests, setDonationRequests] = useState<DonationRequest[]>([]);
  const [unclaimedRequests, setUnclaimedRequests] = useState<UnclaimedRequest[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Found Item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('Watches');
  const [newItemCustomCategory, setNewItemCustomCategory] = useState('');
  const [newItemPhotos, setNewItemPhotos] = useState<string[]>([]);
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemDate, setNewItemDate] = useState(new Date().toISOString().split('T')[0]);
  const [newItemLocation, setNewItemLocation] = useState('');
  const [newItemStorage, setNewItemStorage] = useState('P.T. Department, School Ground - Locker PT-01');
  const [newItemPrivateDetails, setNewItemPrivateDetails] = useState('');
  const [isSubmittingFound, setIsSubmittingFound] = useState(false);
  const [addFoundSuccess, setAddFoundSuccess] = useState(false);
  const [addFoundError, setAddFoundError] = useState<string | null>(null);

  // Claim Decision state
  const [reviewingClaimId, setReviewingClaimId] = useState<string | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'request_evidence'>('approve');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewInstructions, setReviewInstructions] = useState('');
  const [isReviewingClaim, setIsReviewingClaim] = useState(false);

  // Handover state
  const [handoverClaim, setHandoverClaim] = useState<OwnershipClaim | null>(null);

  // Settings form state
  const [editSettings, setEditSettings] = useState<Partial<SchoolSettings>>({});
  const [settingsSuccess, setSettingsSuccess] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  // Reveal private markings toggle
  const [revealedItems, setRevealedItems] = useState<Record<string, boolean>>({});

  const toggleReveal = (id: string) => {
    setRevealedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadAllTeacherData = async () => {
    if (!isTeacher) return;
    try {
      setLoading(true);
      const [fItems, clms, lReports, dons, donReqs, unclReqs, logs] = await Promise.all([
        api.getFoundItems(),
        api.getAllClaims(),
        api.getAllLostReports(),
        api.getDonations(),
        api.getAllDonationRequests(),
        api.getUnclaimedRequests(),
        api.getAuditLogs(),
      ]);
      setFoundItems(fItems);
      setClaims(clms);
      setLostReports(lReports);
      setDonations(dons);
      setDonationRequests(donReqs);
      setUnclaimedRequests(unclReqs);
      setAuditLogs(logs);
      if (settings) {
        setEditSettings(settings);
      }
    } catch (err) {
      console.error('Failed to load teacher data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllTeacherData();
  }, [isTeacher]);

  if (!isTeacher) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Faculty Authorization Required</h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          The Teacher Dashboard and ownership claim approval workstation are restricted to authorized school faculty members with an approved faculty verification code.
        </p>
        <button
          onClick={onOpenTeacherLogin}
          className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          Sign In as Faculty
        </button>
      </div>
    );
  }

  // Handle Photo Upload in Add Found Item
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAddFoundError('Image file must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItemPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Add Found Item
  const handleCreateFoundItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFoundError(null);

    if (!newItemName.trim() || !newItemDesc.trim() || !newItemLocation.trim() || !newItemStorage.trim()) {
      setAddFoundError('Please complete all mandatory item fields including storage location.');
      return;
    }

    if (newItemPrivateDetails.trim().length < 8) {
      setAddFoundError('Private identifying details must be at least 8 characters (used to verify rightful student claimants).');
      return;
    }

    setIsSubmittingFound(true);
    try {
      await api.createFoundItem({
        name: newItemName,
        category: newItemCategory,
        customCategory: newItemCategory === 'Other' ? newItemCustomCategory : undefined,
        photos: newItemPhotos.length > 0 ? newItemPhotos : undefined,
        description: newItemDesc,
        dateFound: newItemDate,
        locationFound: newItemLocation,
        storageLocation: newItemStorage,
        privateIdentifyingDetails: newItemPrivateDetails,
      });

      setAddFoundSuccess(true);
      setNewItemName('');
      setNewItemDesc('');
      setNewItemLocation('');
      setNewItemPrivateDetails('');
      setNewItemPhotos([]);
      await loadAllTeacherData();
      await refreshNotifications();
    } catch (err: any) {
      setAddFoundError(err.message || 'Failed to publish found item.');
    } finally {
      setIsSubmittingFound(false);
    }
  };

  // Submit Claim Review
  const handleSubmitClaimReview = async (claimId: string) => {
    setIsReviewingClaim(true);
    try {
      await api.reviewClaim(claimId, reviewAction, reviewFeedback, reviewInstructions);
      setReviewingClaimId(null);
      setReviewFeedback('');
      setReviewInstructions('');
      await loadAllTeacherData();
      await refreshNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to review claim.');
    } finally {
      setIsReviewingClaim(false);
    }
  };

  // Delete Found Item
  const handleDeleteFoundItem = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}" from found records?`)) return;
    try {
      await api.deleteFoundItem(id);
      await loadAllTeacherData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete item.');
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await api.updateSettings(editSettings);
      await refreshSettings();
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
      await loadAllTeacherData();
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  // Approve / Reject Donation
  const handleReviewDonationRequest = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await api.reviewDonationRequest(requestId, action);
      await loadAllTeacherData();
      await refreshNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to update donation request.');
    }
  };

  // Approve / Reject Redistribution Request
  const handleReviewRedistribution = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await api.reviewUnclaimedRequest(requestId, action);
      await loadAllTeacherData();
      await refreshNotifications();
    } catch (err: any) {
      alert(err.message || 'Failed to review redistribution request.');
    }
  };

  const pendingClaims = claims.filter((c) => c.status === 'Pending Review');
  const holdingDays = settings?.holdingPeriodDays || 15;
  const itemsPast15Days = foundItems.filter((i) => i.daysUnclaimed >= holdingDays && i.status !== 'Claimed / Collected');

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-emerald-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Authorized Faculty Control Center
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">Teacher &amp; Staff Administration</h1>
          <p className="text-xs text-slate-300">
            Logged in as: <strong>{user?.name}</strong> ({user?.email}) • {user?.department || 'Faculty Member'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-emerald-300 text-xs font-bold border border-white/20">
            {pendingClaims.length} Claims Awaiting Review
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-white/10 text-amber-300 text-xs font-bold border border-white/20">
            {itemsPast15Days.length} Unclaimed &ge; {holdingDays}d
          </span>
        </div>
      </div>

      {/* Live Alert: Incoming student claim message */}
      {pendingClaims.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xl flex-shrink-0 animate-bounce">
              🔔
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Incoming Alert: Student Found Their Property!</span>
                <span className="text-[10px] bg-amber-500 text-slate-950 px-2 py-0.5 rounded font-black uppercase">
                  {pendingClaims.length} Pending
                </span>
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                A student has submitted an ownership claim stating they identified their lost item. Detailed marks have been queued for your verification.
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModule('claims')}
            className="self-start sm:self-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow transition whitespace-nowrap"
          >
            Review Evidence Now →
          </button>
        </div>
      )}

      {/* Navigation Submenu Modules */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveModule('claims')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeModule === 'claims'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Review Claims ({claims.length})
        </button>

        <button
          onClick={() => setActiveModule('add-found')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeModule === 'add-found'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-blue-600" />
          Add Found Item
        </button>

        <button
          onClick={() => setActiveModule('manage-found')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeModule === 'manage-found'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4 text-indigo-600" />
          Manage Found Items ({foundItems.length})
        </button>

        <button
          onClick={() => setActiveModule('lost-reports')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeModule === 'lost-reports'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-purple-600" />
          Student Lost Reports ({lostReports.length})
        </button>

        <button
          onClick={() => setActiveModule('unclaimed')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeModule === 'unclaimed'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          15-Day Counter ({itemsPast15Days.length})
        </button>

        <button
          onClick={() => setActiveModule('donations')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeModule === 'donations'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <HeartHandshake className="w-4 h-4 text-teal-600" />
          Donations ({donationRequests.length} Reqs)
        </button>

        <button
          onClick={() => setActiveModule('audit')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeModule === 'audit'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-slate-500" />
          Activity Logs
        </button>

        <button
          onClick={() => setActiveModule('settings')}
          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
            activeModule === 'settings'
              ? 'bg-white text-emerald-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4 text-slate-500" />
          Admin Settings
        </button>
      </div>

      {/* MODULE 1: REVIEW CLAIMS */}
      {activeModule === 'claims' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900">Ownership Claims Review</h2>
              <p className="text-xs text-slate-500">
                Compare student evidence against confidential private details stored on record.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
              {pendingClaims.length} Pending Decision
            </span>
          </div>

          {claims.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-xs text-slate-400">
              No ownership claims have been submitted by students yet.
            </div>
          ) : (
            <div className="space-y-5">
              {claims.map((claim) => {
                const isPending = claim.status === 'Pending Review';
                const isReviewing = reviewingClaimId === claim.id;
                const associatedItem = foundItems.find((i) => i.id === claim.foundItemId);

                return (
                  <div
                    key={claim.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900">
                          {claim.referenceCode}
                        </span>
                        <h3 className="font-bold text-slate-900 text-sm">
                          Item: {claim.foundItemName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-200 text-slate-800">
                          {claim.status}
                        </span>
                        {claim.status === 'Approved (Ready for Pickup)' && (
                          <button
                            onClick={() => setHandoverClaim(claim)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition"
                          >
                            Sign-Off Handover
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Side-by-Side Comparison */}
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Left: Student Submitted Evidence */}
                      <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-blue-900 font-bold">
                          <span>Claimant Student Information</span>
                          <span>Class: {claim.studentClass}</span>
                        </div>
                        <p className="text-slate-800 font-medium">
                          {claim.studentName} ({claim.studentEmail})
                        </p>
                        {claim.contactNumber && (
                          <p className="text-slate-600">Contact: {claim.contactNumber}</p>
                        )}

                        <div className="pt-2 border-t border-blue-200">
                          <span className="font-bold text-slate-700 block mb-1">
                            Student Stated Identifying Evidence:
                          </span>
                          <p className="p-2.5 bg-white rounded-lg border border-blue-100 font-mono text-[11px] text-slate-800 leading-relaxed">
                            {claim.privateDetailsEvidence}
                          </p>
                        </div>

                        {claim.photoProof && (
                          <div className="pt-2">
                            <span className="font-bold text-slate-700 block mb-1">Student Photo Proof:</span>
                            <img
                              src={claim.photoProof}
                              alt="Proof"
                              className="w-24 h-24 object-cover rounded-lg border border-blue-200"
                            />
                          </div>
                        )}
                      </div>

                      {/* Right: Confidential Teacher Stored Markings */}
                      <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-300 space-y-2 text-xs">
                        <div className="flex justify-between items-center text-amber-950 font-bold">
                          <span>Teacher Stored Confidential Record</span>
                          <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded text-amber-900">
                            Strictly Private
                          </span>
                        </div>
                        <p className="text-slate-700">
                          Stored Location: <strong>{associatedItem?.storageLocation || 'P.T. Department Office, School Ground'}</strong>
                        </p>

                        <div className="pt-2 border-t border-amber-200">
                          <span className="font-bold text-amber-950 block mb-1">
                            Original Secret Markings Recorded on Upload:
                          </span>
                          <p className="p-2.5 bg-white rounded-lg border border-amber-200 font-mono text-[11px] text-amber-950 leading-relaxed font-semibold">
                            {associatedItem?.privateIdentifyingDetails || (claim as any).foundItemPrivateDetails || 'No private notes on record'}
                          </p>
                        </div>

                        <div className="pt-2 text-[11px] text-amber-800">
                          Compare student stated features (e.g. scratches, alarms, engravings) with the stored markings above.
                        </div>
                      </div>
                    </div>

                    {/* Teacher Action Drawer */}
                    {isPending && !isReviewing && (
                      <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                        <button
                          onClick={() => {
                            setReviewingClaimId(claim.id);
                            setReviewAction('request_evidence');
                            setReviewFeedback('Please provide further specific descriptions or photos of the back/inner markings.');
                          }}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition"
                        >
                          Request More Evidence
                        </button>
                        <button
                          onClick={() => {
                            setReviewingClaimId(claim.id);
                            setReviewAction('reject');
                            setReviewFeedback('Evidence does not match the secret markings on file.');
                          }}
                          className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold transition"
                        >
                          Reject Claim
                        </button>
                        <button
                          onClick={() => {
                            setReviewingClaimId(claim.id);
                            setReviewAction('approve');
                            setReviewFeedback('Claim evidence verified. Approved for physical collection.');
                            setReviewInstructions(
                              `Please visit ${settings?.collectionPointName} (${settings?.collectionPointLocation}) during ${settings?.collectionHours}. Quote reference: ${claim.referenceCode}. Bring your Student ID.`
                            );
                          }}
                          className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow"
                        >
                          Approve Claim
                        </button>
                      </div>
                    )}

                    {/* Review Form Expansion */}
                    {isReviewing && (
                      <div className="p-5 bg-slate-100 border-t border-slate-200 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs uppercase text-slate-700">
                            Action: {reviewAction.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Feedback message to student:
                          </label>
                          <input
                            type="text"
                            value={reviewFeedback}
                            onChange={(e) => setReviewFeedback(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                        </div>

                        {reviewAction === 'approve' && (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 mb-1">
                              Collection Location &amp; Instructions:
                            </label>
                            <input
                              type="text"
                              value={reviewInstructions}
                              onChange={(e) => setReviewInstructions(e.target.value)}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                            />
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setReviewingClaimId(null)}
                            className="px-4 py-1.5 text-xs font-semibold text-slate-600"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            disabled={isReviewingClaim}
                            onClick={() => handleSubmitClaimReview(claim.id)}
                            className="px-5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow"
                          >
                            {isReviewingClaim ? 'Processing...' : 'Confirm Decision'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODULE 2: ADD FOUND ITEM */}
      {activeModule === 'add-found' && (
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Add New Found Item Listing</h2>
            <p className="text-xs text-slate-500">
              Only authorized teachers may upload found items. Private verification markings are kept confidential from students.
            </p>
          </div>

          {addFoundSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-2xl flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Found item successfully published and day counter started!
              </span>
              <button
                onClick={() => setAddFoundSuccess(false)}
                className="text-emerald-900 font-bold underline text-xs"
              >
                Dismiss
              </button>
            </div>
          )}

          {addFoundError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>{addFoundError}</span>
            </div>
          )}

          <form onSubmit={handleCreateFoundItem} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Item Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Silver Casio digital watch, Navy Blue pencil pouch..."
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Watches">Watches</option>
                  <option value="Pouches">Pouches</option>
                  <option value="Bags">Bags</option>
                  <option value="Water Bottles">Water Bottles</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {newItemCategory === 'Other' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Type <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Graphing Calculator, Keys..."
                    value={newItemCustomCategory}
                    onChange={(e) => setNewItemCustomCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Date Found <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newItemDate}
                  onChange={(e) => setNewItemDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Campus Location Found <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Basketball Court bleachers"
                  value={newItemLocation}
                  onChange={(e) => setNewItemLocation(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Storage / Collection Shelf Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. P.T. Department, School Ground - Locker Box #4 or Shelf PT-12"
                value={newItemStorage}
                onChange={(e) => setNewItemStorage(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Exact shelf location is strictly kept internal to faculty and desk staff.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider mb-1">
                Private Identifying Details (Confidential) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Confidential marks known only to owner (e.g. scratched initials 'ALM', 7:15 AM alarm, sticker on bottom, specific contents inside pocket)..."
                value={newItemPrivateDetails}
                onChange={(e) => setNewItemPrivateDetails(e.target.value)}
                className="w-full p-2.5 bg-amber-50/60 border border-amber-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <p className="text-[11px] text-amber-800 mt-1">
                CRITICAL: Students never see this field. It is used to compare against the student's claim evidence.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                General Public Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Public-facing general description..."
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Item Photographs (Multiple Angles Supported)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
              />
              {newItemPhotos.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {newItemPhotos.map((p, idx) => (
                    <div key={idx} className="relative">
                      <img src={p} alt="" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                      <button
                        type="button"
                        onClick={() => setNewItemPhotos(newItemPhotos.filter((_, i) => i !== idx))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] flex items-center justify-center"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingFound}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
              >
                {isSubmittingFound ? 'Saving...' : 'Publish Found Item Listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODULE 3: MANAGE FOUND ITEMS */}
      {activeModule === 'manage-found' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900">Manage Found Item Records</h2>
            <button
              onClick={() => setActiveModule('add-found')}
              className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              + Add New Item
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-3">Item</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Date Found</th>
                    <th className="p-3">Holding Day Counter</th>
                    <th className="p-3">Storage Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Confidential Markings</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {foundItems.map((item) => {
                    const isPast15 = item.daysUnclaimed >= holdingDays;
                    const isRevealed = revealedItems[item.id];

                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-900 max-w-[160px] truncate">
                          {item.name}
                        </td>
                        <td className="p-3 text-slate-500">{item.category}</td>
                        <td className="p-3 text-slate-500">{item.dateFound}</td>
                        <td className="p-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                              isPast15 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            Day {item.daysUnclaimed}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">{item.storageLocation}</td>
                        <td className="p-3">
                          <span className="font-semibold text-blue-800">{item.status}</span>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => toggleReveal(item.id)}
                            className="text-[11px] font-semibold text-amber-700 hover:underline flex items-center gap-1"
                          >
                            {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            {isRevealed ? 'Hide' : 'Reveal'}
                          </button>
                          {isRevealed && (
                            <p className="text-[10px] font-mono text-slate-700 mt-1 max-w-xs bg-amber-50 p-1 rounded border border-amber-200">
                              {item.privateIdentifyingDetails}
                            </p>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handleDeleteFoundItem(item.id, item.name)}
                            className="p-1 text-rose-500 hover:text-rose-700"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4: STUDENT LOST REPORTS */}
      {activeModule === 'lost-reports' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">Student Lost-Item Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lostReports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 text-sm">{report.itemName}</span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-900 text-[10px]">
                    {report.status}
                  </span>
                </div>
                <div className="text-slate-500 flex justify-between">
                  <span>Student: <strong>{report.studentName}</strong> ({report.studentClass})</span>
                  <span>Lost: {report.dateLost}</span>
                </div>
                <p className="text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {report.description}
                </p>
                <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                  <strong>Student Distinctive Features:</strong> {report.distinctiveFeatures}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 5: 15-DAY UNCLAIMED & REDISTRIBUTION */}
      {activeModule === 'unclaimed' && (
        <div className="space-y-5">
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-950 leading-relaxed">
            <strong>School {holdingDays}-Day Holding Policy:</strong> Items that reach {holdingDays} days without an owner claim may be authorized for redistribution to students in need or used for school departments. Staff must confirm that no pending owner claims exist before approving redistribution.
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Student Redistribution Requests</h3>
            {unclaimedRequests.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                No student redistribution requests currently submitted.
              </div>
            ) : (
              <div className="space-y-3">
                {unclaimedRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-blue-700 text-xs block">
                        {req.referenceCode} • {req.foundItemName}
                      </span>
                      <span className="text-slate-600">
                        Student: <strong>{req.studentName}</strong> ({req.studentClass}) • Reason: "{req.reason}"
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{req.status}</span>
                      {req.status === 'Pending Review' && (
                        <>
                          <button
                            onClick={() => handleReviewRedistribution(req.id, 'reject')}
                            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleReviewRedistribution(req.id, 'approve')}
                            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow"
                          >
                            Approve Redistribution
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 6: DONATIONS MANAGEMENT */}
      {activeModule === 'donations' && (
        <div className="space-y-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-slate-900">Donations &amp; Request Reviews</h2>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Recipient Requests for Donated Books &amp; Gear</h3>
            {donationRequests.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                No student donation requests on file.
              </div>
            ) : (
              <div className="space-y-3">
                {donationRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-emerald-800 text-xs block">
                        {req.referenceCode} • {req.donationTitle}
                      </span>
                      <span className="text-slate-600">
                        Student: <strong>{req.studentName}</strong> ({req.studentClass}) • Need: "{req.reason}"
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-700">{req.status}</span>
                      {req.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleReviewDonationRequest(req.id, 'reject')}
                            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleReviewDonationRequest(req.id, 'approve')}
                            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold shadow"
                          >
                            Approve Recipient
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODULE 7: AUDIT LOGS */}
      {activeModule === 'audit' && (
        <div className="space-y-4">
          <h2 className="text-lg font-black text-slate-900">Immutable Audit Trail</h2>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Actor</th>
                  <th className="p-3">Target</th>
                  <th className="p-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 font-bold text-slate-800">{log.action}</td>
                    <td className="p-3 text-slate-600">{log.actorName} ({log.actorEmail})</td>
                    <td className="p-3 uppercase text-[10px] text-slate-500 font-bold">{log.targetType}</td>
                    <td className="p-3 text-slate-700">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODULE 8: ADMIN SETTINGS */}
      {activeModule === 'settings' && (
        <div className="max-w-2xl mx-auto bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">Administrator School Configuration</h2>
            <p className="text-xs text-slate-500">
              Customize school branding, holding period days, faculty verification codes, and collection point locations.
            </p>
          </div>

          {settingsSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              Settings updated successfully.
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                School Name
              </label>
              <input
                type="text"
                value={editSettings.schoolName || ''}
                onChange={(e) => setEditSettings({ ...editSettings, schoolName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Holding Period (Days)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={editSettings.holdingPeriodDays || 15}
                  onChange={(e) => setEditSettings({ ...editSettings, holdingPeriodDays: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Faculty Verification Code
                </label>
                <input
                  type="text"
                  value={editSettings.facultyVerificationCode || 'CHS-2026'}
                  onChange={(e) => setEditSettings({ ...editSettings, facultyVerificationCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Collection Point Name
              </label>
              <input
                type="text"
                value={editSettings.collectionPointName || ''}
                onChange={(e) => setEditSettings({ ...editSettings, collectionPointName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Collection Point Location
              </label>
              <input
                type="text"
                value={editSettings.collectionPointLocation || ''}
                onChange={(e) => setEditSettings({ ...editSettings, collectionPointLocation: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Collection Desk Hours
              </label>
              <input
                type="text"
                value={editSettings.collectionHours || ''}
                onChange={(e) => setEditSettings({ ...editSettings, collectionHours: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {savingSettings ? 'Saving Settings...' : 'Save Configuration'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Handover Modal */}
      {handoverClaim && (
        <HandoverModal
          claim={handoverClaim}
          isOpen={!!handoverClaim}
          onClose={() => setHandoverClaim(null)}
          onHandoverComplete={loadAllTeacherData}
        />
      )}
    </div>
  );
};
