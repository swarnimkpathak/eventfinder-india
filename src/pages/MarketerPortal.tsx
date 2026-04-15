import { useState } from 'react';
import { BarChart2, TrendingUp, Users, Target, Plus, X, Eye, MousePointer, ShoppingCart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { mockCampaigns, CATEGORY_EMOJIS } from '../data/mockData';
import type { Campaign, EventCategory } from '../types';

function StatCard({ label, value, change, icon, color }: {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-gray-500 text-xs mt-0.5">{label}</p>
    </div>
  );
}

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${color} opacity-80`}
          style={{ height: `${max > 0 ? (v / max) * 100 : 0}%`, minHeight: 2 }}
        />
      ))}
    </div>
  );
}

const STATUS_STYLES: Record<Campaign['status'], string> = {
  active: 'bg-green-100 text-green-700',
  paused: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-500',
  draft: 'bg-blue-100 text-blue-600',
};

const ALL_INTERESTS: EventCategory[] = ['music', 'food', 'tech', 'sports', 'arts', 'comedy', 'dance', 'wellness', 'cultural'];

const defaultCampaign = {
  name: '',
  targetCity: 'bangalore' as string,
  targetInterests: [] as EventCategory[],
  targetAgeGroup: '18-35',
  budget: 10000,
};

export default function MarketerPortal() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [tab, setTab] = useState<'dashboard' | 'campaigns' | 'create'>('dashboard');
  const [newCampaign, setNewCampaign] = useState(defaultCampaign);
  const [showSuccess, setShowSuccess] = useState(false);

  const totalImpressions = campaigns.reduce((s, c) => s + c.impressions, 0);
  const totalClicks = campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);
  const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0';
  const avgCVR = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(1) : '0';

  // Mock weekly data for charts
  const weeklyImpressions = [12000, 18000, 15000, 22000, 19000, 28000, 31000];
  const weeklyClicks = [720, 1080, 900, 1320, 1140, 1680, 1860];
  const weeklyConversions = [43, 65, 54, 79, 68, 101, 112];

  function toggleInterest(cat: EventCategory) {
    setNewCampaign(prev => ({
      ...prev,
      targetInterests: prev.targetInterests.includes(cat)
        ? prev.targetInterests.filter(i => i !== cat)
        : [...prev.targetInterests, cat],
    }));
  }

  function createCampaign() {
    if (!newCampaign.name) return;
    const campaign: Campaign = {
      id: 'camp-' + Date.now(),
      name: newCampaign.name,
      targetCity: newCampaign.targetCity,
      targetInterests: newCampaign.targetInterests,
      targetAgeGroup: newCampaign.targetAgeGroup,
      budget: newCampaign.budget,
      spent: 0,
      impressions: 0,
      clicks: 0,
      conversions: 0,
      status: 'draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    };
    setCampaigns(prev => [campaign, ...prev]);
    setNewCampaign(defaultCampaign);
    setShowSuccess(true);
    setTab('campaigns');
    setTimeout(() => setShowSuccess(false), 3000);
  }

  function toggleStatus(id: string) {
    setCampaigns(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, status: c.status === 'active' ? 'paused' : c.status === 'paused' ? 'active' : c.status };
    }));
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart2 size={22} />
                <h1 className="font-black text-xl">Marketer Portal</h1>
              </div>
              <p className="text-indigo-200 text-sm">Reach your audience in Bangalore & Chennai</p>
            </div>
            <button
              onClick={() => setTab('create')}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              <Plus size={16} /> New Campaign
            </button>
          </div>

          {/* Tab Bar */}
          <div className="flex gap-1 bg-white/10 p-1 rounded-xl mt-4">
            {(['dashboard', 'campaigns', 'create'] as const).map(t2 => (
              <button
                key={t2}
                onClick={() => setTab(t2)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                  tab === t2 ? 'bg-white text-indigo-700' : 'text-white/80 hover:text-white'
                }`}
              >
                {t2 === 'dashboard' ? '📊 Dashboard' : t2 === 'campaigns' ? '🎯 Campaigns' : '➕ Create'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {showSuccess && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3 animate-fadeIn">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">✅</div>
            <div>
              <p className="font-semibold text-green-800 text-sm">Campaign created successfully!</p>
              <p className="text-green-600 text-xs">Your campaign is saved as a draft. Activate it to start running.</p>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {tab === 'dashboard' && (
          <div className="space-y-5 animate-fadeIn">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard
                label="Total Impressions"
                value={totalImpressions.toLocaleString('en-IN')}
                change={14}
                icon={<Eye size={20} className="text-blue-600" />}
                color="bg-blue-50"
              />
              <StatCard
                label="Total Clicks"
                value={totalClicks.toLocaleString('en-IN')}
                change={8}
                icon={<MousePointer size={20} className="text-purple-600" />}
                color="bg-purple-50"
              />
              <StatCard
                label="Conversions"
                value={totalConversions.toLocaleString('en-IN')}
                change={22}
                icon={<ShoppingCart size={20} className="text-green-600" />}
                color="bg-green-50"
              />
              <StatCard
                label="Total Spent"
                value={`₹${totalSpent.toLocaleString('en-IN')}`}
                icon={<TrendingUp size={20} className="text-saffron-600" />}
                color="bg-saffron-50"
              />
            </div>

            {/* Second row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                <p className="text-3xl font-black text-indigo-600">{activeCampaigns}</p>
                <p className="text-xs text-gray-500 mt-0.5">Active Campaigns</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                <p className="text-3xl font-black text-purple-600">{avgCTR}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Avg CTR</p>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
                <p className="text-3xl font-black text-green-600">{avgCVR}%</p>
                <p className="text-xs text-gray-500 mt-0.5">Avg CVR</p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">Weekly Impressions</h3>
                  <span className="text-xs text-green-600 font-medium">+14%</span>
                </div>
                <MiniBarChart data={weeklyImpressions} color="bg-blue-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Mon</span><span>Sun</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">Weekly Clicks</h3>
                  <span className="text-xs text-green-600 font-medium">+8%</span>
                </div>
                <MiniBarChart data={weeklyClicks} color="bg-purple-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Mon</span><span>Sun</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold text-gray-900 text-sm">Weekly Conversions</h3>
                  <span className="text-xs text-green-600 font-medium">+22%</span>
                </div>
                <MiniBarChart data={weeklyConversions} color="bg-green-500" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Mon</span><span>Sun</span>
                </div>
              </div>
            </div>

            {/* Top Campaigns */}
            <div className="bg-white rounded-2xl border border-gray-100">
              <div className="p-4 border-b border-gray-50 flex justify-between">
                <h3 className="font-bold text-gray-900">Top Performing Campaigns</h3>
                <button onClick={() => setTab('campaigns')} className="text-indigo-500 text-sm font-medium hover:text-indigo-600">View all →</button>
              </div>
              <div className="divide-y divide-gray-50">
                {campaigns.filter(c => c.status === 'active').slice(0, 3).map(c => (
                  <div key={c.id} className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                      <Target size={16} className="text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.impressions.toLocaleString()} impressions • {c.conversions} conversions</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-600">{c.impressions > 0 ? ((c.clicks / c.impressions) * 100).toFixed(1) : 0}%</p>
                      <p className="text-xs text-gray-400">CTR</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* City Distribution */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Audience Distribution</h3>
              <div className="space-y-2">
                {[
                  { city: 'Bangalore', pct: 58, color: 'bg-saffron-500' },
                  { city: 'Chennai', pct: 42, color: 'bg-indigo-500' },
                ].map(item => (
                  <div key={item.city}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{item.city}</span>
                      <span className="text-gray-500">{item.pct}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {tab === 'campaigns' && (
          <div className="space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{campaigns.length} Campaigns</h2>
              <button
                onClick={() => setTab('create')}
                className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
              >
                <Plus size={16} /> Create
              </button>
            </div>

            {campaigns.map(c => (
              <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
                      <span className={`badge text-xs ${STATUS_STYLES[c.status]}`}>{c.status}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      📍 {c.targetCity === 'both' ? 'Both cities' : c.targetCity.charAt(0).toUpperCase() + c.targetCity.slice(1)} •
                      👥 Age {c.targetAgeGroup}
                    </p>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {c.targetInterests.map(i => (
                        <span key={i} className="text-xs">{CATEGORY_EMOJIS[i]} {i}</span>
                      ))}
                    </div>
                  </div>
                  {(c.status === 'active' || c.status === 'paused') && (
                    <button
                      onClick={() => toggleStatus(c.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        c.status === 'active'
                          ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {c.status === 'active' ? '⏸ Pause' : '▶ Resume'}
                    </button>
                  )}
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-blue-50 rounded-xl p-2">
                    <p className="text-sm font-black text-blue-600">{(c.impressions / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-400">Views</p>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-2">
                    <p className="text-sm font-black text-purple-600">{c.clicks.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">Clicks</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-2">
                    <p className="text-sm font-black text-green-600">{c.conversions}</p>
                    <p className="text-xs text-gray-400">Bookings</p>
                  </div>
                  <div className="bg-saffron-50 rounded-xl p-2">
                    <p className="text-sm font-black text-saffron-600">₹{c.budget > 0 ? Math.round(c.spent / c.budget * 100) : 0}%</p>
                    <p className="text-xs text-gray-400">Used</p>
                  </div>
                </div>

                {/* Budget Progress */}
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Budget: ₹{c.spent.toLocaleString()} / ₹{c.budget.toLocaleString()}</span>
                    <span>{c.startDate} → {c.endDate}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.status === 'completed' ? 'bg-gray-400' : 'bg-indigo-500'}`}
                      style={{ width: `${c.budget > 0 ? Math.min(100, (c.spent / c.budget) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Campaign Tab */}
        {tab === 'create' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Create New Campaign</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., Summer Music Fest Promo"
                    value={newCampaign.name}
                    onChange={e => setNewCampaign(p => ({ ...p, name: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Target City</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['bangalore', 'chennai', 'both']).map(city => (
                      <button
                        key={city}
                        onClick={() => setNewCampaign(p => ({ ...p, targetCity: city }))}
                        className={`py-2 rounded-xl border text-sm font-medium capitalize transition-all ${
                          newCampaign.targetCity === city
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {city === 'both' ? '🌍 Both' : city === 'bangalore' ? '🌆 Blr' : '🏖️ Chn'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Target Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_INTERESTS.map(cat => (
                      <button
                        key={cat}
                        onClick={() => toggleInterest(cat)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-all ${
                          newCampaign.targetInterests.includes(cat)
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {CATEGORY_EMOJIS[cat]} <span className="capitalize">{cat}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Age Group</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['18-24', '25-35', '36-50', '18-35', '25-45', 'All ages'].map(age => (
                      <button
                        key={age}
                        onClick={() => setNewCampaign(p => ({ ...p, targetAgeGroup: age }))}
                        className={`py-2 rounded-xl border text-sm font-medium transition-all ${
                          newCampaign.targetAgeGroup === age
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">
                    Budget: ₹{newCampaign.budget.toLocaleString('en-IN')}
                  </label>
                  <input
                    type="range"
                    min={1000}
                    max={200000}
                    step={1000}
                    value={newCampaign.budget}
                    onChange={e => setNewCampaign(p => ({ ...p, budget: parseInt(e.target.value) }))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>₹1,000</span>
                    <span>₹2,00,000</span>
                  </div>
                </div>

                {/* Estimated Reach */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                  <h3 className="font-semibold text-indigo-800 text-sm mb-2">📊 Estimated Reach</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="font-black text-indigo-700">{Math.round(newCampaign.budget * 3.2).toLocaleString()}</p>
                      <p className="text-xs text-indigo-500">Impressions</p>
                    </div>
                    <div>
                      <p className="font-black text-indigo-700">{Math.round(newCampaign.budget * 0.19).toLocaleString()}</p>
                      <p className="text-xs text-indigo-500">Clicks</p>
                    </div>
                    <div>
                      <p className="font-black text-indigo-700">{Math.round(newCampaign.budget * 0.011)}</p>
                      <p className="text-xs text-indigo-500">Bookings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setNewCampaign(defaultCampaign); setTab('campaigns'); }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={createCampaign}
                disabled={!newCampaign.name}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-50"
              >
                Create Campaign
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
