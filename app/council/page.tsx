import type { ReactNode } from "react";

const EXECUTIVE_LEADERSHIP = [
  {
    title: "Head Boy",
    primary: "Vinay Kumar Maurya",
    primaryClass: "Class 12",
    viceTitle: "Vice Head Boy",
    vice: "Abhimanyu Singh",
    viceClass: "Class 11",
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
    glow: "bg-blue-500/20",
  },
  {
    title: "Head Girl",
    primary: "Satakshi Gangwar",
    primaryClass: "Class 12",
    viceTitle: "Vice Head Girl",
    vice: "Kirti Singh",
    viceClass: "Class 11",
    gradient: "from-fuchsia-600 via-violet-600 to-indigo-600",
    glow: "bg-fuchsia-500/20",
  },
];

const FUNCTIONAL_LEADERSHIP = [
  {
    title: "Sports",
    description:
      "Leading sporting activities, participation and representation across the campus.",
    primaryLabel: "Sports Captains",
    primaryBoy: "Nitin",
    primaryGirl: "Roshini",
    secondaryLabel: "Vice Sports Captains",
    secondaryBoy: "Abhimanyu",
    secondaryGirl: "Nainshee Mishra",
    accent: "bg-emerald-500",
    accentDark: "bg-emerald-600",
    soft: "bg-emerald-50",
    border: "border-emerald-200",
    icon: "01",
  },
  {
    title: "Honour",
    description:
      "Supporting student responsibility, discipline and representation.",
    primaryLabel: "Honour Secretaries",
    primaryBoy: "Krish",
    primaryGirl: "Pravesh",
    secondaryLabel: "Joint Honour Secretaries",
    secondaryBoy: "Hemant Rathore",
    secondaryGirl: "Tejaswani",
    accent: "bg-indigo-500",
    accentDark: "bg-indigo-600",
    soft: "bg-indigo-50",
    border: "border-indigo-200",
    icon: "02",
  },
  {
    title: "Cultural",
    description:
      "Coordinating cultural activities, participation and student expression.",
    primaryLabel: "Cultural Secretaries",
    primaryBoy: "Dheeraj",
    primaryGirl: "Preet",
    secondaryLabel: "Joint Cultural Secretaries",
    secondaryBoy: "Aditya Maurya",
    secondaryGirl: "Satakshi Sharma",
    accent: "bg-fuchsia-500",
    accentDark: "bg-fuchsia-600",
    soft: "bg-fuchsia-50",
    border: "border-fuchsia-200",
    icon: "03",
  },
];

const HOUSE_LEADERSHIP = [
  {
    name: "Jal",
    descriptor: "Water",
    color: "blue",
    captainBoy: "Sachin Sahani",
    captainGirl: "Divya",
    viceBoy: "Harshit Yadav",
    viceGirl: "Aditi Singh",
  },
  {
    name: "Vayu",
    descriptor: "Air",
    color: "yellow",
    captainBoy: "Himanshu Kumar Gautam",
    captainGirl: "Navya Barnawal",
    viceBoy: "Rishabh Yadav",
    viceGirl: "Jigyasa Rajawat",
  },
  {
    name: "Agni",
    descriptor: "Fire",
    color: "red",
    captainBoy: "Vishal Kashyap",
    captainGirl: "Anshika Yadav",
    viceBoy: "Krishna Kumar Dwivedi",
    viceGirl: "Divya",
  },
  {
    name: "Prithvi",
    descriptor: "Earth",
    color: "green",
    captainBoy: "Abhay Chaurasiya",
    captainGirl: "Ananya Rajawat",
    viceBoy: "Ritesh Pal",
    viceGirl: "Vedika Singh",
  },
];

const HOUSE_STYLES: Record<
  string,
  {
    gradient: string;
    accent: string;
    accentDark: string;
    soft: string;
    border: string;
    text: string;
    number: string;
    glow: string;
  }
> = {
  blue: {
    gradient: "from-blue-600 via-blue-500 to-cyan-500",
    accent: "bg-blue-500",
    accentDark: "bg-blue-600",
    soft: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    number: "text-blue-600/10",
    glow: "bg-blue-400/20",
  },
  yellow: {
    gradient: "from-amber-400 via-yellow-400 to-orange-400",
    accent: "bg-yellow-500",
    accentDark: "bg-yellow-600",
    soft: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
    number: "text-yellow-600/10",
    glow: "bg-yellow-400/20",
  },
  red: {
    gradient: "from-red-600 via-rose-500 to-orange-500",
    accent: "bg-red-500",
    accentDark: "bg-red-600",
    soft: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    number: "text-red-600/10",
    glow: "bg-red-400/20",
  },
  green: {
    gradient: "from-emerald-600 via-green-500 to-teal-500",
    accent: "bg-green-500",
    accentDark: "bg-green-600",
    soft: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    number: "text-green-600/10",
    glow: "bg-green-400/20",
  },
};

function SectionEyebrow({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <p
      className={`text-[11px] font-bold uppercase tracking-[0.2em] ${
        light ? "text-white/70" : "text-slate-500"
      }`}
    >
      {children}
    </p>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-9 max-w-3xl">
      <SectionEyebrow>{eyebrow}</SectionEyebrow>

      <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>

      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function ExecutiveCard({
  title,
  primary,
  primaryClass,
  viceTitle,
  vice,
  viceClass,
  gradient,
  glow,
}: {
  title: string;
  primary: string;
  primaryClass: string;
  viceTitle: string;
  vice: string;
  viceClass: string;
  gradient: string;
  glow: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-28px_rgba(15,23,42,0.45)]">
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${gradient} px-6 py-7 sm:px-8 sm:py-8`}
      >
        <div
          className={`absolute -right-12 -top-12 h-36 w-36 rounded-full ${glow} blur-2xl`}
        />

        <div className="absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />

        <div className="absolute right-6 top-6 h-20 w-20 rounded-full border border-white/10" />

        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
            Executive
          </p>

          <h3 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            {title}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-2 divide-x divide-slate-200">
        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {primaryClass}
          </p>

          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
            {primary}
          </p>
        </div>

        <div className="px-6 py-7 sm:px-8 sm:py-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            {viceClass}
          </p>

          <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
            {viceTitle}
          </p>

          <p className="mt-2 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
            {vice}
          </p>
        </div>
      </div>
    </article>
  );
}

function LeadershipPair({
  label,
  boy,
  girl,
}: {
  label: string;
  boy: string;
  girl: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-500">
        {label}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <p className="truncate text-base font-bold text-slate-950 sm:text-lg">
          {boy}
        </p>

        <p className="truncate text-base font-bold text-slate-950 sm:text-lg">
          {girl}
        </p>
      </div>
    </div>
  );
}

function FunctionalCard({
  title,
  description,
  primaryLabel,
  primaryBoy,
  primaryGirl,
  secondaryLabel,
  secondaryBoy,
  secondaryGirl,
  accent,
  accentDark,
  soft,
  border,
  icon,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  primaryBoy: string;
  primaryGirl: string;
  secondaryLabel: string;
  secondaryBoy: string;
  secondaryGirl: string;
  accent: string;
  accentDark: string;
  soft: string;
  border: string;
  icon: string;
}) {
  return (
    <article
      className={`group overflow-hidden rounded-[1.75rem] border ${border} bg-white shadow-[0_14px_40px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-28px_rgba(15,23,42,0.45)]`}
    >
      <div className={`relative overflow-hidden ${soft} px-6 py-6`}>
        <div
          className={`absolute -right-8 -top-8 h-28 w-28 rounded-full ${accent} opacity-10 blur-2xl`}
        />

        <div className="relative flex items-start gap-4">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accentDark} text-xs font-bold text-white shadow-sm`}
          >
            {icon}
          </div>

          <div className="min-w-0">
            <h3 className="text-xl font-bold tracking-tight text-slate-950">
              {title}
            </h3>

            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <LeadershipPair
          label={`${primaryLabel} · Class 12`}
          boy={primaryBoy}
          girl={primaryGirl}
        />

        <div className="my-6 flex items-center justify-center gap-3">
          <div className={`h-px flex-1 ${accent} opacity-20`} />

          <span className="text-[10px] font-bold text-slate-300">↓</span>

          <div className={`h-px flex-1 ${accent} opacity-20`} />
        </div>

        <LeadershipPair
          label={`${secondaryLabel} · Class 11`}
          boy={secondaryBoy}
          girl={secondaryGirl}
        />
      </div>
    </article>
  );
}

function HousePerson({
  role,
  boy,
  girl,
}: {
  role: string;
  boy: string;
  girl: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {role}
      </p>

      <div className="mt-3 grid grid-cols-2 gap-4">
        <p className="truncate text-base font-bold text-slate-950 sm:text-lg">
          {boy}
        </p>

        <p className="truncate text-base font-bold text-slate-950 sm:text-lg">
          {girl}
        </p>
      </div>
    </div>
  );
}

function HouseCard({
  name,
  descriptor,
  color,
  captainBoy,
  captainGirl,
  viceBoy,
  viceGirl,
  index,
}: {
  name: string;
  descriptor: string;
  color: string;
  captainBoy: string;
  captainGirl: string;
  viceBoy: string;
  viceGirl: string;
  index: number;
}) {
  const style = HOUSE_STYLES[color];

  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border ${style.border} bg-white shadow-[0_16px_45px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-28px_rgba(15,23,42,0.45)]`}
    >
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${style.gradient} px-6 py-7 sm:px-7`}
      >
        <div
          className={`absolute -right-10 -top-14 h-40 w-40 rounded-full ${style.glow} blur-2xl`}
        />

        <div
          className={`pointer-events-none absolute -bottom-10 right-3 select-none text-[9rem] font-black leading-none ${style.number}`}
        >
          {String(index).padStart(2, "0")}
        </div>

        <div className="relative flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
              House {String(index).padStart(2, "0")}
            </p>

            <h3 className="mt-1 text-4xl font-black tracking-tight text-white">
              {name}
            </h3>

            <p className="mt-1 text-xs font-medium text-white/75">
              {descriptor} · House Leadership
            </p>
          </div>

          <div className="hidden h-12 w-12 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm sm:block" />
        </div>
      </div>

      <div className="p-6 sm:p-7">
        <div className={`rounded-2xl ${style.soft} p-5`}>
          <HousePerson
            role="House Captains"
            boy={captainBoy}
            girl={captainGirl}
          />
        </div>

        <div className="my-5 flex items-center gap-3">
          <div className={`h-px flex-1 ${style.accent} opacity-20`} />

          <span className="text-[10px] font-bold text-slate-300">↓</span>

          <div className={`h-px flex-1 ${style.accent} opacity-20`} />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
          <HousePerson
            role="Vice House Captains"
            boy={viceBoy}
            girl={viceGirl}
          />
        </div>
      </div>
    </article>
  );
}

export default function CouncilPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f7f3] text-slate-900">
      <section className="relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(59,130,246,0.16),transparent_28%),radial-gradient(circle_at_85%_10%,rgba(217,70,239,0.14),transparent_25%),radial-gradient(circle_at_50%_100%,rgba(16,185,129,0.1),transparent_30%)]" />

        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-10 sm:pt-14 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.55)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(59,130,246,0.5),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(217,70,239,0.4),transparent_28%),radial-gradient(circle_at_65%_90%,rgba(16,185,129,0.3),transparent_30%)]" />

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-sm" />
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full border border-white/10 bg-white/[0.03]" />
            <div className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full border border-white/10" />

            <div className="absolute right-[18%] top-[28%] h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_20px_rgba(103,232,249,0.9)]" />
            <div className="absolute right-[30%] top-[58%] h-1.5 w-1.5 rounded-full bg-fuchsia-300 shadow-[0_0_16px_rgba(240,171,252,0.9)]" />
            <div className="absolute left-[48%] top-[22%] h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.9)]" />

            <div className="relative grid min-h-[440px] items-end lg:grid-cols-[1.25fr_0.75fr]">
              <div className="px-7 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.8)]" />

                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/80">
                    Student Council · 2026–27
                  </span>
                </div>

                <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                  The students
                  <br />
                  who lead
                  <br />
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
                    the campus.
                  </span>
                </h1>

                <p className="mt-7 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                  School-wide office-bearers and four house leadership teams,
                  brought together as one Student Council for the 2026–27
                  session.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">
                    School Council
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">
                    4 Houses
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">
                    2026–27
                  </span>
                </div>
              </div>

              <div className="relative hidden min-h-[440px] items-center justify-center lg:flex">
                <div className="absolute h-72 w-72 rounded-full bg-gradient-to-br from-blue-500/20 via-violet-500/15 to-fuchsia-500/20 blur-3xl" />

                <div className="relative h-64 w-64">
                  <div className="absolute inset-0 rounded-full border border-white/10" />
                  <div className="absolute inset-6 rounded-full border border-white/10" />
                  <div className="absolute inset-12 rounded-full border border-white/10" />

                  <div className="absolute left-1/2 top-0 h-3 w-3 -translate-x-1/2 rounded-full bg-cyan-300 shadow-[0_0_25px_rgba(103,232,249,0.8)]" />
                  <div className="absolute bottom-4 left-8 h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_22px_rgba(110,231,183,0.8)]" />
                  <div className="absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-fuchsia-300 shadow-[0_0_25px_rgba(240,171,252,0.8)]" />

                  <div className="absolute inset-20 flex items-center justify-center rounded-full border border-white/15 bg-white/10 text-center shadow-2xl backdrop-blur-md">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/50">
                        One council
                      </p>

                      <p className="mt-1 text-xl font-black tracking-tight text-white">
                        Four houses
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Executive
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Head Boy · Head Girl
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Functional
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Sports · Honour · Cultural
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Houses
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Jal · Vayu · Agni · Prithvi
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="school-council"
        className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28"
      >
        <SectionHeader
          eyebrow="01 · School Council"
          title="School-wide leadership"
          description="The school-wide structure begins with executive leadership and extends into three functional areas."
        />

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px w-8 bg-slate-300" />

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Executive
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {EXECUTIVE_LEADERSHIP.map((leader) => (
            <ExecutiveCard key={leader.title} {...leader} />
          ))}
        </div>

        <div className="my-10 hidden items-center justify-center gap-4 md:flex">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-300" />

          <div className="flex h-9 items-center rounded-full border border-slate-200 bg-white px-4 shadow-sm">
            <span className="text-[10px] font-bold tracking-[0.16em] text-slate-300">
              ↓
            </span>
          </div>

          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-300" />
        </div>

        <div className="mb-6 mt-12 flex items-center gap-3">
          <div className="h-px w-8 bg-slate-300" />

          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Portfolios
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {FUNCTIONAL_LEADERSHIP.map((area) => (
            <FunctionalCard key={area.title} {...area} />
          ))}
        </div>
      </section>

      <section
        id="house-leadership"
        className="relative overflow-hidden bg-white py-20 lg:py-28"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_90%_15%,rgba(234,179,8,0.08),transparent_22%),radial-gradient(circle_at_20%_90%,rgba(239,68,68,0.07),transparent_22%),radial-gradient(circle_at_85%_90%,rgba(16,185,129,0.08),transparent_22%)]" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeader
            eyebrow="02 · House Leadership"
            title="Four houses, one council."
            description="House Captains and Vice House Captains form the house leadership branch of the Student Council, giving each house its own student leadership team."
          />

          <div className="mb-10 flex flex-wrap gap-2">
            {HOUSE_LEADERSHIP.map((house) => {
              const style = HOUSE_STYLES[house.color];

              return (
                <div
                  key={house.name}
                  className={`inline-flex items-center gap-2 rounded-full border ${style.border} ${style.soft} px-3 py-1.5`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${style.accent}`}
                  />

                  <span
                    className={`text-[10px] font-bold uppercase tracking-[0.12em] ${style.text}`}
                  >
                    {house.name}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {HOUSE_LEADERSHIP.map((house, index) => (
              <HouseCard
                key={house.name}
                {...house}
                index={index + 1}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-14">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <SectionEyebrow light>
            Student Council · 2026–27
          </SectionEyebrow>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/50">
            School-wide leadership and house leadership form one student
            leadership structure across the campus.
          </p>
        </div>
      </section>
    </main>
  );
}
