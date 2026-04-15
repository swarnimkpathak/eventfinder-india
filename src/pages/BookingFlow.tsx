import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, CheckCircle2, Ticket, Copy, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getEventById } from '../data/mockData';
import { useApp } from '../context/AppContext';
import type { Booking, TicketType } from '../types';

function generateBookingId(): string {
  return 'EFI-' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

const STEPS = ['Tickets', 'Details', 'Payment', 'Confirmed'];

export default function BookingFlow() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, dispatch, state } = useApp();
  const event = getEventById(id || '');

  const [step, setStep] = useState(0);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState(state.user.name || '');
  const [phone, setPhone] = useState(state.user.phone || '');
  const [email, setEmail] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [paymentStep, setPaymentStep] = useState<'enter' | 'processing' | 'done'>('enter');
  const [bookingId, setBookingId] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (event) {
      const avail = event.ticketTypes.find(t => t.available > 0);
      if (avail) setSelectedTicket(avail);
    }
  }, [event]);

  useEffect(() => {
    if (paymentStep === 'processing' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (paymentStep === 'processing' && countdown === 0) {
      const newBookingId = generateBookingId();
      setBookingId(newBookingId);
      if (event && selectedTicket) {
        const booking: Booking = {
          id: newBookingId,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventVenue: event.venue,
          eventCity: event.city,
          eventImage: event.image,
          ticketTypeName: selectedTicket.name,
          quantity,
          totalAmount: selectedTicket.price * quantity,
          status: 'confirmed',
          qrData: JSON.stringify({ bookingId: newBookingId, eventId: event.id, ticket: selectedTicket.name, qty: quantity }),
          bookedAt: new Date().toISOString(),
          attendeeName: name,
          attendeePhone: phone,
        };
        dispatch({ type: 'ADD_BOOKING', payload: booking });
      }
      setPaymentStep('done');
      setStep(3);
    }
  }, [paymentStep, countdown]);

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="text-6xl">😕</div>
        <p className="text-gray-600">Event not found</p>
        <Link to="/" className="btn-primary">Go Home</Link>
      </div>
    );
  }

  const totalAmount = selectedTicket ? selectedTicket.price * quantity : 0;
  const isFree = totalAmount === 0;

  function handlePayment() {
    if (isFree) {
      const newBookingId = generateBookingId();
      setBookingId(newBookingId);
      if (selectedTicket) {
        const booking: Booking = {
          id: newBookingId,
          eventId: event.id,
          eventTitle: event.title,
          eventDate: event.date,
          eventTime: event.time,
          eventVenue: event.venue,
          eventCity: event.city,
          eventImage: event.image,
          ticketTypeName: selectedTicket.name,
          quantity,
          totalAmount: 0,
          status: 'confirmed',
          qrData: JSON.stringify({ bookingId: newBookingId, eventId: event.id, ticket: selectedTicket.name, qty: quantity }),
          bookedAt: new Date().toISOString(),
          attendeeName: name,
          attendeePhone: phone,
        };
        dispatch({ type: 'ADD_BOOKING', payload: booking });
      }
      setPaymentStep('done');
      setStep(3);
    } else {
      setPaymentStep('processing');
      setCountdown(3);
    }
  }

  const qrValue = bookingId ? JSON.stringify({
    id: bookingId,
    event: event.title,
    date: event.date,
    ticket: selectedTicket?.name,
    qty: quantity,
    name,
  }) : '';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-20">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            {step < 3 && (
              <button
                onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="font-bold text-gray-900 text-base">{step < 3 ? 'Book Tickets' : 'Booking Confirmed!'}</h1>
              <p className="text-gray-500 text-xs truncate max-w-xs">{event.title}</p>
            </div>
          </div>

          {/* Stepper */}
          {step < 3 && (
            <div className="flex items-center gap-2">
              {STEPS.slice(0, 3).map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 ${
                    i < step ? 'bg-saffron-500 text-white' :
                    i === step ? 'bg-saffron-500 text-white ring-2 ring-saffron-200' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs font-medium ${i === step ? 'text-saffron-600' : 'text-gray-400'}`}>{s}</span>
                  {i < 2 && <div className={`flex-1 h-0.5 rounded-full ${i < step ? 'bg-saffron-500' : 'bg-gray-200'}`} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Step 0: Select Tickets */}
        {step === 0 && (
          <div className="animate-fadeIn space-y-4">
            {/* Event Summary */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 flex gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{event.title}</h3>
                <p className="text-gray-500 text-xs mt-0.5">{formatDate(event.date)} • {event.time}</p>
                <p className="text-gray-500 text-xs">{event.venue}</p>
              </div>
            </div>

            {/* Ticket Types */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-50">
                <h2 className="font-bold text-gray-900">Select Ticket Type</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {event.ticketTypes.map(ticket => (
                  <button
                    key={ticket.id}
                    onClick={() => ticket.available > 0 && setSelectedTicket(ticket)}
                    disabled={ticket.available === 0}
                    className={`w-full flex items-center justify-between p-4 text-left transition-all ${
                      ticket.available === 0 ? 'opacity-50 cursor-not-allowed' :
                      selectedTicket?.id === ticket.id ? 'bg-saffron-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                        selectedTicket?.id === ticket.id
                          ? 'border-saffron-500 bg-saffron-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedTicket?.id === ticket.id && (
                          <div className="w-full h-full rounded-full bg-saffron-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{ticket.name}</p>
                        <p className="text-gray-500 text-xs">{ticket.description}</p>
                        <p className="text-xs text-gray-400">{ticket.available > 0 ? `${ticket.available} left` : 'Sold out'}</p>
                      </div>
                    </div>
                    <span className={`font-bold text-base ${ticket.price === 0 ? 'text-green-600' : 'text-saffron-600'}`}>
                      {ticket.price === 0 ? 'Free' : `₹${ticket.price}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            {selectedTicket && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <h2 className="font-bold text-gray-900 mb-3">Quantity</h2>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{selectedTicket.name}</p>
                    <p className="text-xs text-gray-400">Max 10 per booking</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-xl font-bold text-gray-900 w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(q => Math.min(10, q + 1, selectedTicket.available))}
                      disabled={quantity >= Math.min(10, selectedTicket.available)}
                      className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Price Summary */}
            {selectedTicket && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{selectedTicket.name} × {quantity}</span>
                  <span>₹{selectedTicket.price} × {quantity}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Platform fee</span>
                  <span>₹{isFree ? 0 : Math.round(totalAmount * 0.03)}</span>
                </div>
                <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-gray-900">
                  <span>Total</span>
                  <span className={isFree ? 'text-green-600' : 'text-saffron-600'}>
                    {isFree ? 'Free' : `₹${totalAmount + (isFree ? 0 : Math.round(totalAmount * 0.03))}`}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={() => setStep(1)}
              disabled={!selectedTicket}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 1: Contact Details */}
        {step === 1 && (
          <div className="animate-fadeIn space-y-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-4">Your Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Phone Number *</label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600 font-medium">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="input-field flex-1"
                      maxLength={10}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1">Email <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-saffron-50 border border-saffron-100 rounded-2xl p-4">
              <h3 className="font-semibold text-saffron-800 text-sm mb-2">Order Summary</h3>
              <div className="flex justify-between text-sm text-saffron-700">
                <span>{selectedTicket?.name} × {quantity}</span>
                <span className="font-bold">{isFree ? 'Free' : `₹${totalAmount}`}</span>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!name || !phone}
              className="btn-primary w-full disabled:opacity-50"
            >
              Continue to Payment <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 2: Payment */}
        {step === 2 && (
          <div className="animate-fadeIn space-y-4">
            {isFree ? (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center">
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="font-bold text-gray-900 text-lg mb-1">This event is Free!</h2>
                <p className="text-gray-500 text-sm">Confirm your booking with one tap</p>
                <div className="mt-4 bg-green-50 border border-green-100 rounded-xl p-3">
                  <p className="text-green-700 font-semibold text-sm">Total: ₹0 (Free)</p>
                </div>
              </div>
            ) : (
              <>
                {/* Payment Method */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-50">
                    <h2 className="font-bold text-gray-900">Payment Method</h2>
                  </div>
                  <div className="divide-y divide-gray-50">
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`w-full flex items-center gap-3 p-4 text-left ${paymentMethod === 'upi' ? 'bg-green-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${paymentMethod === 'upi' ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}>
                        {paymentMethod === 'upi' && <div className="w-full h-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">UPI Payment</p>
                        <p className="text-xs text-gray-500">GPay, PhonePe, Paytm, BHIM</p>
                      </div>
                      <span className="ml-auto text-2xl">💳</span>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`w-full flex items-center gap-3 p-4 text-left ${paymentMethod === 'card' ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}>
                        {paymentMethod === 'card' && <div className="w-full h-full flex items-center justify-center"><div className="w-2 h-2 bg-white rounded-full" /></div>}
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">Credit / Debit Card</p>
                        <p className="text-xs text-gray-500">Visa, Mastercard, RuPay</p>
                      </div>
                      <span className="ml-auto text-2xl">🏦</span>
                    </button>
                  </div>
                </div>

                {/* UPI Input */}
                {paymentMethod === 'upi' && (
                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <div className="text-center mb-4">
                      <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto flex items-center justify-center mb-2 border border-gray-200">
                        <QRCodeSVG
                          value={`upi://pay?pa=eventfinder@ybl&pn=EventFinder+India&am=${totalAmount}&tn=${encodeURIComponent(event.title)}`}
                          size={120}
                        />
                      </div>
                      <p className="text-xs text-gray-500">Scan with any UPI app</p>
                    </div>
                    <div className="relative">
                      <span className="absolute left-0 inset-y-0 flex items-center pl-3 text-sm font-medium text-gray-500">UPI ID:</span>
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="input-field pl-16"
                      />
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="bg-saffron-50 border border-saffron-100 rounded-2xl p-4">
                  <div className="flex justify-between font-bold text-saffron-800">
                    <span>Amount to Pay</span>
                    <span>₹{totalAmount + Math.round(totalAmount * 0.03)}</span>
                  </div>
                  <p className="text-saffron-600 text-xs mt-1">Includes ₹{Math.round(totalAmount * 0.03)} platform fee</p>
                </div>
              </>
            )}

            {/* Processing state */}
            {paymentStep === 'processing' && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center animate-fadeIn">
                <div className="w-16 h-16 border-4 border-saffron-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="font-bold text-gray-900">{t('booking.processing')}</p>
                <p className="text-gray-500 text-sm mt-1">Please wait... ({countdown}s)</p>
              </div>
            )}

            {paymentStep === 'enter' && (
              <button
                onClick={handlePayment}
                className="btn-primary w-full"
              >
                {isFree ? '🎟️ Get Free Ticket' : `Pay ₹${totalAmount + Math.round(totalAmount * 0.03)}`}
              </button>
            )}
          </div>
        )}

        {/* Step 3: Confirmed */}
        {step === 3 && (
          <div className="animate-fadeIn space-y-4">
            {/* Success Banner */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl p-6 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={48} className="text-white" strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-black mb-1">{t('booking.success')}</h2>
              <p className="text-green-100 text-sm">Your tickets are ready</p>
            </div>

            {/* Ticket Card */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-saffron-500 to-orange-500 p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Ticket size={18} />
                  <span className="font-semibold text-sm">EventFinder India</span>
                </div>
                <h3 className="font-black text-lg leading-tight">{event.title}</h3>
              </div>

              {/* Ticket Details */}
              <div className="p-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-400 text-xs">Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(event.date)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Time</p>
                  <p className="font-semibold text-gray-900">{event.time}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Venue</p>
                  <p className="font-semibold text-gray-900 text-xs">{event.venue}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Tickets</p>
                  <p className="font-semibold text-gray-900">{quantity}× {selectedTicket?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Name</p>
                  <p className="font-semibold text-gray-900">{name}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Amount Paid</p>
                  <p className={`font-semibold ${isFree ? 'text-green-600' : 'text-saffron-600'}`}>
                    {isFree ? 'Free' : `₹${totalAmount}`}
                  </p>
                </div>
              </div>

              {/* Dashed separator */}
              <div className="mx-4 border-t border-dashed border-gray-200 relative">
                <div className="absolute -left-7 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border border-gray-100" />
                <div className="absolute -right-7 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-50 rounded-full border border-gray-100" />
              </div>

              {/* QR Code */}
              <div className="p-6 flex flex-col items-center gap-3">
                <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                  <QRCodeSVG value={qrValue} size={150} />
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl">
                    <span className="font-mono font-bold text-gray-900">{bookingId}</span>
                    <button
                      onClick={() => { navigator.clipboard.writeText(bookingId); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                      className="text-saffron-500 hover:text-saffron-600"
                    >
                      {copied ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Show this QR at venue entry</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Link to="/tickets" className="flex-1 btn-secondary flex items-center justify-center gap-2 text-sm">
                <Ticket size={16} /> My Tickets
              </Link>
              <Link to="/" className="flex-1 btn-primary flex items-center justify-center gap-2 text-sm">
                Explore More
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
