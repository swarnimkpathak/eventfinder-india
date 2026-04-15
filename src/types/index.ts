export type EventCategory = 'music' | 'food' | 'tech' | 'sports' | 'arts' | 'comedy' | 'dance' | 'wellness' | 'cultural';
export type City = 'bangalore' | 'chennai';
export type Language = 'en' | 'hi' | 'ta' | 'kn';

export interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  date: string;
  time: string;
  endTime?: string;
  venue: string;
  address: string;
  city: City;
  zone: string;
  price: number;
  image: string;
  tags: string[];
  capacity: number;
  booked: number;
  organizer: string;
  isFeatured?: boolean;
  isGroupFriendly?: boolean;
  ticketTypes: TicketType[];
}

export interface Booking {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventCity: string;
  eventImage: string;
  ticketTypeName: string;
  quantity: number;
  totalAmount: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  qrData: string;
  bookedAt: string;
  attendeeName: string;
  attendeePhone: string;
  isGroup?: boolean;
  groupSize?: number;
}

export interface UserPreferences {
  interests: EventCategory[];
  city: City;
  zones: string[];
  language: Language;
  hasOnboarded: boolean;
  name: string;
  phone: string;
}

export interface GroupMember {
  id: string;
  name: string;
  phone: string;
  status: 'invited' | 'accepted' | 'declined' | 'pending';
  availability?: string[];
}

export interface AvailabilityPoll {
  dates: string[];
  votes: Record<string, string[]>;
}

export interface Campaign {
  id: string;
  name: string;
  targetCity: string;
  targetInterests: EventCategory[];
  targetAgeGroup: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  status: 'active' | 'paused' | 'completed' | 'draft';
  startDate: string;
  endDate: string;
}

export interface AppState {
  user: UserPreferences;
  bookings: Booking[];
  group: {
    members: GroupMember[];
    selectedEventId?: string;
    poll?: AvailabilityPoll;
  };
}

export type AppAction =
  | { type: 'SET_USER_PREFERENCES'; payload: Partial<UserPreferences> }
  | { type: 'COMPLETE_ONBOARDING'; payload: UserPreferences }
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'CANCEL_BOOKING'; payload: string }
  | { type: 'ADD_GROUP_MEMBER'; payload: GroupMember }
  | { type: 'REMOVE_GROUP_MEMBER'; payload: string }
  | { type: 'SET_GROUP_EVENT'; payload: string }
  | { type: 'UPDATE_MEMBER_STATUS'; payload: { memberId: string; status: GroupMember['status'] } }
  | { type: 'VOTE_POLL'; payload: { date: string; memberId: string } }
  | { type: 'INIT_POLL'; payload: AvailabilityPoll };
