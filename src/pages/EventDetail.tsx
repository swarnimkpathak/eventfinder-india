import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Share2, Ticket, ChevronRight, Star } from 'lucide-react';
import { getEventById, CATEGORY_COLORS, CATEGORY_EMOJIS, CATEGORY_GRADIENTS } from '../data/mockData';
import { useApp } from '../context/AppContext';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useApp();
  const event = getEventById(id || '');

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">🔍</div>
        <h2 className="text-xl font-bold text-gray-900">Event not found</h2>
        <Link to="/" className="btn-primary">Go back home</Link>
      </div>
    );
  }

  const available = event.capacity - event.booked;
  const isSoldOut = available <= 0;
  const isLimited = available / event.capacity < 0.15 && !isSoldOut;
  const isFree = event.price === 0;
  const fillPct = Math.max(0, Math.min(100, (event.booked / event.capacity) * 100));

  const handleShare = () => {
    const text = `Check out ${event.title} on ${formatDate(event.date)} at ${event.venue}! Book now on EventFinder India.`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      <div className="relative h-64 md:h-80">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            (target.parentElement as HTMLElement).className += ` bg-gradient-to-br ${CATEGORY_GRADIENTS[event.category]} flex items-center justify-center`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/10" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors"
        >
          <Share2 size={18} className="text-gray-700" />
        </button>

        {/* Featured Badge */}
        {event.isFeatured && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-saffron-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <Star size={12} fill="white" /> Featured Event
          </div>
        )}

        {/* Hero Content */}
        <div className="absolute bottom-4 left-4 right-4">
          <span className={`badge ${CATEGORY_COLORS[event.category]} mb-2`}>
            {CATEGORY_EMOJIS[event.category]} {event.category}
          </span>
          <h1 className="text-white font-black text-xl md:text-2xl leading-tight">{event.title}</h1>
          <p className="text-white/80 text-sm mt-1">by {event.organizer}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Quick Info Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-saffron-500 mb-1">
              <Calendar size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Date & Time</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{formatDate(event.date)}</p>
            <p className="text-gray-500 text-sm">{event.time}{event.endTime ? ` – ${event.endTime}` : ''}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-saffron-500 mb-1">
              <MapPin size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Venue</span>
            </div>
            <p className="font-semibold text-gray-900 text-sm">{event.venue}</p>
            <p className="text-gray-500 text-sm">{event.zone}</p>
          </div>
        </div>

        {/* Organizer */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-saffron-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-black text-sm">
            {event.organizer.charAt(0)}
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Organized by</p>
            <p className="font-semibold text-gray-900 text-sm">{event.organizer}</p>
          </div>
          {event.isGroupFriendly && (
            <div className="ml-auto flex items-center gap-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Users size={12} /> Group Friendly
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
          <h2 className="font-bold text-gray-900 mb-2">About this event</h2>
          <p className="text-gray-600 text-sm leading-relaxed">{event.description}</p>
          <div className="flex flex-wrap gap-2 mt-3">
            {event.tags.map(tag => (
              <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Address */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
          <div className="flex items-start gap-2">
            <MapPin size={16} className="text-saffron-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{event.venue}</p>
              <p className="text-gray-500 text-sm">{event.address}</p>
            </div>
          </div>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-900 text-sm">Availability</h3>
            <span className={`text-sm font-semibold ${
              isSoldOut ? 'text-red-500' : isLimited ? 'text-amber-500' : 'text-green-600'
            }`}>
              {isSoldOut ? 'Sold Out' : isLimited ? `⚡ Only ${available} left!` : `${available} ${t('event.available')}`}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isSoldOut ? 'bg-red-400' : isLimited ? 'bg-amber-400' : 'bg-green-400'
              }`}
              style={{ width: `${fillPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{event.booked} out of {event.capacity} booked</p>
        </div>

        {/* Ticket Types */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 mb-20">
          <h2 className="font-bold text-gray-900 mb-3">Ticket Options</h2>
          <div className="space-y-3">
            {event.ticketTypes.map(ticket => (
              <div key={ticket.id} className={`flex items-center justify-between p-3 rounded-xl border ${
                ticket.available === 0 ? 'border-gray-100 bg-gray-50 opacity-60' : 'border-gray-200'
              }`}>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{ticket.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{ticket.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {ticket.available === 0 ? 'Sold out' : `${ticket.available} available`}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-base ${ticket.price === 0 ? 'text-green-600' : 'text-saffron-600'}`}>
                    {ticket.price === 0 ? 'Free' : `₹${ticket.price}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-lg z-30">
        <div className="max-w-2xl mx-auto flex gap-3">
          {event.isGroupFriendly && (
            <Link
              to={`/group/${event.id}`}
              className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-saffron-500 text-saffron-600 font-semibold text-sm hover:bg-saffron-50 transition-colors"
            >
              <Users size={18} />
              Group
            </Link>
          )}
          <Link
            to={isSoldOut ? '#' : `/booking/${event.id}`}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
              isSoldOut
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-saffron-500 hover:bg-saffron-600 text-white shadow-md hover:shadow-lg active:scale-95'
            }`}
          >
            <Ticket size={18} />
            {isSoldOut ? t('event.soldOut') : `${t('event.bookNow')} ${isFree ? '(Free)' : `from ₹${event.price}`}`}
            {!isSoldOut && <ChevronRight size={18} />}
          </Link>
        </div>
      </div>
    </div>
  );
}
