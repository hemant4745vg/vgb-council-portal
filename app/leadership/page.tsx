import type { ReactNode } from "react";

const SENIOR_LEADERSHIP = [
  {
    title: "Principal",
    name: "Ms Meera Pandey",
    description:
      "Providing academic, pastoral and institutional leadership across the campus.",
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
    glow: "bg-blue-400/20",
    number: "01",
  },
  {
    title: "Head — Administration & Campus Life",
    name: "Col. Abhishake Rai",
    description:
      "Leading administration, campus operations and the wider life of the school.",
    gradient: "from-emerald-600 via-teal-500 to-cyan-500",
    glow: "bg-emerald-400/20",
    number: "02",
  },
  {
    title: "CEO, VidyaGyan Schools",
    name: "Col. Ajay Kumar",
    description:
      "Providing institutional leadership across the VidyaGyan Schools.",
    gradient: "from-fuchsia-600 via-violet-600 to-indigo-600",
    glow: "bg-fuchsia-400/20",
    number: "03",
  },
];

const HOUSE_LEADERSHIP = [
  {
    name: "Jal",
    descriptor: "Water",
    color: "blue",
    hm: "Ananya Rudra",
    chm: "Sushil Thapa",
  },
  {
    name: "Vayu",
    descriptor: "Air",
    color: "yellow",
    hm: "Anjani Rai",
    chm: "Tarannum",
  },
  {
    name: "Agni",
    descriptor: "Fire",
    color: "red",
    hm: "Jayati Sah",
    chm: "Animesh Singh",
  },
  {
    name: "Prithvi",
    descriptor: "Earth",
    color: "green",
    hm: "Rajeev Kumar",
    chm: "Sakshi",
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

function SeniorLeaderCard({
  title,
  name,
  description,
  gradient,
  glow,
  number,
}: {
  title: string;
  name: string;
  description: string;
  gradient: string;
  glow: string;
  number: string;
}) {
  return (
    <article className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_18px_50px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-28px_rgba(15,23,42,0.45)]">
      <div
        className={`relative overflow-hidden bg-gradient-to-br ${gradient} px-6 py-7 sm:px-7 sm:py-8`}
      >
        <div
          className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${glow} blur-2xl`}
        />

        <div className="pointer-events-none absolute -bottom-8 right-2 select-none text-[8rem] font-black leading-none text-white/10">
          {number}
        </div>

        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/70">
            Senior leadership
          </p>

          <h3 className="mt-3 max-w-sm text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
            {title}
          </h3>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-7 sm:py-7">
        <p className="text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
          {name}
        </p>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          {description}
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-100" />

          <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-300">
            Leadership
          </span>
        </div>
      </div>
    </article>
  );
}

function HouseCard({
  name,
  descriptor,
  color,
  hm,
  chm,
  index,
}: {
  name: string;
  descriptor: string;
  color: string;
  hm: string;
  chm: string;
  index: number;
}) {
  const style = HOUSE_STYLES[color];

  return (
    <article
      className={`group relative overflow-hidden rounded-[2rem] border ${style.border} bg-white shadow-[0_16px_45px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-28px_rgba(15,23,42,0.45)]`}
    >
      {/* House Header */}
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

        <div className="relative">
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
      </div>

      {/* House Masters */}
      <div className="p-6 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* House Master */}
          <div
            className={`rounded-2xl border ${style.border} ${style.soft} p-5`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${style.accent}`}
              />

              <p
                className={`text-[10px] font-bold uppercase tracking-[0.14em] ${style.text}`}
              >
                House Master
              </p>
            </div>

            <p className="mt-4 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
              {hm}
            </p>
          </div>

          {/* Co-House Master */}
          <div
            className={`rounded-2xl border ${style.border} ${style.soft} p-5`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${style.accent}`}
              />

              <p
                className={`text-[10px] font-bold uppercase tracking-[0.14em] ${style.text}`}
              >
                Co-House Master
              </p>
            </div>

            <p className="mt-4 text-lg font-bold tracking-tight text-slate-950 sm:text-xl">
              {chm}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
export default function LeadershipPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f7f3] text-slate-900">
      {/* HERO */}
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
                    School Leadership · 2026–27
                  </span>
                </div>

                <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.94] tracking-[-0.045em] text-white sm:text-6xl lg:text-7xl">
                  The people
                  <br />
                  who guide
                  <br />
                  <span className="bg-gradient-to-r from-cyan-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
                    the campus.
                  </span>
                </h1>

                <p className="mt-7 max-w-xl text-sm leading-6 text-white/65 sm:text-base">
                  The institutional leadership of VidyaGyan, from senior school
                  administration to the House Masters and Co-House Masters who
                  support campus life.
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">
                    Senior Leadership
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">
                    House Masters
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/70">
                    4 Houses
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
                        One campus
                      </p>

                      <p className="mt-1 text-xl font-black tracking-tight text-white">
                        One leadership
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Senior Leadership
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                Principal · Administration · CEO
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                House Leadership
              </p>

              <p className="mt-1 text-sm font-bold text-slate-900">
                HM · CHM · Jal · Vayu · Agni · Prithvi
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SENIOR LEADERSHIP */}
      <section
        id="senior-leadership"
        className="mx-auto max-w-7xl px-5 pb-20 lg:px-8 lg:pb-28"
      >
        <SectionHeader
          eyebrow="01 · Senior Leadership"
          title="Institutional leadership"
          description="The senior leadership structure overseeing the school and the wider VidyaGyan institutional ecosystem."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {SENIOR_LEADERSHIP.map((leader) => (
            <SeniorLeaderCard key={leader.title} {...leader} />
          ))}
        </div>
      </section>

      {/* HOUSE LEADERSHIP */}
      <section
        id="house-leadership"
        className="relative overflow-hidden bg-white py-20 lg:py-28"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.08),transparent_22%),radial-gradient(circle_at_90%_15%,rgba(234,179,8,0.08),transparent_22%),radial-gradient(circle_at_20%_90%,rgba(239,68,68,0.07),transparent_22%),radial-gradient(circle_at_85%_90%,rgba(16,185,129,0.08),transparent_22%)]" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
          <SectionHeader
            eyebrow="02 · House Leadership"
            title="Four houses, guided together."
            description="Each house is supported by a House Master and Co-House Master, providing adult leadership and continuity across campus life."
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

      {/* FOOTER STRIP */}
      <section className="bg-slate-950 py-14">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <SectionEyebrow light>
            VidyaGyan · School Leadership · 2026–27
          </SectionEyebrow>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/50">
            Institutional leadership and house leadership working together
            across the campus.
          </p>
        </div>
      </section>
    </main>
  );
}
