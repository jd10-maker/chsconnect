import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { FoundItem, ItemCategory } from '../types';
import {
  Search,
  Filter,
  Clock,
  MapPin,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  PackageCheck,
  Sparkles,
} from 'lucide-react';

interface LostFoundViewProps {
  onSelectItem: (item: FoundItem) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onNavigateReport: () => void;
}

export const LostFoundView: React.FC<LostFoundViewProps> = ({
  onSelectItem,
  searchQuery,
  setSearchQuery,
  onNavigateReport,
}) => {
  const { isTeacher, settings } = useAuth();
  const [items, setItems] = useState<FoundItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [daysFilter, setDaysFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'days'>('newest');

  const holdingDays = settings?.holdingPeriodDays || 15;

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await api.getFoundItems({
        search: searchQuery,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        status: selectedStatus !== 'All' ? selectedStatus : undefined,
        location: selectedLocation !== 'All' ? selectedLocation : undefined,
        daysFilter: daysFilter !== 'all' ? daysFilter : undefined,
      });
      setItems(data);
    } catch (err) {
      console.error('Failed to load found items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [selectedCategory, selectedStatus, selectedLocation, daysFilter, searchQuery]);

  const categories: (ItemCategory | 'All')[] = [
    'All',
    'Watches',
    'Pouches',
    'Bags',
    'Water Bottles',
    'Other',
  ];

  // Distinct locations for filter dropdown
  const uniqueLocations = useMemo(() => {
    const locs = new Set<string>();
    items.forEach((i) => {
      if (i.locationFound) locs.add(i.locationFound);
    });
    return Array.from(locs);
  }, [items]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.dateFound).getTime() - new Date(a.dateFound).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.dateFound).getTime() - new Date(b.dateFound).getTime();
      }
      if (sortBy === 'days') {
        return b.daysUnclaimed - a.daysUnclaimed;
      }
      return 0;
    });
  }, [items, sortBy]);

  return (
    <div className="space-y-8 pb-16">
      {/* Title & Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Lost &amp; Found Directory
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            Browse all items currently secured on campus. Identifying marks and sensitive codes are kept confidential to ensure true ownership verification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateReport}
            className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2"
          >
            <span>Report What You Lost</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Row 1: Search & Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by keyword, item name, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="newest">Most Recently Found</option>
              <option value="oldest">Oldest Date Found</option>
              <option value="days">Days Unclaimed (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Row 2: Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Row 3: Dropdown filters (Status, Location, Day Counter) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Claim Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Stored / Available">Stored &amp; Available</option>
              <option value="Claim Pending">Claim Pending</option>
              <option value="Claim Approved">Claim Approved (Awaiting Collection)</option>
              <option value="Unclaimed (15+ Days)">Unclaimed (15+ Days Review)</option>
              <option value="Claimed / Collected">Collected / Reunited</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Campus Location
            </label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="All">All Campus Locations</option>
              {uniqueLocations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Holding Day Counter
            </label>
            <select
              value={daysFilter}
              onChange={(e) => setDaysFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600 focus:outline-none"
            >
              <option value="all">All Days</option>
              <option value="under7">Fresh Finds (&le; 7 Days)</option>
              <option value="over15">Past Holding Period (&ge; 15 Days Unclaimed)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="h-72 rounded-2xl bg-slate-100 animate-pulse"></div>
          ))}
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200 p-6 space-y-3">
          <Layers className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Matching Found Items</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your category, status, or search keywords. You can also file a lost item report so faculty can reach out when it turns up!
          </p>
          <button
            onClick={onNavigateReport}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow"
          >
            Submit Lost Report Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedItems.map((item) => {
            const isPast15 = item.daysUnclaimed >= holdingDays;
            const isCollected = item.status === 'Claimed / Collected';

            return (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer overflow-hidden flex flex-col"
              >
                {/* Photo container */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={item.photos[0] || 'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=800&q=80'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-900/80 text-white backdrop-blur-xs">
                      {item.category}
                      {item.customCategory ? ` • ${item.customCategory}` : ''}
                    </span>
                  </div>

                  {/* Day Counter Floating Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 shadow ${
                        isPast15
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-950/80 text-white backdrop-blur-xs'
                      }`}
                    >
                      <Clock className="w-3 h-3 text-amber-300" />
                      {item.daysUnclaimed}d in custody
                    </span>
                  </div>

                  {isCollected && (
                    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center text-white text-xs font-bold">
                      ✓ Collected by Owner
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-700 transition line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 space-y-2 text-[11px]">
                    <div className="flex items-center justify-between text-slate-500">
                      <span className="flex items-center gap-1 truncate max-w-[170px]">
                        <MapPin className="w-3 h-3 text-rose-500 flex-shrink-0" />
                        <span className="truncate">{item.locationFound}</span>
                      </span>
                      <span>{item.dateFound}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          isCollected
                            ? 'bg-emerald-100 text-emerald-800'
                            : isPast15
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="text-xs font-bold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                        View &amp; Claim <ArrowRight className="w-3 h-3" />
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
