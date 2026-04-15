import { useEffect } from 'react';
import { createBrowserRouter, RouterProvider, Outlet, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Onboarding from './pages/Onboarding';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import BookingFlow from './pages/BookingFlow';
import MyTickets from './pages/MyTickets';
import GroupCoordination from './pages/GroupCoordination';
import MarketerPortal from './pages/MarketerPortal';
import { AppProvider, useApp } from './context/AppContext';

function ProtectedLayout() {
  const { state } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state.user.hasOnboarded) {
      navigate('/onboarding', { replace: true });
    }
  }, [state.user.hasOnboarded, navigate]);

  if (!state.user.hasOnboarded) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Outlet />
    </div>
  );
}

function OnboardingGuard() {
  const { state } = useApp();
  if (state.user.hasOnboarded) {
    return <Navigate to="/" replace />;
  }
  return <Onboarding />;
}

const router = createBrowserRouter([
  {
    path: '/onboarding',
    element: (
      <AppProvider>
        <OnboardingGuard />
      </AppProvider>
    ),
  },
  {
    path: '/',
    element: (
      <AppProvider>
        <ProtectedLayout />
      </AppProvider>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: 'event/:id', element: <EventDetail /> },
      { path: 'booking/:id', element: <BookingFlow /> },
      { path: 'tickets', element: <MyTickets /> },
      { path: 'group', element: <GroupCoordination /> },
      { path: 'group/:eventId', element: <GroupCoordination /> },
      { path: 'marketer', element: <MarketerPortal /> },
    ],
  },
  {
    path: '*',
    element: (
      <AppProvider>
        <Navigate to="/" replace />
      </AppProvider>
    ),
  },
], { basename: '/eventfinder-india' });

export default function App() {
  return <RouterProvider router={router} />;
}
