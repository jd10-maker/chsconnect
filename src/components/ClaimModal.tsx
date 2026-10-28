import React, { useState } from 'react';
import { FoundItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import {
  ShieldAlert,
  AlertCircle,
  X,
  Upload,
  CheckCircle2,
  Lock,
  Phone,
  FileText,
  Sparkles,
} from 'lucide-react';

interface ClaimModalProps {
  item: FoundItem | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSubmitted: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  isOpen,
  onClose,
  onClaimSubmitted,
}) => {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [description, setDescription] = useState('');
  const [privateDetailsEvidence, setPrivateDetailsEvidence] = useState('');
  const [photoProof, setPhotoProof] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoProof(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('You must be signed in with your student account to submit an ownership claim.');
      return;
    }

    if (privateDetailsEvidence.trim().length < 10) {
      setError('Please provide specific evidence (at least 10 characters) that matches the confidential physical markings on this item.');
      return;
    }

    setIsSubmitting(true);
    try {
      const claim = await api.submitClaim({
        foundItemId: item.id,
        description,
        privateDetailsEvidence,
        photoProof,
        contactNumber,
      });
      setSubmittedRef(claim.referenceCode);
      await refreshNotifications();
      onClaimSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <ShieldAlert className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Ownership Verification Claim</h3>
              <p className="text-xs text-blue-200">Item: {item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submittedRef ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-900">Claim Checked Out &amp; Submitted!</h4>
                <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs text-left space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Notification Dispatched to Faculty:</span>
                  </div>
                  <p className="leading-relaxed">
                    A high-priority alert has been sent to the teachers stating that you identified <strong>"{item.name}"</strong> as your lost belonging. Your evidence has been queued for verification.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Your Claim Voucher Reference</span>
                <p className="text-2xl font-mono font-black text-blue-800 tracking-wider mt-0.5">{submittedRef}</p>
                <p className="text-[11px] text-slate-500 mt-2">
                  When a teacher approves your claim, present this reference code and your Student ID card at the P.T. Department in the School Ground.
                </p>
              </div>

              <button
                onClick={onClose}
                className="py-2.5 px-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md transition"
              >
                Close &amp; View Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Item Summary Card */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={item.photos[0] || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'}
                  alt={item.name}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 block text-sm">{item.name}</span>
                  <span className="text-slate-500">Category: {item.category}</span>
                  <div className="text-slate-500 flex gap-2 mt-0.5">
                    <span>Found: {item.dateFound}</span>
                    <span>•</span>
                    <span>Loc: {item.locationFound}</span>
                  </div>
                </div>
              </div>

              {/* Security policy notice */}
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <Lock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold">Confidential Evidence Requirement:</strong> To prevent false claims, teachers record secret identifying details upon receiving found property. A photo or student name alone does not prove ownership. Describe specific private evidence below (e.g. scratches, stickers, inner contents, alarms, engraved initials).
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form fields */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Private Identifying Evidence <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe secret marks, stickers, inner contents, engraved letters, battery notes, alarms, or scratches only the true owner would know..."
                  value={privateDetailsEvidence}
                  onChange={(e) => setPrivateDetailsEvidence(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Teachers will compare this against the private record before approving pickup.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  General Circumstance / Additional Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lost during sports practice near the school ground bleachers"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Contact Phone (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="tel"
                      placeholder="e.g. 555-0199"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Supporting Photo / Receipt (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {photoProof && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={photoProof} alt="Proof" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                  <span className="text-[11px] text-emerald-600 font-medium">Photo evidence attached</span>
                  <button
                    type="button"
                    onClick={() => setPhotoProof('')}
                    className="text-[11px] text-rose-500 hover:underline ml-auto"
                  >
                    Remove
                  </button>
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-700/20 disabled:opacity-50 transition"
                >
                  {isSubmitting ? 'Submitting Claim...' : 'Submit Claim & Alert Teachers'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
