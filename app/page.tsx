'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Direct client initialization
const supabase = createClient(
  'https://lllmgmfofwczpqbmigey.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbG1nbWZvZndjenBxYm1pZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss'
);

interface CalendarEvent {
  id?: number;
  title: string;
  event_date: string;
  venue?: string;
  category?: 'Flagship' | 'Academic' | 'Cultural' | 'Exams' | 'Sports' | 'Excursion';
  target?: string;
  time?: string;
  created_by?: string;
}

// 2026-27 Master Annual Calendar Dataset
const ANNUAL_EVENTS: CalendarEvent[] = [
  { title: 'Science-iquisition', category: 'Academic', target: 'All Grades', event_date: '2026-04-16', venue: 'Campus', time: 'Day Event' },
  { title: 'Investiture Ceremony', category: 'Flagship', target: 'All Grades', event_date: '2026-04-18', venue: 'Auditorium', time: 'Morning Event' },
  { title: 'Trip to Biodiversity Park (SNU)', category: 'Excursion', target: 'Grade 9', event_date: '2026-04-22', venue: 'SNU Noida', time: 'Day Trip' },
  { title: "Bard's Day", category: 'Cultural', target: 'All Grades', event_date: '2026-04-23', venue: 'Amphitheatre', time: 'Evening Event' },
  { title: 'Periodic Test 1 (PT-1)', category: 'Exams', target: 'Grades 7-12', event_date: '2026-05-04', venue: 'Classrooms', time: 'Morning Session' },
  { title: 'VGB MUN 2026', category: 'Academic', target: 'Grades 9-12', event_date: '2026-08-07', venue: 'Conference Block', time: 'Full Day' },
  { title: 'Vidyagyan Day (VG Day)', category: 'Flagship', target: 'All Grades', event_date: '2026-08-08', venue: 'Main Ground', time: 'Full Day' },
  { title: 'STEAM Conclave', category: 'Academic', target: 'Grades 9-12 Science', event_date: '2026-08-12', venue: 'Labs', time: 'Full Day' },
  { title: 'TED Event', category: 'Cultural', target: 'All Grades', event_date: '2026-08-31', venue: 'Amphitheatre', time: 'Morning Session' },
  { title: 'Mid-Term Examinations', category: 'Exams', target: 'Grades 7-12', event_date: '2026-09-12', venue: 'Classrooms', time: '08:00 AM - 11:00 AM' },
  { title: 'Trip to Physics Dham & Jaipur', category: 'Excursion', target: 'Selected Delegations', event_date: '2026-10-02', venue: 'Jaipur', time: 'Full Day Trip' },
  { title: 'Inter-Disciplinary Trip to Agra', category: 'Excursion', target: 'Grades 7-8 & 11-12 Eco', event_date: '2026-10-17', venue: 'Agra', time: 'Day Trip' },
  { title: 'Lit Fest 2026', category: 'Cultural', target: 'Inter-School Delegations', event_date: '2026-10-30', venue: 'Auditorium', time: 'Full Day' },
  { title: 'Annual Sports Day', category: 'Sports', target: 'All Houses', event_date: '2026-11-28', venue: 'Sports Complex', time: '08:00 AM - 04:00 PM' },
  { title: 'Pre-Board Examinations', category: 'Exams', target: 'Grades 10 & 12', event_date: '2026-12-08', venue: 'Exam Halls', time: '09:00 AM - 12:00 PM' },
  { title: 'Annual Examinations', category: 'Exams', target: 'Grades 9 & 11', event_date: '2027-02-09', venue: 'Exam Halls', time: 'Morning Session' }
];

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('Council Member');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Events state
  const [supabaseEvents, setSupabaseEvents] = useState<CalendarEvent[]>([]);
  const [displayEvents, setDisplayEvents] = useState<CalendarEvent[]>([]);
  const [isToday, setIsToday] = useState(false);
  const [clockTime, setClockTime] = useState('');
  const [clockDate, setClockDate] = useState('');

  // New Event Form State
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newVenue, setNewVenue] = useState('');

  useEffect(() => {
    // Clock updates
    const updateTime = () => {
      const now = new Date();
      setClockTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
      setClockDate(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' }));
    };
    updateTime();
    const clockInterval = setInterval(updateTime, 1000);

    // Auth check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.email) fetchUserRole(session.user.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user?.email) fetchUserRole(session.user.email);
    });

    fetchEvents();

    return () => {
      clearInterval(clockInterval);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    evaluateCalendarDisplay();
  }, [supabaseEvents]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });
    if (!error && data) setSupabaseEvents(data);
  };

  const evaluateCalendarDisplay = () => {
    const combined = [...supabaseEvents, ...ANNUAL_EVENTS];
    const todayStr = new Date().toISOString().split('T')[0];

    const activeToday = combined.filter(evt => evt.event_date === todayStr);

    if (activeToday.length > 0) {
      setDisplayEvents(activeToday);
      setIsToday(true);
    } else {
      const upcoming = combined
        .filter(evt => evt.event_date >= todayStr)
        .sort((a, b) => a.event_date.localeCompare(b.event_date))
        .slice(0, 6);

      setDisplayEvents(upcoming);
      setIsToday(false);
    }
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

  const getCategoryStyles = (category?: string) => {
    switch (category?.toLowerCase()) {
      case 'flagship': return { bg: 'bg-amber-100', text: 'text-amber-800', dot: 'bg-amber-500' };
      case 'cultural': return { bg: 'bg-rose-100', text: 'text-rose-800', dot: 'bg-rose-500' };
      case 'academic': return { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500' };
      case 'exams': return { bg: 'bg-purple-100', text: 'text-purple-800', dot: 'bg-purple-500' };
      case 'sports': return { bg: 'bg-emerald-100', text: 'text-emerald-800', dot: 'bg-emerald-500' };
      case 'excursion': return { bg: 'bg-cyan-100', text: 'text-cyan-800', dot: 'bg-cyan-500' };
      default: return { bg: 'bg-indigo-100', text: 'text-indigo-800', dot: 'bg-indigo-500' };
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f8f5] text-slate-900 font-sans">
      {/* Header Bar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f8f5]/95 backdrop-blur-md">
  <div className="max-w-7xl mx-auto px-5 lg:px-8">
    <div className="h-20 flex items-center justify-between">

      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm tracking-tight">
            VG
          </span>
        </div>

        <div>
          <div className="text-[15px] font-bold tracking-tight text-blue-950">
            VidyaGyan Council
          </div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Student Leadership
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
        <a href="#home" className="text-blue-950">
          Home
        </a>
        <a href="#about" className="hover:text-blue-950 transition">
          About
        </a>
        <a href="#leadership" className="hover:text-blue-950 transition">
          Leadership
        </a>
        <a href="#calendar" className="hover:text-blue-950 transition">
          Calendar
        </a>
        <a href="#initiatives" className="hover:text-blue-950 transition">
          Initiatives
        </a>
      </nav>

      {/* Account */}
      {session ? (
        <div className="flex items-center gap-3">
          <div className="hidden lg:block text-right">
            <div className="text-xs font-semibold text-slate-800">
              {session.user.email}
            </div>
            <div className="text-[11px] text-slate-500">
              {userRole}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-lg bg-blue-950 text-white text-sm font-semibold hover:bg-blue-900 transition shadow-sm"
        >
          Council Sign In
        </button>
      )}
    </div>
  </div>
</header>

      {/* Main Content Area */}
      <main id="home" className="max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-14">
        {!session ? (
          /* Public Unauthenticated View */
          <div className="space-y-8">
            {/* Hero Banner with Live Clock */}
            <section className="relative overflow-hidden rounded-[2rem] bg-blue-950 text-white shadow-xl">
  <div className="absolute inset-0 opacity-20">
    <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/30" />
    <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full border border-white/20" />
  </div>

  <div className="relative grid lg:grid-cols-[1fr_auto] gap-10 items-end px-7 py-10 md:px-12 md:py-14">

    <div className="max-w-3xl">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300 mb-5">
        VidyaGyan Leadership Academy
      </p>

      <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
        Student leadership,
        <br />
        organised with purpose.
      </h2>

      <p className="mt-6 max-w-2xl text-sm md:text-base leading-7 text-blue-100">
        The VidyaGyan Council Portal brings together the Council's
        calendar, announcements, initiatives, resources and operational
        workspace in one institutional platform.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="#calendar"
          className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-950 hover:bg-slate-100 transition"
        >
          Explore Calendar
        </a>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15 transition"
        >
          Council Workspace
        </button>
      </div>
    </div>

    <div className="lg:min-w-[210px] lg:text-right">
      <div className="text-[11px] uppercase tracking-[0.2em] text-blue-300">
        Campus Time
      </div>

      <div className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
        {clockTime || "00:00:00 AM"}
      </div>

      <div className="mt-1 text-sm text-blue-200">
        {clockDate}
      </div>

      <div className="mt-5 inline-flex items-center gap-2 text-xs text-blue-200">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        Portal online
      </div>
    </div>
  </div>
</section>

            {/* Dynamic Calendar Section */}
            <section
  id="calendar"
  className="mt-10 bg-white rounded-[1.75rem] shadow-sm border border-slate-200/80 p-6 md:p-8"
>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
                <div>
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <span>📅</span>
                    <span>{isToday ? "Today's Events" : "Upcoming Schedule"}</span>
                  </h3>
                  <p className="text-xs md:text-sm text-slate-500 mt-1">
                    {isToday ? "Overview of active workshops and activities today." : "No events scheduled for today. Here is what's coming up next on campus."}
                  </p>
                </div>

                <div>
                  {isToday ? (
                    <span className="px-4 py-1.5 bg-green-50 border border-green-200 text-green-700 text-xs font-bold rounded-full flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Live Today
                    </span>
                  ) : (
                    <span className="px-4 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-full flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Upcoming Events
                    </span>
                  )}
                </div>
              </div>

              {/* Event Table View */}
              <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <th className="p-4 border-b border-slate-100">Event / Program</th>
                      <th className="p-4 border-b border-slate-100">Category & Target</th>
                      <th className="p-4 border-b border-slate-100 text-right">Date & Venue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {displayEvents.length > 0 ? (
                      displayEvents.map((evt, idx) => {
                        const styles = getCategoryStyles(evt.category);
                        return (
                          <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-semibold text-slate-800">
                              <div className="flex items-center gap-2.5">
                                <span className={`w-2 h-2 rounded-full ${styles.dot}`}></span>
                                {evt.title}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col gap-1 items-start">
                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${styles.bg} ${styles.text}`}>
                                  {evt.category || 'Council Event'}
                                </span>
                                <span className="text-xs text-slate-400 pl-0.5">{evt.target || 'All Students'}</span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="font-medium text-slate-700">{evt.event_date}</div>
                              <div className="text-xs text-slate-400 mt-0.5">{evt.venue || evt.time || 'Campus'}</div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-slate-400">
                          No upcoming events listed in calendar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : (
          /* Logged In Dashboard View */
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-800">Council Dashboard</h2>
              <p className="text-slate-600 text-sm mt-1">
                Authorized Workspace for Event Management & Operations
              </p>
            </div>

            {/* Event Creation Form */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Post New Event to Supabase</h3>
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

            {/* Live Database Events List */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Live Database Events ({supabaseEvents.length})</h3>
              <div className="divide-y divide-slate-100">
                {supabaseEvents.length > 0 ? (
                  supabaseEvents.map((evt) => (
                    <div key={evt.id} className="py-3 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-800">{evt.title}</p>
                        <p className="text-xs text-slate-500">Date: {evt.event_date} | Venue: {evt.venue || 'N/A'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4">No events found in `calendar_events` table.</p>
                )}
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

            <h3 className="text-xl font-bold text-slate-800">Sign In</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Authorized teachers and council members only.
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">School Email</label>
                <input
                  type="email"
                  placeholder="username@vidyagyan.in"
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
