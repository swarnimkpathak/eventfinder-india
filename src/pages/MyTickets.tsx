import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, MapPin, ChevronDown, ChevronUp, Download, Share2, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import type { Booking } from '../types';

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function isUpcoming(dateStr: string): boolean {
  return new Date(dateStr) >= new Date();
}

function TicketCard({ booking }: { booking: Booking }) {
  const { dispatch } = useApp();
  const [expanded, setExpanded] = useState(false);
  const upcoming = isUpcoming(booking.eventDate);
  const isCancelled = booking.status === 'cancelled';
  const isFree = booking.totalAmount === 0;

  const handleShare = () => {
    const text = `I'm going to ${booking.eventTitle} on ${formatDate(booking.eventDate)}! Booking ID: ${booking.id}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className={`card overflow-hidden transition-all ${isCancelled ? 'opacity-60' : ''}`}>
      {/* Ticket Header */}
      <div className={`p-4 ${
        isCancelled ? 'bg-gray-100' :
        upcoming ? 'bg-gradient-to-r from-saffron-500 to-orange-500' :
        'bg-gradient-to-r from-gray-500 to-gray-600'
      } text-white`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs opacity-80 mb-0.5 font-medium">
              {isCancelled ? '❌ CANCELLED' : upcoming ? '🎟️ UPCOMING' : '✅ ATTENDED'}
            </p>
            <h3 className="font-black text-base leading-tight line-clamp-2">{booking.eventTitle}</h3>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs opacity-80">Total</p>
            <p className="font-bold">{isFree ? 'Free' : `₹${booking.totalAmount}`}</p>
          </div>
        </div>
      </div>

      {/* Ticket Body */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar size={14} className="text-saffron-500" />
            <span>{formatDate(booking.eventDate)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600">
            <Ticket size={14} className="text-saffron-500" />
            <span>{booking.quantity}× {booking.ticketTypeName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
            <MapPin size={14} className="text-saffron-500" />
            <span className="truncate">{booking.eventVenue}</span>
          </div>
        </div>

        {/* Booking ID */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2 mb-3">
          <span className="text-xs text-gray-400">Booking ID</span>
          <span className="font-mono font-bold text-gray-900 text-sm">{booking.id}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {!isCancelled && upcoming && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-saffron-200 text-saffron-600 text-sm font-medium hover:bg-saffron-50 transition-colors"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              {expanded ? 'Hide QR' : 'Show QR'}
            </button>
          )}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Share2 size={16} />
          </button>
          {!isCancelled && upcoming && (
            <button
              onClick={() => dispatch({ type: 'CANCEL_BOOKING', payload: booking.id })}
              className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Expanded QR Code */}
        {expanded && !isCancelled && (
          <div className="mt-4 pt-4 border-t border-dashed border-gray-200 animate-fadeIn">
            <div className="flex flex-col items-center gap-3">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <QRCodeSVG value={booking.qrData} size={160} />
              </div>
              <p className="text-xs text-gray-400 text-center">
                Show this QR code at the venue entrance<br />
                <span className="font-medium text-gray-500">Valid for {booking.quantity} {booking.quantity === 1 ? 'person' : 'people'}</span>
              </p>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-saffron-500 text-white rounded-xl text-sm font-medium hover:bg-saffron-600 transition-colors">
                  <Download size={14} /> Save Ticket
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function MyTickets() {
  const { t, state } = useApp();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcoming = state.bookings.filter(b => b.status !== 'cancelled' && isUpcoming(b.eventDate));
  const past = state.bookings.filter(b => b.status === 'cancelled' || !isUpcoming(b.eventDate));

  const displayBookings = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-saffron-100 rounded-xl flex items-center justify-center">
              <Ticket size={20} className="text-saffron-600" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 text-xl">{t('nav.tickets')}</h1>
              <p className="text-gray-500 text-sm">{state.bookings.length} total bookings</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setTab('upcoming')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === 'upcoming' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('tickets.upcoming')} {upcoming.length > 0 && <span className="ml-1 bg-saffron-500 text-white text-xs px-1.5 py-0.5 rounded-full">{upcoming.length}</span>}
            </button>
            <button
              onClick={() => setTab('past')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === 'past' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('tickets.past')} {past.length > 0 && <span className="ml-1 bg-gray-400 text-white text-xs px-1.5 py-0.5 rounded-full">{past.length}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {displayBookings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎟️</div>
            <h3 className="font-bold text-gray-900 text-lg mb-2">
              {tab === 'upcoming' ? 'No upcoming tickets' : 'No past events'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {tab === 'upcoming' ? t('tickets.noTickets') : "You haven't attended any events yet."}
            </p>
            {tab === 'upcoming' && (
              <Link to="/" className="btn-primary inline-flex items-center gap-2">
                <Ticket size={18} /> Browse Events
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {displayBookings.map(booking => (
              <TicketCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
