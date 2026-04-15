# EventFinder India - Local Event Discovery & Booking Platform

A fully functional React application built from the EventFinder India PRD.

## Features Implemented

- **Onboarding Flow** — 3-step interest selection, city/zone preferences, language choice
- **Discovery Feed** — Personalized event cards, featured section, search + advanced filters
- **Event Detail** — Full event info, ticket types, capacity bar, WhatsApp share
- **Booking Flow** — 4-step: ticket selection → contact → UPI payment (mock) → QR ticket
- **My Tickets** — Upcoming/Past tabs, QR code display, cancel booking
- **Group Coordination** — Add members, WhatsApp invites, availability poll, group booking
- **Marketer Portal** — Analytics dashboard, campaign management, create campaigns with targeting
- **Multilingual** — English, Hindi, Tamil, Kannada
- **20 Events** — 10 in Bangalore, 10 in Chennai across all categories
- **State Persistence** — User preferences and bookings saved to localStorage

## Setup

### Step 1: Install Node.js

Download and install Node.js (v18 or higher) from:
**https://nodejs.org/en/download**

Choose the **LTS** version for Windows.

### Step 2: Install Dependencies

Open a terminal (Command Prompt or PowerShell) in this folder:

```
cd C:\Users\PathakS\Downloads\eventfinder-india
npm install
```

### Step 3: Run the App

```
npm run dev
```

Open your browser at: **http://localhost:5173**

## Tech Stack

- **React 18** + TypeScript
- **Vite 5** (build tool)
- **Tailwind CSS 3** (styling)
- **React Router 6** (navigation)
- **qrcode.react** (QR code generation)
- **Lucide React** (icons)

## Project Structure

```
src/
├── components/       # Navbar, EventCard, FilterPanel
├── context/          # AppContext (global state + translations)
├── data/             # 20 mock events, campaign data
├── i18n/             # EN/HI/TA/KN translations
├── pages/            # Onboarding, Home, EventDetail, BookingFlow,
│                     # MyTickets, GroupCoordination, MarketerPortal
├── types/            # TypeScript interfaces
├── App.tsx           # Router setup
└── main.tsx          # Entry point
```

## User Journeys

1. **First Visit** → Onboarding (interests → city/zones → language)
2. **Discovery** → Home feed → filter by category/zone/date/price
3. **Booking** → Event Detail → Book Now → UPI payment → QR ticket
4. **Group** → Group Coordination → add friends → WhatsApp invite → poll → book
5. **Marketer** → Marketer Portal → create targeted campaigns → view analytics

## Credentials / Login

No authentication required — just complete the onboarding flow on first visit.

Marketer Portal is accessible directly from the top navigation.
