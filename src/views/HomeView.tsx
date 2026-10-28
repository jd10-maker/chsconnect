import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FoundItem, DonationItem, ItemCategory } from '../types';
import {
  Search,
  PlusCircle,
  Package,
  HeartHandshake,
  Clock,
  ShieldCheck,
  MapPin,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (view: string) => void;
  onSelectFoundItem: (item: FoundItem) => void;
  onSelectDonation: (donation: DonationItem) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenLogin: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectFoundItem,
  onSelectDonation,
  searchQuery,
  setSearchQuery,
  onOpenLogin,
}) => {
  const { user, isTeacher, settings } = useAuth();
  const [recentFoundItems, setRecentFoundItems] = useState<FoundItem[]>([]);
  const [recentDonations, setRecentDonations] = useState<DonationItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [items, dons] = await Promise.all([
          api.getFoundItems(),
          api.getDonations(),
        ]);
        setRecentFoundItems(items);
        setRecentDonations(dons);
      } catch (err) {
        console.error('Failed to load home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories: (ItemCategory | 'All')[] = [
    'All',
    'Watches',
    'Pouches',
    'Bags',
    'Water Bottles',
    'Other',
  ];

  const filteredItems = recentFoundItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationFound.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const holdingDays = settings?.holdingPeriodDays || 15;
  const itemsUnder15Days = recentFoundItems.filter((i) => i.daysUnclaimed < holdingDays && i.status !== 'Claimed / Collected');
  const itemsOver15Days = recentFoundItems.filter((i) => i.daysUnclaimed >= holdingDays && i.status !== 'Claimed / Collected');
  const collectedCount = recentFoundItems.filter((i) => i.status === 'Claimed / Collected').length;

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-indigo-950 to-slate-900 text-white p-6 sm:p-10 shadow-2xl border border-slate-800">
        {/* Subtle decorative background circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Official School Property Repository &amp; Donation Center
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Lost something on campus? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-amber-300">
              We help you recover it safely.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Every found watch, bag, water bottle, or pouch turned in to staff is securely catalogued with confidential verification markings. Plus, explore student donations for books and school essentials!
          </p>

          {/* Search Bar in Hero */}
          <div className="pt-2">
            <div className="relative max-w-xl">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
              <input
                type="text"
                placeholder="Search found watches, pouches, bags, water bottles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-24 py-3.5 bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-slate-900 placeholder:text-slate-400 rounded-2xl text-sm border border-white/20 focus:border-blue-400 focus:outline-none backdrop-blur-md transition shadow-lg"
              />
              <button
                type="button"
                onClick={() => onNavigate('lost-found')}
                className="absolute right-2 top-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow"
              >
                Find
              </button>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => onNavigate('lost-found')}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md flex items-center gap-2"
            >
              <Package className="w-4 h-4" />
              Browse Found Items
            </button>
            <button
              onClick={() => onNavigate('report-lost')}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              Report a Lost Item
            </button>
            <button
              onClick={() => onNavigate('donations')}
              className="px-5 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs font-bold border border-emerald-500/30 transition flex items-center gap-2"
            >
              <HeartHandshake className="w-4 h-4 text-emerald-300" />
              Explore Donations
            </button>
            <button
              onClick={() => onNavigate('my-claims')}
              className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5"
            >
              <Layers className="w-4 h-4 text-blue-400" />
              Track My Claims
            </button>
          </div>
        </div>
      </section>

      {/* Campus Impact Metrics */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{recentFoundItems.length}</span>
            <span className="block text-xs text-slate-500 font-medium">Logged Found Items</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{collectedCount}</span>
            <span className="block text-xs text-slate-500 font-medium">Reunited With Owners</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{itemsOver15Days.length}</span>
            <span className="block text-xs text-slate-500 font-medium">15+ Day Unclaimed Items</span>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900">{recentDonations.length}</span>
            <span className="block text-xs text-slate-500 font-medium">Community Donations</span>
          </div>
        </div>
      </section>

      {/* 15-Day Unclaimed Rule Notice Banner */}
      <section className="p-4 sm:p-5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
              Automatic {holdingDays}-Day Holding Period Rule
              <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold uppercase">
                Active Policy
              </span>
            </h4>
            <p className="text-xs text-amber-900/80 max-w-2xl mt-0.5 leading-relaxed">
              Every found item has an active day counter. Items are strictly held for {holdingDays} days for rightful owners to claim. Items unclaimed after {holdingDays} days are flagged for faculty review and eligible student redistribution at the P.T. Department.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('pe-desk')}
          className="self-start sm:self-center px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shadow-xs"
        >
          <span>P.T. Collection Desk</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* SECTION 1: LOST & FOUND */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Recently Reported Found Items
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Items safely secured by faculty. Click any item to inspect details or submit an ownership claim.
            </p>
          </div>

          <button
            onClick={() => onNavigate('lost-found')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View All ({recentFoundItems.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white shadow-sm shadow-blue-700/20'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Found Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 rounded-2xl bg-slate-100 animate-pulse"></div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No items match your selected filter.</p>
            <p className="text-xs text-slate-400 mt-1">Try selecting "All" or reporting a lost item.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.slice(0, 6).map((item) => {
              const isPast15 = item.daysUnclaimed >= holdingDays;
              const isClaimed = item.status === 'Claimed / Collected';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectFoundItem(item)}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer overflow-hidden flex flex-col"
                >
                  {/* Photo with Day Counter Badge */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={item.photos[0] || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* Top tags */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                        {item.category}
                      </span>
                    </div>

                    {/* Day counter pill */}
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow ${
                          isPast15
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-950/80 text-white backdrop-blur-xs'
                        }`}
                      >
                        <Clock className="w-3 h-3 text-amber-300" />
                        {item.daysUnclaimed}d unclaimed
                      </span>
                    </div>

                    {/* Status overlay badge */}
                    {isClaimed && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                        ✓ Reunited With Owner
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition line-clamp-1">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" /> {item.locationFound}
                        </span>
                        <span>{item.dateFound}</span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-semibold text-blue-700">
                          {item.status}
                        </span>
                        <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                          Inspect <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 2: SEPARATE DONATIONS SECTION */}
      <section className="p-6 sm:p-8 bg-gradient-to-br from-emerald-950/5 via-teal-900/5 to-slate-100 rounded-3xl border border-emerald-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                School Community Donations
              </h2>
            </div>
            <p className="text-xs text-slate-600 max-w-xl">
              Books, uniform jackets, revision guides, and equipment donated by students, staff, and alumni for fellow students in need. Completely separate from lost property.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('donations')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Explore All Donations ({recentDonations.length})
            </button>
          </div>
        </div>

        {/* Donations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recentDonations.slice(0, 3).map((don) => (
            <div
              key={don.id}
              onClick={() => onSelectDonation(don)}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer overflow-hidden flex flex-col group"
            >
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                <img
                  src={don.photos[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                  alt={don.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2.5 left-2.5 flex gap-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white">
                    {don.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white">
                    {don.condition}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition line-clamp-1">
                    {don.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {don.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">By: {don.donorName}</span>
                  <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-0.5">
                    Request Item <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Collection Desk & Handover Hours Guide */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            Physical Collection Point
          </span>
          <h3 className="text-xl font-black">
            Ready to collect your property or donation?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            All approved ownership claims and donation distributions take place at the{' '}
            <strong className="text-white">{settings?.collectionPointName || 'P.T. Department Office'}</strong> (
            {settings?.collectionPointLocation || 'P.T. Department, School Ground'}). Bring your official student ID card and approved Reference Code.
          </p>
          <div className="text-xs text-blue-300 font-medium pt-1">
            🕒 Open: {settings?.collectionHours || 'Mon - Fri: 12:30 PM - 1:30 PM & 3:30 PM - 4:15 PM'}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('my-claims')}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition text-center"
          >
            Check My Claim Status
          </button>
          {!user && (
            <button
              onClick={onOpenLogin}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition text-center"
            >
              Sign In to Account
            </button>
          )}
        </div>
      </section>
    </div>
  );
};
