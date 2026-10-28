import React, { useState } from 'react';
import { FoundItem } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Calendar,
  MapPin,
  Clock,
  ShieldCheck,
  Eye,
  EyeOff,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

interface ItemDetailModalProps {
  item: FoundItem | null;
  isOpen: boolean;
  onClose: () => void;
  onClaim: (item: FoundItem) => void;
  onRequestUnclaimed?: (item: FoundItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onClaim,
  onRequestUnclaimed,
}) => {
  const { user, isTeacher, settings } = useAuth();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showPrivateDetails, setShowPrivateDetails] = useState(false);

  if (!isOpen || !item) return null;

  const holdingDays = settings?.holdingPeriodDays || 15;
  const isPastHoldingPeriod = item.daysUnclaimed >= holdingDays;
  const isCollected = item.status === 'Claimed / Collected';
  const isRedistributed = item.status === 'Redistributed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-blue-600 text-white">
              {item.category}
              {item.customCategory ? ` • ${item.customCategory}` : ''}
            </span>
            <h3 className="text-lg font-bold truncate max-w-md">{item.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Images Section */}
          <div className="space-y-2">
            <div className="relative h-64 sm:h-72 w-full bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
              <img
                src={item.photos[selectedImageIndex] || item.photos[0]}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {/* Day counter floating badge */}
              <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 shadow-md">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                {item.daysUnclaimed} Days in Lost &amp; Found
                {isPastHoldingPeriod && (
                  <span className="text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-bold uppercase ml-1">
                    15+ Day Review
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail switcher if multiple images */}
            {item.photos.length > 1 && (
              <div className="flex gap-2">
                {item.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                      selectedImageIndex === idx ? 'border-blue-600 scale-105' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Details Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Date Found</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> {item.dateFound}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Location Found</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-rose-500" /> {item.locationFound}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Status</span>
              <span
                className={`font-semibold text-[11px] inline-block mt-0.5 px-2 py-0.5 rounded-md ${
                  isCollected
                    ? 'bg-emerald-100 text-emerald-800'
                    : isPastHoldingPeriod
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {item.status}
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
              <span className="text-slate-400 text-[10px] uppercase font-bold block">Holding Period</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" /> Day {item.daysUnclaimed} / {holdingDays}
              </span>
            </div>
          </div>

          {/* General Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              General Description
            </h4>
            <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Storage & Collection Desk Info */}
          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs flex items-start gap-2.5">
            <Package className="w-4 h-4 text-blue-700 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-blue-900">Collection Desk Storage:</span>{' '}
              <span className="text-blue-800">
                {isTeacher ? item.storageLocation : 'Held securely at P.T. Department Collection Point (School Ground)'}
              </span>
              <p className="text-[11px] text-blue-600 mt-0.5">
                Teacher recorded: {item.reportedByTeacherName} ({item.reportedByTeacherEmail})
              </p>
            </div>
          </div>

          {/* Teacher Only: Private Identifying Markings */}
          {isTeacher && item.privateIdentifyingDetails && (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-300 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  Faculty Confidential Verification Details (Hidden from Students)
                </span>
                <button
                  type="button"
                  onClick={() => setShowPrivateDetails(!showPrivateDetails)}
                  className="text-amber-800 hover:text-amber-950 font-semibold flex items-center gap-1 text-[11px]"
                >
                  {showPrivateDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showPrivateDetails ? 'Hide' : 'Reveal'}
                </button>
              </div>
              {showPrivateDetails ? (
                <div className="p-2.5 bg-white rounded-lg border border-amber-200 text-slate-800 font-mono text-[11px]">
                  {item.privateIdentifyingDetails}
                </div>
              ) : (
                <p className="text-[11px] text-amber-700 italic">
                  Markings are hidden to prevent accidental shoulder-surfing. Click "Reveal" to inspect when reviewing student claims.
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {isCollected ? (
                <span className="text-emerald-700 font-semibold flex items-center gap-1">
                  <UserCheck className="w-4 h-4" /> This item has been verified &amp; collected by owner.
                </span>
              ) : isPastHoldingPeriod ? (
                <span className="text-amber-700 font-semibold">
                  15+ day holding period reached. Eligible for school redistribution review.
                </span>
              ) : (
                <span className="text-blue-700 font-medium">
                  {holdingDays - item.daysUnclaimed} days left in holding period for owner claim.
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition"
              >
                Close
              </button>

              {!isCollected && !isRedistributed && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onClaim(item);
                    }}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-700/20 transition flex items-center justify-center gap-1.5"
                  >
                    <span>Claim Ownership</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {isPastHoldingPeriod && onRequestUnclaimed && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onRequestUnclaimed(item);
                      }}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-md transition"
                    >
                      Request Redistribution
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
