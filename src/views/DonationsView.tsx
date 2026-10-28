import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { DonationItem, DonationCategory, ItemCondition, DonorType } from '../types';
import {
  HeartHandshake,
  Search,
  Filter,
  PlusCircle,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Package,
} from 'lucide-react';

interface DonationsViewProps {
  onSelectDonation: (donation: DonationItem) => void;
  onOpenDonateModal: () => void;
}

export const DonationsView: React.FC<DonationsViewProps> = ({
  onSelectDonation,
  onOpenDonateModal,
}) => {
  const { user, isTeacher, settings } = useAuth();
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDonorType, setSelectedDonorType] = useState<string>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');

  const loadDonations = async () => {
    try {
      setLoading(true);
      const data = await api.getDonations({
        search,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        donorType: selectedDonorType !== 'All' ? selectedDonorType : undefined,
        condition: selectedCondition !== 'All' ? selectedCondition : undefined,
      });
      setDonations(data);
    } catch (err) {
      console.error('Failed to load donations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, [search, selectedCategory, selectedDonorType, selectedCondition]);

  const categories = [
    'All',
    'Books',
    'Uniforms & PE Gear',
    'Stationery',
    'Sports Equipment',
    'Electronics',
    'Other',
  ];

  const donorTypes = ['All', 'Student', 'Staff', 'Former Student / Alumni'];
  const conditions = ['All', 'Brand New', 'Like New', 'Gently Used', 'Fair'];

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-900/50">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-semibold">
            <HeartHandshake className="w-4 h-4 text-emerald-400" />
            School Community Giving Program
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            School Books &amp; Supply Donations
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Free textbooks, exam revision guides, sports equipment, and uniforms generously donated by current students, faculty, and alumni. Separate from lost property.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenDonateModal}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition shadow-md flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-slate-950" />
              Donate an Item
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search textbooks, AP prep guides, jerseys, calculators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Dropdown Filters (Donor Type & Condition) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Donor Role
            </label>
            <select
              value={selectedDonorType}
              onChange={(e) => setSelectedDonorType(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {donorTypes.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Donors' : t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Item Condition
            </label>
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            >
              {conditions.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All Conditions' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Donations List */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : donations.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Donations Matching Criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your filters or be the first to contribute books or equipment to help fellow students!
          </p>
          <button
            onClick={onOpenDonateModal}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow"
          >
            Donate an Item Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {donations.map((don) => {
            const isAvailable = don.status === 'Available';

            return (
              <div
                key={don.id}
                onClick={() => onSelectDonation(don)}
                className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all cursor-pointer overflow-hidden flex flex-col"
              >
                {/* Image */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={don.photos[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                    alt={don.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-2.5 left-2.5 flex gap-1">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                      {don.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      {don.condition}
                    </span>
                  </div>

                  {!isAvailable && (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                      {don.status}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition line-clamp-1">
                      {don.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {don.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 space-y-1.5 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500">
                      <span>Donor: {don.donorName}</span>
                      <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {don.donorType}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-semibold text-emerald-700">{don.status}</span>
                      <span className="text-xs font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View Details <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
