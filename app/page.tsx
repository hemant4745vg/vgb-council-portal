'use client';
import { useEffect, useMemo, useState } from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
/* =========================================================
   SUPABASE
========================================================= */
const supabase = createClient(
  'https://lllmgmfofwczpqbmigey.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsbG1nbWZvZndjenBxYm1pZ2V5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss'
);
/* =========================================================
   TYPES
========================================================= */
type Category =
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
  description?: string;
  event_time?: string;
  category?: Category;
  created_by?: string;
  venue?: string;
  target?: string;
  time?: string;
}
interface MenuDay {
  breakfast: string;
  morningSnack: string;
  lunch: string;
  eveningSnack: string;
  dinner: string;
}
interface MealPeriod {
  key: keyof MenuDay;
  label: string;
  time: string;
  icon: string;
}
/* =========================================================
   ANNUAL CALENDAR
   Source: Vidyagyan Bulandshahr Annual Calendar 2026–27
========================================================= */
const ANNUAL_EVENTS: CalendarEvent[] = [
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
/* =========================================================
   MESS MENU
   Source: Summer Menu 17-08-2026
========================================================= */
const MENU_DATA: Record<string, MenuDay> = {
  Monday: {
    breakfast:
      'Boiled egg + 2 full Aloo Sandwich + Sweet Daliya + Banana, Chutney',
    morningSnack:
      'Squash and Veg. Patties',
    lunch:
      'Rajma Dal, Jeera Aloo, Chapati, Jeera Rice, Raita & Chilli onion as salad',
    eveningSnack:
      'Roasted peanut chat with Squash / Pasta',
    dinner:
      'Dal Makhni / Arhar Dal, Seasonal Veg., Wheat Roti, Rice, Onion Cucumber',
  },
  Tuesday: {
    breakfast:
      'Vada – 2, Idli PS – 2 Nos., Sambhar and Coconut Chutney (Rawa Idli)',
    morningSnack:
      'Samosa and Jaljeera (made in house)',
    lunch:
      'Mix Dal Fry, Any Green Leafy Vegetable, Wheat Roti, Rice, Jeera Raita',
    eveningSnack:
      'Cold Milk and bakery cookies',
    dinner:
      'Seasonal Veg. or Ramas Aloo Sabzi / Jeera Aloo, Chana Dal, Wheat Chapati, Rice and Seasonal Salad + Besan Ladoo',
  },
  Wednesday: {
    breakfast:
      'Puri with Aloo tomato / Black Channa ki sabji + Dahi',
    morningSnack:
      'Boiled Chana Chat & Squash PS – 1 cup',
    lunch:
      'Any seasonal veg., Dal, Rice, Roti, and cut cucumbers and onions (not mixed), Raita',
    eveningSnack:
      'Cut fruit one bowl – papaya, watermelon / guava or seasonal fruits',
    dinner:
      'Veg. Manchurian, Fried Rice, Noodles, Chilli Paneer, Fruit Custard / Ice-cream',
  },
  Thursday: {
    breakfast:
      '1. Poha with Peanut Butter Sandwich + Cold Coffee  2. Poha with Cornflakes + Hot Milk, & (Boiled egg / Banana for Veg. & N-veg.)',
    morningSnack:
      'Coconut Cookies / Bounce with flavoured milk',
    lunch:
      'Chole, Seasonal Veg., Jeera Rice, Chapati, Papad, Onion Salad',
    eveningSnack:
      'Macroni',
    dinner:
      'Soya bean Sabzi or Soya Chap, Mix Dal, Wheat Roti, Rice and Seasonal Salad + Kheer',
  },
  Friday: {
    breakfast:
      'Pav Bhaji (Pav must be heated in butter), Milk Porridge and Chutney',
    morningSnack:
      'Muffin Chocolate / Vanilla with Squash (Vanilla muffin once in a month)',
    lunch:
      'Tehri, Seasonal Veg. Gravy, Wheat Roti, Onion, Cucumber / Jeera Raita',
    eveningSnack:
      'Veg. S/w (cucumber and tomato with cheese) with Squash / Golgappa & Channa & Potato',
    dinner:
      'Paneer Curry / Chicken Curry, Dal, Wheat Chapati, Rice, Seasonal and Salad OR Veg/non-veg Biryani with Tomato chutney with dal and chapatti, Gulab Jamun / White Rasgulla once in a month',
  },
  Saturday: {
    breakfast:
      'Chole Kulcha 3 (3–5 for senior students), coffee',
    morningSnack:
      'Flavour Chocolate Milk & Rusk PS – 3 pcs',
    lunch:
      'Lobhiya, Rice, Chapati, Mixed Veg., Salad, Papad',
    eveningSnack:
      'Bhelpuri with Lemon water',
    dinner:
      'Seasonal Veg., Arhar Dal, Wheat Roti, Rice, Seasonal Salad',
  },
  Sunday: {
    breakfast:
      'Plain paratha with Aloo tomato ki sabji',
    morningSnack:
      'Cream Roll – 1 Pc / Seasonal Fruits (No Banana)',
    lunch:
      'Lauki Chana Dal, Seasonal Veg. Sukha, Wheat Chapati, Rice, Raita and Seasonal Salad',
    eveningSnack:
      'Dhokla with Squash / Papri Chat',
    dinner:
      'Paneer Curry / Egg Curry, Dal, Wheat Chapati, Rice, Salad',
  },
};
const MEAL_PERIODS: MealPeriod[] = [
  {
    key: 'breakfast',
    label: 'Breakfast',
    time: '7:15 AM',
    icon: '☀',
  },
  {
    key: 'morningSnack',
    label: 'Morning Snack',
    time: '11:00 AM',
    icon: '◌',
  },
  {
    key: 'lunch',
    label: 'Lunch',
    time: '2:00 PM',
    icon: '🍽',
  },
  {
    key: 'eveningSnack',
    label: 'Evening Snack',
    time: '5:15 PM',
    icon: '◒',
  },
  {
    key: 'dinner',
    label: 'Dinner',
    time: '7:15 PM',
    icon: '☾',
  },
];
const MEAL_SCHEDULE = [
  { label: 'Breakfast', start: '07:15', duration: 55 },
  { label: 'Mid Day Fuel', start: '11:00', duration: 20 },
  { label: 'Lunch', start: '14:00', duration: 60 },
  { label: 'Evening Snacks', start: '17:15', duration: 30 },
  { label: 'Dinner', start: '19:15', duration: 75 },
];
/* =========================================================
   CONSTANTS
========================================================= */
const DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];
const CATEGORY_FILTERS = [
  'All',
  'Academic',
  'Cultural',
  'Exams',
  'Sports',
  'Excursion',
  'Flagship',
];
/* =========================================================
   HELPERS
========================================================= */
function getIndiaNow() {
  return new Date(
    new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Kolkata',
    })
  );
}
function getIndiaDateString() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
  }).format(new Date());
}
function getIndiaDayName() {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
  }).format(new Date());
}
function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
function getCategoryStyles(category?: string) {
  switch (category?.toLowerCase()) {
    case 'flagship':
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-800',
        dot: 'bg-amber-500',
      };
    case 'cultural':
      return {
        bg: 'bg-rose-100',
        text: 'text-rose-800',
        dot: 'bg-rose-500',
      };
    case 'academic':
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        dot: 'bg-blue-500',
      };
    case 'exams':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-800',
        dot: 'bg-purple-500',
      };
    case 'sports':
      return {
        bg: 'bg-emerald-100',
        text: 'text-emerald-800',
        dot: 'bg-emerald-500',
      };
    case 'excursion':
      return {
        bg: 'bg-cyan-100',
        text: 'text-cyan-800',
        dot: 'bg-cyan-500',
      };
    default:
      return {
        bg: 'bg-indigo-100',
        text: 'text-indigo-800',
        dot: 'bg-indigo-500',
      };
  }
}
function getCurrentMealStatus() {
  const now = getIndiaNow();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const schedule = MEAL_SCHEDULE.map((item) => {
    const [hour, minute] = item.start.split(':').map(Number);
    const start = hour * 60 + minute;
    return {
      ...item,
      startMinutes: start,
      endMinutes: start + item.duration,
    };
  });
  const current = schedule.find(
    (item) =>
      minutes >= item.startMinutes &&
      minutes < item.endMinutes
  );
  if (current) {
    return {
      status: 'Serving Now',
      meal: current.label,
      active: true,
    };
  }
  const next = schedule.find((item) => minutes < item.startMinutes);
  if (next) {
    return {
      status: 'Next Meal',
      meal: next.label,
      active: false,
    };
  }
  return {
    status: 'Kitchen Closed',
    meal: 'Tomorrow’s breakfast',
    active: false,
  };
}
/* =========================================================
   STUDENT COUNCIL 2026–27
========================================================= */
const SCHOOL_COUNCIL = [
  { role: 'Head Boy', primary: 'Vinay Kumar Maurya', secondaryRole: 'Vice Head Boy', secondary: 'Abhimanyu Singh' },
  { role: 'Head Girl', primary: 'Satakshi Gangwar', secondaryRole: 'Vice Head Girl', secondary: 'Kirti Singh' },
  { role: 'Sports Captain · Boy', primary: 'Nitin', secondaryRole: 'Vice Sports Captain · Boy', secondary: 'Abhimanyu' },
  { role: 'Sports Captain · Girl', primary: 'To be confirmed', secondaryRole: 'Vice Sports Captain · Girl', secondary: 'Nainshee Mishra' },
  { role: 'Honour Secretary · Boy', primary: 'Krish', secondaryRole: 'Joint Honour Secretary · Boy', secondary: 'Hemant Rathore' },
  { role: 'Honour Secretary · Girl', primary: 'Pravesh', secondaryRole: 'Joint Honour Secretary · Girl', secondary: 'Tejaswani' },
  { role: 'Cultural Secretary · Boy', primary: 'Dheeraj', secondaryRole: 'Joint Cultural Secretary · Boy', secondary: 'Aditya Mauya' },
  { role: 'Cultural Secretary · Girl', primary: 'To be confirmed', secondaryRole: 'Joint Cultural Secretary · Girl', secondary: 'Satakshi Sharma' },
];
const HOUSE_LEADERSHIP = [
  { name: 'Jal', color: 'blue', captainBoy: 'Sachin Sahani', captainGirl: 'To be confirmed', viceBoy: 'Harshit Yadav', viceGirl: 'Aditi Singh' },
  { name: 'Vayu', color: 'yellow', captainBoy: 'Himanshu Kumar Gautam', captainGirl: 'To be confirmed', viceBoy: 'Rishabh Yadav', viceGirl: 'Jigyasa Rajawat' },
  { name: 'Agni', color: 'red', captainBoy: 'To be confirmed', captainGirl: 'To be confirmed', viceBoy: 'Krishna Kumar Dwivedi', viceGirl: 'Divya' },
  { name: 'Prithvi', color: 'green', captainBoy: 'To be confirmed', captainGirl: 'To be confirmed', viceBoy: 'Ritesh Pal', viceGirl: 'Vedika Singh' },
];
/* =========================================================
   SMALL COMPONENTS
========================================================= */
function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-2xl md:text-3xl font-bold tracking-tight text-blue-950">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm leading-6 text-slate-500 max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
/* =========================================================
   MAIN
========================================================= */
export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState('Council Member');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clockTime, setClockTime] = useState('');
  const [clockDate, setClockDate] = useState('');
  const [supabaseEvents, setSupabaseEvents] = useState<CalendarEvent[]>([]);
  const [calendarCategory, setCalendarCategory] = useState('All');
  const [calendarSearch, setCalendarSearch] = useState('');
  const [selectedMenuDay, setSelectedMenuDay] = useState('Monday');
  const [mealStatus, setMealStatus] = useState(
    getCurrentMealStatus()
  );
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] =
    useState<Category>('Academic');
  /* =======================================================
     CLOCK + AUTH + EVENTS
  ======================================================= */
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setClockTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      setClockDate(
        now.toLocaleDateString('en-US', {
          timeZone: 'Asia/Kolkata',
          weekday: 'long',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
      setMealStatus(getCurrentMealStatus());
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    supabase.auth.getSession().then(
      ({ data: { session } }) => {
        setSession(session);
        if (session?.user?.email) {
          fetchUserRole(session.user.email);
        }
      }
    );
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session?.user?.email) {
          fetchUserRole(session.user.email);
        }
      }
    );
    fetchEvents();
    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);
  /* =======================================================
     CURRENT MENU DAY
  ======================================================= */
  useEffect(() => {
    const today = getIndiaDayName();
    if (DAYS.includes(today)) {
      setSelectedMenuDay(today);
    }
  }, []);
  /* =======================================================
     USER ROLE
  ======================================================= */
  const fetchUserRole = async (userEmail: string) => {
    const { data, error } = await supabase
      .from('allowed_users')
      .select('role')
      .eq('email', userEmail.toLowerCase())
      .single();
    if (error) {
      console.error('Unable to fetch user role:', error);
      return;
    }
    if (data?.role) {
      setUserRole(data.role);
    }
  };
  /* =======================================================
     FETCH DATABASE EVENTS
  ======================================================= */
  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('event_date', { ascending: true });
    if (error) {
      console.error(
        'Unable to fetch calendar events:',
        error
      );
      return;
    }
    if (!data) {
      return;
    }
    const formattedEvents: CalendarEvent[] = data.map(
      (event: any) => ({
        id: event.id,
        title: event.title,
        event_date: event.event_date,
        description: event.description,
        event_time: event.event_time,
        category: event.category,
        created_by: event.created_by,
        venue: event.description || 'Campus',
        target: event.target || 'All Students',
        time: event.event_time || '',
      })
    );
    setSupabaseEvents(formattedEvents);
  };
  /* =======================================================
     MERGED CALENDAR
  ======================================================= */
  const mergedCalendar = useMemo(() => {
    const merged = [...ANNUAL_EVENTS, ...supabaseEvents];
    return merged
      .filter((event) => event.event_date)
      .filter((event) => {
        const matchesCategory =
          calendarCategory === 'All' ||
          event.category === calendarCategory;
        const query = calendarSearch.trim().toLowerCase();
        const matchesSearch =
          !query ||
          event.title.toLowerCase().includes(query) ||
          (event.target || '').toLowerCase().includes(query) ||
          (event.venue || '').toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) =>
        a.event_date.localeCompare(b.event_date)
      );
  }, [
    supabaseEvents,
    calendarCategory,
    calendarSearch,
  ]);
  const today = getIndiaDateString();
  const upcomingEvents = useMemo(() => {
    return [...ANNUAL_EVENTS, ...supabaseEvents]
      .filter((event) => event.event_date >= today)
      .sort((a, b) =>
        a.event_date.localeCompare(b.event_date)
      )
      .slice(0, 6);
  }, [supabaseEvents, today]);
  const todayEvents = useMemo(() => {
    return [...ANNUAL_EVENTS, ...supabaseEvents].filter(
      (event) => event.event_date === today
    );
  }, [supabaseEvents, today]);
  /* =======================================================
     LOGIN
  ======================================================= */
  const handleLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const formattedEmail = email.trim().toLowerCase();
    if (!formattedEmail.endsWith('@vidyagyan.in')) {
      setMessage(
        'Access denied. Use an official @vidyagyan.in school email.'
      );
      setLoading(false);
      return;
    }
    const { error } =
      await supabase.auth.signInWithOtp({
        email: formattedEmail,
        options: {
          emailRedirectTo:
            'https://vgb-student-council-portal.vercel.app',
        },
      });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        'Magic link sent. Check your Outlook inbox.'
      );
    }
    setLoading(false);
  };
  /* =======================================================
     CREATE EVENT
  ======================================================= */
  const handleCreateEvent = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    if (!session) {
      setMessage('You must be signed in.');
      return;
    }
    if (!newTitle || !newDate || !newCategory) {
      setMessage(
        'Please complete the required event fields.'
      );
      return;
    }
    const { error } =
      await supabase.from('calendar_events').insert([
        {
          title: newTitle.trim(),
          description: newVenue.trim() || null,
          event_date: newDate,
          event_time: newTime.trim() || null,
          category: newCategory,
          created_by:
            session.user.email || null,
          target: newTarget.trim() || null,
        },
      ]);
    if (error) {
      setMessage(
        `Unable to publish event: ${error.message}`
      );
      return;
    }
    setNewTitle('');
    setNewDate('');
    setNewVenue('');
    setNewTarget('');
    setNewTime('');
    setNewCategory('Academic');
    setMessage('Event published successfully.');
    await fetchEvents();
  };
  /* =======================================================
     LOGOUT
  ======================================================= */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUserRole('Council Member');
  };
  /* =======================================================
     MENU
  ======================================================= */
  const selectedMenu = MENU_DATA[selectedMenuDay];
  /* =======================================================
     RENDER
  ======================================================= */
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0,_#f7f8f5_42%,_#eef2ef_100%)] text-slate-900 font-sans scroll-smooth">
      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-[#f7f8f5]/90 shadow-[0_1px_12px_rgba(15,23,42,0.04)] backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 lg:px-8">
          <div className="h-[72px] flex items-center justify-between gap-5">
            <a
              href="#home"
              className="flex items-center gap-3 shrink-0"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-sm">
                  VG
                </span>
              </div>
              <div>
                <div className="text-[15px] font-bold tracking-tight text-blue-950">
                  VidyaGyan Portal
                </div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  Bulandshahr · 2026–27
                </div>
              </div>
            </a>
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a
                href="#home"
                className="hover:text-blue-950 transition"
              >
                Home
              </a>
              <a
                href="#schedule"
                className="hover:text-blue-950 transition"
              >
                Schedule
              </a>
              <a
                href="#mess"
                className="hover:text-blue-950 transition"
              >
                Mess
              </a>
              <a
                href="#activities"
                className="hover:text-blue-950 transition"
              >
                Activities
              </a>
              <a
                href="#calendar"
                className="hover:text-blue-950 transition"
              >
                Calendar
              </a>
              <a
                href="#council"
                className="hover:text-blue-950 transition"
              >
                Council
              </a>
              <a
                href="#leadership"
                className="hover:text-blue-950 transition"
              >
                Leadership
              </a>
            </nav>
            {session ? (
              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden xl:block text-right mr-2">
                  <div className="text-xs font-semibold text-slate-800">
                    {session.user.email}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {userRole}
                  </div>
                </div>
                <a
                  href="#workspace"
                  className="hidden sm:inline-flex px-3.5 py-2 rounded-lg bg-blue-950 text-white text-xs font-semibold hover:bg-blue-900 transition"
                >
                  Workspace
                </a>
                <button
                  onClick={handleLogout}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 rounded-lg bg-blue-950 text-white text-xs font-semibold hover:bg-blue-900 transition"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>
      {/* =====================================================
          MAIN
      ===================================================== */}
      <main
        id="home"
        className="max-w-7xl mx-auto px-5 lg:px-8 py-7 lg:py-10"
      >
        {/* ===================================================
            HERO
        =================================================== */}
        <section className="relative overflow-hidden rounded-[2rem] bg-blue-950 text-white shadow-xl">
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="absolute right-[-100px] top-[-100px] h-[380px] w-[380px] rounded-full border border-white/30" />
            <div className="absolute right-[-30px] top-[-30px] h-[230px] w-[230px] rounded-full border border-white/20" />
            <div className="absolute left-[-100px] bottom-[-160px] h-[350px] w-[350px] rounded-full border border-emerald-300/20" />
          </div>
          <div className="relative grid lg:grid-cols-[1fr_auto] gap-10 items-end px-7 py-10 md:px-12 md:py-14">
            <div className="max-w-3xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-300 mb-5">
                VidyaGyan Bulandshahr
              </p>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.04]">
                One portal for
                <br />
                campus life.
              </h1>
              <p className="mt-6 max-w-2xl text-sm md:text-base leading-7 text-blue-100">
                A unified student-facing platform for schedules,
                campus events, mess information, activities,
                announcements, resources and student leadership.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#schedule"
                  className="inline-flex items-center justify-center rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-950 hover:bg-slate-100 transition"
                >
                  View Today
                </a>
                <a
                  href="#mess"
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15 transition"
                >
                  Today&apos;s Menu
                </a>
                <a
                  href="#calendar"
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white hover:bg-white/15 transition"
                >
                  Calendar
                </a>
              </div>
            </div>
            <div className="lg:min-w-[245px] lg:text-right">
              <div className="text-[10px] uppercase tracking-[0.2em] text-blue-300">
                Campus Time
              </div>
              <div className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
                {clockTime || '--:--:--'}
              </div>
              <div className="mt-1 text-sm text-blue-200">
                {clockDate}
              </div>
              <div className="mt-5 inline-flex items-center gap-2 text-xs text-blue-200">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                India Standard Time
              </div>
            </div>
          </div>
        </section>
        {/* ===================================================
            TODAY STRIP
        =================================================== */}
        <section
          id="schedule"
          className="mt-6 grid md:grid-cols-3 gap-4"
        >
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                Today
              </span>
              <span className="text-xs text-slate-400">
                {today}
              </span>
            </div>
            <div className="mt-3 text-xl font-bold text-blue-950">
              {todayEvents.length > 0
                ? `${todayEvents.length} campus event${todayEvents.length > 1 ? 's' : ''}`
                : 'Regular campus day'}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {todayEvents.length > 0
                ? todayEvents.map((e) => e.title).join(' · ')
                : 'No annual-calendar event is recorded for today.'}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-700">
                Mess
              </span>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  mealStatus.active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {mealStatus.status}
              </span>
            </div>
            <div className="mt-3 text-xl font-bold text-blue-950">
              {mealStatus.meal}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Follow the live meal schedule below.
            </p>
          </div>
          <div className="bg-blue-950 rounded-2xl p-5 text-white shadow-sm">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
              Next Up
            </div>
            <div className="mt-3 text-xl font-bold">
              {upcomingEvents[0]?.title || 'No upcoming event'}
            </div>
            <p className="mt-1 text-sm text-blue-200">
              {upcomingEvents[0]
                ? formatDate(upcomingEvents[0].event_date)
                : 'Calendar is clear'}
            </p>
          </div>
        </section>
        {/* ===================================================
            QUICK ACCESS
        =================================================== */}
        <section className="mt-10">
          <SectionHeading
            eyebrow="Quick Access"
            title="Everything students actually need."
            description="The portal separates immediate daily information from longer-term reference material. Humanity has finally discovered that navigation matters."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                title: 'Arrangements',
                description: 'Daily campus arrangements and notices.',
                href: '#arrangements',
                icon: '▦',
              },
              {
                title: 'Academic Timetable',
                description: 'Academic schedule and routine reference.',
                href: '#academic',
                icon: '⌘',
              },
              {
                title: 'Mess Menu',
                description: 'Today and full weekly meal plan.',
                href: '#mess',
                icon: '◉',
              },
              {
                title: 'Events Calendar',
                description: 'Annual and live campus events.',
                href: '#calendar',
                icon: '□',
              },
            ].map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="group bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-blue-950 font-bold">
                  {item.icon}
                </div>
                <h3 className="mt-4 font-bold text-blue-950">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {item.description}
                </p>
                <div className="mt-4 text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  Open →
                </div>
              </a>
            ))}
          </div>
        </section>
        {/* ===================================================
            MESS MENU
        =================================================== */}
        <section
          id="mess"
          className="mt-12 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Mess Menu"
            title="Fuel for body & mind."
            description="The weekly campus mess menu, presented by day and meal period."
            action={
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                {mealStatus.status}
              </div>
            }
          />
          <div className="bg-white rounded-[1.75rem] border border-slate-200/80 shadow-sm overflow-hidden">
            {/* Menu Header */}
            <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50 px-6 md:px-8 py-7 border-b border-orange-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-700">
                    Kitchen Open
                  </p>
                  <h3 className="mt-2 text-2xl md:text-3xl font-bold text-blue-950">
                    Weekly Mess Menu
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Select a day to view the complete menu.
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-xs text-slate-400">
                    Current meal
                  </div>
                  <div className="mt-1 font-bold text-orange-700">
                    {mealStatus.meal}
                  </div>
                </div>
              </div>
            </div>
            {/* Day Tabs */}
            <div className="px-4 md:px-6 pt-5 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {DAYS.map((day) => {
                  const active =
                    selectedMenuDay === day;
                  const todayDay =
                    getIndiaDayName() === day;
                  return (
                    <button
                      key={day}
                      onClick={() =>
                        setSelectedMenuDay(day)
                      }
                      className={`relative px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                        active
                          ? 'bg-blue-950 text-white shadow-sm'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {day}
                      {todayDay && (
                        <span
                          className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                            active
                              ? 'bg-emerald-400'
                              : 'bg-emerald-500'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Menu Cards */}
            <div className="p-5 md:p-7">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MEAL_PERIODS.map((meal) => {
                  const items =
                    selectedMenu[meal.key];
                  return (
                    <div
                      key={meal.key}
                      className="rounded-2xl border border-slate-200 p-5 hover:border-slate-300 transition"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-700 flex items-center justify-center text-sm">
                              {meal.icon}
                            </span>
                            <div>
                              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                {meal.label}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {meal.time}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="mt-5 text-sm leading-6 text-slate-700">
                        {items}
                      </p>
                    </div>
                  );
                })}
              </div>
              {/* Meal timings */}
              <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-5">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  Daily Meal Schedule
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
                  {MEAL_SCHEDULE.map((meal) => (
                    <div
                      key={meal.label}
                      className="bg-white rounded-xl border border-slate-200 p-3"
                    >
                      <div className="text-xs font-semibold text-blue-950">
                        {meal.label}
                      </div>
                      <div className="mt-1 text-[11px] text-slate-500">
                        {meal.start}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* ===================================================
            SCHOOL SERVICES
        =================================================== */}
        <section className="mt-12" id="arrangements">
          <SectionHeading
            eyebrow="School Services"
            title="Campus information, organised."
            description="These sections form the wider school portal. They can later be connected to their respective live school data sources."
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: 'arrangements',
                title: 'Arrangements',
                label: 'Daily',
                text: 'Campus arrangements, special instructions and operational notices.',
              },
              {
                id: 'academic',
                title: 'Academic Timetable',
                label: 'Academic',
                text: 'Academic timetable and class-related schedule information.',
              },
              {
                id: 'normal-routine',
                title: 'Normal Routine',
                label: 'Routine',
                text: 'Reference for the regular daily school routine.',
              },
              {
                id: 'evening-prep',
                title: 'Evening Prep',
                label: 'Evening',
                text: 'Evening preparation schedule and relevant campus information.',
              },
            ].map((item) => (
              <div
                key={item.id}
                id={item.id}
                className="scroll-mt-24 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">
                    {item.label}
                  </span>
                  <span className="text-xs text-slate-300">
                    →
                  </span>
                </div>
                <h3 className="mt-4 font-bold text-blue-950">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-5 text-slate-500">
                  {item.text}
                </p>
                <div className="mt-4 text-[11px] font-semibold text-slate-400">
                  School data integration
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* ===================================================
            SATURDAY / SUNDAY
        =================================================== */}
        <section className="mt-12">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-white rounded-[1.5rem] border border-slate-200/80 p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
                Weekend
              </p>
              <h3 className="mt-2 text-xl font-bold text-blue-950">
                Saturday Routine
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dedicated space for Saturday arrangements,
                activities, sports and the weekend campus schedule.
              </p>
              <a
                href="#mess"
                onClick={() =>
                  setSelectedMenuDay('Saturday')
                }
                className="inline-flex mt-5 text-xs font-semibold text-blue-950"
              >
                View Saturday Menu →
              </a>
            </div>
            <div className="bg-white rounded-[1.5rem] border border-slate-200/80 p-6 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700">
                Weekend
              </p>
              <h3 className="mt-2 text-xl font-bold text-blue-950">
                Sunday Routine
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Dedicated space for Sunday arrangements,
                activities and campus information.
              </p>
              <a
                href="#mess"
                onClick={() =>
                  setSelectedMenuDay('Sunday')
                }
                className="inline-flex mt-5 text-xs font-semibold text-blue-950"
              >
                View Sunday Menu →
              </a>
            </div>
          </div>
        </section>
        {/* ===================================================
            CALENDAR
        =================================================== */}
        <section
          id="calendar"
          className="mt-12 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Events Calendar"
            title="What is happening next."
            description="Annual calendar events are combined with events published through the authenticated portal workspace."
            action={
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                Live + Annual Calendar
              </span>
            }
          />
          {/* Filters */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 md:p-5 mb-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="search"
                  value={calendarSearch}
                  onChange={(e) =>
                    setCalendarSearch(e.target.value)
                  }
                  placeholder="Search events, targets or venues..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {CATEGORY_FILTERS.map((category) => (
                  <button
                    key={category}
                    onClick={() =>
                      setCalendarCategory(category)
                    }
                    className={`shrink-0 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                      calendarCategory === category
                        ? 'bg-blue-950 text-white'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Upcoming */}
          <div className="bg-white rounded-[1.75rem] border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="px-6 md:px-8 py-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-blue-950">
                    Upcoming Schedule
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    {mergedCalendar.length} matching event
                    {mergedCalendar.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <a
                  href="#calendar"
                  className="text-xs font-semibold text-blue-950"
                >
                  Full calendar
                </a>
              </div>
            </div>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4">
                      Event
                    </th>
                    <th className="p-4">
                      Category
                    </th>
                    <th className="p-4">
                      Target
                    </th>
                    <th className="p-4 text-right">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mergedCalendar.map(
                    (event, index) => {
                      const styles =
                        getCategoryStyles(
                          event.category
                        );
                      return (
                        <tr
                          key={`${event.id ?? event.title}-${index}`}
                          className="hover:bg-slate-50/70 transition"
                        >
                          <td className="p-4">
                            <div className="flex items-start gap-3">
                              <span
                                className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${styles.dot}`}
                              />
                              <div>
                                <div className="font-semibold text-sm text-slate-800">
                                  {event.title}
                                </div>
                                <div className="mt-1 text-xs text-slate-400">
                                  {event.venue || 'Campus'}
                                  {event.time &&
                                    ` · ${event.time}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold ${styles.bg} ${styles.text}`}
                            >
                              {event.category ||
                                'Campus'}
                            </span>
                          </td>
                          <td className="p-4 text-xs text-slate-500">
                            {event.target ||
                              'All Students'}
                          </td>
                          <td className="p-4 text-right">
                            <div className="text-sm font-medium text-slate-700">
                              {formatDate(
                                event.event_date
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
            <div className="md:hidden p-4 space-y-3">
              {mergedCalendar.map(
                (event, index) => {
                  const styles =
                    getCategoryStyles(
                      event.category
                    );
                  return (
                    <div
                      key={`${event.id ?? event.title}-mobile-${index}`}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${styles.dot}`}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-slate-800">
                            {event.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${styles.bg} ${styles.text}`}
                            >
                              {event.category ||
                                'Campus'}
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
                              {event.target ||
                                'All Students'}
                            </span>
                          </div>
                          <div className="mt-3 text-xs text-slate-500">
                            <span className="font-medium text-slate-700">
                              {formatDate(
                                event.event_date
                              )}
                            </span>
                            <span className="mx-2">
                              ·
                            </span>
                            {event.venue ||
                              'Campus'}
                            {event.time && (
                              <>
                                <span className="mx-2">
                                  ·
                                </span>
                                {event.time}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
              {mergedCalendar.length === 0 && (
                <div className="p-8 text-center text-sm text-slate-400">
                  No matching events found.
                </div>
              )}
            </div>
          </div>
        </section>
        {/* ===================================================
            ACTIVITIES
        =================================================== */}
        <section
          id="activities"
          className="mt-12 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Activity Portal"
            title="Student life beyond the timetable."
            description="A central landing space for clubs, competitions, cultural programmes, sports and student-led initiatives."
          />
          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                title: 'Sports',
                text: 'Inter-house competitions, practice schedules, sports events and campus athletics.',
                label: 'Competition',
              },
              {
                title: 'Cultural & Literary',
                text: 'Lit fests, recitations, music, theatre, arts and cultural programmes.',
                label: 'Expression',
              },
              {
                title: 'Student Initiatives',
                text: 'Student-led projects, leadership programmes, social initiatives and campus activities.',
                label: 'Leadership',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-[1.5rem] border border-slate-200/80 p-6 shadow-sm"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  {item.label}
                </span>
                <h3 className="mt-3 text-xl font-bold text-blue-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {item.text}
                </p>
                <div className="mt-5 text-xs font-semibold text-slate-400">
                  Activity Portal
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* ===================================================
            ANNOUNCEMENTS
        =================================================== */}
        <section className="mt-12">
          <SectionHeading
            eyebrow="Announcements"
            title="Important information, without the noise."
            description="This area is ready to become the central announcement stream once the announcements table is connected."
          />
          <div className="bg-white rounded-[1.5rem] border border-slate-200/80 p-6 md:p-8">
            <div className="grid md:grid-cols-[auto_1fr_auto] gap-5 items-center">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-950 font-bold">
                !
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
                  Portal Infrastructure
                </div>
                <h3 className="mt-1 font-bold text-blue-950">
                  Announcements will live here.
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Staff or authorised student leaders can eventually publish
                  notices with priority, audience, expiry date and attachments.
                </p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                Coming online
              </span>
            </div>
          </div>
        </section>
        {/* ===================================================
            LEADERSHIP
        =================================================== */}
        <section
          id="leadership"
          className="mt-12 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Student Leadership"
            title="Leadership as an institution."
            description="The portal connects public information with the operational work behind student leadership."
          />
          <div className="grid md:grid-cols-3 gap-5">
            <div className="bg-blue-950 rounded-[1.5rem] p-7 text-white">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">
                Council
              </div>
              <h3 className="mt-4 text-2xl font-bold">
                Student Leadership
              </h3>
              <p className="mt-3 text-sm leading-6 text-blue-200">
                Roles, responsibilities, structures and student
                representation.
              </p>
            </div>
            <div className="bg-white rounded-[1.5rem] border border-slate-200/80 p-7 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                Initiatives
              </div>
              <h3 className="mt-4 text-2xl font-bold text-blue-950">
                Projects
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Student-led projects can move from planning to tasks,
                execution, outcomes and reports.
              </p>
            </div>
            <div className="bg-white rounded-[1.5rem] border border-slate-200/80 p-7 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                Institutional Memory
              </div>
              <h3 className="mt-4 text-2xl font-bold text-blue-950">
                Archive
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Meetings, documents, reports, decisions and completed
                initiatives can become searchable institutional records.
              </p>
            </div>
          </div>
        </section>
        {/* ===================================================
            STUDENT COUNCIL
        =================================================== */
        <section id="council" className="mt-14 scroll-mt-24">
          <SectionHeading
            eyebrow="Student Council · 2026–27"
            title="The students who lead the campus."
            description="The Student Council brings together the primary Class 12 office-bearers, their Class 11 Vice/Joint counterparts, and house leadership under one structure."
          />
          <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-5 md:px-8">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">School Council</p>
                  <h3 className="mt-1 text-xl font-bold tracking-tight text-blue-950">Primary &amp; corresponding leadership</h3>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  2026–27 Council
                </div>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {SCHOOL_COUNCIL.map((item) => (
                <div key={item.role} className="grid gap-4 px-6 py-5 transition hover:bg-slate-50/70 md:grid-cols-[1fr_auto_1fr] md:items-center md:px-8">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-700">Class 12 · Primary</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{item.role}</p>
                    <p className="mt-1 text-lg font-bold tracking-tight text-blue-950">{item.primary}</p>
                  </div>
                  <div className="hidden h-10 w-px bg-slate-200 md:block" />
                  <div className="border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-700">Class 11 · Vice / Joint</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">{item.secondaryRole}</p>
                    <p className="mt-1 text-lg font-bold tracking-tight text-slate-800">{item.secondary}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">House Leadership</p>
              <h3 className="mt-2 text-xl md:text-2xl font-bold tracking-tight text-blue-950">Four houses, one council.</h3>
            </div>
            <p className="hidden max-w-md text-right text-xs leading-5 text-slate-500 md:block">House Captains and Vice House Captains form part of the Student Council and are presented here alongside the school-wide office-bearers.</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {HOUSE_LEADERSHIP.map((house) => {
              const styles = {
                blue: { card: 'border-blue-200/80 bg-blue-50/70', bar: 'bg-blue-600', label: 'text-blue-700', soft: 'bg-blue-100 text-blue-800' },
                yellow: { card: 'border-yellow-200/80 bg-yellow-50/70', bar: 'bg-yellow-500', label: 'text-yellow-700', soft: 'bg-yellow-100 text-yellow-800' },
                red: { card: 'border-red-200/80 bg-red-50/70', bar: 'bg-red-600', label: 'text-red-700', soft: 'bg-red-100 text-red-800' },
                green: { card: 'border-green-200/80 bg-green-50/70', bar: 'bg-green-600', label: 'text-green-700', soft: 'bg-green-100 text-green-800' },
              }[house.color];
              return (
                <article key={house.name} className={`group relative overflow-hidden rounded-[1.5rem] border p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${styles.card}`}>
                  <div className={`absolute inset-x-0 top-0 h-1 ${styles.bar}`} />
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${styles.soft}`}>House</span>
                      <h4 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{house.name}</h4>
                    </div>
                    <span className={`h-9 w-9 rounded-full border-4 border-white/80 shadow-sm ${styles.bar}`} />
                  </div>
                  <div className="mt-5 space-y-4">
                    <div>
                      <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${styles.label}`}>House Captains</p>
                      <div className="mt-2 space-y-1.5">
                        <p className="text-sm font-semibold text-slate-800">♂ {house.captainBoy}</p>
                        <p className="text-sm font-semibold text-slate-800">♀ {house.captainGirl}</p>
                      </div>
                    </div>
                    <div className="border-t border-black/5 pt-4">
                      <p className={`text-[10px] font-bold uppercase tracking-[0.16em] ${styles.label}`}>Vice House Captains</p>
                      <div className="mt-2 space-y-1.5">
                        <p className="text-sm font-semibold text-slate-800">♂ {house.viceBoy}</p>
                        <p className="text-sm font-semibold text-slate-800">♀ {house.viceGirl}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
        /* ===================================================
            RESOURCES
        =================================================== */}
        <section
          id="resources"
          className="mt-12 scroll-mt-24"
        >
          <SectionHeading
            eyebrow="Resources"
            title="Useful school information."
            description="A future home for documents, links, academic resources and institutional references."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'School Documents',
              'Academic Resources',
              'Useful Links',
              'Institutional Archive',
            ].map((resource) => (
              <div
                key={resource}
                className="bg-white rounded-2xl border border-slate-200/80 p-5"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-blue-950">
                  ↗
                </div>
                <h3 className="mt-4 text-sm font-bold text-blue-950">
                  {resource}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Portal resource space.
                </p>
              </div>
            ))}
          </div>
        </section>
        {/* ===================================================
            AUTHENTICATED WORKSPACE
        =================================================== */}
        {session && (
          <section
            id="workspace"
            className="mt-14 pt-10 border-t border-slate-200 scroll-mt-24"
          >
            <SectionHeading
              eyebrow="Authorised Area"
              title="Workspace"
              description="Operational tools for authorised teachers and student leaders."
              action={
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">
                    {userRole}
                  </span>
                </div>
              }
            />
            {/* Workspace Overview */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              {[
                {
                  number: supabaseEvents.length,
                  label: 'Live Events',
                },
                {
                  number: upcomingEvents.length,
                  label: 'Upcoming',
                },
                {
                  number: '—',
                  label: 'Open Tasks',
                },
                {
                  number: '—',
                  label: 'Projects',
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white rounded-2xl border border-slate-200 p-5"
                >
                  <div className="text-2xl font-bold text-blue-950">
                    {stat.number}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            {/* Event Publishing */}
            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
                  Calendar Management
                </p>
                <h3 className="mt-2 text-xl font-bold text-blue-950">
                  Publish New Event
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Publish an event to the live calendar.
                </p>
              </div>
              <form
                onSubmit={handleCreateEvent}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) =>
                      setNewTitle(e.target.value)
                    }
                    placeholder="Council Meeting"
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) =>
                      setNewDate(e.target.value)
                    }
                    required
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(
                        e.target.value as Category
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  >
                    <option value="Academic">
                      Academic
                    </option>
                    <option value="Flagship">
                      Flagship
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
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={newVenue}
                    onChange={(e) =>
                      setNewVenue(e.target.value)
                    }
                    placeholder="Auditorium"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Target
                  </label>
                  <input
                    type="text"
                    value={newTarget}
                    onChange={(e) =>
                      setNewTarget(e.target.value)
                    }
                    placeholder="Grades 9–12"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Time / Range
                  </label>
                  <input
                    type="text"
                    value={newTime}
                    onChange={(e) =>
                      setNewTime(e.target.value)
                    }
                    placeholder="10:00 AM / Full Day"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                  />
                </div>
                <button
                  type="submit"
                  className="lg:col-span-3 md:col-span-2 rounded-xl bg-blue-950 text-white py-3 font-semibold text-sm hover:bg-blue-900 transition"
                >
                  Publish Event
                </button>
              </form>
              {message && (
                <div
                  className={`mt-5 rounded-xl px-4 py-3 text-xs ${
                    message.toLowerCase().includes('success') ||
                    message.toLowerCase().includes('published')
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {message}
                </div>
              )}
            </div>
            {/* Database Events */}
            <div className="mt-6 bg-white rounded-[1.5rem] border border-slate-200 shadow-sm p-6 md:p-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">
                    Supabase
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-blue-950">
                    Live Database Events
                  </h3>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                  {supabaseEvents.length}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {supabaseEvents.length > 0 ? (
                  supabaseEvents.map((event) => {
                    const styles =
                      getCategoryStyles(
                        event.category
                      );
                    return (
                      <div
                        key={event.id}
                        className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${styles.dot}`}
                          />
                          <div>
                            <p className="font-semibold text-sm text-slate-800">
                              {event.title}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDate(
                                event.event_date
                              )}
                              {' · '}
                              {event.venue ||
                                event.description ||
                                'Campus'}
                              {event.time &&
                                ` · ${event.time}`}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`self-start sm:self-auto px-2.5 py-1 rounded-full text-[10px] font-semibold ${styles.bg} ${styles.text}`}
                        >
                          {event.category ||
                            'Campus'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-sm text-slate-500">
                    No events are currently stored in the{' '}
                    <code className="bg-slate-100 px-1.5 py-1 rounded text-xs">
                      calendar_events
                    </code>{' '}
                    table.
                  </div>
                )}
              </div>
            </div>
            {/* Future Workspace Modules */}
            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                'Announcements',
                'Tasks',
                'Projects',
                'Meetings',
                'Documents',
                'Reports',
                'Members',
                'Archive',
              ].map((module) => (
                <div
                  key={module}
                  className="bg-white rounded-2xl border border-slate-200 p-5"
                >
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    Workspace
                  </div>
                  <h3 className="mt-3 font-bold text-blue-950">
                    {module}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Module prepared for the next database layer.
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      {/* =====================================================
          SIGN-IN MODAL
      ===================================================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-[1.5rem] shadow-2xl max-w-md w-full p-7 relative"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 w-8 h-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              aria-label="Close"
            >
              ×
            </button>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">
              Authorised Workspace
            </p>
            <h3 className="mt-2 text-2xl font-bold text-blue-950">
              Sign In
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Use your official VidyaGyan school email to access
              authorised portal functions.
            </p>
            <form
              onSubmit={handleLogin}
              className="mt-7 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  School Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  placeholder="username@vidyagyan.in"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-950 text-white py-3 font-semibold text-sm hover:bg-blue-900 transition disabled:opacity-50"
              >
                {loading
                  ? 'Sending...'
                  : 'Send Magic Link'}
              </button>
            </form>
            {message && (
              <div
                className={`mt-4 rounded-xl p-3 text-xs text-center ${
                  message.toLowerCase().includes('sent')
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}
            <p className="mt-5 text-[10px] text-center text-slate-400">
              Access is restricted to official
              @vidyagyan.in accounts.
            </p>
          </div>
        </div>
      )}
      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="font-bold text-blue-950">
                VidyaGyan Portal
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-500 max-w-sm">
                A unified digital layer for campus information,
                student life and institutional leadership.
              </p>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-700">
                Portal
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-500">
                <a href="#schedule" className="hover:text-blue-950">
                  Schedule
                </a>
                <a href="#mess" className="hover:text-blue-950">
                  Mess Menu
                </a>
                <a href="#calendar" className="hover:text-blue-950">
                  Calendar
                </a>
                <a href="#activities" className="hover:text-blue-950">
                  Activities
                </a>
                <a href="#leadership" className="hover:text-blue-950">
                  Leadership
                </a>
                <a href="#resources" className="hover:text-blue-950">
                  Resources
                </a>
              </div>
            </div>
            <div className="md:text-right">
              <div className="text-xs font-bold text-slate-700">
                VidyaGyan Bulandshahr
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Student Portal · 2026–27
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Campus Time · Asia/Kolkata
              </p>
            </div>
          </div>
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <span className="text-[10px] text-slate-400">
              VidyaGyan Leadership Academy
            </span>
            <span className="text-[10px] text-slate-400">
              Portal Infrastructure · 2026–27
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
