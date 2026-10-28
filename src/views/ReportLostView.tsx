import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { ItemCategory, FoundItem } from '../types';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  ArrowRight,
  Clock,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';

interface ReportLostViewProps {
  onNavigateHome: () => void;
  onNavigateMyClaims: () => void;
  onSelectFoundItem: (item: FoundItem) => void;
}

export const ReportLostView: React.FC<ReportLostViewProps> = ({
  onNavigateHome,
  onNavigateMyClaims,
  onSelectFoundItem,
}) => {
  const { user, settings } = useAuth();
  const { refreshNotifications } = useNotifications();

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Watches');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [dateLost, setDateLost] = useState(new Date().toISOString().split('T')[0]);
  const [locationLost, setLocationLost] = useState('');
  const [distinctiveFeatures, setDistinctiveFeatures] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [photo, setPhoto] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  // Live match suggestion state
  const [existingFoundItems, setExistingFoundItems] = useState<FoundItem[]>([]);
  const [suggestedMatches, setSuggestedMatches] = useState<FoundItem[]>([]);

  useEffect(() => {
    async function loadFoundItems() {
      try {
        const items = await api.getFoundItems();
        setExistingFoundItems(items);
      } catch (e) {
        console.warn('Could not load found items for match preview:', e);
      }
    }
    loadFoundItems();
  }, []);

  // Compute live potential matches as user types!
  useEffect(() => {
    if (!itemName && !category) {
      setSuggestedMatches([]);
      return;
    }

    const keywords = itemName.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
    const matches = existingFoundItems.filter((item) => {
      if (item.status === 'Claimed / Collected' || item.status === 'Disposed') return false;
      const sameCategory = item.category === category;
      const keywordHit = keywords.some(
        (k) =>
          item.name.toLowerCase().includes(k) ||
          item.description.toLowerCase().includes(k) ||
          (item.customCategory && item.customCategory.toLowerCase().includes(k))
      );
      return sameCategory || keywordHit;
    });

    setSuggestedMatches(matches.slice(0, 3));
  }, [itemName, category, existingFoundItems]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file must be under 5MB.');
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
      setError('Please sign in to report a lost belonging.');
      return;
    }

    if (!itemName.trim() || !description.trim() || !locationLost.trim() || !distinctiveFeatures.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const report = await api.submitLostReport({
        itemName,
        category,
        customCategory: category === 'Other' ? customCategory : undefined,
        description,
        dateLost,
        locationLost,
        distinctiveFeatures,
        additionalNotes: additionalNotes || undefined,
        photo: photo || undefined,
      });

      setSubmittedReportId(report.id);
      await refreshNotifications();
    } catch (err: any) {
      setError(err.message || 'Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Report a Lost Belonging
          </h1>
        </div>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Submit details about what you lost. Our smart campus matching engine will scan logged found items and alert teachers when a match is verified.
        </p>
      </div>

      {submittedReportId ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Lost Report Filed Successfully!</h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto mt-1">
              Your lost report has been registered under your account (<strong>{user?.name}</strong>, {user?.currentClass}). You will receive an in-app notification whenever a matching item is recorded.
            </p>
          </div>

          {/* Show matched found items if any */}
          {suggestedMatches.length > 0 && (
            <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 text-left space-y-3">
              <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>We found {suggestedMatches.length} potentially matching found item(s) already in custody:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {suggestedMatches.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => onSelectFoundItem(m)}
                    className="p-3 bg-white rounded-xl border border-blue-200 cursor-pointer hover:border-blue-400 hover:shadow-md transition text-xs"
                  >
                    <img
                      src={m.photos[0] || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'}
                      alt={m.name}
                      className="w-full h-24 object-cover rounded-lg mb-2"
                    />
                    <span className="font-bold text-slate-900 line-clamp-1">{m.name}</span>
                    <span className="text-[11px] text-slate-500 block">Found: {m.dateFound}</span>
                    <span className="text-blue-700 font-bold text-[11px] flex items-center gap-1 mt-1">
                      Inspect &amp; Claim <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3 pt-3">
            <button
              onClick={() => {
                setSubmittedReportId(null);
                setItemName('');
                setDescription('');
                setDistinctiveFeatures('');
                setPhoto('');
              }}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
            >
              Report Another Item
            </button>
            <button
              onClick={onNavigateMyClaims}
              className="px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs shadow-md"
            >
              View My Reports &amp; Claims
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Student Info Pill */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Reporting Student</span>
                <span className="font-bold text-slate-900">{user?.name || 'Guest'}</span>
                <span className="text-slate-500 text-[11px]"> ({user?.email})</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Class</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                  {user?.currentClass || 'Unassigned'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Item Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Silver Casio vintage watch, Black JanSport backpack..."
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ItemCategory)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  >
                    <option value="Watches">Watches</option>
                    <option value="Pouches">Pouches</option>
                    <option value="Bags">Bags</option>
                    <option value="Water Bottles">Water Bottles</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {category === 'Other' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Specify Item Type <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Calculator, Eyeglasses, Jacket, Keys..."
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Approximate Date Lost <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={dateLost}
                    onChange={(e) => setDateLost(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Approximate Location Lost <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. School Ground bleachers, Cafeteria, Science lab..."
                    value={locationLost}
                    onChange={(e) => setLocationLost(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  General Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe the color, brand, model, and general appearance..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Distinctive Identifying Features <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Specific scratches, stickers, keychains, engraved letters, passcode wallpaper, or internal contents..."
                  value={distinctiveFeatures}
                  onChange={(e) => setDistinctiveFeatures(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This confidential detail helps teachers confirm genuine ownership.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Any other helpful information..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Reference Photograph (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {photo && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={photo} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                    <span className="text-[11px] text-blue-600">Attached image</span>
                    <button type="button" onClick={() => setPhoto('')} className="text-xs text-rose-500 ml-auto">
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-3 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold text-xs rounded-xl shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {isSubmitting ? 'Registering Report...' : 'Submit Lost Item Report'}
                </button>
              </div>
            </form>
          </div>

          {/* Right Sidebar: Smart Live Matches Preview */}
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/70 p-5 rounded-3xl border border-indigo-200/80 space-y-3">
              <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Live Matching Assistant
              </div>
              <p className="text-xs text-indigo-950/80 leading-relaxed">
                As you type, our campus database scans logged found items to see if someone already turned in your property!
              </p>

              {suggestedMatches.length > 0 ? (
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold text-indigo-900">
                    Found {suggestedMatches.length} Possible Match(es):
                  </span>
                  {suggestedMatches.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => onSelectFoundItem(item)}
                      className="p-3 bg-white rounded-xl border border-indigo-200 hover:border-indigo-400 cursor-pointer shadow-xs transition space-y-1.5"
                    >
                      <div className="flex gap-2.5 items-center">
                        <img
                          src={item.photos[0] || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'}
                          alt={item.name}
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-slate-900 block line-clamp-1">{item.name}</span>
                          <span className="text-[11px] text-slate-500">Found: {item.dateFound}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="text-slate-500 truncate max-w-[140px]">{item.locationFound}</span>
                        <span className="text-blue-700 font-bold flex items-center gap-0.5">
                          Claim <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-white/70 rounded-xl border border-indigo-100 text-center text-xs text-indigo-900/60">
                  Fill in the item name and category to search for immediate matches.
                </div>
              )}
            </div>

            {/* School Policy Reminder */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
              <span className="font-bold text-slate-800 uppercase text-[10px] tracking-wider block">
                Verification Protocol
              </span>
              <p className="leading-relaxed">
                When a match is found, you will be invited to submit an ownership claim. Please do not visit the P.T. Department collection desk until a teacher has verified your claim and generated your Reference Code.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
