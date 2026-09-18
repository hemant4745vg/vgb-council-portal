const SCHOOL_COUNCIL = [
  {
    role: "Head Boy",
    primary: "Vinay Kumar Maurya",
    secondaryRole: "Vice Head Boy",
    secondary: "Abhimanyu Singh",
  },
  {
    role: "Head Girl",
    primary: "Satakshi Gangwar",
    secondaryRole: "Vice Head Girl",
    secondary: "Kirti Singh",
  },
  {
    role: "Sports Captain · Boy",
    primary: "Nitin",
    secondaryRole: "Vice Sports Captain · Boy",
    secondary: "Abhimanyu",
  },
  {
    role: "Sports Captain · Girl",
    primary: "Roshini",
    secondaryRole: "Vice Sports Captain · Girl",
    secondary: "Nainshee Mishra",
  },
  {
    role: "Honour Secretary · Boy",
    primary: "Krish",
    secondaryRole: "Joint Honour Secretary · Boy",
    secondary: "Hemant Rathore",
  },
  {
    role: "Honour Secretary · Girl",
    primary: "Pravesh",
    secondaryRole: "Joint Honour Secretary · Girl",
    secondary: "Tejaswani",
  },
  {
    role: "Cultural Secretary · Boy",
    primary: "Dheeraj",
    secondaryRole: "Joint Cultural Secretary · Boy",
    secondary: "Aditya Maurya",
  },
  {
    role: "Cultural Secretary · Girl",
    primary: "Preet",
    secondaryRole: "Joint Cultural Secretary · Girl",
    secondary: "Satakshi Sharma",
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
  }
> = {
  blue: {
    border: "border-blue-200/80",
    background: "bg-blue-50/70",
    accent: "bg-blue-600",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
  },
  yellow: {
    border: "border-yellow-200/80",
    background: "bg-yellow-50/70",
    accent: "bg-yellow-500",
    text: "text-yellow-700",
    badge: "bg-yellow-100 text-yellow-800",
  },
  red: {
    border: "border-red-200/80",
    background: "bg-red-50/70",
    accent: "bg-red-600",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800",
  },
  green: {
    border: "border-green-200/80",
    background: "bg-green-50/70",
    accent: "bg-green-600",
    text: "text-green-700",
    badge: "bg-green-100 text-green-800",
  },
};

export default function CouncilPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#ffffff_0,_#f7f8f5_42%,_#eef2ef_100%)] text-slate-900">
      <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20">
        <div className="max-w-3xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Student Council · 2026–27
          </p>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            The students who lead the campus.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600">
            The Student Council brings together the school-wide office-bearers
            and the four house leadership teams.
          </p>
        </div>

        <div className="mt-14">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              School Council
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              School-wide leadership
            </h2>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-sm">
            <div className="hidden grid-cols-2 border-b border-slate-200 bg-slate-50/80 px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 md:grid">
              <span>Class 12 · Primary</span>
              <span>Class 11 · Vice / Joint</span>
            </div>

            <div className="divide-y divide-slate-200">
              {SCHOOL_COUNCIL.map((member) => (
                <div
                  key={member.role}
                  className="grid gap-5 px-6 py-6 transition-colors hover:bg-slate-50/70 md:grid-cols-2"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {member.role}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {member.primary}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                      {member.secondaryRole}
                    </p>
                    <p className="mt-2 text-lg font-medium text-slate-700">
                      {member.secondary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">
              House Leadership
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Four houses, one council.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {HOUSE_LEADERSHIP.map((house) => {
              const style = HOUSE_STYLES[house.color];

              return (
                <article
                  key={house.name}
                  className={`overflow-hidden rounded-3xl border ${style.border} ${style.background} shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <div className="flex items-center gap-4 border-b border-black/5 px-6 py-5">
                    <div
                      className={`h-10 w-2 rounded-full ${style.accent}`}
                    />

                    <div>
                      <h3 className={`text-2xl font-semibold ${style.text}`}>
                        {house.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        House Leadership
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-6 p-6 sm:grid-cols-2">
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">
                        House Captains
                      </p>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-400">Boy</p>
                          <p className="font-medium text-slate-800">
                            {house.captainBoy}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Girl</p>
                          <p className="font-medium text-slate-800">
                            {house.captainGirl}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.13em] text-slate-500">
                        Vice House Captains
                      </p>

                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-slate-400">Boy</p>
                          <p className="font-medium text-slate-800">
                            {house.viceBoy}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Girl</p>
                          <p className="font-medium text-slate-800">
                            {house.viceGirl}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}
                    >
                      {house.name} House
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
