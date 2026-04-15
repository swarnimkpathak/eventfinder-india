import { X, SlidersHorizontal } from 'lucide-react';
import type { EventCategory } from '../types';
import { CATEGORY_COLORS, CATEGORY_EMOJIS } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface FilterState {
  interests: EventCategory[];
  zones: string[];
  priceMax: number | undefined;
  dateFilter: 'today' | 'weekend' | 'week' | null;
  showFreeOnly: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  zones: string[];
  isOpen: boolean;
  onClose: () => void;
}

const ALL_CATEGORIES: EventCategory[] = ['music', 'food', 'tech', 'sports', 'arts', 'comedy', 'dance', 'wellness', 'cultural'];

export default function FilterPanel({ filters, onFiltersChange, zones, isOpen, onClose }: FilterPanelProps) {
  const { t } = useApp();

  function toggleInterest(cat: EventCategory) {
    const next = filters.interests.includes(cat)
      ? filters.interests.filter(i => i !== cat)
      : [...filters.interests, cat];
    onFiltersChange({ ...filters, interests: next });
  }

  function toggleZone(zone: string) {
    const next = filters.zones.includes(zone)
      ? filters.zones.filter(z => z !== zone)
      : [...filters.zones, zone];
    onFiltersChange({ ...filters, zones: next });
  }

  function setDateFilter(val: FilterState['dateFilter']) {
    onFiltersChange({ ...filters, dateFilter: filters.dateFilter === val ? null : val });
  }

  function clearAll() {
    onFiltersChange({ interests: [], zones: [], priceMax: undefined, dateFilter: null, showFreeOnly: false });
  }

  const activeCount = filters.interests.length + filters.zones.length +
    (filters.priceMax !== undefined ? 1 : 0) + (filters.dateFilter ? 1 : 0) + (filters.showFreeOnly ? 1 : 0);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Panel */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto
          transform transition-transform duration-300 ease-in-out
          lg:static lg:transform-none lg:shadow-none lg:h-auto lg:w-64 lg:rounded-2xl lg:border lg:border-gray-100
          ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-saffron-500" />
              <h2 className="font-bold text-gray-900">{t('home.filters')}</h2>
              {activeCount > 0 && (
                <span className="bg-saffron-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button onClick={clearAll} className="text-xs text-red-500 font-medium hover:text-red-600">
                  Clear all
                </button>
              )}
              <button onClick={onClose} className="lg:hidden w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Date Filter */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">When</h3>
            <div className="flex flex-wrap gap-2">
              {(['today', 'weekend', 'week'] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDateFilter(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    filters.dateFilter === d
                      ? 'bg-saffron-500 text-white border-saffron-500'
                      : 'border-gray-200 text-gray-600 hover:border-saffron-300'
                  }`}
                >
                  {d === 'today' ? t('home.today') : d === 'weekend' ? t('home.weekend') : t('home.thisWeek')}
                </button>
              ))}
            </div>
          </div>

          {/* Free Only */}
          <div className="mb-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <div
                onClick={() => onFiltersChange({ ...filters, showFreeOnly: !filters.showFreeOnly })}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  filters.showFreeOnly ? 'bg-saffron-500' : 'bg-gray-200'
                }`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  filters.showFreeOnly ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </div>
              <span className="text-sm font-medium text-gray-700">{t('home.free')} only</span>
            </label>
          </div>

          {/* Categories */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Category</h3>
            <div className="space-y-1.5">
              {ALL_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleInterest(cat)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
                    filters.interests.includes(cat)
                      ? 'bg-saffron-50 border border-saffron-200 text-saffron-700'
                      : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                  }`}
                >
                  <span>{CATEGORY_EMOJIS[cat]}</span>
                  <span className="capitalize font-medium">{cat}</span>
                  {filters.interests.includes(cat) && (
                    <span className="ml-auto">
                      <div className="w-4 h-4 bg-saffron-500 rounded-full flex items-center justify-center">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Zones */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Zone</h3>
            <div className="flex flex-wrap gap-2">
              {zones.map(zone => (
                <button
                  key={zone}
                  onClick={() => toggleZone(zone)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    filters.zones.includes(zone)
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                  }`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Max Price: {filters.priceMax !== undefined ? `₹${filters.priceMax}` : 'Any'}
            </h3>
            <input
              type="range"
              min={0}
              max={3000}
              step={100}
              value={filters.priceMax ?? 3000}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                onFiltersChange({ ...filters, priceMax: val === 3000 ? undefined : val });
              }}
              className="w-full accent-saffron-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>₹0</span>
              <span>₹3000+</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden btn-primary w-full"
          >
            Show Results
          </button>
        </div>
      </aside>
    </>
  );
}
