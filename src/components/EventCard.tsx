import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, Star } from 'lucide-react';
import type { Event } from '../types';
import { CATEGORY_COLORS, CATEGORY_EMOJIS, CATEGORY_GRADIENTS } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface EventCardProps {
  event: Event;
  variant?: 'default' | 'featured' | 'compact';
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return d.toLocaleDateString('en-IN', options);
}

function getAvailabilityColor(pct: number): string {
  if (pct > 0.5) return 'bg-green-500';
  if (pct > 0.2) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function EventCard({ event, variant = 'default' }: EventCardProps) {
  const { t } = useApp();
  const available = event.capacity - event.booked;
  const availPct = available / event.capacity;
  const isSoldOut = available <= 0;
  const isLimited = availPct < 0.15 && !isSoldOut;
  const isFree = event.price === 0;

  if (variant === 'compact') {
    return (
      <Link to={`/event/${event.id}`} className="flex gap-3 p-3 card hover:border-saffron-200">
        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[event.category]} flex items-center justify-center flex-shrink-0`}>
          <span className="text-2xl">{CATEGORY_EMOJIS[event.category]}</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{event.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{formatDate(event.date)} • {event.time}</p>
          <p className="text-xs text-gray-500 truncate">{event.zone}</p>
          <div className="mt-1">
            <span className={`text-xs font-bold ${isFree ? 'text-green-600' : 'text-saffron-600'}`}>
              {isFree ? 'Free' : `₹${event.price}`}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={`/event/${event.id}`} className="relative rounded-2xl overflow-hidden group cursor-pointer flex-shrink-0 w-72 md:w-80">
        <div className="relative h-48">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              (target.parentElement as HTMLElement).className += ` bg-gradient-to-br ${CATEGORY_GRADIENTS[event.category]}`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          {event.isFeatured && (
            <div className="absolute top-3 left-3 flex items-center gap-1 bg-saffron-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              <Star size={10} fill="white" /> Featured
            </div>
          )}
          {isSoldOut && (
            <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Sold Out
            </div>
          )}
          {isLimited && (
            <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Few left!
            </div>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className={`badge ${CATEGORY_COLORS[event.category]} mb-2`}>
            {CATEGORY_EMOJIS[event.category]} {event.category}
          </span>
          <h3 className="font-bold text-white text-base line-clamp-2 leading-tight">{event.title}</h3>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-white/80 text-xs flex items-center gap-1">
              <Calendar size={11} /> {formatDate(event.date)}
            </span>
            <span className="text-white/80 text-xs flex items-center gap-1">
              <MapPin size={11} /> {event.zone}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className={`font-bold text-sm ${isFree ? 'text-green-400' : 'text-saffron-300'}`}>
              {isFree ? 'Free Entry' : `From ₹${event.price}`}
            </span>
            {event.isGroupFriendly && (
              <span className="flex items-center gap-1 text-white/70 text-xs">
                <Users size={11} /> Group
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/event/${event.id}`} className="card group animate-fadeIn">
      <div className="relative h-44 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            (target.parentElement as HTMLElement).className += ` bg-gradient-to-br ${CATEGORY_GRADIENTS[event.category]} flex items-center justify-center`;
            (target.parentElement as HTMLElement).innerHTML += `<span class="text-5xl">${CATEGORY_EMOJIS[event.category]}</span>`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3">
          <span className={`badge ${CATEGORY_COLORS[event.category]}`}>
            {CATEGORY_EMOJIS[event.category]} {event.category}
          </span>
        </div>
        {isFree && (
          <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            FREE
          </div>
        )}
        {isSoldOut && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Sold Out
          </div>
        )}
        {isLimited && !isSoldOut && (
          <div className="absolute top-3 right-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Few left!
          </div>
        )}
        {event.isFeatured && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-saffron-500/90 text-white text-xs font-bold px-2 py-1 rounded-full">
            <Star size={10} fill="white" /> Featured
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base line-clamp-2 leading-snug group-hover:text-saffron-600 transition-colors">
          {event.title}
        </h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{event.description}</p>

        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={14} className="text-saffron-500 flex-shrink-0" />
            <span>{formatDate(event.date)}</span>
            <Clock size={14} className="text-saffron-500 flex-shrink-0 ml-1" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin size={14} className="text-saffron-500 flex-shrink-0" />
            <span className="truncate">{event.venue}, {event.zone}</span>
          </div>
        </div>

        {/* Availability Bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">
              {isSoldOut ? t('event.soldOut') : `${available} ${t('event.available')}`}
            </span>
            {event.isGroupFriendly && (
              <span className="flex items-center gap-1 text-xs text-indigo-500 font-medium">
                <Users size={11} /> Group friendly
              </span>
            )}
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getAvailabilityColor(availPct)}`}
              style={{ width: `${Math.max(0, availPct * 100)}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            {isFree ? (
              <span className="text-green-600 font-bold text-lg">Free Entry</span>
            ) : (
              <div>
                <span className="text-xs text-gray-400">From</span>
                <span className="text-saffron-600 font-bold text-lg ml-1">₹{event.price}</span>
              </div>
            )}
          </div>
          <button
            onClick={(e) => e.preventDefault()}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isSoldOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-saffron-500 hover:bg-saffron-600 text-white shadow-sm hover:shadow-md active:scale-95'
            }`}
          >
            {isSoldOut ? t('event.soldOut') : t('event.bookNow')}
          </button>
        </div>
      </div>
    </Link>
  );
}
