import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Users, Plus, X, Check, ArrowLeft, MessageCircle, Calendar, ChevronRight, Ticket } from 'lucide-react';
import { getEventById } from '../data/mockData';
import { useApp } from '../context/AppContext';
import type { GroupMember } from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
}

// Generate poll dates from today
function getPollDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

const STATUS_COLORS: Record<GroupMember['status'], string> = {
  invited: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  pending: 'bg-gray-100 text-gray-600',
};

const STATUS_ICONS: Record<GroupMember['status'], string> = {
  invited: '📨',
  accepted: '✅',
  declined: '❌',
  pending: '⏳',
};

export default function GroupCoordination() {
  const { eventId } = useParams<{ eventId?: string }>();
  const { state, dispatch, t } = useApp();
  const event = eventId ? getEventById(eventId) : undefined;

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [tab, setTab] = useState<'members' | 'poll' | 'book'>('members');
  const [showAddForm, setShowAddForm] = useState(false);
  const [pollDates] = useState(getPollDates());
  const [myVotes, setMyVotes] = useState<string[]>([]);
  const [pollInitialized, setPollInitialized] = useState(false);

  const members = state.group.members;
  const acceptedCount = members.filter(m => m.status === 'accepted').length;

  function addMember() {
    if (!newName.trim()) return;
    const member: GroupMember = {
      id: generateId(),
      name: newName.trim(),
      phone: newPhone.trim(),
      status: 'invited',
    };
    dispatch({ type: 'ADD_GROUP_MEMBER', payload: member });
    setNewName('');
    setNewPhone('');
    setShowAddForm(false);
  }

  function simulateResponse(memberId: string) {
    const statuses: GroupMember['status'][] = ['accepted', 'accepted', 'accepted', 'declined'];
    const random = statuses[Math.floor(Math.random() * statuses.length)];
    dispatch({ type: 'UPDATE_MEMBER_STATUS', payload: { memberId, status: random } });
  }

  function initPoll() {
    const poll = {
      dates: pollDates,
      votes: Object.fromEntries(pollDates.map(d => [d, []])),
    };
    dispatch({ type: 'INIT_POLL', payload: poll });
    setPollInitialized(true);
  }

  function toggleVote(date: string) {
    setMyVotes(prev =>
      prev.includes(date) ? prev.filter(d => d !== date) : [...prev, date]
    );
  }

  const shareInvite = (member: GroupMember) => {
    const eventName = event?.title || 'an event';
    const text = `Hey ${member.name}! Joining ${eventName}? Let me know on EventFinder India! 🎉`;
    window.open(`https://wa.me/${member.phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const bestDate = state.group.poll
    ? Object.entries(state.group.poll.votes).sort(([, a], [, b]) => b.length - a.length)[0]
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3 mb-4">
            <Link to={event ? `/event/${event.id}` : '/'} className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100">
              <ArrowLeft size={20} />
            </Link>
            <div className="flex-1">
              <h1 className="font-black text-gray-900 text-xl">{t('group.title')}</h1>
              {event && <p className="text-gray-500 text-sm truncate">{event.title}</p>}
            </div>
            <div className="flex items-center gap-1 bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full text-sm font-semibold">
              <Users size={14} />
              {members.length}
            </div>
          </div>

          {/* Event Card if selected */}
          {event && (
            <div className="bg-saffron-50 border border-saffron-100 rounded-2xl p-3 flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-saffron-800 text-sm line-clamp-1">{event.title}</p>
                <p className="text-saffron-600 text-xs">{formatDate(event.date)} • {event.venue}</p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
            {(['members', 'poll', 'book'] as const).map(t2 => (
              <button
                key={t2}
                onClick={() => setTab(t2)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all capitalize ${
                  tab === t2 ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t2 === 'members' ? '👥 Members' : t2 === 'poll' ? '📅 Poll' : '🎟️ Book'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Members Tab */}
        {tab === 'members' && (
          <div className="space-y-4 animate-fadeIn">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white rounded-2xl p-3 border border-gray-100 text-center">
                <p className="text-2xl font-black text-gray-900">{members.length}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-gray-100 text-center">
                <p className="text-2xl font-black text-green-600">{acceptedCount}</p>
                <p className="text-xs text-gray-400">Accepted</p>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-gray-100 text-center">
                <p className="text-2xl font-black text-yellow-500">{members.filter(m => m.status === 'invited').length}</p>
                <p className="text-xs text-gray-400">Pending</p>
              </div>
            </div>

            {/* Add Member Form */}
            {showAddForm ? (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 animate-fadeIn">
                <h3 className="font-bold text-gray-900 mb-3">Add Member</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Friend's name"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="input-field"
                    onKeyDown={e => e.key === 'Enter' && addMember()}
                  />
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-600">+91</div>
                    <input
                      type="tel"
                      placeholder="Phone (optional)"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      className="input-field flex-1"
                      maxLength={10}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowAddForm(false)} className="btn-secondary flex-1">Cancel</button>
                    <button onClick={addMember} disabled={!newName.trim()} className="btn-primary flex-1 disabled:opacity-50">
                      Add
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-saffron-300 text-saffron-600 hover:bg-saffron-50 transition-colors font-semibold text-sm"
              >
                <Plus size={18} /> {t('group.addMember')}
              </button>
            )}

            {/* Members List */}
            {members.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">👥</div>
                <p className="font-bold text-gray-700 mb-1">No members yet</p>
                <p className="text-gray-400 text-sm">Add friends to coordinate group booking</p>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(member => (
                  <div key={member.id} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{member.name}</p>
                      {member.phone && <p className="text-gray-400 text-xs">+91 {member.phone}</p>}
                      <span className={`badge mt-0.5 text-xs ${STATUS_COLORS[member.status]}`}>
                        {STATUS_ICONS[member.status]} {member.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {member.status === 'invited' && (
                        <button
                          onClick={() => simulateResponse(member.id)}
                          className="p-1.5 rounded-lg text-xs bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                          title="Simulate response"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      {member.phone && (
                        <button
                          onClick={() => shareInvite(member)}
                          className="p-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
                          title="Send WhatsApp invite"
                        >
                          <MessageCircle size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => dispatch({ type: 'REMOVE_GROUP_MEMBER', payload: member.id })}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Poll Tab */}
        {tab === 'poll' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-1">{t('group.poll')}</h2>
              <p className="text-gray-500 text-sm">Check which dates work for everyone</p>
            </div>

            {!pollInitialized ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3">📅</div>
                <p className="font-bold text-gray-700 mb-2">Start an Availability Poll</p>
                <p className="text-gray-400 text-sm mb-5">Ask your group which dates work for them</p>
                <button onClick={initPoll} className="btn-primary">
                  Create Poll
                </button>
              </div>
            ) : (
              <>
                {/* My availability */}
                <div className="bg-white rounded-2xl p-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-700 text-sm mb-3">Mark your availability</h3>
                  <div className="space-y-2">
                    {pollDates.map(date => {
                      const d = new Date(date);
                      const votes = state.group.poll?.votes[date] || [];
                      const isSelected = myVotes.includes(date);
                      return (
                        <button
                          key={date}
                          onClick={() => toggleVote(date)}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                            isSelected ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Calendar size={16} className={isSelected ? 'text-green-500' : 'text-gray-400'} />
                            <div className="text-left">
                              <p className={`font-semibold text-sm ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                                {d.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex -space-x-1">
                              {votes.slice(0, 3).map((_, i) => (
                                <div key={i} className="w-5 h-5 bg-indigo-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs" />
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">{votes.length + (isSelected ? 1 : 0)} available</span>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? 'border-green-500 bg-green-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <Check size={10} className="text-white" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {bestDate && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-4 text-white">
                    <p className="text-xs text-green-100 font-medium mb-1">🏆 Best date for your group</p>
                    <p className="font-bold text-lg">
                      {new Date(bestDate[0]).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-green-100 text-sm">{bestDate[1].length} members available</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Book Tab */}
        {tab === 'book' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <h2 className="font-bold text-gray-900 mb-1">Group Booking Summary</h2>
              <p className="text-gray-500 text-sm">Book tickets for everyone in one go</p>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 text-sm">Group size</span>
                <span className="font-bold text-gray-900">{Math.max(1, acceptedCount + 1)} people</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 text-sm">Accepted members</span>
                <span className="font-semibold text-green-600">{acceptedCount} ✅</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-gray-600 text-sm">Pending response</span>
                <span className="font-semibold text-yellow-500">{members.filter(m => m.status === 'invited').length} ⏳</span>
              </div>
              {event && (
                <div className="border-t border-gray-100 pt-3 mt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">Min. ticket price</span>
                    <span className="font-bold text-saffron-600">₹{event.price}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-600 text-sm">Estimated total</span>
                    <span className="font-bold text-gray-900 text-lg">
                      ₹{event.price * Math.max(1, acceptedCount + 1)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {acceptedCount === 0 && members.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 text-sm text-amber-700">
                💡 Waiting for members to accept. Simulate responses in the Members tab!
              </div>
            )}

            {event ? (
              <Link
                to={`/booking/${event.id}`}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Ticket size={18} />
                Proceed to Group Booking ({Math.max(1, acceptedCount + 1)} tickets)
                <ChevronRight size={18} />
              </Link>
            ) : (
              <Link to="/" className="btn-secondary w-full flex items-center justify-center gap-2">
                Browse Events to Book
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
