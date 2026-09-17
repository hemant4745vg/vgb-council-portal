'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Direct client initialization bypassing Vercel env variable build caching
const supabase = createClient(
  'https://lllmgmfofwczpqbmigey.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbG1nbWZvZndjenBxYm1pZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss'
);

interface CalendarEvent {
  id: number;
  title: string;
  event_date: string;
  venue: string;
  created_by?: string;
}

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('Council Member');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Events state
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newVenue, setNewVenue] = useState('');

  useEffect(() => {
    // Check initial auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) fetchUserRole(session.user.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) fetchUserRole(session.user.email);
    });

    fetchEvents();
    return () => subscription.unsubscribe();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });
    if (!error && data) setEvents(data);
  };

  const fetchUserRole = async (userEmail: string) => {
    const { data } = await supabase
      .from('allowed_users')
      .select('role')
      .eq('email', userEmail.toLowerCase())
      .single();
    if (data?.role) setUserRole(data.role);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const formattedEmail = email.trim().toLowerCase();

    // Verify school domain directly on the frontend
    if (!formattedEmail.endsWith('@vidyagyan.in')) {
      setMessage('Access Denied: Must use an official @vidyagyan.in school email.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: formattedEmail,
      options: { emailRedirectTo: 'https://vgb-student-council-portal.vercel.app' },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Magic link sent! Check your Outlook inbox.');
    }
    setLoading(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    const { error } = await supabase.from('calendar_events').insert([
      {
        title: newTitle,
        event_date: newDate,
        venue: newVenue,
        created_by: session?.user?.email,
      },
    ]);

    if (!error) {
      setNewTitle('');
      setNewDate('');
      setNewVenue('');
      fetchEvents();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header Bar */}
      <header className="bg-blue-900 text-white px-6 py-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold tracking-wide">Vidyagyan Council Portal</h1>
          <p className="text-xs text-blue-200">Honour Secretariat & Student Leadership</p>
        </div>

        {session ? (
          <div className="flex items-center space-x-4">
            <div className="text-right text-sm">
              <span className="block font-medium">{session.user.email}</span>
              <span className="inline-block bg-blue-700 text-xs text-blue-100 px-2 py-0.5 rounded-full mt-0.5">
                {userRole}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-xs px-3 py-2 rounded-md font-medium transition"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 hover:bg-blue-800 rounded-lg transition border border-blue-700 flex items-center space-x-2"
            title="Account Menu"
          >
            {/* 3-line / Menu Icon */}
            <svg className="w-6 h-6 fill-current text-white" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span className="text-sm font-medium pr-1">Sign In</span>
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-10">
        {!session ? (
          /* Public Unauthenticated View */
          <div className="space-y-10">
            {/* Hero Banner */}
            <section className="bg-gradient-to-r from-blue-900 to-indigo-800 text-white rounded-2xl p-8 shadow-lg">
              <h2 className="text-3xl font-extrabold mb-3">Welcome to Vidyagyan Student Leadership</h2>
              <p className="text-blue-100 text-base max-w-2xl leading-relaxed">
                Official repository for Student Council agendas, public announcements, and event scheduling.
              </p>
            </section>

            {/* Public Events View */}
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center space-x-2">
                <span>Upcoming Events Calendar</span>
              </h3>
              {events.length === 0 ? (
                <p className="text-slate-500 italic py-6 text-center">No upcoming events scheduled at this time.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {events.map((evt) => (
                    <div key={evt.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                      <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {evt.event_date}
                      </span>
                      <h4 className="font-bold text-slate-800 mt-2">{evt.title}</h4>
                      {evt.venue && <p className="text-xs text-slate-500 mt-1">📍 {evt.venue}</p>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* Logged In Dashboard View */
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">Council Dashboard</h2>
              <p className="text-slate-600 text-sm mt-1">
                Authorized Workspace for Event Management & Operations
              </p>
            </div>

            {/* Event Creation Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Post New Event</h3>
              <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  required
                />
                <input
                  type="text"
                  placeholder="Venue (e.g. Auditorium)"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="submit"
                  className="md:col-span-3 bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 transition text-sm"
                >
                  Publish Event
                </button>
              </form>
            </div>

            {/* Live Events Management List */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Scheduled Events ({events.length})</h3>
              <div className="divide-y divide-slate-100">
                {events.map((evt) => (
                  <div key={evt.id} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-slate-800">{evt.title}</p>
                      <p className="text-xs text-slate-500">Date: {evt.event_date} | Venue: {evt.venue || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Pop-up Sign In Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-slate-800">Council Sign In</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Authorized teachers and council members only.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">School Email</label>
                <input
                  type="email"
                  placeholder="hr4745@vidyagyan.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Send Magic Link'}
              </button>
            </form>

            {message && (
              <p className={`mt-4 text-xs text-center p-2.5 rounded-md ${
                message.includes('sent') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
