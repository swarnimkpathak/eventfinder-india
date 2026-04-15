import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useApp, useInterestCategories } from '../context/AppContext';
import { CATEGORY_EMOJIS, BANGALORE_ZONES, CHENNAI_ZONES } from '../data/mockData';
import type { EventCategory, City, Language } from '../types';

const CITIES: { value: City; label: string; emoji: string; desc: string }[] = [
  { value: 'bangalore', label: 'Bangalore', emoji: '🌆', desc: 'Garden City of India' },
  { value: 'chennai', label: 'Chennai', emoji: '🏖️', desc: 'Gateway to South India' },
];

const LANGUAGES: { value: Language; label: string; native: string; emoji: string }[] = [
  { value: 'en', label: 'English', native: 'English', emoji: '🇬🇧' },
  { value: 'hi', label: 'Hindi', native: 'हिंदी', emoji: '🇮🇳' },
  { value: 'ta', label: 'Tamil', native: 'தமிழ்', emoji: '🎭' },
  { value: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', emoji: '🌸' },
];

const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: 'Music', food: 'Food & Drink', tech: 'Tech', sports: 'Sports',
  arts: 'Arts', comedy: 'Comedy', dance: 'Dance', wellness: 'Wellness', cultural: 'Cultural',
};

export default function Onboarding() {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const allCategories = useInterestCategories();
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<EventCategory[]>([]);
  const [city, setCity] = useState<City>('bangalore');
  const [zones, setZones] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const currentZones = city === 'bangalore' ? BANGALORE_ZONES : CHENNAI_ZONES;

  function toggleInterest(cat: EventCategory) {
    setInterests(prev =>
      prev.includes(cat) ? prev.filter(i => i !== cat) : [...prev, cat]
    );
  }

  function toggleZone(zone: string) {
    setZones(prev =>
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  }

  function handleCityChange(c: City) {
    setCity(c);
    setZones([]);
  }

  function handleComplete() {
    dispatch({
      type: 'COMPLETE_ONBOARDING',
      payload: {
        interests: interests.length ? interests : allCategories,
        city,
        zones,
        language,
        hasOnboarded: true,
        name: name || 'Guest User',
        phone: phone || '',
      },
    });
    navigate('/', { replace: true });
  }

  const steps = [
    { title: 'Interests', subtitle: "What are you into?", step: 0 },
    { title: 'Location', subtitle: 'Your city & zones', step: 1 },
    { title: 'Preferences', subtitle: 'Language & profile', step: 2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-saffron-50 via-white to-orange-50 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-10 pb-4 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-saffron-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-white text-2xl font-black">EF</span>
        </div>
        <h1 className="text-2xl font-black text-gray-900">EventFinder India</h1>
        <p className="text-gray-500 text-sm mt-1">Discover local events in Bangalore & Chennai</p>
      </div>

      {/* Progress */}
      <div className="px-6 max-w-lg mx-auto w-full">
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.step} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                i < step ? 'bg-saffron-500 text-white' :
                i === step ? 'bg-saffron-500 text-white ring-4 ring-saffron-100' :
                'bg-gray-100 text-gray-400'
              }`}>
                {i < step ? <CheckCircle2 size={16} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full ${i < step ? 'bg-saffron-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 px-6 max-w-lg mx-auto w-full">
        {/* Step 0: Interests */}
        {step === 0 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-1">What are your interests?</h2>
            <p className="text-gray-500 text-sm mb-5">Pick as many as you like — we'll personalize your feed</p>
            <div className="grid grid-cols-3 gap-3">
              {allCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleInterest(cat)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    interests.includes(cat)
                      ? 'border-saffron-500 bg-saffron-50 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <span className="text-3xl">{CATEGORY_EMOJIS[cat]}</span>
                  <span className={`text-xs font-semibold ${interests.includes(cat) ? 'text-saffron-700' : 'text-gray-600'}`}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  {interests.includes(cat) && (
                    <div className="w-4 h-4 bg-saffron-500 rounded-full flex items-center justify-center">
                      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                        <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            {interests.length === 0 && (
              <p className="text-center text-xs text-gray-400 mt-4">
                Skip to see all events, or select your favorites
              </p>
            )}
          </div>
        )}

        {/* Step 1: City & Zones */}
        {step === 1 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Where are you?</h2>
            <p className="text-gray-500 text-sm mb-5">Choose your city and preferred neighborhoods</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {CITIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => handleCityChange(c.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    city === c.value
                      ? 'border-saffron-500 bg-saffron-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className="text-3xl mb-2">{c.emoji}</div>
                  <div className={`font-bold text-sm ${city === c.value ? 'text-saffron-700' : 'text-gray-900'}`}>
                    {c.label}
                  </div>
                  <div className="text-xs text-gray-400">{c.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <h3 className="font-semibold text-gray-700 text-sm mb-2">
                Preferred Zones <span className="text-gray-400 font-normal">(optional)</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentZones.map(zone => (
                  <button
                    key={zone}
                    onClick={() => toggleZone(zone)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      zones.includes(zone)
                        ? 'bg-indigo-500 text-white border-indigo-500'
                        : 'border-gray-200 text-gray-600 hover:border-indigo-300 bg-white'
                    }`}
                  >
                    {zone}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Language & Profile */}
        {step === 2 && (
          <div className="animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Almost done!</h2>
            <p className="text-gray-500 text-sm mb-5">Set your language preference and quick profile</p>

            <div className="mb-5">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">Language</h3>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map(l => (
                  <button
                    key={l.value}
                    onClick={() => setLanguage(l.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                      language === l.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <span className="text-2xl">{l.emoji}</span>
                    <div className="text-left">
                      <div className={`text-sm font-bold ${language === l.value ? 'text-blue-700' : 'text-gray-900'}`}>
                        {l.native}
                      </div>
                      <div className="text-xs text-gray-400">{l.label}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1">Phone Number</label>
                <div className="flex gap-2">
                  <div className="flex items-center px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium text-gray-600">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="input-field flex-1"
                    maxLength={10}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 mt-6">
        <div className="max-w-lg mx-auto flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="btn-secondary flex items-center gap-2"
            >
              <ChevronLeft size={18} /> Back
            </button>
          )}
          <button
            onClick={() => step < 2 ? setStep(s => s + 1) : handleComplete()}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {step < 2 ? (
              <>Next <ChevronRight size={18} /></>
            ) : (
              <>Start Exploring <span className="text-lg">🎉</span></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
