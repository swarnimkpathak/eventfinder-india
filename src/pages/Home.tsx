import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import EventCard from '../components/EventCard';
import FilterPanel from '../components/FilterPanel';
import { useApp } from '../context/AppContext';
import { mockEvents, getFilteredEvents, CATEGORY_EMOJIS, BANGALORE_ZONES, CHENNAI_ZONES, CATEGORY_GRADIENTS } from '../data/mockData';
import type { EventCategory } from '../types';

interface FilterState {
  interests: EventCategory[];
  zones: string[];
  priceMax: number | undefined;
  dateFilter: 'today' | 'weekend' | 'week' | null;
  showFreeOnly: boolean;
}

const defaultFilters: FilterState = {
  interests: [],
  zones: [],
  priceMax: undefined,
  dateFilter: null,
  showFreeOnly: false,
};

export default function Home() {
  const { t, city, state } = useApp();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [filterOpen, setFilterOpen] = useState(false);

  const currentZones = city === 'bangalore' ? BANGALORE_ZONES : CHENNAI_ZONES;

  const featuredEvents = useMemo(() =>
    mockEvents.filter(e => e.city === city && e.isFeatured),
    [city]
  );

  const filteredEvents = useMemo(() => {
    const result = getFilteredEvents({
      city,
      interests: filters.interests,
      zones: filters.zones,
      query: query.trim() || undefined,
      priceMax: filters.showFreeOnly ? 0 : filters.priceMax,
      dateFilter: filters.dateFilter,
    });
    return result;
  }, [city, filters, query]);

  const activeFilterCount = filters.interests.length + filters.zones.length +
    (filters.priceMax !== undefined ? 1 : 0) + (filters.dateFilter ? 1 : 0) + (filters.showFreeOnly ? 1 : 0);

  const categories: EventCategory[] = ['music', 'food', 'tech', 'sports', 'arts', 'comedy', 'dance', 'wellness', 'cultural'];

  function toggleCategoryQuick(cat: EventCategory) {
    setFilters(prev => ({
      ...prev,
      interests: prev.interests.includes(cat)
        ? prev.interests.filter(i => i !== cat)
        : [...prev.interests, cat],
    }));
  }

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '🌅 Good morning';
    if (h < 17) return '☀️ Good afternoon';
    return '🌙 Good evening';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-saffron-500 via-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-orange-100 text-sm font-medium">{greeting()}{state.user.name ? `, ${state.user.name}` : ''}!</p>
          <h1 className="text-2xl md:text-3xl font-black mt-1">{t('home.title')}</h1>
          <p className="text-orange-100 text-sm mt-1">
            {city === 'bangalore' ? '🌆 Bangalore' : '🏖️ Chennai'} — {filteredEvents.length} events found
          </p>

          {/* Search Bar */}
          <div className="mt-4 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={t('home.search')}
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg text-sm"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Quick Category Pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => toggleCategoryQuick(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                  filters.interests.includes(cat)
                    ? 'bg-white text-saffron-600 shadow'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {CATEGORY_EMOJIS[cat]} <span className="capitalize">{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Featured Events */}
        {!query && activeFilterCount === 0 && featuredEvents.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 text-lg">✨ {t('home.featured')}</h2>
              <span className="text-xs text-gray-400">{featuredEvents.length} events</span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {featuredEvents.map(event => (
                <EventCard key={event.id} event={event} variant="featured" />
              ))}
            </div>
          </section>
        )}

        {/* Filter Bar + Content */}
        <div className="flex gap-6">
          {/* Sidebar Filter (desktop) */}
          <div className="hidden lg:block flex-shrink-0">
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              zones={currentZones}
              isOpen={true}
              onClose={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900">
                  {query ? `Results for "${query}"` : t('home.allEvents')}
                </h2>
                <p className="text-sm text-gray-500">{filteredEvents.length} events</p>
              </div>
              <button
                onClick={() => setFilterOpen(true)}
                className={`lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  activeFilterCount > 0
                    ? 'border-saffron-500 bg-saffron-50 text-saffron-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal size={16} />
                {t('home.filters')}
                {activeFilterCount > 0 && (
                  <span className="bg-saffron-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {filters.interests.map(i => (
                  <button
                    key={i}
                    onClick={() => setFilters(f => ({ ...f, interests: f.interests.filter(x => x !== i) }))}
                    className="flex items-center gap-1 px-3 py-1 bg-saffron-100 text-saffron-700 rounded-full text-xs font-medium"
                  >
                    {CATEGORY_EMOJIS[i]} {i} <X size={10} />
                  </button>
                ))}
                {filters.zones.map(z => (
                  <button
                    key={z}
                    onClick={() => setFilters(f => ({ ...f, zones: f.zones.filter(x => x !== z) }))}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                  >
                    📍 {z} <X size={10} />
                  </button>
                ))}
                {filters.dateFilter && (
                  <button
                    onClick={() => setFilters(f => ({ ...f, dateFilter: null }))}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                  >
                    📅 {filters.dateFilter} <X size={10} />
                  </button>
                )}
                {filters.showFreeOnly && (
                  <button
                    onClick={() => setFilters(f => ({ ...f, showFreeOnly: false }))}
                    className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                  >
                    🎫 Free only <X size={10} />
                  </button>
                )}
                <button
                  onClick={() => setFilters(defaultFilters)}
                  className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-500 rounded-full text-xs font-medium"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Event Grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{t('home.noEvents')}</h3>
                <p className="text-gray-500 text-sm mb-4">Try different filters or search terms</p>
                <button
                  onClick={() => { setFilters(defaultFilters); setQuery(''); }}
                  className="btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        zones={currentZones}
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
      />
    </div>
  );
}
