import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, AppAction, UserPreferences, Language, City, EventCategory } from '../types';

const defaultUser: UserPreferences = {
  interests: [],
  city: 'bangalore',
  zones: [],
  language: 'en',
  hasOnboarded: false,
  name: '',
  phone: '',
};

const initialState: AppState = {
  user: defaultUser,
  bookings: [],
  group: { members: [] },
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER_PREFERENCES':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'COMPLETE_ONBOARDING':
      return { ...state, user: { ...action.payload, hasOnboarded: true } };
    case 'ADD_BOOKING':
      return { ...state, bookings: [action.payload, ...state.bookings] };
    case 'CANCEL_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b =>
          b.id === action.payload ? { ...b, status: 'cancelled' as const } : b
        ),
      };
    case 'ADD_GROUP_MEMBER':
      return {
        ...state,
        group: { ...state.group, members: [...state.group.members, action.payload] },
      };
    case 'REMOVE_GROUP_MEMBER':
      return {
        ...state,
        group: { ...state.group, members: state.group.members.filter(m => m.id !== action.payload) },
      };
    case 'SET_GROUP_EVENT':
      return { ...state, group: { ...state.group, selectedEventId: action.payload } };
    case 'UPDATE_MEMBER_STATUS':
      return {
        ...state,
        group: {
          ...state.group,
          members: state.group.members.map(m =>
            m.id === action.payload.memberId ? { ...m, status: action.payload.status } : m
          ),
        },
      };
    case 'INIT_POLL':
      return { ...state, group: { ...state.group, poll: action.payload } };
    case 'VOTE_POLL':
      if (!state.group.poll) return state;
      const updatedVotes = { ...state.group.poll.votes };
      if (!updatedVotes[action.payload.date]) updatedVotes[action.payload.date] = [];
      if (!updatedVotes[action.payload.date].includes(action.payload.memberId)) {
        updatedVotes[action.payload.date] = [...updatedVotes[action.payload.date], action.payload.memberId];
      }
      return {
        ...state,
        group: { ...state.group, poll: { ...state.group.poll, votes: updatedVotes } },
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  t: (key: string) => string;
  language: Language;
  city: City;
  setCity: (city: City) => void;
  setLanguage: (lang: Language) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const STORAGE_KEY = 'eventfinder_state';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (initial) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...initial, ...parsed };
      }
    } catch {}
    return initial;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const language: Language = state.user.language || 'en';
  const city: City = state.user.city || 'bangalore';

  function setCity(c: City) {
    dispatch({ type: 'SET_USER_PREFERENCES', payload: { city: c } });
  }

  function setLanguage(lang: Language) {
    dispatch({ type: 'SET_USER_PREFERENCES', payload: { language: lang } });
  }

  // Simple translation function using the translations map
  const translationMap: Record<Language, Record<string, string>> = {
    en: {
      'nav.discover': 'Discover', 'nav.tickets': 'My Tickets', 'nav.group': 'Group', 'nav.marketer': 'Marketer',
      'home.title': 'Discover Events Near You', 'home.search': 'Search events, venues, artists...',
      'home.filters': 'Filters', 'home.featured': 'Featured Events', 'home.allEvents': 'All Events',
      'home.noEvents': 'No events found. Try adjusting your filters.', 'home.today': 'Today',
      'home.weekend': 'Weekend', 'home.thisWeek': 'This Week', 'home.free': 'Free',
      'event.bookNow': 'Book Now', 'event.groupBook': 'Group Booking', 'event.available': 'seats left',
      'event.soldOut': 'Sold Out', 'event.limited': 'Limited seats!', 'event.share': 'Share on WhatsApp',
      'booking.selectTickets': 'Select Tickets', 'booking.payment': 'Payment', 'booking.confirmation': 'Confirmation',
      'booking.payWithUPI': 'Pay with UPI', 'booking.scanQR': 'Scan QR code or enter UPI ID',
      'booking.processing': 'Processing payment...', 'booking.success': 'Booking Confirmed!',
      'booking.viewTicket': 'View Ticket', 'onboarding.welcome': 'Welcome to EventFinder India',
      'onboarding.interests': 'What are your interests?', 'onboarding.interestsSubtitle': "Select all that apply — we'll personalize your feed",
      'onboarding.city': 'Where are you located?', 'onboarding.citySubtitle': 'Choose your city and preferred zones',
      'onboarding.language': 'Choose your language', 'onboarding.languageSubtitle': "We'll show the app in your preferred language",
      'onboarding.next': 'Next', 'onboarding.done': 'Start Exploring',
      'common.back': 'Back', 'common.next': 'Next', 'common.done': 'Done', 'common.cancel': 'Cancel',
      'common.confirm': 'Confirm', 'common.loading': 'Loading...', 'common.error': 'Something went wrong',
      'tickets.upcoming': 'Upcoming', 'tickets.past': 'Past', 'tickets.noTickets': 'No tickets yet. Book an event to get started!',
      'tickets.viewQR': 'View QR Code', 'group.title': 'Group Booking', 'group.addMember': 'Add Member',
      'group.poll': 'Availability Poll', 'group.bookGroup': 'Book for Group',
      'marketer.title': 'Marketer Portal', 'marketer.campaigns': 'Campaigns',
      'marketer.createCampaign': 'Create Campaign', 'marketer.analytics': 'Analytics',
    },
    hi: {
      'nav.discover': 'खोजें', 'nav.tickets': 'मेरे टिकट', 'nav.group': 'ग्रुप', 'nav.marketer': 'मार्केटर',
      'home.title': 'आपके पास के इवेंट खोजें', 'home.search': 'इवेंट, वेन्यू खोजें...',
      'home.filters': 'फ़िल्टर', 'home.featured': 'फ़ीचर्ड इवेंट', 'home.allEvents': 'सभी इवेंट',
      'home.noEvents': 'कोई इवेंट नहीं मिला।', 'home.today': 'आज', 'home.weekend': 'वीकेंड',
      'home.thisWeek': 'इस हफ़्ते', 'home.free': 'मुफ़्त', 'event.bookNow': 'अभी बुक करें',
      'event.groupBook': 'ग्रुप बुकिंग', 'event.available': 'सीटें बाकी', 'event.soldOut': 'बिक गया',
      'event.limited': 'सीमित सीटें!', 'event.share': 'WhatsApp पर शेयर करें',
      'booking.selectTickets': 'टिकट चुनें', 'booking.payment': 'भुगतान', 'booking.confirmation': 'पुष्टि',
      'booking.payWithUPI': 'UPI से भुगतान करें', 'booking.scanQR': 'QR कोड स्कैन करें',
      'booking.processing': 'भुगतान प्रक्रिया जारी है...', 'booking.success': 'बुकिंग की पुष्टि हो गई!',
      'booking.viewTicket': 'टिकट देखें', 'onboarding.welcome': 'EventFinder India में आपका स्वागत है',
      'onboarding.interests': 'आपकी रुचि क्या है?', 'onboarding.interestsSubtitle': 'सभी लागू चुनें',
      'onboarding.city': 'आप कहाँ हैं?', 'onboarding.citySubtitle': 'अपना शहर और पसंदीदा ज़ोन चुनें',
      'onboarding.language': 'भाषा चुनें', 'onboarding.languageSubtitle': 'हम ऐप आपकी पसंदीदा भाषा में दिखाएंगे',
      'onboarding.next': 'अगला', 'onboarding.done': 'शुरू करें', 'common.back': 'वापस',
      'common.next': 'अगला', 'common.done': 'हो गया', 'common.cancel': 'रद्द करें',
      'common.confirm': 'पुष्टि करें', 'common.loading': 'लोड हो रहा है...', 'common.error': 'कुछ गलत हो गया',
      'tickets.upcoming': 'आगामी', 'tickets.past': 'पिछले', 'tickets.noTickets': 'अभी कोई टिकट नहीं है।',
      'tickets.viewQR': 'QR कोड देखें', 'group.title': 'ग्रुप बुकिंग', 'group.addMember': 'सदस्य जोड़ें',
      'group.poll': 'उपलब्धता पोल', 'group.bookGroup': 'ग्रुप के लिए बुक करें',
      'marketer.title': 'मार्केटर पोर्टल', 'marketer.campaigns': 'अभियान',
      'marketer.createCampaign': 'अभियान बनाएं', 'marketer.analytics': 'एनालिटिक्स',
    },
    ta: {
      'nav.discover': 'கண்டுபிடி', 'nav.tickets': 'என் டிக்கெட்', 'nav.group': 'குழு', 'nav.marketer': 'மார்கெட்டர்',
      'home.title': 'உங்கள் அருகில் நிகழ்வுகளை கண்டுபிடியுங்கள்', 'home.search': 'நிகழ்வுகள் தேடுங்கள்...',
      'home.filters': 'வடிகட்டிகள்', 'home.featured': 'சிறப்பு நிகழ்வுகள்', 'home.allEvents': 'அனைத்து நிகழ்வுகள்',
      'home.noEvents': 'நிகழ்வுகள் எதுவும் இல்லை.', 'home.today': 'இன்று', 'home.weekend': 'வார இறுதி',
      'home.thisWeek': 'இந்த வாரம்', 'home.free': 'இலவசம்', 'event.bookNow': 'இப்போது பதிவு செய்',
      'event.groupBook': 'குழு பதிவு', 'event.available': 'இருக்கைகள் உள்ளன', 'event.soldOut': 'விற்றது',
      'event.limited': 'குறைந்த இருக்கைகள்!', 'event.share': 'WhatsApp-ல் பகிர்',
      'booking.selectTickets': 'டிக்கெட் தேர்வு', 'booking.payment': 'கட்டணம்', 'booking.confirmation': 'உறுதிப்படுத்தல்',
      'booking.payWithUPI': 'UPI மூலம் கட்டணம்', 'booking.scanQR': 'QR குறியீட்டை ஸ்கேன் செய்யவும்',
      'booking.processing': 'கட்டணம் செயலாக்கப்படுகிறது...', 'booking.success': 'பதிவு உறுதிப்படுத்தப்பட்டது!',
      'booking.viewTicket': 'டிக்கெட் பார்', 'onboarding.welcome': 'EventFinder India-க்கு வரவேற்கிறோம்',
      'onboarding.interests': 'உங்கள் ஆர்வங்கள் என்ன?', 'onboarding.interestsSubtitle': 'பொருந்தும் அனைத்தையும் தேர்வு செய்யுங்கள்',
      'onboarding.city': 'நீங்கள் எங்கு இருக்கிறீர்கள்?', 'onboarding.citySubtitle': 'உங்கள் நகரம் மற்றும் மண்டலங்களை தேர்வு செய்யுங்கள்',
      'onboarding.language': 'மொழியை தேர்வு செய்யுங்கள்', 'onboarding.languageSubtitle': 'உங்கள் விருப்பமான மொழியில் ஆப்பை காட்டுவோம்',
      'onboarding.next': 'அடுத்து', 'onboarding.done': 'ஆராய தொடங்கு', 'common.back': 'திரும்பு',
      'common.next': 'அடுத்து', 'common.done': 'முடிந்தது', 'common.cancel': 'ரத்து செய்',
      'common.confirm': 'உறுதிப்படுத்து', 'common.loading': 'ஏற்றுகிறது...', 'common.error': 'ஏதோ தவறு நடந்தது',
      'tickets.upcoming': 'வரவிருக்கும்', 'tickets.past': 'கடந்த', 'tickets.noTickets': 'இன்னும் டிக்கெட் இல்லை.',
      'tickets.viewQR': 'QR குறியீட்டை பார்', 'group.title': 'குழு பதிவு', 'group.addMember': 'உறுப்பினர் சேர்',
      'group.poll': 'கிடைக்கும் நேர கணக்கெடுப்பு', 'group.bookGroup': 'குழுவிற்காக பதிவு செய்',
      'marketer.title': 'மார்கெட்டர் போர்டல்', 'marketer.campaigns': 'பிரச்சாரங்கள்',
      'marketer.createCampaign': 'பிரச்சாரம் உருவாக்கு', 'marketer.analytics': 'பகுப்பாய்வு',
    },
    kn: {
      'nav.discover': 'ಅನ್ವೇಷಿಸಿ', 'nav.tickets': 'ನನ್ನ ಟಿಕೆಟ್', 'nav.group': 'ಗ್ರೂಪ್', 'nav.marketer': 'ಮಾರ್ಕೆಟರ್',
      'home.title': 'ನಿಮ್ಮ ಸಮೀಪ ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಕಂಡುಹಿಡಿಯಿರಿ', 'home.search': 'ಕಾರ್ಯಕ್ರಮಗಳನ್ನು ಹುಡುಕಿ...',
      'home.filters': 'ಫಿಲ್ಟರ್', 'home.featured': 'ವೈಶಿಷ್ಟ್ಯ ಕಾರ್ಯಕ್ರಮಗಳು', 'home.allEvents': 'ಎಲ್ಲಾ ಕಾರ್ಯಕ್ರಮಗಳು',
      'home.noEvents': 'ಯಾವುದೇ ಕಾರ್ಯಕ್ರಮಗಳು ಕಂಡುಬಂದಿಲ್ಲ.', 'home.today': 'ಇಂದು', 'home.weekend': 'ವಾರಾಂತ್ಯ',
      'home.thisWeek': 'ಈ ವಾರ', 'home.free': 'ಉಚಿತ', 'event.bookNow': 'ಈಗ ಬುಕ್ ಮಾಡಿ',
      'event.groupBook': 'ಗ್ರೂಪ್ ಬುಕಿಂಗ್', 'event.available': 'ಸ್ಥಾನಗಳು ಉಳಿದಿವೆ', 'event.soldOut': 'ಮಾರಾಟವಾಗಿದೆ',
      'event.limited': 'ಸೀಮಿತ ಸ್ಥಾನಗಳು!', 'event.share': 'WhatsApp ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ',
      'booking.selectTickets': 'ಟಿಕೆಟ್ ಆಯ್ಕೆ', 'booking.payment': 'ಪಾವತಿ', 'booking.confirmation': 'ದೃಢೀಕರಣ',
      'booking.payWithUPI': 'UPI ಮೂಲಕ ಪಾವತಿ', 'booking.scanQR': 'QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',
      'booking.processing': 'ಪಾವತಿ ಸಂಸ್ಕರಿಸಲಾಗುತ್ತಿದೆ...', 'booking.success': 'ಬುಕಿಂಗ್ ದೃಢಪಡಿಸಲಾಗಿದೆ!',
      'booking.viewTicket': 'ಟಿಕೆಟ್ ನೋಡಿ', 'onboarding.welcome': 'EventFinder India ಗೆ ಸ್ವಾಗತ',
      'onboarding.interests': 'ನಿಮ್ಮ ಆಸಕ್ತಿಗಳೇನು?', 'onboarding.interestsSubtitle': 'ಅನ್ವಯಿಸುವ ಎಲ್ಲವನ್ನೂ ಆಯ್ಕೆ ಮಾಡಿ',
      'onboarding.city': 'ನೀವು ಎಲ್ಲಿ ಇದ್ದೀರಿ?', 'onboarding.citySubtitle': 'ನಿಮ್ಮ ನಗರ ಮತ್ತು ಝೋನ್‌ಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ',
      'onboarding.language': 'ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ', 'onboarding.languageSubtitle': 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯಲ್ಲಿ ಆ್ಯಪ್ ತೋರಿಸುತ್ತೇವೆ',
      'onboarding.next': 'ಮುಂದೆ', 'onboarding.done': 'ಅನ್ವೇಷಣೆ ಪ್ರಾರಂಭಿಸಿ', 'common.back': 'ಹಿಂದೆ',
      'common.next': 'ಮುಂದೆ', 'common.done': 'ಮುಗಿಯಿತು', 'common.cancel': 'ರದ್ದುಮಾಡಿ',
      'common.confirm': 'ದೃಢಪಡಿಸಿ', 'common.loading': 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...', 'common.error': 'ಏನೋ ತಪ್ಪಾಯಿತು',
      'tickets.upcoming': 'ಮುಂಬರುವ', 'tickets.past': 'ಹಿಂದಿನ', 'tickets.noTickets': 'ಇನ್ನೂ ಟಿಕೆಟ್ ಇಲ್ಲ.',
      'tickets.viewQR': 'QR ಕೋಡ್ ನೋಡಿ', 'group.title': 'ಗ್ರೂಪ್ ಬುಕಿಂಗ್', 'group.addMember': 'ಸದಸ್ಯರನ್ನು ಸೇರಿಸಿ',
      'group.poll': 'ಲಭ್ಯತೆ ಸಮೀಕ್ಷೆ', 'group.bookGroup': 'ಗ್ರೂಪ್‌ಗಾಗಿ ಬುಕ್ ಮಾಡಿ',
      'marketer.title': 'ಮಾರ್ಕೆಟರ್ ಪೋರ್ಟಲ್', 'marketer.campaigns': 'ಅಭಿಯಾನಗಳು',
      'marketer.createCampaign': 'ಅಭಿಯಾನ ರಚಿಸಿ', 'marketer.analytics': 'ವಿಶ್ಲೇಷಣೆ',
    },
  };

  function translate(key: string): string {
    return translationMap[language]?.[key] ?? translationMap.en[key] ?? key;
  }

  return (
    <AppContext.Provider value={{ state, dispatch, t: translate, language, city, setCity, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function useInterestCategories(): EventCategory[] {
  return ['music', 'food', 'tech', 'sports', 'arts', 'comedy', 'dance', 'wellness', 'cultural'];
}
