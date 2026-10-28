import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { DonationCategory, ItemCondition, DonorType } from '../types';
import { X, HeartHandshake, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

interface DonateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDonationCreated: () => void;
}

export const DonateFormModal: React.FC<DonateFormModalProps> = ({
  isOpen,
  onClose,
  onDonationCreated,
}) => {
  const { user, isTeacher, settings } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DonationCategory>('Books');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState<ItemCondition>('Like New');
  const [donorType, setDonorType] = useState<DonorType>(
    isTeacher ? 'Staff' : 'Student'
  );
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [eligibilityRequirements, setEligibilityRequirements] = useState('');
  const [photo, setPhoto] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Photo must be smaller than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError('Please sign in to donate an item.');
      return;
    }

    if (!title.trim() || !description.trim()) {
      setError('Please provide a title and description.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createDonation({
        title,
        category,
        description,
        condition,
        donorType,
        isAnonymous,
        eligibilityRequirements: eligibilityRequirements || undefined,
        photos: photo ? [photo] : undefined,
      });
      setSuccess(true);
      await refreshNotifications();
      onDonationCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to submit donation.');
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
              <h3 className="text-lg font-bold">Donate an Item to School</h3>
              <p className="text-xs text-emerald-200">Give books, PE gear, or supplies to fellow students</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Thank You for Your Donation!</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                {isTeacher
                  ? 'Your listing has been published immediately to the school donations section.'
                  : 'Your donation has been submitted for faculty review. Once approved, other students can request it!'}
              </p>
              <button
                onClick={onClose}
                className="py-2 px-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow transition"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Item Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AP Chemistry Princeton Review (Clean copy)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as DonationCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Books">Books &amp; Textbooks</option>
                    <option value="Uniforms & PE Gear">Uniforms &amp; PE Gear</option>
                    <option value="Stationery">Stationery &amp; Art Supplies</option>
                    <option value="Sports Equipment">Sports Equipment</option>
                    <option value="Electronics">Electronics &amp; Calculators</option>
                    <option value="Other">Other Items</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Condition <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as ItemCondition)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Brand New">Brand New</option>
                    <option value="Like New">Like New</option>
                    <option value="Gently Used">Gently Used</option>
                    <option value="Fair">Fair (Usable condition)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Donor Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={donorType}
                    onChange={(e) => setDonorType(e.target.value as DonorType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="Student">Current Student</option>
                    <option value="Staff">School Staff / Faculty</option>
                    <option value="Former Student / Alumni">Former Student / Alumni</option>
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 font-medium">
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Donate Anonymously</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description &amp; Details <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe the edition, size, condition, and any accessories included..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Eligibility Criteria (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. For Grade 10-12 students or Track team members"
                  value={eligibilityRequirements}
                  onChange={(e) => setEligibilityRequirements(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Item Photograph (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                {photo && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={photo} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                    <span className="text-[11px] text-emerald-600">Photo attached</span>
                    <button type="button" onClick={() => setPhoto('')} className="text-xs text-rose-500 ml-auto">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting Donation...' : 'Publish Donation Listing'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
