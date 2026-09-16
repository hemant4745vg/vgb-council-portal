"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lllmgmfofwczpqbmigey.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key-for-build";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Home() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venue, setVenue] = useState("");

  useEffect(() => {
    checkUser();
    fetchEvents();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data } = await supabase
        .from("allowed_users")
        .select("role")
        .eq("email", session.user.email)
        .single();
      if (data) setRole(data.role);
    }
  };

  const fetchEvents = async () => {
    const { data } = await supabase.from("calendar_events").select("*").order("event_date", { ascending: true });
    if (data) setEvents(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!email.toLowerCase().endsWith("@vidyagyan.in")) {
      setMessage("Error: Please use your official @vidyagyan.in school email.");
      setLoading(false);
      return;
    }

    const { data: whitelisted } = await supabase
      .from("allowed_users")
      .select("role")
      .eq("email", email.toLowerCase())
      .single();

    if (!whitelisted) {
      setMessage("Access Denied: Email not registered on the council whitelist.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: typeof window !== "undefined" ? window.location.origin : "" },
    });

    if (error) setMessage(`Error: ${error.message}`);
    else setMessage("Magic link sent! Check your inbox.");
    setLoading(false);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !eventDate) return;

    const { error } = await supabase.from("calendar_events").insert([
      { title, event_date: eventDate, venue, created_by: user.email }
    ]);

    if (!error) {
      setTitle("");
      setEventDate("");
      setVenue("");
      fetchEvents();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <header className="bg-blue-900 text-white p-6 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Vidyagyan Council Portal</h1>
          <p className="text-xs text-blue-200">Honour Secretariat & Student Leadership</p>
        </div>
        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm bg-blue-800 px-3 py-1 rounded-full">{user.email} ({role})</span>
            <button
              onClick={() => supabase.auth.signOut().then(() => setUser(null))}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm font-semibold"
            >
              Sign Out
            </button>
          </div>
        ) : null}
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          {!user ? (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-lg font-bold mb-2">Council Sign In</h2>
              <p className="text-xs text-gray-500 mb-4">Authorized teachers and council members only.</p>
              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="email"
                  placeholder="name@vidyagyan.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm"
                >
                  {loading ? "Verifying..." : "Send Magic Link"}
                </button>
              </form>
              {message && <p className="mt-3 text-xs text-center p-2 rounded bg-gray-100">{message}</p>}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-xl border shadow-sm">
              <h2 className="text-lg font-bold mb-4">Add Calendar Event</h2>
              <form onSubmit={handleAddEvent} className="space-y-3">
                <input
                  type="text"
                  placeholder="Event Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                  required
                />
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Venue"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="w-full p-2 border rounded-lg text-sm"
                />
                <button type="submit" className="w-full bg-green-600 text-white font-semibold py-2 rounded-lg text-sm">
                  Publish Event
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-lg font-bold mb-4">Upcoming Events Calendar</h2>
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-gray-400 text-sm italic">No events posted yet.</p>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="p-3 border-b flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-sm">{ev.title}</h3>
                      <p className="text-xs text-gray-500">{new Date(ev.event_date).toLocaleDateString()} — {ev.venue || "TBA"}</p>
                    </div>
                    {ev.created_by && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded">{ev.created_by}</span>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
