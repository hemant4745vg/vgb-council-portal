const EXECUTIVE_LEADERSHIP = [
  {
    title: "Head Boy",
    gender: "Boy",
    primary: "Vinay Kumar Maurya",
    viceTitle: "Vice Head Boy",
    vice: "Abhimanyu Singh",
  },
  {
    title: "Head Girl",
    gender: "Girl",
    primary: "Satakshi Gangwar",
    viceTitle: "Vice Head Girl",
    vice: "Kirti Singh",
  },
];

const FUNCTIONAL_LEADERSHIP = [
  {
    title: "Sports Leadership",
    description: "Leading sporting activities and representation.",
    primaryLabel: "Sports Captain",
    primaryBoy: "Nitin",
    primaryGirl: "Roshini",
    secondaryLabel: "Vice Sports Captain",
    secondaryBoy: "Abhimanyu",
    secondaryGirl: "Nainshee Mishra",
    accent: "bg-emerald-600",
    softAccent: "bg-emerald-50",
    border: "border-emerald-200/80",
    text: "text-emerald-700",
  },
  {
    title: "Honour Leadership",
    description: "Supporting student discipline, responsibility and representation.",
    primaryLabel: "Honour Secretary",
    primaryBoy: "Krish",
    primaryGirl: "Pravesh",
    secondaryLabel: "Joint Honour Secretary",
    secondaryBoy: "Hemant Rathore",
    secondaryGirl: "Tejaswani",
    accent: "bg-indigo-600",
    softAccent: "bg-indigo-50",
    border: "border-indigo-200/80",
    text: "text-indigo-700",
  },
  {
    title: "Cultural Leadership",
    description: "Coordinating cultural activities and student participation.",
    primaryLabel: "Cultural Secretary",
    primaryBoy: "Dheeraj",
    primaryGirl: "Preet",
    secondaryLabel: "Joint Cultural Secretary",
    secondaryBoy: "Aditya Maurya",
    secondaryGirl: "Satakshi Sharma",
    accent: "bg-violet-600",
    softAccent: "bg-violet-50",
    border: "border-violet-200/80",
    text: "text-violet-700",
  },
];

const HOUSE_LEADERSHIP = [
  {
    name: "Jal",
    color: "blue",
    captainBoy: "Sachin Sahani",
    captainGirl: "Divya",
    viceBoy: "Harshit Yadav",
    viceGirl: "Aditi Singh",
  },
  {
    name: "Vayu",
    color: "yellow",
    captainBoy: "Himanshu Kumar Gautam",
    captainGirl: "Navya Barnawal",
    viceBoy: "Rishabh Yadav",
    viceGirl: "Jigyasa Rajawat",
  },
  {
    name: "Agni",
    color: "red",
    captainBoy: "Vishal Kashyap",
    captainGirl: "Anshika Yadav",
    viceBoy: "Krishna Kumar Dwivedi",
    viceGirl: "Divya",
  },
  {
    name: "Prithvi",
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
    border: string;
    background: string;
    accent: string;
    text: string;
    badge: string;
    accentSoft: string;
  }
> = {
  blue: {
    border: "border-blue-200/80",
    background: "bg-blue-50/60",
    accent: "bg-blue-600",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    accentSoft: "bg-blue-100/70",
  },
  yellow: {
    border: "border-yellow-200/80",
    background: "bg-yellow-50/60",
    accent: "bg-yellow-500",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-800",
    accentSoft: "bg-yellow-100/70",
  },
  red: {
    border: "border-red-200/80",
    background: "bg-red-50/60",
    accent: "bg-red-600",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800",
    accentSoft: "bg-red-100/70",
  },
  green: {
    border: "border-green-200/80",
    background: "bg-green-50/60",
    accent: "bg-green-600",
    text: "text-green-700",
    badge: "bg-green-100 text-green-800",
    accentSoft: "bg-green-100/70",
  },
};

function SectionLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      {children}
    </p>
  );
}

function NameBlock({
  label,
  name,
  primary = false,
}: {
  label: string;
  name: string;
  primary?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.13em] ${
          primary ? "text-slate-500" : "text-slate-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`mt-1.5 ${
          primary
            ? "text-base font-semibold text-slate-900 sm:text-lg"
            : "text-sm font-medium text-slate-700 sm:text-base"
        }`}
      >
        {name}
      </p>
    </div>
  );
}

function ExecutiveCard({
  title,
  gender,
  primary,
  viceTitle,
  vice,
}: {
  title: string;
  gender: string;
  primary: string;
  viceTitle: string;
  vice: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-slate-900" />

      <div className="p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
              {title}
            </p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              {primary}
            </h3>
          </div>

          <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            {gender}
          </span>
        </div>

        <div className="my-6 h-px bg-slate-100" />

        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
            ↳
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
              {viceTitle}
            </p>
            <p className="mt-1 text-sm font-medium text-slate-700 sm:text-base">
              {vice}
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-3 sm:px-7">
        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
          Class 12 primary · Class 11 vice
        </p>
      </div>
    </article>
  );
}

function FunctionalLeadershipCard({
  title,
  description,
  primaryLabel,
  primaryBoy,
  primaryGirl,
  secondaryLabel,
  secondaryBoy,
  secondaryGirl,
  accent,
  softAccent,
  border,
  text,
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
  softAccent: string;
  border: string;
  text: string;
}) {
  return (
    <article
      className={`overflow-hidden rounded-3xl border ${border} bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className={`relative overflow-hidden ${softAccent} px-6 py-5`}>
        <div
          className={`absolute left-0 top-0 h-full w-1.5 ${accent}`}
        />

        <div className="pl-2">
          <p className={`text-xs font-semibold uppercase tracking-[0.15em] ${text}`}>
            Functional leadership
          </p>

          <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="p-6">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className={`h-1.5 w-1.5 rounded-full ${accent}`} />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {primaryLabel} · Class 12
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NameBlock label="Boy" name={primaryBoy} primary />
            <NameBlock label="Girl" name={primaryGirl} primary />
          </div>
        </div>

        <div className="my-6 border-t border-dashed border-slate-200" />

        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {secondaryLabel} · Class 11
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NameBlock label="Boy" name={secondaryBoy} />
            <NameBlock label="Girl" name={secondaryGirl} />
          </div>
        </div>
      </div>
    </article>
  );
}

function HouseCard({
  name,
  color,
  captainBoy,
  captainGirl,
  viceBoy,
  viceGirl,
}: {
  name: string;
  color: string;
  captainBoy: string;
  captainGirl: string;
  viceBoy: string;
  viceGirl: string;
}) {
  const style = HOUSE_STYLES[color];

  return (
    <article
      className={`group overflow-hidden rounded-3xl border ${style.border} ${style.background} shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md`}
    >
      <div className="flex items-center justify-between gap-4 border-b border-black/5 px-6 py-5">
        <div className="flex items-center gap-4">
          <div className={`h-11 w-1.5 rounded-full ${style.accent}`} />

          <div>
            <h3 className={`text-2xl font-semibold tracking-tight ${style.text}`}>
              {name}
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">
              House Leadership
            </p>
          </div>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] ${style.badge}`}
        >
          {name}
        </span>
      </div>

      <div className="p-6">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full ${style.accentSoft} ${style.text} text-xs font-bold`}
            >
              01
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                House Captains
              </p>
              <p className="text-[10px] text-slate-400">Primary house leadership</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NameBlock label="Boy" name={captainBoy} primary />
            <NameBlock label="Girl" name={captainGirl} primary />
          </div>
        </div>

        <div className="my-6 border-t border-dashed border-black/10" />

        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/70 text-xs font-bold text-slate-400">
              02
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                Vice House Captains
              </p>
              <p className="text-[10px] text-slate-400">
                Supporting house leadership
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <NameBlock label="Boy" name={viceBoy} />
            <NameBlock label="Girl" name={viceGirl} />
          </div>
        </div>
      </div>
    </article>
  );
}

export default function CouncilPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0,_#f7f8f5_42%,_#eef2ef_100%)] text-slate-900">
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <header className="max-w-4xl">
          <SectionLabel>Student Council · 2026–27</SectionLabel>

          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            The students who lead the campus.
          </h1>

          <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            The Student Council brings together school-wide office-bearers and
            the four house leadership teams for the 2026–27 session. Class 12
            students hold the primary offices, with Class 11 students serving
            as their corresponding Vice or Joint office-bearers.
          </p>
        </header>

        <div className="mt-16">
          <div className="mb-8">
            <SectionLabel>School Council</SectionLabel>

            <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  School-wide leadership
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  The school-wide council is organised from executive
                  leadership into three functional areas.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                Class 12 primary
                <span className="mx-1 text-slate-300">→</span>
                <span className="h-2 w-2 rounded-full bg-slate-300" />
                Class 11 vice / joint
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-slate-300" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Executive leadership
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {EXECUTIVE_LEADERSHIP.map((leader) => (
                <ExecutiveCard
                  key={leader.title}
                  title={leader.title}
                  gender={leader.gender}
                  primary={leader.primary}
                  viceTitle={leader.viceTitle}
                  vice={leader.vice}
                />
              ))}
            </div>
          </div>

          <div className="mt-12">
            <div className="mb-4 flex items-center gap-3">
              <span className="h-px w-8 bg-slate-300" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Functional leadership
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
              {FUNCTIONAL_LEADERSHIP.map((area) => (
                <FunctionalLeadershipCard
                  key={area.title}
                  title={area.title}
                  description={area.description}
                  primaryLabel={area.primaryLabel}
                  primaryBoy={area.primaryBoy}
                  primaryGirl={area.primaryGirl}
                  secondaryLabel={area.secondaryLabel}
                  secondaryBoy={area.secondaryBoy}
                  secondaryGirl={area.secondaryGirl}
                  accent={area.accent}
                  softAccent={area.softAccent}
                  border={area.border}
                  text={area.text}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="my-20 flex items-center gap-5">
          <div className="h-px flex-1 bg-slate-200" />
          <div className="h-2 w-2 rounded-full bg-slate-300" />
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <section>
          <div className="mb-8">
            <SectionLabel>House Leadership</SectionLabel>

            <div className="mt-2 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                  Four houses, one council.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Each house has its own Captain and Vice Captain leadership
                  team within the Student Council.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {HOUSE_LEADERSHIP.map((house) => (
              <HouseCard
                key={house.name}
                name={house.name}
                color={house.color}
                captainBoy={house.captainBoy}
                captainGirl={house.captainGirl}
                viceBoy={house.viceBoy}
                viceGirl={house.viceGirl}
              />
            ))}
          </div>
        </section>

        <div className="mt-16 rounded-3xl border border-slate-200/70 bg-white/70 px-6 py-6 text-center shadow-sm sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">
            Student Council · 2026–27
          </p>

          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
            School-wide leadership and house leadership form one student
            council structure across the campus.
          </p>
        </div>
      </section>
    </main>
  );
}
