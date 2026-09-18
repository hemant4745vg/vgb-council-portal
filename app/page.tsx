'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient, Session } from '@supabase/supabase-js';

/* -------------------------------------------------------------------------- */
/* Supabase                                                                    */
/* -------------------------------------------------------------------------- */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

type EventCategory =
  | 'Flagship'
  | 'Academic'
  | 'Cultural'
  | 'Exams'
  | 'Sports'
  | 'Excursion';

interface CalendarEvent {
  id?: number;
  title: string;
  event_date: string;
  description?: string | null;
  event_time?: string | null;
  category?: EventCategory;
  created_by?: string | null;
  venue?: string;
  target?: string;
  time?: string;
}

type FeedbackType = 'success' | 'error' | 'info';

interface Feedback {
  type: FeedbackType;
  text: string;
}

/* -------------------------------------------------------------------------- */
/* Master Annual Calendar                                                     */
/* -------------------------------------------------------------------------- */

const ANNUAL_EVENTS: CalendarEvent[] = [
  /* September 2026 */
  {
    title: 'Math Rangoli',
    category: 'Academic',
    target: 'Grade 6',
    event_date: '2026-09-18',
    venue: 'Campus',
    time: 'Evening Prep',
  },
  {
    title: 'Mid-Term Examinations End',
    category: 'Exams',
    target: 'Grades 11–12',
    event_date: '2026-09-21',
    venue: 'Exam Halls',
  },
  {
    title: 'Mid-Term Examinations End',
    category: 'Exams',
    target: 'Grades 9–10',
    event_date: '2026-09-23',
    venue: 'Exam Halls',
  },
  {
    title: 'Mid-Term Examinations End',
    category: 'Exams',
    target: 'Grades 7–8',
    event_date: '2026-09-25',
    venue: 'Exam Halls',
  },
  {
    title: 'SPANDAN Lit Fest',
    category: 'Cultural',
    target: 'Teachers',
    event_date: '2026-09-25',
    venue: 'Campus',
  },
  {
    title: 'Inter-Section English Recitation',
    category: 'Cultural',
    target: 'Grade 6',
    event_date: '2026-09-25',
    venue: 'Campus',
  },
  {
    title: 'Cultural Week',
    category: 'Cultural',
    target: 'School Community',
    event_date: '2026-09-28',
    venue: 'Campus',
    time: '28 Sep – 1 Oct',
  },
  {
    title: 'Cultural Week Ends',
    category: 'Cultural',
    target: 'School Community',
    event_date: '2026-10-01',
    venue: 'Campus',
  },

  /* October 2026 */
  {
    title: 'Gandhi Jayanti & Theatre Visit',
    category: 'Cultural',
    target: 'School Community',
    event_date: '2026-10-02',
    venue: 'Campus / Theatre',
  },
  {
    title: 'Trip to Physics Dham – Jaipur',
    category: 'Excursion',
    target: 'Selected Students',
    event_date: '2026-10-02',
    venue: 'Physics Dham / Jaipur',
  },
  {
    title: 'IH Kabaddi',
    category: 'Sports',
    target: 'Inter-House',
    event_date: '2026-10-05',
    venue: 'Sports Ground',
    time: '5–7 Oct & 11–12 Oct',
  },
  {
    title: 'Mid-Term Review',
    category: 'Academic',
    target: 'Grades 11–12',
    event_date: '2026-10-08',
    venue: 'Campus',
  },
  {
    title: 'Mid-Term Review',
    category: 'Academic',
    target: 'Grades 9–10',
    event_date: '2026-10-09',
    venue: 'Campus',
  },
  {
    title: 'Mid-Term Review',
    category: 'Academic',
    target: 'Grades 7–8',
    event_date: '2026-10-10',
    venue: 'Campus',
  },
  {
    title: 'Delhi Zoo Visit',
    category: 'Excursion',
    target: 'Grade 6',
    event_date: '2026-10-12',
    venue: 'Delhi Zoo',
  },
  {
    title: 'Workshop',
    category: 'Academic',
    target: 'Grades 6–8',
    event_date: '2026-10-14',
    venue: 'Campus',
  },
  {
    title: 'IH Painting Competition',
    category: 'Cultural',
    target: 'Grades 6–7',
    event_date: '2026-10-15',
    venue: 'Campus',
  },
  {
    title: 'IH Painting Competition',
    category: 'Cultural',
    target: 'Grades 8–9',
    event_date: '2026-10-16',
    venue: 'Campus',
  },
  {
    title: 'Inter-Disciplinary Trip to Agra',
    category: 'Excursion',
    target: 'Grades 7–8 & 11–12 Eco',
    event_date: '2026-10-17',
    venue: 'Agra',
  },
  {
    title: 'Maha Navami',
    category: 'Cultural',
    target: 'School Community',
    event_date: '2026-10-19',
  },
  {
    title: 'Dussehra',
    category: 'Cultural',
    target: 'School Community',
    event_date: '2026-10-20',
  },
  {
    title: 'IH Badminton',
    category: 'Sports',
    target: 'Inter-House',
    event_date: '2026-10-21',
    venue: 'Sports Ground',
    time: '21–24 Oct',
  },
  {
    title: 'Visit to Delhi Haat',
    category: 'Excursion',
    target: 'Commerce & Economics',
    event_date: '2026-10-26',
    venue: 'Delhi Haat',
  },
  {
    title: 'Annual Sports Practice',
    category: 'Sports',
    target: 'School Community',
    event_date: '2026-10-26',
    venue: 'Sports Ground',
    time: '26–31 Oct · Evening',
  },
  {
    title: 'Lit Fest 2026',
    category: 'Cultural',
    target: 'Inter-School Delegations',
    event_date: '2026-10-30',
    venue: 'Campus',
    time: '30–31 Oct',
  },
  {
    title: 'Syllabus Completion',
    category: 'Academic',
    target: 'Grades 10 & 12',
    event_date: '2026-10-31',
    venue: 'Campus',
  },

  /* November 2026 */
  {
    title: 'History for Peace 2026',
    category: 'Academic',
    target: 'School Community',
    event_date: '2026-11-02',
    venue: 'Campus',
    time: '2–3 Nov',
  },
  {
    title: 'PTM',
    category: 'Academic',
    target: 'Parents & Students',
    event_date: '2026-11-04',
    venue: 'Campus',
  },
  {
    title: 'Deepawali Break',
    category: 'Flagship',
    target: 'Students',
    event_date: '2026-11-05',
    time: '5–21 Nov',
  },
  {
    title: 'Reporting Day',
    category: 'Academic',
    target: 'Teachers',
    event_date: '2026-11-17',
    venue: 'Campus',
  },
  {
    title: 'OLE',
    category: 'Academic',
    target: 'Teachers',
    event_date: '2026-11-18',
    venue: 'Campus',
    time: '18–21 Nov',
  },
  {
    title: 'Reporting Day',
    category: 'Academic',
    target: 'Students',
    event_date: '2026-11-22',
    venue: 'Campus',
  },
  {
    title: 'Classes Begin',
    category: 'Academic',
    target: 'Students',
    event_date: '2026-11-23',
    venue: 'Campus',
  },
  {
    title: 'Annual Sports Practice',
    category: 'Sports',
    target: 'School Community',
    event_date: '2026-11-23',
    venue: 'Sports Ground',
    time: '23–24 Nov · Evening',
  },
  {
    title: 'Annual Sports Day',
    category: 'Sports',
    target: 'All Houses',
    event_date: '2026-11-28',
    venue: 'Sports Complex',
  },
  {
    title: 'Interaction with Mr. Solanki',
    category: 'Academic',
    target: 'School Community',
    event_date: '2026-11-30',
    venue: 'Campus',
    time: 'Environmentalist Interaction',
  },

  /* December 2026 */
  {
    title: 'Itihaas Anveshan',
    category: 'Academic',
    target: 'School Community',
    event_date: '2026-12-05',
    venue: 'Campus',
  },
  {
    title: 'VGEE',
    category: 'Academic',
    target: 'Eligible Students',
    event_date: '2026-12-06',
    venue: 'Campus',
  },
  {
    title: 'Periodic Tests',
    category: 'Exams',
    target: 'Relevant Grades',
    event_date: '2026-12-08',
    venue: 'Exam Halls',
    time: '8–14 Dec',
  },
  {
    title: 'Pre-Board Examinations',
    category: 'Exams',
    target: 'Grades 10 & 12',
    event_date: '2026-12-08',
    venue: 'Exam Halls',
    time: '8–16 Dec',
  },
  {
    title: 'Inter-Section Choir',
    category: 'Cultural',
    target: 'Grade 6',
    event_date: '2026-12-17',
    venue: 'Morning Assembly',
  },
  {
    title: 'PTM',
    category: 'Academic',
    target: 'Grades 6–9 & 11',
    event_date: '2026-12-19',
    venue: 'Campus',
  },
  {
    title: 'Winter Break Begins',
    category: 'Flagship',
    target: 'Grades 6–9 & 11',
    event_date: '2026-12-20',
    time: '20 Dec – 9 Jan',
  },
  {
    title: 'Winter Camp',
    category: 'Academic',
    target: 'Grades 10 & 12',
    event_date: '2026-12-21',
    venue: 'Campus',
  },
  {
    title: 'Christmas',
    category: 'Cultural',
    target: 'School Community',
    event_date: '2026-12-25',
  },
  {
    title: 'New Year Eve Celebration',
    category: 'Cultural',
    target: 'School Community',
    event_date: '2026-12-31',
    venue: 'Campus',
  },

  /* January 2027 */
  {
    title: 'Reporting Day',
    category: 'Academic',
    target: 'Teachers',
    event_date: '2027-01-09',
    venue: 'Campus',
  },
  {
    title: 'Reporting Day',
    category: 'Academic',
    target: 'Students',
    event_date: '2027-01-10',
    venue: 'Campus',
  },
  {
    title: 'Classes Begin',
    category: 'Academic',
    target: 'Students',
    event_date: '2027-01-11',
    venue: 'Campus',
  },
  {
    title: 'ICCR International Festival',
    category: 'Cultural',
    target: 'Grade 8',
    event_date: '2027-01-21',
    venue: 'Campus',
    time: '21–23 Jan',
  },
  {
    title: 'IH Music Competition',
    category: 'Cultural',
    target: 'Grades 7–9',
    event_date: '2027-01-25',
    venue: 'Campus',
    time: 'Singing / Orchestra',
  },
  {
    title: 'Republic Day',
    category: 'Flagship',
    target: 'School Community',
    event_date: '2027-01-26',
  },
  {
    title: 'Visit to Book Fair',
    category: 'Excursion',
    target: 'Students',
    event_date: '2027-01-30',
    venue: 'Book Fair',
  },

  /* February 2027 */
  {
    title: 'Annual Examinations',
    category: 'Exams',
    target: 'Grade 11',
    event_date: '2027-02-09',
    venue: 'Exam Halls',
    time: '9–17 Feb',
  },
  {
    title: 'Annual Examinations',
    category: 'Exams',
    target: 'Grade 9',
    event_date: '2027-02-09',
    venue: 'Exam Halls',
    time: '9–19 Feb',
  },
  {
    title: 'OLE',
    category: 'Academic',
    target: 'Grades 9 & 11',
    event_date: '2027-02-22',
    venue: 'Campus',
    time: 'Proposed · 22–27 Feb',
  },

  /* March 2027 */
  {
    title: 'New Session Begins',
    category: 'Academic',
    target: 'Grades 10 & 12',
    event_date: '2027-03-01',
    venue: 'Campus',
  },
  {
    title: 'Annual Examinations',
    category: 'Exams',
    target: 'Grades 6–8',
    event_date: '2027-03-09',
    venue: 'Exam Halls',
    time: '9–23 Mar',
  },
  {
    title: 'Holi',
    category: 'Cultural',
    target: 'School Community',
    event_date: '2027-03-22',
  },
  {
    title: 'Session Break',
    category: 'Academic',
    target: 'Students',
    event_date: '2027-03-27',
    time: '27–31 Mar',
  },
  {
    title: 'In-Service Training',
    category: 'Academic',
    target: 'Staff',
    event_date: '2027-03-29',
    venue: 'Campus',
    time: '29–30 Mar',
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

const INDIA_TIME_ZONE = 'Asia/Kolkata';

function getIndiaDateString(date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatDate(dateString: string): string {
  if (!dateString) return 'Date not specified';

  const [year, month, day] = dateString.split('-').map(Number);

  if (!year || !month || !day) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: INDIA_TIME_ZONE,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function getRelativeLabel(dateString: string, todayString: string): string {
  if (dateString === todayString) return 'Today';

  const [ty, tm, td] = todayString.split('-').map(Number);
  const [ey, em, ed] = dateString.split('-').map(Number);

  const today = Date.UTC(ty, tm - 1, td);
  const event = Date.UTC(ey, em - 1, ed);

  const difference = Math.round((event - today) / 86400000);

  if (difference === 1) return 'Tomorrow';
  if (difference > 1 && difference <= 7) return `In ${difference} days`;

  return '';
}

function getCategoryStyles(category?: string) {
  switch (category?.toLowerCase()) {
    case 'flagship':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
      };

    case 'cultural':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-200',
        dot: 'bg-rose-500',
      };

    case 'academic':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-800',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
      };

    case 'exams':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-800',
        border: 'border-purple-200',
        dot: 'bg-purple-500',
      };

    case 'sports':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-800',
        border: 'border-emerald-200',
        dot: 'bg-emerald-500',
      };

    case 'excursion':
      return {
        bg: 'bg-cyan-50',
        text: 'text-cyan-800',
        border: 'border-cyan-200',
        dot: 'bg-cyan-500',
      };

    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-500',
      };
  }
}

function normaliseEvent(event: any): CalendarEvent {
  return {
    id: event.id,
    title: event.title,
    event_date: event.event_date,
    description: event.description,
    event_time: event.event_time,
    category: event.category,
    created_by: event.created_by,
    venue: event.description || 'Campus',
    time: event.event_time || '',
  };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                   */
/* -------------------------------------------------------------------------- */

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [userRole, setUserRole] = useState('Council Member');
  const [isAuthorized, setIsAuthorized] = useState(false);

  const [email, setEmail] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginFeedback, setLoginFeedback] = useState<Feedback | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [supabaseEvents, setSupabaseEvents] = useState<CalendarEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(false);

  const [todayString, setTodayString] = useState(
    getIndiaDateString()
  );

  const [clockTime, setClockTime] = useState('');
  const [clockDate, setClockDate] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newCategory, setNewCategory] =
    useState<EventCategory>('Academic');

  const [publishing, setPublishing] = useState(false);
  const [eventFeedback, setEventFeedback] =
    useState<Feedback | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Derived calendar                                                         */
  /* ------------------------------------------------------------------------ */

  const mergedEvents = useMemo(() => {
    const all = [...ANNUAL_EVENTS, ...supabaseEvents];

    const seen = new Set<string>();

    return all
      .filter((event) => event.event_date && event.title)
      .sort((a, b) => {
        const dateDifference =
          a.event_date.localeCompare(b.event_date);

        if (dateDifference !== 0) return dateDifference;

        return a.title.localeCompare(b.title);
      })
      .filter((event) => {
        /*
         * Do not aggressively remove duplicates here.
         * Two similarly named events can legitimately have different
         * targets or dates. Only exact duplicates are suppressed.
         */
        const key = [
          event.title.trim().toLowerCase(),
          event.event_date,
          event.target || '',
          event.venue || '',
        ].join('|');

        if (seen.has(key)) return false;

        seen.add(key);
        return true;
      });
  }, [supabaseEvents]);

  const todaysEvents = useMemo(
    () =>
      mergedEvents.filter(
        (event) => event.event_date === todayString
      ),
    [mergedEvents, todayString]
  );

  const upcomingEvents = useMemo(
    () =>
      mergedEvents
        .filter((event) => event.event_date > todayString)
        .slice(0, 8),
    [mergedEvents, todayString]
  );

  const displayEvents =
    todaysEvents.length > 0 ? todaysEvents : upcomingEvents;

  const hasTodayEvents = todaysEvents.length > 0;

  const canManageEvents =
    isAuthorized &&
    ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'SECRETARY'].includes(
      userRole.toUpperCase()
    );

  /* ------------------------------------------------------------------------ */
  /* Clock and date rollover                                                  */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setClockTime(
        now.toLocaleTimeString('en-US', {
          timeZone: INDIA_TIME_ZONE,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );

      setClockDate(
        now.toLocaleDateString('en-US', {
          timeZone: INDIA_TIME_ZONE,
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );

      const currentIndiaDate = getIndiaDateString(now);

      setTodayString((previous) =>
        previous === currentIndiaDate ? previous : currentIndiaDate
      );
    };

    updateClock();

    const interval = window.setInterval(updateClock, 1000);

    return () => window.clearInterval(interval);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    let mounted = true;

    const initialiseAuth = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(currentSession);

      if (currentSession?.user?.email) {
        await fetchUserRole(currentSession.user.email);
      }

      setAuthChecked(true);
    };

    initialiseAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (newSession?.user?.email) {
        await fetchUserRole(newSession.user.email);
      } else {
        setUserRole('Council Member');
        setIsAuthorized(false);
      }

      setAuthChecked(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Fetch calendar                                                            */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setEventsLoading(true);
    setEventsError(false);

    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });

    if (error) {
      console.error('Unable to fetch calendar events:', error);
      setEventsError(true);
      setEventsLoading(false);
      return;
    }

    setSupabaseEvents((data || []).map(normaliseEvent));
    setEventsLoading(false);
  };

  /* ------------------------------------------------------------------------ */
  /* User authorization                                                        */
  /* ------------------------------------------------------------------------ */

  const fetchUserRole = async (userEmail: string) => {
    const normalizedEmail = userEmail.trim().toLowerCase();

    const { data, error } = await supabase
      .from('allowed_users')
      .select('role')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error('Unable to verify council authorization:', error);
      setUserRole('Council Member');
      setIsAuthorized(false);
      return;
    }

    if (!data?.role) {
      setUserRole('Unauthorized');
      setIsAuthorized(false);
      return;
    }

    setUserRole(data.role);
    setIsAuthorized(true);
  };

  /* ------------------------------------------------------------------------ */
  /* Login                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    setLoginFeedback(null);

    const formattedEmail = email.trim().toLowerCase();

    if (!formattedEmail) {
      setLoginFeedback({
        type: 'error',
        text: 'Please enter your school email address.',
      });
      return;
    }

    if (!formattedEmail.endsWith('@vidyagyan.in')) {
      setLoginFeedback({
        type: 'error',
        text: 'Please use your official @vidyagyan.in school email.',
      });
      return;
    }

    setLoginLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email: formattedEmail,
      options: {
        emailRedirectTo:
          'https://vgb-student-council-portal.vercel.app',
      },
    });

    if (error) {
      console.error('Magic link error:', error);

      setLoginFeedback({
        type: 'error',
        text:
          'We could not send the sign-in link. Please check the email address and try again.',
      });
    } else {
      setLoginFeedback({
        type: 'success',
        text:
          'Magic link sent. Check your VidyaGyan Outlook inbox and open the link to continue.',
      });
    }

    setLoginLoading(false);
  };

  /* ------------------------------------------------------------------------ */
  /* Logout                                                                    */
  /* ------------------------------------------------------------------------ */

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setSession(null);
    setUserRole('Council Member');
    setIsAuthorized(false);
    setLoginFeedback(null);
    setEventFeedback(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Event creation                                                             */
  /* ------------------------------------------------------------------------ */

  const handleCreateEvent = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!canManageEvents) {
      setEventFeedback({
        type: 'error',
        text: 'You are not authorized to publish calendar events.',
      });
      return;
    }

    const title = newTitle.trim();
    const venue = newVenue.trim();
    const target = newTarget.trim();
    const time = newTime.trim();

    if (!title || !newDate || !newCategory) {
      setEventFeedback({
        type: 'error',
        text: 'Please complete all required fields.',
      });
      return;
    }

    if (newDate < todayString) {
      setEventFeedback({
        type: 'error',
        text: 'Please choose today or a future date.',
      });
      return;
    }

    setPublishing(true);
    setEventFeedback(null);

    /*
     * Current database schema:
     * calendar_events.description = nullable text
     *
     * Because the existing table does not have a venue column,
     * venue is stored in description. The public formatter maps
     * description back to venue.
     */
    const description = [
      venue ? `Venue: ${venue}` : '',
      target ? `Target: ${target}` : '',
    ]
      .filter(Boolean)
      .join(' · ');

    const { error } = await supabase
      .from('calendar_events')
      .insert([
        {
          title,
          description: description || null,
          event_date: newDate,
          event_time: time || null,
          category: newCategory,
          created_by: session?.user?.email || null,
        },
      ]);

    if (error) {
      console.error('Unable to publish event:', error);

      setEventFeedback({
        type: 'error',
        text:
          'The event could not be published. Please check your permissions and try again.',
      });

      setPublishing(false);
      return;
    }

    setNewTitle('');
    setNewDate('');
    setNewVenue('');
    setNewTime('');
    setNewTarget('');
    setNewCategory('Academic');

    setEventFeedback({
      type: 'success',
      text: 'Event published successfully.',
    });

    await fetchEvents();

    setPublishing(false);
  };

  /* ------------------------------------------------------------------------ */
  /* Modal accessibility                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () =>
      document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  /* ------------------------------------------------------------------------ */
  /* Render helpers                                                            */
  /* ------------------------------------------------------------------------ */

  const renderFeedback = (
    feedback: Feedback | null
  ) => {
    if (!feedback) return null;

    const classes =
      feedback.type === 'success'
        ? 'border-green-200 bg-green-50 text-green-800'
        : feedback.type === 'error'
          ? 'border-red-200 bg-red-50 text-red-800'
          : 'border-blue-200 bg-blue-50 text-blue-800';

    return (
      <div
        role="status"
        className={`rounded-xl border px-4 py-3 text-sm ${classes}`}
      >
        {feedback.text}
      </div>
    );
  };

  const renderEventRow = (
    event: CalendarEvent,
    index: number
  ) => {
    const styles = getCategoryStyles(event.category);
    const relativeLabel = getRelativeLabel(
      event.event_date,
      todayString
    );

    const eventVenue =
      event.venue ||
      (event.description?.startsWith('Venue:')
        ? event.description
            .split(' · ')[0]
            .replace('Venue:', '')
            .trim()
        : 'Campus');

    return (
      <tr
        key={`${event.title}-${event.event_date}-${event.target}-${index}`}
        className={`transition-colors hover:bg-slate-50 ${
          event.event_date === todayString
            ? 'bg-emerald-50/40'
            : ''
        }`}
      >
        <td className="p-4 align-top">
          <div className="flex items-start gap-3">
            <span
              className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`}
            />

            <div>
              <div className="font-semibold text-slate-900">
                {event.title}
              </div>

              {event.time && (
                <div className="mt-1 text-xs text-slate-500">
                  {event.time}
                </div>
              )}
            </div>
          </div>
        </td>

        <td className="p-4 align-top">
          <div className="flex flex-col items-start gap-1.5">
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.bg} ${styles.text} ${styles.border}`}
            >
              {event.category || 'Council Event'}
            </span>

            <span className="text-xs text-slate-500">
              {event.target || 'School Community'}
            </span>
          </div>
        </td>

        <td className="p-4 text-right align-top">
          <div className="flex flex-col items-end">
            {relativeLabel && (
              <span
                className={`mb-1 text-[10px] font-bold uppercase tracking-wide ${
                  relativeLabel === 'Today'
                    ? 'text-emerald-700'
                    : 'text-slate-400'
                }`}
              >
                {relativeLabel}
              </span>
            )}

            <span className="font-semibold text-slate-700">
              {formatDate(event.event_date)}
            </span>

            <span className="mt-1 text-xs text-slate-400">
              {eventVenue}
            </span>
          </div>
        </td>
      </tr>
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Page                                                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#f7f8f5] font-sans text-slate-900">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                              */}
      {/* ------------------------------------------------------------------ */}

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f8f5]/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Brand */}
            <a
              href="#home"
              className="flex items-center gap-3"
              onClick={() => setMobileMenuOpen(false)}
              aria-label="VidyaGyan Council home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 shadow-sm">
                <span className="text-sm font-bold tracking-tight text-white">
                  VG
                </span>
              </div>

              <div>
                <div className="text-[15px] font-bold tracking-tight text-blue-950">
                  VidyaGyan Council
                </div>

                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Student Leadership
                </div>
              </div>
            </a>

            {/* Desktop navigation */}
            <nav
              className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"
              aria-label="Primary navigation"
            >
              <a
                href="#home"
                className="text-blue-950 transition hover:text-blue-700"
              >
                Home
              </a>

              <a
                href="#about"
                className="transition hover:text-blue-950"
              >
                About
              </a>

              <a
                href="#leadership"
                className="transition hover:text-blue-950"
              >
                Leadership
              </a>

              <a
                href="#calendar"
                className="transition hover:text-blue-950"
              >
                Calendar
              </a>

              <a
                href="#initiatives"
                className="transition hover:text-blue-950"
              >
                Initiatives
              </a>
            </nav>

            {/* Desktop account */}
            <div className="hidden items-center gap-3 md:flex">
              {session ? (
                <>
                  <div className="hidden text-right lg:block">
                    <div className="max-w-[220px] truncate text-xs font-semibold text-slate-800">
                      {session.user.email}
                    </div>

                    <div
                      className={`text-[11px] ${
                        isAuthorized
                          ? 'text-slate-500'
                          : 'text-red-600'
                      }`}
                    >
                      {userRole}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="rounded-lg bg-blue-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
                >
                  Council Sign In
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white p-2.5 text-slate-700 md:hidden"
              onClick={() =>
                setMobileMenuOpen((previous) => !previous)
              }
              aria-label={
                mobileMenuOpen
                  ? 'Close navigation menu'
                  : 'Open navigation menu'
              }
              aria-expanded={mobileMenuOpen}
            >
              <span className="text-lg leading-none">
                {mobileMenuOpen ? '×' : '☰'}
              </span>
            </button>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <div className="border-t border-slate-200 py-4 md:hidden">
              <nav
                className="flex flex-col gap-1"
                aria-label="Mobile navigation"
              >
                {[
                  ['Home', '#home'],
                  ['About', '#about'],
                  ['Leadership', '#leadership'],
                  ['Calendar', '#calendar'],
                  ['Initiatives', '#initiatives'],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-blue-950"
                  >
                    {label}
                  </a>
                ))}

                {!session && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setIsModalOpen(true);
                    }}
                    className="mt-2 rounded-lg bg-blue-950 px-4 py-3 text-left text-sm font-semibold text-white"
                  >
                    Council Sign In
                  </button>
                )}

                {session && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="mt-2 rounded-lg border border-slate-300 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700"
                  >
                    Sign Out
                  </button>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main                                                               */}
      {/* ------------------------------------------------------------------ */}

      <main
        id="home"
        className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-14"
      >
        <div className="space-y-10">
          {/* Hero */}
          <section className="relative overflow-hidden rounded-[2rem] bg-blue-950 text-white shadow-xl">
            <div
              className="pointer-events-none absolute inset-0 opacity-20"
              aria-hidden="true"
            >
              <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/30" />
              <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full border border-white/20" />
            </div>

            <div className="relative grid items-end gap-10 px-7 py-10 lg:grid-cols-[1fr_auto] md:px-12 md:py-14">
              <div className="max-w-3xl">
                <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">
                  VidyaGyan Leadership Academy
                </p>

                <h1 className="text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
                  Student leadership,
                  <br />
                  organised with purpose.
                </h1>

                <p className="mt-6 max-w-2xl text-sm leading-7 text-blue-100 md:text-base">
                  The VidyaGyan Council Portal brings together the
                  Council&apos;s calendar, announcements, initiatives,
                  resources and operational workspace in one
                  institutional platform.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <a
                    href="#calendar"
                    className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-950 transition hover:bg-slate-100"
                  >
                    Explore Calendar
                  </a>

                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  >
                    Council Workspace
                  </button>
                </div>
              </div>

              {/* Campus clock */}
              <div className="lg:min-w-[230px] lg:text-right">
                <div className="text-[11px] uppercase tracking-[0.2em] text-blue-300">
                  Campus Time · IST
                </div>

                <div className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                  {clockTime || '00:00:00 AM'}
                </div>

                <div className="mt-1 text-sm text-blue-200">
                  {clockDate}
                </div>

                <div className="mt-5 inline-flex items-center gap-2 text-xs text-blue-200">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  Portal online
                </div>
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* About                                                             */}
          {/* ---------------------------------------------------------------- */}

          <section
            id="about"
            className="grid gap-5 md:grid-cols-3"
          >
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm md:col-span-2">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                About the Portal
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-blue-950">
                One institutional layer for student leadership.
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
                The portal is designed to make Council activities
                visible, organised and easier to operate. The public
                layer provides institutional information, while the
                authenticated workspace supports authorised Council
                operations.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
              <div className="text-3xl font-bold text-blue-950">
                {mergedEvents.length}
              </div>

              <div className="mt-1 text-sm font-semibold text-slate-700">
                Calendar records
              </div>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Annual institutional schedule combined with live
                Council entries.
              </p>
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Calendar                                                          */}
          {/* ---------------------------------------------------------------- */}

          <section
            id="calendar"
            className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="mb-6 flex flex-col gap-4 border-b border-slate-100 pb-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-lg"
                    aria-hidden="true"
                  >
                    📅
                  </span>

                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {hasTodayEvents
                      ? "Today's Schedule"
                      : 'Upcoming Schedule'}
                  </h2>
                </div>

                <p className="mt-1 text-xs text-slate-500 md:text-sm">
                  {hasTodayEvents
                    ? 'Activities scheduled for today on campus.'
                    : "No activities are scheduled for today. Here's what comes next."}
                </p>
              </div>

              <div>
                {hasTodayEvents ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold text-emerald-700">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    Live Today
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-700">
                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                    Upcoming Events
                  </span>
                )}
              </div>
            </div>

            {/* Error banner */}
            {eventsError && (
              <div
                role="status"
                className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
              >
                Live calendar data could not be reached. The
                institutional annual calendar is still being shown.
              </div>
            )}

            {/* Loading */}
            {eventsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-16 animate-pulse rounded-xl bg-slate-100"
                  />
                ))}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-hidden rounded-2xl border border-slate-100 md:block">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                        <th className="border-b border-slate-100 p-4">
                          Event / Program
                        </th>

                        <th className="border-b border-slate-100 p-4">
                          Category & Target
                        </th>

                        <th className="border-b border-slate-100 p-4 text-right">
                          Date & Venue
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100 text-sm">
                      {displayEvents.length > 0 ? (
                        displayEvents.map(renderEventRow)
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-10 text-center"
                          >
                            <div className="text-sm font-semibold text-slate-700">
                              No upcoming events listed.
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              The calendar will update when new
                              events are published.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="space-y-3 md:hidden">
                  {displayEvents.length > 0 ? (
                    displayEvents.map((event, index) => {
                      const styles = getCategoryStyles(
                        event.category
                      );

                      const relativeLabel = getRelativeLabel(
                        event.event_date,
                        todayString
                      );

                      const eventVenue =
                        event.venue || 'Campus';

                      return (
                        <article
                          key={`${event.title}-${event.event_date}-${index}`}
                          className={`rounded-2xl border p-4 ${
                            event.event_date === todayString
                              ? 'border-emerald-200 bg-emerald-50/40'
                              : 'border-slate-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex min-w-0 items-start gap-3">
                              <span
                                className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${styles.dot}`}
                              />

                              <div className="min-w-0">
                                <h3 className="font-semibold text-slate-900">
                                  {event.title}
                                </h3>

                                {event.time && (
                                  <p className="mt-1 text-xs text-slate-500">
                                    {event.time}
                                  </p>
                                )}
                              </div>
                            </div>

                            {relativeLabel && (
                              <span
                                className={`shrink-0 text-[10px] font-bold uppercase tracking-wide ${
                                  relativeLabel === 'Today'
                                    ? 'text-emerald-700'
                                    : 'text-slate-400'
                                }`}
                              >
                                {relativeLabel}
                              </span>
                            )}
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles.bg} ${styles.text} ${styles.border}`}
                            >
                              {event.category ||
                                'Council Event'}
                            </span>

                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                              {event.target ||
                                'School Community'}
                            </span>
                          </div>

                          <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">
                              {formatDate(event.event_date)}
                            </span>

                            <span className="mx-2">·</span>

                            {eventVenue}

                            {event.time && (
                              <>
                                <span className="mx-2">·</span>
                                {event.time}
                              </>
                            )}
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                      <div className="text-sm font-semibold text-slate-700">
                        No upcoming events listed.
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        The calendar will update when new events
                        are published.
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Leadership                                                        */}
          {/* ---------------------------------------------------------------- */}

          <section
            id="leadership"
            className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">
                Leadership
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-blue-950">
                Student leadership, structured for responsibility.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                The Council Portal provides a common operational
                layer for student leaders, authorised staff and
                institutional activities. Public information and
                internal operations remain separate.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: 'Leadership',
                  text: 'Council roles, responsibilities and institutional representation.',
                },
                {
                  title: 'Operations',
                  text: 'Events, tasks, meetings and initiatives in one workspace.',
                },
                {
                  title: 'Continuity',
                  text: 'A structured institutional record of Council activity.',
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5"
                >
                  <h3 className="font-semibold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Initiatives                                                       */}
          {/* ---------------------------------------------------------------- */}

          <section
            id="initiatives"
            className="rounded-[1.75rem] bg-blue-950 p-6 text-white shadow-sm md:p-8"
          >
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
              Initiatives
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight">
              From ideas to institutional memory.
            </h2>

            <p className="mt-4 max-w-3xl text-sm leading-7 text-blue-100">
              The portal is designed to eventually connect projects,
              tasks, meetings, outcomes, reports and archived
              documentation, so Council work does not disappear
              when the academic year changes.
            </p>

            <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                'Projects',
                'Tasks',
                'Meetings',
                'Archive',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white"
                >
                  {item}
                </div>
              ))}
            </div>
          </section>

          {/* ---------------------------------------------------------------- */}
          {/* Authenticated Workspace                                           */}
          {/* ---------------------------------------------------------------- */}

          {authChecked && session && (
            <section
              id="workspace"
              className="space-y-6 border-t border-slate-200 pt-10"
            >
              {/* Workspace header */}
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />

                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                      Council Workspace
                    </span>
                  </div>

                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-blue-950">
                    Welcome to the workspace.
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {session.user.email}
                  </p>
                </div>

                <div className="self-start rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:self-auto">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Access level
                  </div>

                  <div
                    className={`mt-1 text-sm font-semibold ${
                      isAuthorized
                        ? 'text-blue-950'
                        : 'text-red-700'
                    }`}
                  >
                    {userRole}
                  </div>
                </div>
              </div>

              {/* Unauthorized state */}
              {!isAuthorized ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
                  <h3 className="font-bold text-red-900">
                    Workspace access not authorised
                  </h3>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-red-800">
                    Your email has authenticated successfully, but
                    it is not currently listed in the Council
                    access registry. Authentication and authorization
                    are separate checks.
                  </p>

                  <p className="mt-3 text-xs text-red-700">
                    If you believe this is an error, contact the
                    authorised portal administrator.
                  </p>
                </div>
              ) : (
                <>
                  {/* Workspace navigation */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                    <div className="flex min-w-max gap-1">
                      {[
                        'Dashboard',
                        'Calendar',
                        'Announcements',
                        'Tasks',
                        'Projects',
                        'Meetings',
                        'Documents',
                      ].map((item, index) => (
                        <button
                          key={item}
                          type="button"
                          className={`rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                            index === 0
                              ? 'bg-blue-950 text-white'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-blue-950'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dashboard overview */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      {
                        label: 'Calendar Events',
                        value: supabaseEvents.length,
                      },
                      {
                        label: 'Upcoming',
                        value: upcomingEvents.length,
                      },
                      {
                        label: 'Role',
                        value: userRole,
                      },
                      {
                        label: 'System',
                        value: 'Online',
                      },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="text-xs font-medium text-slate-500">
                          {stat.label}
                        </div>

                        <div
                          className={`mt-2 font-bold ${
                            stat.label === 'Role'
                              ? 'text-lg text-blue-950'
                              : 'text-2xl text-blue-950'
                          }`}
                        >
                          {stat.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Event management */}
                  {canManageEvents && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                          Calendar Management
                        </p>

                        <h3 className="mt-1 text-xl font-bold text-slate-900">
                          Publish an event
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Required fields are marked with{' '}
                          <span className="font-bold text-red-500">
                            *
                          </span>
                          .
                        </p>
                      </div>

                      {renderFeedback(eventFeedback)}

                      <form
                        onSubmit={handleCreateEvent}
                        className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
                      >
                        <div>
                          <label
                            htmlFor="event-title"
                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                          >
                            Event Title{' '}
                            <span className="text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            id="event-title"
                            type="text"
                            value={newTitle}
                            onChange={(event) =>
                              setNewTitle(event.target.value)
                            }
                            placeholder="e.g. Council Meeting"
                            maxLength={120}
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="event-date"
                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                          >
                            Date{' '}
                            <span className="text-red-500">
                              *
                            </span>
                          </label>

                          <input
                            id="event-date"
                            type="date"
                            value={newDate}
                            min={todayString}
                            onChange={(event) =>
                              setNewDate(event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="event-category"
                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                          >
                            Category{' '}
                            <span className="text-red-500">
                              *
                            </span>
                          </label>

                          <select
                            id="event-category"
                            value={newCategory}
                            onChange={(event) =>
                              setNewCategory(
                                event.target
                                  .value as EventCategory
                              )
                            }
                            required
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                          >
                            <option value="Academic">
                              Academic
                            </option>
                            <option value="Cultural">
                              Cultural
                            </option>
                            <option value="Exams">
                              Exams
                            </option>
                            <option value="Sports">
                              Sports
                            </option>
                            <option value="Excursion">
                              Excursion
                            </option>
                            <option value="Flagship">
                              Flagship
                            </option>
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="event-target"
                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                          >
                            Target Audience
                          </label>

                          <input
                            id="event-target"
                            type="text"
                            value={newTarget}
                            onChange={(event) =>
                              setNewTarget(event.target.value)
                            }
                            placeholder="e.g. Grade 11 Council"
                            maxLength={100}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="event-venue"
                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                          >
                            Venue
                          </label>

                          <input
                            id="event-venue"
                            type="text"
                            value={newVenue}
                            onChange={(event) =>
                              setNewVenue(event.target.value)
                            }
                            placeholder="e.g. Conference Room"
                            maxLength={100}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="event-time"
                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                          >
                            Time / Range
                          </label>

                          <input
                            id="event-time"
                            type="text"
                            value={newTime}
                            onChange={(event) =>
                              setNewTime(event.target.value)
                            }
                            placeholder="e.g. 4:00 PM – 5:30 PM"
                            maxLength={100}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <button
                            type="submit"
                            disabled={publishing}
                            className="w-full rounded-lg bg-blue-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {publishing
                              ? 'Publishing…'
                              : 'Publish Event'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Live database events */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                          Live Database
                        </p>

                        <h3 className="mt-1 text-xl font-bold text-slate-900">
                          Published events
                        </h3>
                      </div>

                      <span className="text-xs font-medium text-slate-400">
                        {supabaseEvents.length} database record
                        {supabaseEvents.length === 1 ? '' : 's'}
                      </span>
                    </div>

                    <div className="mt-5 divide-y divide-slate-100">
                      {supabaseEvents.length > 0 ? (
                        supabaseEvents.map((event) => (
                          <div
                            key={event.id}
                            className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <div className="font-semibold text-slate-900">
                                {event.title}
                              </div>

                              <div className="mt-1 text-xs text-slate-500">
                                {formatDate(event.event_date)}
                                {' · '}
                                {event.venue || 'Campus'}
                                {event.time
                                  ? ` · ${event.time}`
                                  : ''}
                              </div>
                            </div>

                            <span
                              className={`self-start rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:self-auto ${
                                getCategoryStyles(
                                  event.category
                                ).bg
                              } ${
                                getCategoryStyles(
                                  event.category
                                ).text
                              } ${
                                getCategoryStyles(
                                  event.category
                                ).border
                              }`}
                            >
                              {event.category ||
                                'Council Event'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center">
                          <div className="text-sm font-semibold text-slate-700">
                            No live events have been published.
                          </div>

                          <div className="mt-1 text-xs text-slate-400">
                            The public annual calendar remains
                            available independently.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* Footer                                                              */}
      {/* ------------------------------------------------------------------ */}

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-slate-500 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <span className="font-semibold text-slate-700">
              VidyaGyan Council Portal
            </span>
            <span className="mx-2">·</span>
            Student Leadership
          </div>

          <div>
            2026–27 · Campus Time: IST
          </div>
        </div>
      </footer>

      {/* ------------------------------------------------------------------ */}
      {/* Sign-in modal                                                        */}
      {/* ------------------------------------------------------------------ */}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="signin-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false);
            }
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-lg leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-700"
              aria-label="Close sign-in dialog"
            >
              ×
            </button>

            <div className="pr-8">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                Council Workspace
              </p>

              <h2
                id="signin-title"
                className="mt-2 text-2xl font-bold tracking-tight text-slate-900"
              >
                Sign in to continue
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Authorised teachers and Council members can access
                the operational workspace using their official
                VidyaGyan email.
              </p>
            </div>

            <form
              onSubmit={handleLogin}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="school-email"
                  className="mb-1.5 block text-xs font-semibold text-slate-700"
                >
                  School Email
                </label>

                <input
                  id="school-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="username@vidyagyan.in"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  required
                  autoFocus
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full rounded-lg bg-blue-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loginLoading
                  ? 'Sending…'
                  : 'Send Magic Link'}
              </button>
            </form>

            {loginFeedback && (
              <div className="mt-4">
                {renderFeedback(loginFeedback)}
              </div>
            )}

            <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
              Access requires both successful authentication and
              authorised Council membership.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
