import React, { useState } from 'react';
import { OwnershipClaim } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { X, CheckCircle2, ShieldCheck, AlertCircle, FileCheck } from 'lucide-react';

interface HandoverModalProps {
  claim: OwnershipClaim | null;
  isOpen: boolean;
  onClose: () => void;
  onHandoverComplete: () => void;
}

export const HandoverModal: React.FC<HandoverModalProps> = ({
  claim,
  isOpen,
  onClose,
  onHandoverComplete,
}) => {
  const { user } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [verifiedStudentId, setVerifiedStudentId] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !claim) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!verifiedStudentId) {
      setError('You must check the box to confirm that the student physically presented and verified their School ID card.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.confirmHandover(claim.id, verifiedStudentId, notes);
      await refreshNotifications();
      onHandoverComplete();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record handover.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Confirm Physical Handover</h3>
              <p className="text-xs text-slate-300">Reference: {claim.referenceCode}</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Student & Item Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Claimant Student</span>
                <span className="font-bold text-slate-900 text-sm">{claim.studentName}</span>
                <span className="text-slate-500 block">
                  Class: <strong>{claim.studentClass}</strong> • {claim.studentEmail}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[11px] font-bold">
                {claim.referenceCode}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between text-slate-600">
              <span>Item: <strong>{claim.foundItemName}</strong></span>
              <span>Claim Date: {new Date(claim.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Physical Verification Checklist */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={verifiedStudentId}
                onChange={(e) => setVerifiedStudentId(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-0.5 flex-shrink-0"
              />
              <span className="text-xs text-emerald-950 leading-snug">
                <strong>Mandatory Verification:</strong> I confirm that I have physically inspected the student's official School ID card, verified the claimant's identity, and the item has been handed over in person.
              </span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Authorizing Faculty / Staff Member
            </label>
            <input
              type="text"
              readOnly
              value={`${user?.name || 'Authorized Staff'} (${user?.email || 'staff'})`}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Handover Notes / Condition of Item
            </label>
            <input
              type="text"
              placeholder="e.g. Item intact. Student signed the physical desk ledger."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !verifiedStudentId}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Recording Handover...' : 'Confirm Handover & Lock Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
