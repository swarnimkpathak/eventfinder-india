import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MapPin, Globe, Ticket, Users, BarChart2, Compass, ChevronDown, Bell, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Language, City } from '../types';

const CITIES: { value: City; label: string }[] = [
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'chennai', label: 'Chennai' },
];

const LANGUAGES: { value: Language; label: string; native: string }[] = [
  { value: 'en', label: 'English', native: 'English' },
  { value: 'hi', label: 'Hindi', native: 'हिंदी' },
  { value: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { value: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

export default function Navbar() {
  const { t, city, setCity, language, setLanguage, state } = useApp();
  const location = useLocation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const upcomingCount = state.bookings.filter(b => {
    const d = new Date(b.eventDate);
    return b.status === 'confirmed' && d >= new Date();
  }).length;

  const navLinks = [
    { to: '/', label: t('nav.discover'), icon: <Compass size={18} /> },
    { to: '/tickets', label: t('nav.tickets'), icon: <Ticket size={18} />, badge: upcomingCount },
    { to: '/group', label: t('nav.group'), icon: <Users size={18} /> },
    { to: '/marketer', label: t('nav.marketer'), icon: <BarChart2 size={18} /> },
  ];

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to);
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-saffron-500 to-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">EF</span>
            </div>
            <span className="font-black text-gray-900 text-lg hidden sm:block">
              EventFinder <span className="text-saffron-500">India</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive(link.to)
                    ? 'bg-saffron-50 text-saffron-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.icon}
                {link.label}
                {link.badge && link.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-saffron-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {/* City Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => { setShowCityMenu(!showCityMenu); setShowLangMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <MapPin size={14} className="text-saffron-500" />
                <span className="font-medium">{CITIES.find(c => c.value === city)?.label}</span>
                <ChevronDown size={14} />
              </button>
              {showCityMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-36 z-50">
                  {CITIES.map(c => (
                    <button
                      key={c.value}
                      onClick={() => { setCity(c.value); setShowCityMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        city === c.value ? 'text-saffron-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => { setShowLangMenu(!showLangMenu); setShowCityMenu(false); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Globe size={14} className="text-blue-500" />
                <span className="font-medium">{LANGUAGES.find(l => l.value === language)?.native}</span>
                <ChevronDown size={14} />
              </button>
              {showLangMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-36 z-50">
                  {LANGUAGES.map(l => (
                    <button
                      key={l.value}
                      onClick={() => { setLanguage(l.value); setShowLangMenu(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                        language === l.value ? 'text-blue-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {l.native}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-saffron-500 rounded-full"></span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fadeIn">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-saffron-50 text-saffron-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.icon}
                {link.label}
                {link.badge && link.badge > 0 && (
                  <span className="ml-auto bg-saffron-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
            <div className="flex gap-2 pt-2">
              {CITIES.map(c => (
                <button
                  key={c.value}
                  onClick={() => setCity(c.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    city === c.value
                      ? 'bg-saffron-500 text-white border-saffron-500'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 pt-1">
              {LANGUAGES.map(l => (
                <button
                  key={l.value}
                  onClick={() => setLanguage(l.value)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    language === l.value
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {l.native}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Click outside handler */}
      {(showLangMenu || showCityMenu) && (
        <div className="fixed inset-0 z-30" onClick={() => { setShowLangMenu(false); setShowCityMenu(false); }} />
      )}
    </nav>
  );
}
