'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Category =
  | 'Flagship'
  | 'Academic'
  | 'Cultural'
  | 'Exams'
  | 'Sports'
  | 'Excursion'
  | 'Holiday';

type Period = {
  start: string;
  end: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  periods: Period[];
  category: Category;
  target?: string;
  venue?: string;
  time?: string;
  description?: string;
  tentative?: boolean;
  source?: 'annual' | 'live';
  createdBy?: string;
};

const supabase = createClient(
  'https://lllmgmfofwczpqbmigey.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJsbGxtZ21mb2Z3Y3pwYm1pZ2V5IiwiYW5vbiI6ImFub24iLCJpYXQiOjE3ODk1NTIxNzYsImV4cCI6MjEwNTEyODE3Nn0.H_YfM8J3ZOy-B1lH7jgc4JtHu4rhUsigZ72qoI-b1ss'
);

const CATEGORIES: Array<{ key: Category | 'All'; label: string; dot: string }> = [
  { key: 'All', label: 'All', dot: 'bg-slate-500' },
  { key: 'Academic', label: 'Academic', dot: 'bg-blue-500' },
  { key: 'Exams', label: 'Exams', dot: 'bg-violet-500' },
  { key: 'Cultural', label: 'Cultural', dot: 'bg-rose-500' },
  { key: 'Sports', label: 'Sports', dot: 'bg-emerald-500' },
  { key: 'Excursion', label: 'Excursion', dot: 'bg-cyan-500' },
  { key: 'Flagship', label: 'Flagship', dot: 'bg-amber-500' },
  { key: 'Holiday', label: 'Holiday', dot: 'bg-orange-500' },
];

const CATEGORY_STYLES: Record<Category, { dot: string; soft: string; text: string; bar: string; badge: string }> = {
  Academic: {
    dot: 'bg-blue-500',
    soft: 'bg-blue-50',
    text: 'text-blue-700',
    bar: 'bg-blue-100 text-blue-800',
    badge: 'bg-blue-50 text-blue-700 border-blue-100',
  },
  Exams: {
    dot: 'bg-violet-500',
    soft: 'bg-violet-50',
    text: 'text-violet-700',
    bar: 'bg-violet-100 text-violet-800',
    badge: 'bg-violet-50 text-violet-700 border-violet-100',
  },
  Cultural: {
    dot: 'bg-rose-500',
    soft: 'bg-rose-50',
    text: 'text-rose-700',
    bar: 'bg-rose-100 text-rose-800',
    badge: 'bg-rose-50 text-rose-700 border-rose-100',
  },
  Sports: {
    dot: 'bg-emerald-500',
    soft: 'bg-emerald-50',
    text: 'text-emerald-700',
    bar: 'bg-emerald-100 text-emerald-800',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  },
  Excursion: {
    dot: 'bg-cyan-500',
    soft: 'bg-cyan-50',
    text: 'text-cyan-700',
    bar: 'bg-cyan-100 text-cyan-800',
    badge: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  },
  Flagship: {
    dot: 'bg-amber-500',
    soft: 'bg-amber-50',
    text: 'text-amber-700',
    bar: 'bg-amber-100 text-amber-800',
    badge: 'bg-amber-50 text-amber-700 border-amber-100',
  },
  Holiday: {
    dot: 'bg-orange-500',
    soft: 'bg-orange-50',
    text: 'text-orange-700',
    bar: 'bg-orange-100 text-orange-800',
    badge: 'bg-orange-50 text-orange-700 border-orange-100',
  },
};

const annual = (
  id: string,
  title: string,
  category: Category,
  periods: Period | Period[],
  extra: Omit<CalendarEvent, 'id' | 'title' | 'category' | 'periods' | 'source'> = {}
): CalendarEvent => ({
  id,
  title,
  category,
  periods: Array.isArray(periods) ? periods : [periods],
  source: 'annual',
  ...extra,
});

const day = (date: string): Period => ({ start: date, end: date });
const range = (start: string, end: string): Period => ({ start, end });

/*
 * Source: VidyaGyan Bulandshahr Annual Calendar 2026–27.
 * The source PDF is represented here as normalized periods so that the UI
 * can correctly render ranges, cross-month events and non-contiguous events.
 */
const ANNUAL_EVENTS: CalendarEvent[] = [
  // APRIL 2026
  annual('apr-new-session', 'New Session Begins', 'Academic', day('2026-04-01'), { target: 'Grades VI–IX & XI (Provisional)', venue: 'Campus' }),
  annual('apr-good-friday', 'Good Friday', 'Holiday', day('2026-04-03'), { target: 'School Community' }),
  annual('apr-monthly-off', 'Monthly Off', 'Holiday', day('2026-04-04'), { target: 'School Community' }),
  annual('apr-taekwondo', 'IH Taekwondo', 'Sports', range('2026-04-07', '2026-04-10'), { target: 'Inter-House', venue: 'Sports Ground' }),
  annual('apr-asset', 'ASSET Test', 'Exams', range('2026-04-09', '2026-04-11'), { target: 'Relevant Grades', venue: 'Classrooms' }),
  annual('apr-scienceiquisition', 'SCIENCEIQUISITION', 'Academic', day('2026-04-16'), { target: 'Students', venue: 'Campus' }),
  annual('apr-investiture', 'Investiture Ceremony', 'Flagship', day('2026-04-18'), { target: 'School Community', venue: 'Campus' }),
  annual('apr-biodiversity', 'Trip to Biodiversity Park', 'Excursion', day('2026-04-22'), { target: 'Grade 9', venue: 'SNU Noida' }),
  annual('apr-bards-day', "Bard's Day", 'Cultural', day('2026-04-23'), { target: 'School Community', time: 'Evening event', venue: 'Amphitheatre' }),
  annual('apr-football', 'IH Football', 'Sports', range('2026-04-24', '2026-05-02'), { target: 'Inter-House', venue: 'Sports Ground' }),

  // MAY 2026
  annual('may-pt1-9-12', 'Periodic Test 1', 'Exams', range('2026-05-04', '2026-05-09'), { target: 'Grades 9–12', venue: 'Classrooms' }),
  annual('may-pt1-7-8', 'Periodic Test 1', 'Exams', range('2026-05-04', '2026-05-11'), { target: 'Grades 7–8', venue: 'Classrooms' }),
  annual('may-basketball', 'IH Basketball', 'Sports', range('2026-05-07', '2026-05-15'), { target: 'Inter-House', venue: 'Sports Ground' }),
  annual('may-freshers', "Freshers’ Party", 'Cultural', day('2026-05-12'), { target: 'Grade 6', venue: 'Campus' }),
  annual('may-ptm', 'PTM', 'Academic', day('2026-05-16'), { target: 'School Community', venue: 'Campus' }),
  annual('may-summer-break', 'Summer Break', 'Flagship', range('2026-05-17', '2026-06-27'), { target: 'Students', venue: 'Campus' }),
  annual('may-summer-camp', 'Summer Camp', 'Cultural', range('2026-05-18', '2026-05-23'), { target: 'Grade 12', venue: 'Campus' }),
  annual('may-spic-macay', 'SPIC MACAY Annual Convention', 'Cultural', range('2026-05-25', '2026-05-31'), { target: 'School Community', venue: 'IIT Kharagpur' }),
  annual('may-eid', 'Bakri Id / Eid ul-Adha', 'Holiday', day('2026-05-27'), { target: 'School Community' }),

  // JUNE 2026
  annual('jun-teacher-reporting', 'Reporting for Teachers', 'Academic', day('2026-06-25'), { target: 'Teachers', venue: 'Campus' }),
  annual('jun-inservice', 'In-Service Training', 'Academic', range('2026-06-26', '2026-06-27'), { target: 'Staff', venue: 'Campus' }),
  annual('jun-student-reporting', 'Reporting for Students', 'Academic', day('2026-06-28'), { target: 'Students', venue: 'Campus' }),
  annual('jun-classes', 'Classes Begin', 'Academic', day('2026-06-29'), { target: 'Students', venue: 'Campus' }),

  // JULY 2026
  annual('jul-monthly-off', 'Monthly Off', 'Holiday', day('2026-07-04'), { target: 'School Community' }),
  annual('jul-industrial', 'Industrial Visit', 'Excursion', day('2026-07-06'), { target: 'Commerce', venue: 'Off Campus' }),
  annual('jul-volleyball', 'IH Volleyball', 'Sports', range('2026-07-07', '2026-07-11'), { target: 'Inter-House', venue: 'Sports Ground' }),
  annual('jul-nadar', "Mr. Nadar’s Birthday", 'Flagship', day('2026-07-14'), { target: 'School Community' }),
  annual('jul-project', 'Grade 12 Project Submission', 'Academic', day('2026-07-15'), { target: 'Grade 12', venue: 'Academic Block' }),
  annual('jul-story', 'IH Story Telling', 'Cultural', day('2026-07-17'), { target: 'Grade 7', venue: 'Campus' }),
  annual('jul-delhi-trip', 'Inter-Disciplinary Trip', 'Excursion', day('2026-07-18'), { target: 'Grade 6', venue: 'Delhi' }),
  annual('jul-handball', 'IH Handball', 'Sports', range('2026-07-20', '2026-07-25'), { target: 'Inter-House', venue: 'Sports Ground' }),
  annual('jul-sudoku', 'SUDOKU Activity', 'Academic', day('2026-07-25'), { target: 'Grade 7', venue: 'Campus' }),
  annual('jul-speaker', 'Speaker Session', 'Academic', day('2026-07-28'), { target: 'Students', time: 'Evening · 1–2 hrs' }),
  annual('jul-cross-country', 'Cross Country', 'Sports', day('2026-07-29'), { target: 'Students', venue: 'Campus' }),
  annual('jul-turncoat', 'IH Turncoat', 'Cultural', day('2026-07-31'), { target: 'Grade 8', venue: 'Campus' }),

  // AUGUST 2026
  annual('aug-monthly-off', 'Monthly Off', 'Holiday', day('2026-08-01'), { target: 'School Community' }),
  annual('aug-table-tennis', 'IH Table Tennis', 'Sports', range('2026-08-03', '2026-08-06'), { target: 'Inter-House', venue: 'Sports Ground' }),
  annual('aug-vgb-mun', 'VGB MUN', 'Flagship', range('2026-08-07', '2026-08-08'), { target: 'Students', venue: 'Conference Block' }),
  annual('aug-vg-day', 'VG Day', 'Flagship', day('2026-08-08'), { target: 'School Community', venue: 'Main Ground' }),
  annual('aug-steam', 'STEAM Conclave', 'Academic', day('2026-08-12'), { target: 'Grades 9–12 Science Students', venue: 'Labs', tentative: true }),
  annual('aug-dance', 'Inter-House Dance Competition', 'Cultural', day('2026-08-14'), { target: 'Inter-House', venue: 'Campus' }),
  annual('aug-independence', 'Independence Day', 'Flagship', day('2026-08-15'), { target: 'School Community' }),
  annual('aug-declamation', 'IH Declamation', 'Cultural', day('2026-08-18'), { target: 'Grades 9–10', venue: 'Campus' }),
  annual('aug-kaafila', 'Kaafila', 'Cultural', range('2026-08-20', '2026-08-22'), { target: 'School Community', venue: 'Campus', tentative: true }),
  annual('aug-bvp', 'Bharat Vikas Parishad', 'Flagship', day('2026-08-21'), { target: 'School Community', tentative: true }),
  annual('aug-ted', 'TED Event', 'Cultural', day('2026-08-31'), { target: 'School Community', venue: 'Amphitheatre', tentative: true }),
  annual('aug-national-dance', 'National Dance Championship', 'Sports', day('2026-08-24'), { target: 'Selected Students', tentative: true }),
  annual('aug-debate', 'IH Debate', 'Cultural', day('2026-08-26'), { target: 'Grades 11–12', venue: 'Campus' }),
  annual('aug-jantar', 'Trip to Jantar Mantar', 'Excursion', day('2026-08-27'), { target: 'Grade 7', venue: 'Delhi' }),
  annual('aug-raksha', 'Raksha Bandhan', 'Holiday', day('2026-08-28'), { target: 'School Community' }),
  annual('aug-math-games', 'Math Game Challenges / CBSE Kala Utsav', 'Academic', day('2026-08-29'), { target: 'Grade 8', venue: 'Campus' }),

  // SEPTEMBER 2026
  annual('sep-teachers-day', 'Teachers’ Day Celebration', 'Cultural', day('2026-09-03'), { target: 'School Community', venue: 'Campus' }),
  annual('sep-janmashtami', 'Janmashtami', 'Holiday', day('2026-09-04'), { target: 'School Community' }),
  annual('sep-monthly-off', 'Monthly Off', 'Holiday', day('2026-09-05'), { target: 'School Community' }),
  annual('sep-midterm-11-12', 'Mid-Term Examinations', 'Exams', range('2026-09-12', '2026-09-25'), { target: 'Grades 11–12', venue: 'Classrooms' }),
  annual('sep-midterm-9-10', 'Mid-Term Examinations', 'Exams', range('2026-09-12', '2026-09-23'), { target: 'Grades 9–10', venue: 'Classrooms' }),
  annual('sep-midterm-7-8', 'Mid-Term Examinations', 'Exams', range('2026-09-12', '2026-09-25'), { target: 'Grades 7–8', venue: 'Classrooms' }),
  annual('sep-hindi-diwas', 'Hindi Diwas', 'Cultural', day('2026-09-14'), { target: 'School Community', time: 'Evening programme', venue: 'Campus' }),
  annual('sep-nadar', "Roshni Nadar’s Birthday", 'Flagship', day('2026-09-16'), { target: 'School Community', description: 'Duties to be assigned.' }),
  annual('sep-math-rangoli', 'Math Rangoli', 'Academic', day('2026-09-18'), { target: 'Grade 6', time: 'Evening prep', venue: 'Campus' }),
  annual('sep-spandan', 'SPANDAN Lit Fest', 'Cultural', day('2026-09-25'), { target: 'Teachers', venue: 'Campus' }),
  annual('sep-recitation', 'Inter-Section English Recitation', 'Cultural', day('2026-09-25'), { target: 'Grade 6', venue: 'Campus' }),
  annual('sep-cultural-week', 'Cultural Week', 'Cultural', range('2026-09-28', '2026-10-01'), { target: 'School Community', venue: 'Campus' }),

  // OCTOBER 2026
  annual('oct-gandhi-theatre', 'Gandhi Jayanti & Theatre Visit', 'Cultural', day('2026-10-02'), { target: 'School Community', venue: 'Theatre / Campus' }),
  annual('oct-physics-jaipur', 'Trip to Physics Dham – Jaipur', 'Excursion', day('2026-10-02'), { target: 'Selected Delegations', venue: 'Jaipur' }),
  annual('oct-monthly-off', 'Monthly Off', 'Holiday', day('2026-10-03'), { target: 'School Community' }),
  annual('oct-kabaddi', 'IH Kabaddi', 'Sports', [range('2026-10-05', '2026-10-07'), range('2026-10-11', '2026-10-12')], { target: 'Inter-House', venue: 'Sports Ground' }),
  annual('oct-review-11-12', 'Mid-Term Review', 'Academic', day('2026-10-08'), { target: 'Grades 11–12', venue: 'Campus' }),
  annual('oct-review-9-10', 'Mid-Term Review', 'Academic', day('2026-10-09'), { target: 'Grades 9–10', venue: 'Campus' }),
  annual('oct-review-7-8', 'Mid-Term Review', 'Academic', day('2026-10-10'), { target: 'Grades 7–8', venue: 'Campus' }),
  annual('oct-zoo', 'Delhi Zoo Visit', 'Excursion', day('2026-10-12'), { target: 'Grade 6', venue: 'Delhi Zoo' }),
  annual('oct-workshop', 'Workshop', 'Academic', day('2026-10-14'), { target: 'Grades 6–8', venue: 'Campus' }),
  annual('oct-paint-6-7', 'IH Painting Competition', 'Cultural', day('2026-10-15'), { target: 'Grades 6–7', venue: 'Campus' }),
  annual('oct-paint-8-9', 'IH Painting Competition', 'Cultural', day('2026-10-16'), { target: 'Grades 8–9', venue: 'Campus' }),
  annual('oct-agra', 'Inter-Disciplinary Trip to Agra', 'Excursion', day('2026-10-17'), { target: 'Grades 7–8 & 11–12 Eco', venue: 'Agra' }),
  annual('oct-maha-navami', 'Maha Navami', 'Holiday', day('2026-10-19'), { target: 'School Community' }),
  annual('oct-dussehra', 'Dussehra', 'Holiday', day('2026-10-20'), { target: 'School Community' }),
  annual('oct-badminton', 'IH Badminton', 'Sports', range('2026-10-21', '2026-10-24'), { target: 'Inter-House', venue: 'Sports Ground' }),
  annual('oct-delhi-haat', 'Visit to Delhi Haat', 'Excursion', day('2026-10-26'), { target: 'Commerce & Economics', venue: 'Delhi Haat' }),
  annual('oct-sports-practice', 'Annual Sports Practice', 'Sports', range('2026-10-26', '2026-10-31'), { target: 'School Community', time: 'Evening', venue: 'Sports Ground' }),
  annual('oct-litfest', 'Lit Fest 2026', 'Cultural', range('2026-10-30', '2026-10-31'), { target: 'Inter-School Delegations', venue: 'Auditorium' }),
  annual('oct-syllabus', 'Syllabus Completion', 'Academic', day('2026-10-31'), { target: 'Grades 10 & 12', venue: 'Academic Block' }),

  // NOVEMBER 2026
  annual('nov-sports-practice-1', 'Annual Sports Practice', 'Sports', range('2026-11-01', '2026-11-03'), { target: 'School Community', time: 'Evening', venue: 'Sports Ground' }),
  annual('nov-history-peace', 'History for Peace 2026', 'Academic', range('2026-11-02', '2026-11-03'), { target: 'School Community', venue: 'Campus' }),
  annual('nov-ptm', 'PTM', 'Academic', day('2026-11-04'), { target: 'School Community', venue: 'Campus' }),
  annual('nov-diwali-break', 'Deepawali Break', 'Holiday', range('2026-11-05', '2026-11-21'), { target: 'Students' }),
  annual('nov-staff-reporting', 'Reporting Day for Staff', 'Academic', day('2026-11-17'), { target: 'Staff', venue: 'Campus' }),
  annual('nov-ole', 'OLE', 'Academic', range('2026-11-18', '2026-11-21'), { target: 'Teachers', venue: 'Campus' }),
  annual('nov-student-reporting', 'Reporting Day for Students', 'Academic', day('2026-11-22'), { target: 'Students', venue: 'Campus' }),
  annual('nov-classes', 'Classes Begin', 'Academic', day('2026-11-23'), { target: 'Students', venue: 'Campus' }),
  annual('nov-sports-practice-2', 'Annual Sports Practice', 'Sports', range('2026-11-23', '2026-11-24'), { target: 'School Community', time: 'Evening', venue: 'Sports Ground' }),
  annual('nov-sports', 'Annual Sports Day', 'Sports', day('2026-11-28'), { target: 'All Houses', venue: 'Sports Complex' }),
  annual('nov-solanki', 'Interaction with Mr. Solanki', 'Academic', day('2026-11-30'), { target: 'School Community', time: 'Environmentalist interaction', venue: 'Campus' }),

  // DECEMBER 2026
  annual('dec-history', 'Itihaas Anveshan', 'Academic', day('2026-12-05'), { target: 'School Community', venue: 'Campus' }),
  annual('dec-vgee', 'VGEE', 'Academic', day('2026-12-06'), { target: 'Eligible Students', venue: 'Campus' }),
  annual('dec-pt', 'Periodic Tests', 'Exams', range('2026-12-08', '2026-12-14'), { target: 'Relevant Grades', venue: 'Exam Halls' }),
  annual('dec-pb', 'Pre-Board Examinations', 'Exams', range('2026-12-08', '2026-12-16'), { target: 'Grades 10 & 12', venue: 'Exam Halls' }),
  annual('dec-choir', 'Inter-Section Choir', 'Cultural', day('2026-12-17'), { target: 'Grade 6', time: 'Morning assembly', venue: 'Campus' }),
  annual('dec-ptm', 'PTM', 'Academic', day('2026-12-19'), { target: 'Grades 6–9 & 11', venue: 'Campus' }),
  annual('dec-winter-break', 'Winter Break', 'Holiday', range('2026-12-20', '2027-01-09'), { target: 'Grades 6–9 & 11' }),
  annual('dec-winter-camp', 'Winter Camp', 'Cultural', day('2026-12-21'), { target: 'Grades 10 & 12', venue: 'Campus' }),
  annual('dec-christmas', 'Christmas', 'Holiday', day('2026-12-25'), { target: 'School Community' }),
  annual('dec-new-year', 'New Year Eve Celebration', 'Cultural', day('2026-12-31'), { target: 'School Community', venue: 'Campus' }),

  // JANUARY 2027
  annual('jan-new-year', "New Year's Day", 'Holiday', day('2027-01-01'), { target: 'School Community' }),
  annual('jan-teacher-reporting', 'Reporting Day for Teachers', 'Academic', day('2027-01-09'), { target: 'Teachers', venue: 'Campus' }),
  annual('jan-student-reporting', 'Reporting Day for Students', 'Academic', day('2027-01-10'), { target: 'Students', venue: 'Campus' }),
  annual('jan-classes', 'Classes Begin', 'Academic', day('2027-01-11'), { target: 'Students', venue: 'Campus' }),
  annual('jan-iccr', 'ICCR International Festival', 'Cultural', range('2027-01-21', '2027-01-23'), { target: 'Grade 8', venue: 'Campus' }),
  annual('jan-music', 'IH Music Competition', 'Cultural', day('2027-01-25'), { target: 'Grades 7–9', time: 'Singing / Orchestra', venue: 'Campus' }),
  annual('jan-republic', 'Republic Day', 'Flagship', day('2027-01-26'), { target: 'School Community' }),
  annual('jan-book-fair', 'Visit to Book Fair', 'Excursion', day('2027-01-30'), { target: 'Students', venue: 'Delhi' }),

  // FEBRUARY 2027
  annual('feb-monthly-off', 'Monthly Off', 'Holiday', day('2027-02-06'), { target: 'School Community' }),
  annual('feb-exam-11', 'Annual Examinations', 'Exams', range('2027-02-09', '2027-02-17'), { target: 'Grade 11', venue: 'Exam Halls' }),
  annual('feb-exam-9', 'Annual Examinations', 'Exams', range('2027-02-09', '2027-02-19'), { target: 'Grade 9', venue: 'Exam Halls' }),
  annual('feb-ole', 'OLE', 'Academic', range('2027-02-22', '2027-02-27'), { target: 'Grades 9 & 11', venue: 'Campus', tentative: true }),

  // MARCH 2027
  annual('mar-new-session', 'New Session Begins', 'Academic', day('2027-03-01'), { target: 'Grades 10 & 12', venue: 'Campus' }),
  annual('mar-maha-shivaratri', 'Maha Shivaratri', 'Holiday', day('2027-03-06'), { target: 'School Community' }),
  annual('mar-exam-6-8', 'Annual Examinations', 'Exams', range('2027-03-09', '2027-03-23'), { target: 'Grades 6–8', venue: 'Exam Halls' }),
  annual('mar-eid', 'Eid-ul-Fitr', 'Holiday', day('2027-03-10'), { target: 'School Community' }),
  annual('mar-holika', 'Holika Dahan', 'Holiday', day('2027-03-21'), { target: 'School Community' }),
  annual('mar-holi', 'Holi', 'Holiday', day('2027-03-22'), { target: 'School Community' }),
  annual('mar-good-friday', 'Good Friday', 'Holiday', day('2027-03-26'), { target: 'School Community' }),
  annual('mar-session-break', 'Session Break', 'Holiday', range('2027-03-27', '2027-03-31'), { target: 'Students' }),
  annual('mar-inservice', 'In-Service Training', 'Academic', range('2027-03-29', '2027-03-30'), { target: 'Staff', venue: 'Campus' }),
  annual('mar-staff-working', 'Working Day for Staff', 'Academic', day('2027-03-31'), { target: 'Staff', venue: 'Campus' }),
];

const MONTHS = Array.from({ length: 12 }, (_, month) => month);
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function fromDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function formatDateLong(key: string) {
  return fromDateKey(key).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatDateShort(key: string) {
  return fromDateKey(key).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatRange(periods: Period[]) {
  return periods
    .map((period) => {
      if (period.start === period.end) return formatDateShort(period.start);
      const start = fromDateKey(period.start);
      const end = fromDateKey(period.end);
      if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
        return `${start.getDate()}–${end.getDate()} ${start.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`;
      }
      return `${formatDateShort(period.start)} – ${formatDateShort(period.end)}`;
    })
    .join(' · ');
}

function eventOccursOn(event: CalendarEvent, dateKey: string) {
  return event.periods.some((period) => period.start <= dateKey && dateKey <= period.end);
}

function eventTouchesMonth(event: CalendarEvent, year: number, month: number) {
  const first = toDateKey(new Date(year, month, 1));
  const last = toDateKey(new Date(year, month + 1, 0));
  return event.periods.some((period) => period.start <= last && period.end >= first);
}

function getFirstEventDate(event: CalendarEvent) {
  return [...event.periods].sort((a, b) => a.start.localeCompare(b.start))[0]?.start ?? '9999-12-31';
}

function normalizeLiveEvent(event: any): CalendarEvent {
  const category = CATEGORIES.some((item) => item.key === event.category && item.key !== 'All')
    ? event.category
    : 'Academic';
  return {
    id: `live-${event.id}`,
    title: event.title,
    periods: [{ start: event.event_date, end: event.event_date }],
    category,
    target: event.target || 'All Students',
    venue: event.description || 'Campus',
    time: event.event_time || '',
    description: event.description || '',
    source: 'live',
    createdBy: event.created_by || '',
  };
}

export default function CalendarPage() {
  const todayKey = useMemo(() => toDateKey(new Date()), []);
  const today = fromDateKey(todayKey);

  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [search, setSearch] = useState('');
  const [liveEvents, setLiveEvents] = useState<CalendarEvent[]>([]);
  const [calendarError, setCalendarError] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Unable to fetch live calendar events:', error);
        setCalendarError(true);
        return;
      }

      setCalendarError(false);
      setLiveEvents((data || []).map(normalizeLiveEvent));
    };

    fetchEvents();
  }, []);

  const allEvents = useMemo(() => [...ANNUAL_EVENTS, ...liveEvents], [liveEvents]);

  const filteredEvents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allEvents
      .filter((event) => category === 'All' || event.category === category)
      .filter((event) => {
        if (!query) return true;
        return [event.title, event.target, event.venue, event.description, event.time]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));
      });
  }, [allEvents, category, search]);

  const monthEvents = useMemo(() => {
    return filteredEvents
      .filter((event) => eventTouchesMonth(event, currentMonth.getFullYear(), currentMonth.getMonth()))
      .sort((a, b) => getFirstEventDate(a).localeCompare(getFirstEventDate(b)) || a.title.localeCompare(b.title));
  }, [filteredEvents, currentMonth]);

  const selectedDateEvents = useMemo(
    () => filteredEvents.filter((event) => eventOccursOn(event, selectedDate)),
    [filteredEvents, selectedDate]
  );

  const selectedEvent = useMemo(
    () => allEvents.find((event) => event.id === selectedEventId) || null,
    [allEvents, selectedEventId]
  );

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const first = new Date(year, month, 1);
    const firstGridDay = addDays(first, -first.getDay());
    const last = new Date(year, month + 1, 0);
    const lastGridDay = addDays(last, 6 - last.getDay());
    const days: Date[] = [];
    let cursor = firstGridDay;
    while (cursor <= lastGridDay) {
      days.push(new Date(cursor));
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [currentMonth]);

  const weeks = Math.ceil(calendarDays.length / 7);

  const monthLabel = currentMonth.toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });

  const visibleYear = currentMonth.getFullYear();

  const goMonth = (amount: number) => {
    setCurrentMonth((current) => new Date(current.getFullYear(), current.getMonth() + amount, 1));
    setSelectedEventId(null);
  };

  const goToday = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(todayKey);
    setSelectedEventId(null);
  };

  const selectDate = (dateKey: string) => {
    setSelectedDate(dateKey);
    setSelectedEventId(null);
  };

  const selectEvent = (event: CalendarEvent, focusDate?: string) => {
    setSelectedEventId(event.id);
    const targetDate = focusDate || getFirstEventDate(event);
    setSelectedDate(targetDate);
    const target = fromDateKey(targetDate);
    setCurrentMonth(new Date(target.getFullYear(), target.getMonth(), 1));
  };

  const renderEventChip = (event: CalendarEvent, dateKey: string) => {
    const style = CATEGORY_STYLES[event.category];
    const active = selectedEventId === event.id;
    const isStart = event.periods.some((period) => period.start === dateKey);
    const isEnd = event.periods.some((period) => period.end === dateKey);
    const isMulti = event.periods.some((period) => period.start !== period.end && eventOccursOn(event, dateKey));

    return (
      <button
        key={`${event.id}-${dateKey}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          selectEvent(event, dateKey);
        }}
        title={`${event.title} · ${formatRange(event.periods)}`}
        className={`group block w-full overflow-hidden text-left text-[10px] font-semibold leading-4 transition ${
          isMulti
            ? `${style.bar} ${isStart ? 'rounded-l-md' : ''} ${isEnd ? 'rounded-r-md' : ''} px-2 py-1`
            : `${style.soft} ${style.text} rounded-md px-2 py-1`
        } ${active ? 'ring-2 ring-slate-900/20' : 'hover:brightness-95'}`}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
          <span className="truncate">{event.title}</span>
          {event.tentative && <span className="shrink-0 text-[8px] font-bold uppercase opacity-70">T</span>}
        </span>
      </button>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Header */}
        <section className="mb-6 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                VidyaGyan Bulandshahr
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-blue-950 md:text-4xl">
                Campus Calendar
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Academic, cultural, sporting, excursion and school-wide events for the 2026–27 academic year.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-semibold">
                {allEvents.length} events
              </span>
              {liveEvents.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  LIVE
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Controls */}
        <section className="mb-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center justify-between gap-2 sm:justify-start">
              <button
                type="button"
                onClick={() => goMonth(-1)}
                aria-label="Previous month"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 transition hover:bg-slate-50"
              >
                ‹
              </button>
              <div className="min-w-[180px] text-center">
                <div className="text-lg font-bold text-blue-950">{monthLabel}</div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Academic year 2026–27
                </div>
              </div>
              <button
                type="button"
                onClick={() => goMonth(1)}
                aria-label="Next month"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg text-slate-700 transition hover:bg-slate-50"
              >
                ›
              </button>
              <button
                type="button"
                onClick={goToday}
                className="ml-1 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                Today
              </button>
            </div>

            <div className="relative w-full xl:max-w-sm">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, grades, venues..."
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {CATEGORIES.map((item) => {
              const active = category === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setCategory(item.key)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${
                    active
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${active ? 'bg-white' : item.dot}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        </section>

        {calendarError && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800">
            Live portal events could not be loaded. The official annual calendar is still available.
          </div>
        )}

        {/* Main calendar + agenda */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
          {/* Calendar */}
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80">
              {WEEKDAYS.map((dayName, index) => (
                <div
                  key={dayName}
                  className={`px-2 py-3 text-center text-[10px] font-bold uppercase tracking-[0.14em] ${
                    index === 0 || index === 6 ? 'text-slate-400' : 'text-slate-500'
                  }`}
                >
                  <span className="hidden sm:inline">{dayName}</span>
                  <span className="sm:hidden">{dayName.slice(0, 1)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7">
              {calendarDays.map((date) => {
                const dateKey = toDateKey(date);
                const inMonth = date.getMonth() === currentMonth.getMonth();
                const isToday = dateKey === todayKey;
                const isSelected = dateKey === selectedDate;
                const dayEvents = filteredEvents.filter((event) => eventOccursOn(event, dateKey));
                const shown = dayEvents.slice(0, 3);
                const more = dayEvents.length - shown.length;

                return (
                  <button
                    key={dateKey}
                    type="button"
                    onClick={() => selectDate(dateKey)}
                    className={`group min-h-[108px] border-b border-r border-slate-100 p-1.5 text-left align-top transition sm:min-h-[126px] sm:p-2 ${
                      !inMonth ? 'bg-slate-50/70' : 'bg-white hover:bg-slate-50/60'
                    } ${isSelected ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-1 text-xs font-bold ${
                          isToday
                            ? 'bg-blue-600 text-white shadow-sm'
                            : isSelected
                              ? 'bg-blue-100 text-blue-800'
                              : inMonth
                                ? 'text-slate-700'
                                : 'text-slate-300'
                        }`}
                      >
                        {date.getDate()}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="pr-0.5 text-[9px] font-semibold text-slate-400">{dayEvents.length}</span>
                      )}
                    </div>

                    <div className="mt-1.5 space-y-1">
                      {shown.map((event) => renderEventChip(event, dateKey))}
                      {more > 0 && (
                        <span className="block px-1 text-[9px] font-bold text-slate-400">
                          + {more} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 px-4 py-3">
              {CATEGORIES.slice(1).map((item) => (
                <div key={item.key} className="inline-flex items-center gap-1.5 text-[10px] font-medium text-slate-500">
                  <span className={`h-2 w-2 rounded-full ${item.dot}`} />
                  {item.label}
                </div>
              ))}
              <div className="ml-auto text-[10px] text-slate-400">T = tentative</div>
            </div>
          </div>

          {/* Agenda */}
          <aside className="flex max-h-[720px] min-h-[520px] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-700">Monthly Agenda</p>
                  <h2 className="mt-1 text-xl font-bold text-blue-950">{monthLabel}</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    {monthEvents.length} event{monthEvents.length === 1 ? '' : 's'} shown
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
                  {visibleYear}
                </span>
              </div>
            </div>

            <div className="overflow-y-auto p-4">
              {selectedDateEvents.length > 0 && (
                <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-blue-600">Selected date</p>
                      <p className="mt-1 text-sm font-bold text-blue-950">{formatDateLong(selectedDate)}</p>
                    </div>
                    <span className="rounded-full bg-white px-2 py-1 text-[10px] font-bold text-blue-700 shadow-sm">
                      {selectedDateEvents.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {selectedDateEvents.map((event) => {
                      const style = CATEGORY_STYLES[event.category];
                      return (
                        <button
                          key={`selected-${event.id}`}
                          type="button"
                          onClick={() => selectEvent(event, selectedDate)}
                          className={`flex w-full items-start gap-2 rounded-xl border bg-white p-2.5 text-left transition hover:border-slate-300 ${
                            selectedEventId === event.id ? 'ring-2 ring-blue-100' : 'border-slate-100'
                          }`}
                        >
                          <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${style.dot}`} />
                          <span className="min-w-0">
                            <span className="block truncate text-xs font-bold text-slate-800">{event.title}</span>
                            <span className="mt-0.5 block text-[10px] text-slate-500">{event.target || 'School Community'}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {monthEvents.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 px-5 py-10 text-center">
                    <p className="text-sm font-semibold text-slate-700">No matching events</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">Try clearing the search or category filter.</p>
                  </div>
                ) : (
                  monthEvents.map((event) => {
                    const style = CATEGORY_STYLES[event.category];
                    const active = selectedEventId === event.id;
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => selectEvent(event)}
                        className={`w-full rounded-2xl border p-3 text-left transition ${
                          active
                            ? 'border-blue-200 bg-blue-50/60 shadow-sm'
                            : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex gap-3">
                          <div className="w-12 shrink-0 pt-0.5 text-center">
                            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                              {fromDateKey(getFirstEventDate(event)).toLocaleDateString('en-IN', { month: 'short' })}
                            </div>
                            <div className="text-xl font-bold leading-none text-slate-800">
                              {fromDateKey(getFirstEventDate(event)).getDate()}
                            </div>
                          </div>
                          <div className="min-w-0 flex-1 border-l border-slate-100 pl-3">
                            <div className="flex items-start justify-between gap-2">
                              <span className="block truncate text-xs font-bold text-slate-800">{event.title}</span>
                              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[8px] font-bold uppercase ${style.badge}`}>
                                {event.category}
                              </span>
                            </div>
                            <p className="mt-1 text-[10px] leading-4 text-slate-500">{formatRange(event.periods)}</p>
                            {event.target && <p className="mt-0.5 truncate text-[10px] text-slate-400">{event.target}</p>}
                            {event.tentative && <span className="mt-1.5 inline-block text-[9px] font-bold uppercase tracking-wide text-amber-600">Tentative</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        </section>

        {/* Selected event */}
        <section className="mt-5 rounded-[1.5rem] border border-slate-200/80 bg-white shadow-sm">
          {selectedEvent ? (
            <div className="p-5 md:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${CATEGORY_STYLES[selectedEvent.category].badge}`}>
                      {selectedEvent.category}
                    </span>
                    {selectedEvent.source === 'live' && (
                      <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-emerald-700">
                        Live portal event
                      </span>
                    )}
                    {selectedEvent.tentative && (
                      <span className="rounded-full border border-amber-100 bg-amber-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-amber-700">
                        Tentative
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 text-2xl font-bold tracking-tight text-blue-950">{selectedEvent.title}</h2>
                  <p className="mt-1 text-sm font-medium text-slate-500">{formatRange(selectedEvent.periods)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedEventId(null)}
                  className="self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Detail label="Audience" value={selectedEvent.target || 'School Community'} />
                <Detail label="Venue" value={selectedEvent.venue || 'Campus'} />
                <Detail label="Time" value={selectedEvent.time || 'Not specified'} />
                <Detail label="Schedule" value={formatRange(selectedEvent.periods)} />
              </div>

              {selectedEvent.description && (
                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
                  {selectedEvent.description}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-start justify-between gap-3 p-5 sm:flex-row sm:items-center md:p-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Selected event</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">Select an event to view its full details.</p>
              </div>
              <p className="text-xs text-slate-400">Click an event in the calendar or agenda.</p>
            </div>
          )}
        </section>

        {/* Footer note */}
        <footer className="px-1 pb-4 pt-5 text-center text-[10px] leading-5 text-slate-400">
          Official annual-calendar information is based on the VidyaGyan Bulandshahr Annual Calendar 2026–27. Live portal events are marked separately.
        </footer>
      </div>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3">
      <div className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</div>
      <div className="mt-1 text-xs font-semibold leading-5 text-slate-700">{value}</div>
    </div>
  );
}
