import React, { useState } from 'react';
import { DonationItem } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import {
  X,
  HeartHandshake,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface DonationDetailModalProps {
  donation: DonationItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRequestSubmitted: () => void;
}

export const DonationDetailModal: React.FC<DonationDetailModalProps> = ({
  donation,
  isOpen,
  onClose,
  onRequestSubmitted,
}) => {
  const { user, settings } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [requestReason, setRequestReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  if (!isOpen || !donation) return null;

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in as a student to request this donation.');
      return;
    }

    if (requestReason.trim().length < 5) {
      setError('Please provide a brief statement of why you need this item.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.requestDonation(donation.id, requestReason);
      setSubmittedRef(res.referenceCode);
      await refreshNotifications();
      onRequestSubmitted();
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 to-emerald-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <HeartHandshake className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/20 text-emerald-200">
                School Community Donation
              </span>
              <h3 className="text-lg font-bold truncate max-w-sm mt-0.5">{donation.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {submittedRef ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Request Submitted for Review!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                A faculty advisor will review your request. If approved, you can collect this item at the collection desk.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-xs mx-auto">
                <span className="text-[10px] uppercase font-bold text-slate-400">Request Voucher Code</span>
                <p className="text-xl font-mono font-bold text-emerald-800 mt-0.5">{submittedRef}</p>
              </div>
              <button
                onClick={onClose}
                className="py-2 px-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Photo & Tag */}
              <div className="relative h-48 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
                <img
                  src={donation.photos[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                  alt={donation.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <span className="px-2 py-0.5 bg-black/70 backdrop-blur-md text-white rounded-md text-[10px] font-bold">
                    {donation.category}
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-md text-[10px] font-bold">
                    {donation.condition}
                  </span>
                </div>
              </div>

              {/* Donor info */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Donor Information</span>
                  <span className="font-semibold text-slate-800">{donation.donorName}</span>
                  <span className="text-slate-500 block text-[11px]">Type: {donation.donorType}</span>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Availability Status</span>
                  <span className="font-semibold text-emerald-700 inline-block mt-0.5">{donation.status}</span>
                  <span className="text-slate-500 block text-[11px]">Listed: {new Date(donation.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Description</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
                  {donation.description}
                </p>
              </div>

              {/* Eligibility & Collection */}
              <div className="space-y-2 text-xs">
                {donation.eligibilityRequirements && (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                    <span className="font-bold block text-[11px]">Eligibility Criteria:</span>
                    <p className="text-[11px] mt-0.5">{donation.eligibilityRequirements}</p>
                  </div>
                )}
                <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-[11px]">Pickup Location:</span>
                    <p className="text-[11px]">{donation.collectionInstructions || settings?.collectionPointName}</p>
                  </div>
                </div>
              </div>

              {/* Request Form if Available */}
              {donation.status === 'Available' ? (
                <form onSubmit={handleSubmitRequest} className="pt-2 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Submit Request for this Item
                  </h4>

                  {error && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Reason / Educational Need <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="e.g. I am taking AP Calculus this semester and need the prep guide for study sessions..."
                      value={requestReason}
                      onChange={(e) => setRequestReason(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-md transition disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Request This Item'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 bg-slate-100 text-slate-600 rounded-xl text-center text-xs">
                  This item is currently {donation.status.toLowerCase()} and cannot accept new requests.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
