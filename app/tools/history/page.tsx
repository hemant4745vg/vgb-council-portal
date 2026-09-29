 "use client";

import { useMemo, useState } from "react";

type ClassKey = "XI" | "XII";
type ToolId =
  | "chronos"
  | "atlas"
  | "source"
  | "evidence"
  | "causality"
  | "debate"
  | "compare"
  | "network"
  | "questions"
  | "map"
  | "research";

type Tool = {
  id: ToolId;
  title: string;
  eyebrow: string;
  description: string;
};

type Event = {
  year: number;
  label: string;
  place: string;
  category: "Political" | "Economic" | "Social" | "Cultural" | "Scientific";
  note: string;
};

const XI_THEMES = [
  ["I", "Early Societies", "Writing and City Life"],
  ["II", "Empires", "An Empire Across Three Continents · Nomadic Empires"],
  ["III", "Changing Traditions", "The Three Orders · Changing Cultural Traditions"],
  ["IV", "Towards Modernisation", "Displacing Indigenous Peoples · Paths to Modernisation"],
];

const XII_THEMES = [
  ["I", "Themes in Indian History · Part I", "Bricks, Beads and Bones · Kings, Farmers and Towns · Kinship, Caste and Class · Thinkers, Beliefs and Buildings"],
  ["II", "Themes in Indian History · Part II", "Through the Eyes of Travellers · Bhakti-Sufi Traditions · Vijayanagara · Peasants, Zamindars and the State"],
  ["III", "Themes in Indian History · Part III", "Colonialism and the Countryside · Rebels and the Raj · Mahatma Gandhi and the National Movement · Framing the Constitution"],
];

const XI_TOOLS: Tool[] = [
  { id: "chronos", title: "Chronos", eyebrow: "TIME", description: "Build, filter and compare historical timelines across regions." },
  { id: "atlas", title: "Atlas Temporis", eyebrow: "PLACE", description: "Explore historical geography, routes, empires and territorial change." },
  { id: "source", title: "SourceLab", eyebrow: "EVIDENCE", description: "Interrogate primary sources using context, purpose, audience and limitation." },
  { id: "evidence", title: "Evidence Matrix", eyebrow: "EVIDENCE", description: "Separate direct evidence, inference and interpretation." },
  { id: "causality", title: "Causality Lab", eyebrow: "REASON", description: "Distinguish context, cause, trigger, process and consequence." },
  { id: "debate", title: "Debate Room", eyebrow: "INTERPRET", description: "Compare historical interpretations without flattening scholarly disagreement." },
  { id: "compare", title: "Compare", eyebrow: "CONNECT", description: "Compare societies, institutions, processes and historical developments." },
  { id: "network", title: "History Web", eyebrow: "CONNECT", description: "Follow connections between people, places, ideas, trade and institutions." },
  { id: "questions", title: "Question Lab", eyebrow: "PRACTISE", description: "Practise CBSE-style MCQ, short, long and source-based questions." },
  { id: "research", title: "Research Lab", eyebrow: "RESEARCH", description: "Turn a broad historical interest into a defensible research project." },
];

const XII_TOOLS: Tool[] = [
  ...XI_TOOLS.filter((x) => x.id !== "research"),
  { id: "map", title: "CBSE Map Practice", eyebrow: "MAP", description: "Learn and practise prescribed Class XII historical map locations." },
  { id: "research", title: "Research Lab", eyebrow: "RESEARCH", description: "Build a research question, evidence base, analysis and viva plan." },
];

const EVENTS: Event[] = [
  { year: -3500, label: "Early urban centres", place: "Mesopotamia", category: "Social", note: "Writing and urban life develop together in complex ways." },
  { year: -2600, label: "Mature Harappan phase", place: "South Asia", category: "Social", note: "Large planned settlements, craft production and long-distance exchange." },
  { year: -322, label: "Mauryan consolidation", place: "South Asia", category: "Political", note: "A major imperial formation in the subcontinent." },
  { year: 117, label: "Roman Empire at great extent", place: "Mediterranean", category: "Political", note: "A useful anchor for studying imperial administration, society and slavery." },
  { year: 622, label: "Rise of a new Islamic polity", place: "Arabia", category: "Political", note: "A major transformation in the political and religious landscape." },
  { year: 1206, label: "Mongol expansion begins", place: "Central Asia", category: "Political", note: "Genghis Khan and the Mongol world reshape Eurasian connections." },
  { year: 1453, label: "Fall of Constantinople", place: "Eastern Mediterranean", category: "Political", note: "An important marker within changing Eurasian political networks." },
  { year: 1517, label: "Reformation begins", place: "Europe", category: "Cultural", note: "Religious reform becomes a wider political and social process." },
  { year: 1543, label: "Copernican publication", place: "Europe", category: "Scientific", note: "Part of the wider Scientific Revolution." },
  { year: 1600, label: "English East India Company founded", place: "England / Asia", category: "Economic", note: "Useful anchor for the changing history of global commerce and empire." },
  { year: 1757, label: "Battle of Plassey", place: "Bengal", category: "Political", note: "A major turning point in the expansion of British power in India." },
  { year: 1776, label: "American Declaration", place: "North America", category: "Political", note: "Part of a wider age of political transformation." },
  { year: 1789, label: "French Revolution", place: "France", category: "Political", note: "A major event for studying revolution, citizenship and state formation." },
  { year: 1857, label: "Revolt of 1857", place: "India", category: "Political", note: "Study causes, spread, representations and consequences." },
  { year: 1911, label: "Xinhai Revolution", place: "China", category: "Political", note: "A major step in China's transition away from imperial rule." },
  { year: 1919, label: "Treaty of Versailles", place: "Europe", category: "Political", note: "A useful post-war anchor for modernisation and nationalism." },
  { year: 1947, label: "Independence and Partition", place: "South Asia", category: "Political", note: "A defining transition into the postcolonial era." },
  { year: 1950, label: "Constitution of India comes into force", place: "India", category: "Political", note: "Connects constitution-making, citizenship and the beginning of a new era." },
  { year: 1978, label: "Deng-era reform period", place: "China", category: "Economic", note: "A major phase in China's modernisation." },
];

const XII_MAPS = [
  ["Harappan sites", ["Harappa", "Banawali", "Kalibangan", "Balakot", "Rakhigarhi", "Dholavira", "Nageshwar", "Lothal", "Mohenjodaro", "Chanhudaro", "Kot Diji"]],
  ["Mahajanapadas and cities", ["Vajji", "Magadha", "Kosala", "Kuru", "Panchala", "Gandhara", "Avanti", "Rajgir", "Ujjain", "Taxila", "Varanasi"]],
  ["Ashokan inscriptions", ["Sanchi", "Topra", "Meerut", "Kaushambi"]],
  ["Buddhist sites", ["Nagarjunakonda", "Sanchi", "Amaravati", "Lumbini", "Bharhut", "Bodh Gaya", "Ajanta"]],
  ["Vijayanagara and Deccan", ["Bidar", "Golconda", "Bijapur", "Vijayanagar", "Chandragiri", "Kanchipuram", "Mysore", "Thanjavur", "Kolar", "Tirunelveli"]],
  ["Mughal territories and cities", ["Delhi", "Agra", "Panipat", "Amber", "Ajmer", "Lahore", "Goa"]],
  ["1857", ["Delhi", "Meerut", "Jhansi", "Lucknow", "Kanpur", "Azamgarh", "Calcutta", "Benaras", "Gwalior", "Jabalpur", "Agra", "Awadh"]],
  ["National Movement", ["Champaran", "Kheda", "Ahmedabad", "Benaras", "Amritsar", "Chauri Chaura", "Lahore", "Bardoli", "Dandi", "Bombay", "Karachi"]],
];

const SOURCES = [
  {
    title: "A royal inscription",
    type: "Inscription",
    context: "A state-sponsored inscription placed in a public or monumental setting.",
    purpose: "To communicate an official message to a defined audience.",
    audience: "Subjects, officials and wider communities encountering the inscription.",
    tells: "Political priorities, language, ideology, claims of authority and the values the issuer wanted remembered.",
    cannot: "It does not automatically provide an unbiased account of how ordinary people experienced the policy.",
  },
  {
    title: "A traveller's account",
    type: "Travel account",
    context: "A visitor describing a society from an outsider's position.",
    purpose: "To record observations, impressions and information for readers elsewhere.",
    audience: "Readers interested in distant societies.",
    tells: "Descriptions of cities, customs, institutions and visible social practices.",
    cannot: "It may exaggerate novelty, misunderstand local practices or privilege what was visible to the traveller.",
  },
  {
    title: "A colonial official report",
    type: "Official archive",
    context: "An administrative document produced within a colonial bureaucracy.",
    purpose: "To record, classify or justify administrative action.",
    audience: "Officials and institutions within the colonial state.",
    tells: "How the administration understood a problem and what it chose to measure or regulate.",
    cannot: "Its categories and interests are not neutral mirrors of Indian society.",
  },
  {
    title: "A newspaper report",
    type: "Newspaper",
    context: "A contemporaneous account written for a public readership.",
    purpose: "To inform, interpret or persuade readers about current events.",
    audience: "The publication's readership.",
    tells: "Public discourse, contemporary vocabulary, reported events and competing political positions.",
    cannot: "It cannot by itself establish every reported claim as independently verified fact.",
  },
];

const COMPARISONS: Record<string, string[][]> = {
  "Slavery vs Serfdom": [
    ["Status", "Enslaved people were treated as property in many systems.", "Serfs were tied to land and obligations but were not generally identical to chattel slaves."],
    ["Mobility", "Often severely restricted by law and coercion.", "Usually restricted by customary and legal obligations to an estate."],
    ["Labour", "Could be bought, sold or compelled under highly coercive systems.", "Agricultural labour was exchanged for access to land and customary rights."],
    ["Historical context", "Varied enormously across societies and periods.", "Particularly associated with medieval European feudal structures."],
  ],
  "China vs Japan": [
    ["Political change", "China moved from imperial rule through revolution to Communist rule and later reform.", "Japan moved through Meiji transformation, imperial expansion, defeat in 1945 and post-war reconstruction."],
    ["Modernisation", "Reform involved changing state, economy and ideology across several political phases.", "State-led industrialisation and institutional transformation accelerated after the Meiji Restoration."],
    ["External pressure", "Western imperialism and unequal treaties shaped modern Chinese history.", "Foreign pressure and unequal treaties helped catalyse Japanese state transformation."],
    ["Key caution", "Neither trajectory can be reduced to a single linear model of 'modernisation'.", "The Japanese path also combined industrialisation, nationalism, empire and later democratic reforms."],
  ],
  "Mughal vs British revenue": [
    ["State relationship", "Revenue collection was embedded in a wider imperial agrarian structure.", "Colonial systems reorganised revenue extraction around different administrative settlements."],
    ["Intermediaries", "Zamindars and other local actors occupied varied positions.", "Different settlements formalised different relationships among state, intermediaries and cultivators."],
    ["Evidence", "Court records, administrative documents and later scholarship are used together.", "Official reports and archives are valuable but need critical reading."],
    ["Historical question", "How did agrarian relations sustain the state?", "How did colonial revenue systems reshape rural society and production?"],
  ],
};

function SectionButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
        active
          ? "bg-slate-950 text-white shadow-sm"
          : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {children}
    </button>
  );
}

function Panel({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-5 sm:p-6">
        {eyebrow && <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">{eyebrow}</div>}
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Chronos() {
  const [category, setCategory] = useState("All");
  const [region, setRegion] = useState("All");
  const filtered = EVENTS.filter(
    (e) =>
      (category === "All" || e.category === category) &&
      (region === "All" || e.place.includes(region))
  );

  const fmt = (y: number) => (y < 0 ? `${Math.abs(y)} BCE` : `${y} CE`);

  return (
    <Panel
      title="Chronos"
      eyebrow="Interactive timeline"
      description="History becomes much easier to reason about when events can be placed beside one another rather than memorised as isolated dates."
    >
      <div className="flex flex-wrap gap-2">
        {["All", "Political", "Economic", "Social", "Cultural", "Scientific"].map((x) => (
          <button
            key={x}
            onClick={() => setCategory(x)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              category === x ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {x}
          </button>
        ))}
        {["All", "India", "Europe", "China", "Mediterranean"].map((x) => (
          <button
            key={x}
            onClick={() => setRegion(x)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              region === x ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="relative mt-8">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200 sm:left-1/2" />
        <div className="space-y-5">
          {filtered.map((e, i) => (
            <article
              key={`${e.year}-${e.label}`}
              className={`relative grid gap-4 sm:grid-cols-2 ${i % 2 ? "" : ""}`}
            >
              <div className={`pl-9 sm:pl-0 ${i % 2 ? "sm:order-2 sm:text-left sm:pl-8" : "sm:pr-8 sm:text-right"}`}>
                <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{fmt(e.year)}</div>
                <h3 className="mt-1 font-semibold text-slate-900">{e.label}</h3>
                <div className="text-xs font-medium text-slate-500">{e.place} · {e.category}</div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{e.note}</p>
              </div>
              <div className={`absolute left-[7px] top-1.5 h-2.5 w-2.5 rounded-full bg-slate-950 ring-4 ring-white sm:left-[calc(50%-5px)] ${i % 2 ? "" : ""}`} />
            </article>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function HistoricalAtlas() {
  const [year, setYear] = useState(1500);
  const [layer, setLayer] = useState("Political");

  const snapshots = [
    [0, "c. 1 BCE", "Roman Mediterranean · Kushan world · major South Asian states"],
    [622, "622 CE", "Early Islamic world · Byzantine Empire · Tang China"],
    [1200, "c. 1200", "Mongol-era Eurasia · European kingdoms · Indian regional states"],
    [1500, "c. 1500", "Ottoman world · Vijayanagara · Ming China · European maritime expansion"],
    [1700, "c. 1700", "Mughal Empire · Qing China · European commercial empires"],
    [1857, "1857", "British imperial expansion · revolt centres across North India"],
    [1919, "1919", "Post-war empires · nationalist movements · colonial world"],
    [1950, "1950", "Postcolonial states · Cold War political geography"],
  ];
  const snap = snapshots.reduce((a, b) => (Math.abs(b[0] as number - year) < Math.abs(a[0] as number - year) ? b : a));

  return (
    <Panel
      title="Atlas Temporis"
      eyebrow="Historical geography"
      description="A time slider changes the historical frame. The point is not to pretend borders were permanent, but to make territorial change visible."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div>
          <div className="rounded-3xl border border-slate-200 bg-[#f5f1e8] p-5">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[.15em] text-slate-500">
              <span>Historical frame</span><span>{year < 0 ? `${Math.abs(year)} BCE` : `${year} CE`}</span>
            </div>
            <input
              className="mt-5 w-full accent-slate-950"
              type="range"
              min="-1000"
              max="2000"
              step="1"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
            <div className="mt-6 overflow-hidden rounded-2xl border border-[#d8cfbd] bg-[#ece4d2]">
              <svg viewBox="0 0 800 360" className="h-auto w-full" aria-label="stylised historical atlas">
                <path d="M92 106 L145 66 L216 74 L259 112 L318 92 L374 120 L430 96 L493 130 L548 112 L616 154 L685 171 L648 226 L574 239 L528 281 L450 264 L388 293 L324 255 L262 274 L205 235 L137 242 L104 194 Z" fill="#d7c9ae" stroke="#9c8e74" strokeWidth="2" />
                <path d="M104 194 L137 242 L205 235 L262 274 L324 255 L388 293 L450 264 L528 281 L574 239 L648 226 L685 171 L616 154 L548 112 L493 130 L430 96 L374 120 L318 92 L259 112 L216 74 L145 66 L92 106 Z" fill="none" stroke="#b4a68e" strokeDasharray="5 5" />
                <path d="M180 145 C280 105 375 120 470 160 C545 192 590 190 640 174" fill="none" stroke="#8f7b5a" strokeWidth="3" opacity=".7" />
                <path d="M225 225 C300 190 375 205 465 230 C530 246 585 236 625 210" fill="none" stroke="#8f7b5a" strokeWidth="2" opacity=".55" />
                <text x="390" y="182" textAnchor="middle" fontSize="20" fontWeight="700" fill="#665b49">HISTORICAL WORLD</text>
                <text x="400" y="207" textAnchor="middle" fontSize="11" fill="#7b705e">{String(snap[1])}</text>
                <circle cx="225" cy="157" r="5" fill="#6b4f35" />
                <circle cx="418" cy="143" r="5" fill="#6b4f35" />
                <circle cx="554" cy="201" r="5" fill="#6b4f35" />
              </svg>
            </div>
            <div className="mt-4 rounded-2xl bg-white/70 p-4">
              <div className="text-xs font-bold uppercase tracking-[.14em] text-slate-500">{snap[1]}</div>
              <p className="mt-1 text-sm font-medium text-slate-800">{snap[2]}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-500">Layers</div>
            <div className="mt-3 grid gap-2">
              {["Political", "Trade", "Culture", "Conflict"].map((x) => (
                <button key={x} onClick={() => setLayer(x)} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold ${layer === x ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}>
                  {x}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-slate-950 p-4 text-white">
            <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Historical caution</div>
            <p className="mt-2 text-xs leading-5 text-slate-300">
              Maps simplify reality. Boundaries, influence and political control were often contested, overlapping or changing. Treat every map as an argument about space, not the past itself.
            </p>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function SourceLab() {
  const [index, setIndex] = useState(0);
  const s = SOURCES[index];

  return (
    <Panel title="SourceLab" eyebrow="Read the evidence" description="A source is evidence, not a magical truth dispenser. Analyse what it can reveal and where its limits begin.">
      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        <div className="space-y-2">
          {SOURCES.map((x, i) => (
            <button key={x.title} onClick={() => setIndex(i)} className={`w-full rounded-2xl p-4 text-left ${index === i ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-700"}`}>
              <div className="text-[10px] font-bold uppercase tracking-[.15em] opacity-60">{x.type}</div>
              <div className="mt-1 text-sm font-semibold">{x.title}</div>
            </button>
          ))}
        </div>
        <div className="rounded-3xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-950 p-5 text-white">
            <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{s.type}</div>
            <h3 className="mt-1 text-xl font-semibold">{s.title}</h3>
          </div>
          <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
            {[
              ["CONTEXT", s.context],
              ["PURPOSE", s.purpose],
              ["AUDIENCE", s.audience],
              ["WHAT IT TELLS US", s.tells],
              ["WHAT IT CANNOT TELL US", s.cannot],
            ].map(([a, b]) => (
              <div key={a} className="bg-white p-4">
                <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{a}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function EvidenceMatrix() {
  const rows = [
    ["Archaeological remains", "Direct evidence", "Physical remains can establish material patterns.", "They rarely explain motives on their own."],
    ["Official report", "Evidence + interpretation", "Shows what an administration recorded and classified.", "Its categories may reflect institutional interests."],
    ["Later historian", "Interpretation", "Can synthesise multiple sources and debates.", "It is itself an interpretation shaped by method and evidence."],
    ["Traveller account", "Evidence + perspective", "Can illuminate places and practices observed by the traveller.", "Observation is selective and culturally situated."],
  ];

  return (
    <Panel title="Evidence Matrix" eyebrow="Can we know this?" description="Classify the epistemic status of a claim before treating it as settled fact.">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead><tr className="border-b border-slate-200 text-[10px] uppercase tracking-[.14em] text-slate-400"><th className="p-3">Material</th><th className="p-3">Status</th><th className="p-3">Can establish</th><th className="p-3">Limitation</th></tr></thead>
          <tbody>
            {rows.map((r) => <tr key={r[0]} className="border-b border-slate-100 align-top"><td className="p-3 font-semibold">{r[0]}</td><td className="p-3"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold">{r[1]}</span></td><td className="p-3 text-slate-600">{r[2]}</td><td className="p-3 text-slate-500">{r[3]}</td></tr>)}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function CausalityLab() {
  const [event, setEvent] = useState("Revolt of 1857");
  const data: Record<string, { context: string[]; causes: string[]; trigger: string; process: string[]; consequences: string[] }> = {
    "Revolt of 1857": {
      context: ["Expansion of British political authority", "Changing military and administrative structures", "Economic and social tensions"],
      causes: ["Political grievances", "Economic grievances", "Military discontent", "Social and religious anxieties"],
      trigger: "The cartridge controversy became an immediate catalyst within a much wider context.",
      process: ["Initial uprising at Meerut", "Rebel seizure of Delhi", "Spread to major centres including Kanpur, Lucknow and Jhansi", "Suppression and reorganisation of colonial rule"],
      consequences: ["Company rule ended", "Crown rule began in 1858", "Army and administrative structures were reorganised", "New political strategies developed"],
    },
    "French Revolution": {
      context: ["Fiscal strain", "Social hierarchy", "Political institutions under pressure"],
      causes: ["State financial crisis", "Inequalities in taxation", "Political demands for representation", "Enlightenment-era political ideas"],
      trigger: "The political crisis of 1789 rapidly escalated after the Estates-General and subsequent events.",
      process: ["Constitutional change", "Radicalisation", "Republican phase", "Terror and reaction"],
      consequences: ["Political institutions transformed", "Social and legal changes", "European political repercussions"],
    },
  };
  const d = data[event];

  return (
    <Panel title="Causality Lab" eyebrow="Context → cause → process → consequence" description="The tool forces a distinction between background conditions and immediate triggers, because history is not a list of four bullet points labelled 'causes'.">
      <div className="flex flex-wrap gap-2">
        {Object.keys(data).map((x) => <button key={x} onClick={() => setEvent(x)} className={`rounded-xl px-4 py-2 text-xs font-semibold ${event === x ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>{x}</button>)}
      </div>
      <div className="mt-6 grid gap-3 lg:grid-cols-5">
        {[
          ["01", "CONTEXT", d.context],
          ["02", "CAUSES", d.causes],
          ["03", "TRIGGER", [d.trigger]],
          ["04", "PROCESS", d.process],
          ["05", "CONSEQUENCES", d.consequences],
        ].map(([n, title, items]) => (
          <div key={title as string} className="rounded-2xl border border-slate-200 p-4">
            <div className="text-[10px] font-bold tracking-[.15em] text-slate-400">{n} · {title}</div>
            <ul className="mt-3 space-y-2">{(items as string[]).map((x) => <li key={x} className="text-xs leading-5 text-slate-600"><span className="mr-2 text-slate-300">→</span>{x}</li>)}</ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DebateRoom() {
  const [q, setQ] = useState("Why did the Roman Empire transform?");
  const debates = {
    "Why did the Roman Empire transform?": [
      ["Political and administrative pressures", "Large territorial systems created persistent problems of administration, succession and military organisation.", "Political explanations can understate economic, social and cultural processes."],
      ["Economic transformation", "Changes in taxation, trade and landholding altered the resources available to state and society.", "Economic variables did not operate independently of political decisions."],
      ["Cultural and religious change", "Religious and cultural transformations altered institutions, identities and public life.", "Cultural explanations cannot alone account for every institutional change."],
    ],
    "Why did the Harappan urban system change?": [
      ["Environmental factors", "Changing ecological conditions may have affected settlement and resource patterns.", "Environmental change does not automatically explain social responses."],
      ["Economic reorganisation", "Long-distance exchange and settlement networks changed over time.", "Trade disruption is difficult to infer from incomplete archaeological evidence."],
      ["Regionalisation", "Large urban systems may have given way to more dispersed regional patterns.", "Regional diversity makes a single explanation hazardous."],
    ],
  } as Record<string, string[][]>;

  return (
    <Panel title="Debate Room" eyebrow="Historians' interpretations" description="Compare arguments, evidence and limitations. The portal does not manufacture a winner where the historical evidence does not justify one.">
      <div className="flex flex-wrap gap-2">{Object.keys(debates).map((x) => <button key={x} onClick={() => setQ(x)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${q === x ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>{x}</button>)}</div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {debates[q].map(([title, argument, limit]) => (
          <article key={title} className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold">{title}</h3>
            <div className="mt-4 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Argument</div>
            <p className="mt-1 text-sm leading-6 text-slate-600">{argument}</p>
            <div className="mt-4 text-[10px] font-bold uppercase tracking-[.14em] text-slate-400">Limitation / question</div>
            <p className="mt-1 text-sm leading-6 text-slate-500">{limit}</p>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function CompareTool() {
  const [comparison, setComparison] = useState(Object.keys(COMPARISONS)[0]);
  const rows = COMPARISONS[comparison];

  return (
    <Panel title="Comparison Engine" eyebrow="Compare without flattening differences" description="The syllabus repeatedly asks students to compare systems and processes. This tool keeps comparison anchored to explicit dimensions.">
      <div className="flex flex-wrap gap-2">{Object.keys(COMPARISONS).map((x) => <button key={x} onClick={() => setComparison(x)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${comparison === x ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>{x}</button>)}</div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[700px] border-separate border-spacing-0 overflow-hidden rounded-2xl border border-slate-200 text-sm">
          <thead><tr><th className="w-1/4 border-b border-slate-200 bg-slate-50 p-3 text-left text-[10px] uppercase tracking-[.14em] text-slate-400">Dimension</th><th className="border-b border-slate-200 bg-slate-50 p-3 text-left">A</th><th className="border-b border-slate-200 bg-slate-50 p-3 text-left">B</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r[0]}><td className="border-b border-slate-100 p-3 font-semibold">{r[0]}</td><td className="border-b border-slate-100 p-3 text-slate-600">{r[1]}</td><td className="border-b border-slate-100 p-3 text-slate-600">{r[2]}</td></tr>)}</tbody>
        </table>
      </div>
    </Panel>
  );
}

function HistoryWeb() {
  const [selected, setSelected] = useState("Industrial Revolution");
  const nodes: Record<string, { label: string; x: number; y: number; text: string }[]> = {
    "Industrial Revolution": [
      { label: "Technology", x: 50, y: 25, text: "Mechanisation and new energy systems." },
      { label: "Empire", x: 22, y: 53, text: "Industrial capacity interacted with imperial expansion." },
      { label: "Cities", x: 78, y: 53, text: "Urbanisation changed work and social life." },
      { label: "India", x: 28, y: 82, text: "Colonial economic change affected crafts, trade and production." },
      { label: "Labour", x: 72, y: 82, text: "Industrial work generated new social relations and political movements." },
    ],
    "Renaissance": [
      { label: "Humanism", x: 50, y: 25, text: "A major intellectual current associated with Renaissance learning." },
      { label: "Art", x: 22, y: 53, text: "New approaches to representation, perspective and patronage." },
      { label: "Printing", x: 78, y: 53, text: "The spread of print altered access to texts and ideas." },
      { label: "Reformation", x: 28, y: 82, text: "Religious change unfolded within wider cultural and political transformations." },
      { label: "Science", x: 72, y: 82, text: "Renaissance and early modern intellectual changes intersected with scientific developments." },
    ],
  };

  const ns = nodes[selected];

  return (
    <Panel title="History Web" eyebrow="Connections" description="Select an idea and follow the network. The purpose is to make cross-theme relationships visible, not to pretend every historical connection is equally strong.">
      <div className="flex gap-2">{Object.keys(nodes).map((x) => <button key={x} onClick={() => setSelected(x)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${selected === x ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>{x}</button>)}</div>
      <div className="relative mt-6 min-h-[420px] overflow-hidden rounded-3xl bg-slate-950">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
          {ns.map((n, i) => <line key={n.label} x1="50" y1="50" x2={n.x} y2={n.y} stroke="rgba(255,255,255,.18)" strokeWidth=".35" />)}
        </svg>
        <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 p-3 text-center text-sm font-bold text-white backdrop-blur">{selected}</div>
        {ns.map((n) => (
          <button key={n.label} onClick={() => alert(`${n.label}: ${n.text}`)} style={{ left: `${n.x}%`, top: `${n.y}%` }} className="absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-left text-white backdrop-blur transition hover:bg-white/20">
            <div className="text-xs font-bold">{n.label}</div>
            <div className="mt-1 max-w-[150px] text-[10px] leading-4 text-slate-300">{n.text}</div>
          </button>
        ))}
      </div>
    </Panel>
  );
}

function QuestionLab() {
  const questions = [
    { type: "MCQ", q: "Which distinction is most useful when analysing a historical source?", options: ["Its age alone", "What it can reveal and what it cannot establish", "Whether it is famous", "Whether it appears in a textbook"], answer: 1 },
    { type: "SHORT", q: "Why should a historian distinguish a trigger from a long-term cause?", options: ["Because they are identical", "Because a trigger is always more important", "Because immediate catalysts operate within wider conditions", "Because causes cannot be studied"], answer: 2 },
    { type: "SOURCE", q: "A colonial administrative report records a revenue dispute. What should be checked first?", options: ["Only the date", "Its institutional purpose and categories", "The font used", "Whether the report is handwritten"], answer: 1 },
  ];
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const q = questions[index];

  return (
    <Panel title="Question Lab" eyebrow="CBSE-style practice" description="Questions are organised around the syllabus' emphasis on knowledge, understanding, application, analysis and source-based reasoning.">
      <div className="flex items-center justify-between"><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-600">{q.type}</span><span className="text-xs text-slate-400">{index + 1} / {questions.length}</span></div>
      <h3 className="mt-5 text-lg font-semibold leading-7">{q.q}</h3>
      <div className="mt-5 grid gap-2">{q.options.map((o, i) => <button key={o} onClick={() => setPicked(i)} className={`rounded-2xl border p-4 text-left text-sm ${picked === i ? (i === q.answer ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-rose-300 bg-rose-50 text-rose-800") : "border-slate-200 hover:bg-slate-50"}`}>{String.fromCharCode(65 + i)}. {o}</button>)}</div>
      <div className="mt-5 flex items-center justify-between">{picked !== null && <div className="text-xs font-semibold text-slate-500">{picked === q.answer ? "Correct. The distinction matters because historical explanation is multi-layered." : "Not quite. Re-read the question as an evidence problem, not a recall problem."}</div>}<button disabled={picked === null} onClick={() => { setIndex((index + 1) % questions.length); setPicked(null); }} className="ml-auto rounded-xl bg-slate-950 px-4 py-2 text-xs font-semibold text-white disabled:opacity-30">Next question →</button></div>
    </Panel>
  );
}

function MapPractice() {
  const [set, setSet] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const group = XII_MAPS[set];

  return (
    <Panel title="CBSE Map Practice" eyebrow="5-mark map work" description="The location lists are derived from the supplied CBSE History syllabus. Learn first, then test recall without labels.">
      <div className="flex flex-wrap gap-2">{XII_MAPS.map(([name], i) => <button key={name} onClick={() => { setSet(i); setRevealed(false); }} className={`rounded-xl px-3 py-2 text-xs font-semibold ${set === i ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>{name}</button>)}</div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Practice canvas</div>
          <div className="relative mt-5 h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#101820]">
            <svg viewBox="0 0 700 360" className="h-full w-full">
              <path d="M180 45 C250 20 350 35 430 70 C500 98 555 110 610 170 C570 220 540 265 470 300 C385 328 300 300 250 270 C210 230 175 195 130 160 C115 110 140 72 180 45 Z" fill="#26323a" stroke="#6b7780" strokeWidth="2" />
              {group[1].map((name, i) => {
                const x = 180 + ((i * 83) % 390);
                const y = 75 + ((i * 47) % 205);
                return <g key={name}><circle cx={x} cy={y} r="5" fill={revealed ? "#e7c77a" : "#71808b"} /><text x={x + 9} y={y + 4} fontSize="10" fill={revealed ? "#fff" : "#91a0a9"}>{revealed ? name : `Location ${i + 1}`}</text></g>;
              })}
              <text x="350" y="345" textAnchor="middle" fontSize="12" fill="#82909a">schematic practice map · use official maps for precise geography</text>
            </svg>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-200 p-5">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Current set</div>
          <h3 className="mt-1 text-lg font-semibold">{group[0]}</h3>
          <p className="mt-2 text-xs leading-5 text-slate-500">First attempt to recall the locations. Reveal the labels only after committing an answer.</p>
          <button onClick={() => setRevealed(!revealed)} className="mt-5 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white">{revealed ? "Hide labels" : "Reveal locations"}</button>
          <div className="mt-5 space-y-2">{group[1].map((x) => <div key={x} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">{revealed ? x : "••••••••"}</div>)}</div>
        </div>
      </div>
    </Panel>
  );
}

function ResearchLab() {
  const [question, setQuestion] = useState("");
  const [stage, setStage] = useState(0);
  const stages = ["Topic", "Question", "Hypothesis", "Evidence", "Analysis", "Conclusion", "Bibliography", "Viva"];
  const tips = [
    "Start with a bounded historical issue, not an entire civilisation.",
    "A useful research question identifies a relationship, change, comparison or problem.",
    "A hypothesis is a proposition that can be examined against evidence, not a decorative prediction.",
    "Prefer a mix of primary and authenticated secondary sources where appropriate.",
    "Separate description from interpretation. Explain why the evidence supports your inference.",
    "State what your evidence supports, what remains uncertain and the limitations of your study.",
    "Record sources while researching. Do not reconstruct a bibliography from memory at midnight.",
    "Prepare to defend your source choices, method, evidence and conclusions orally.",
  ];

  return (
    <Panel title="History Research Lab" eyebrow="Project work · 20 marks" description="A structured workspace based on the CBSE project sequence: initiation, data collection, analysis and interpretation, conclusion, bibliography and viva.">
      <div className="flex flex-wrap gap-2">{stages.map((x, i) => <button key={x} onClick={() => setStage(i)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${stage === i ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>{i + 1}. {x}</button>)}</div>
      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Working research question</label>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={5} placeholder="Example: How did agrarian relations shape state formation under the Mughal Empire?" className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-slate-400 focus:bg-white" />
          <div className="mt-3 rounded-2xl border border-slate-200 p-4">
            <div className="text-xs font-bold">Checklist</div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">{["Specific", "Historically grounded", "Evidence-based", "Manageable scope", "Allows analysis", "Not merely descriptive"].map((x) => <div key={x} className="text-xs text-slate-600"><span className="mr-2 text-slate-400">□</span>{x}</div>)}</div>
          </div>
        </div>
        <div className="rounded-3xl bg-slate-950 p-5 text-white">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{stages[stage]}</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{tips[stage]}</p>
          <div className="mt-6 rounded-2xl bg-white/10 p-4">
            <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">CBSE project weighting</div>
            <div className="mt-3 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between"><span>Initiation / synopsis</span><b>6</b></div>
              <div className="flex justify-between"><span>Planning / data collection</span><b>5</b></div>
              <div className="flex justify-between"><span>Analysis / conclusion</span><b>5</b></div>
              <div className="flex justify-between"><span>Viva</span><b>4</b></div>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ToolView({ id, cls }: { id: ToolId; cls: ClassKey }) {
  if (id === "chronos") return <Chronos />;
  if (id === "atlas") return <HistoricalAtlas />;
  if (id === "source") return <SourceLab />;
  if (id === "evidence") return <EvidenceMatrix />;
  if (id === "causality") return <CausalityLab />;
  if (id === "debate") return <DebateRoom />;
  if (id === "compare") return <CompareTool />;
  if (id === "network") return <HistoryWeb />;
  if (id === "questions") return <QuestionLab />;
  if (id === "map") return <MapPractice />;
  if (id === "research") return <ResearchLab />;
  return <QuestionLab />;
}

export default function HistoryToolsPage() {
  const [cls, setCls] = useState<ClassKey>("XI");
  const [selected, setSelected] = useState<ToolId>("chronos");

  const tools = cls === "XI" ? XI_TOOLS : XII_TOOLS;
  const current = tools.find((x) => x.id === selected) ?? tools[0];
  const themes = cls === "XI" ? XI_THEMES : XII_THEMES;

  const chooseClass = (next: ClassKey) => {
    setCls(next);
    setSelected("chronos");
  };

  const quick = useMemo(() => [
    ["TIME", "Chronos", "Build and compare timelines."],
    ["PLACE", "Atlas Temporis", "See historical geography change."],
    ["EVIDENCE", "SourceLab", "Read sources critically."],
    ["ARGUMENT", "Causality Lab", "Build historical explanations."],
  ], []);

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] bg-[#11151a] px-6 py-10 text-white shadow-sm sm:px-10 sm:py-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-5 -top-5 h-44 w-44 rounded-full border border-white/10" />
          <div className="absolute bottom-0 right-0 h-32 w-2/3 opacity-20" style={{ backgroundImage: "linear-gradient(135deg, transparent 48%, #d5b77a 49%, transparent 50%), linear-gradient(45deg, transparent 48%, #d5b77a 49%, transparent 50%)", backgroundSize: "34px 34px" }} />
          <div className="relative max-w-4xl">
            <div className="text-[10px] font-bold uppercase tracking-[.22em] text-slate-400">VGB Tools · History · Subject Code 027</div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.03em] sm:text-6xl">The Historian&apos;s Desk</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Read the past. Question the evidence. Connect the world. An interactive CBSE History workspace built around chronology, historical geography, source criticism, interpretation and research.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <SectionButton active={cls === "XI"} onClick={() => chooseClass("XI")}>Class XI · World History</SectionButton>
              <SectionButton active={cls === "XII"} onClick={() => chooseClass("XII")}>Class XII · Indian History</SectionButton>
            </div>
          </div>
          <div className="relative mt-10 grid gap-2 sm:grid-cols-4">
            {quick.map(([a, b, c]) => <button key={b} onClick={() => setSelected(b === "Chronos" ? "chronos" : b === "Atlas Temporis" ? "atlas" : b === "SourceLab" ? "source" : "causality")} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur hover:bg-white/10"><div className="text-[9px] font-bold tracking-[.18em] text-slate-400">{a}</div><div className="mt-1 text-sm font-semibold">{b}</div><div className="mt-1 text-[11px] leading-4 text-slate-400">{c}</div></button>)}
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">Syllabus map · Class {cls}</div>
              <h2 className="mt-1 text-xl font-semibold">What you are actually expected to understand</h2>
            </div>
            <div className="text-xs text-slate-500">CBSE History 027 · Classes XI–XII</div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {themes.map(([n, title, details]) => <div key={n} className="rounded-2xl bg-slate-50 p-4"><div className="text-[10px] font-bold tracking-[.15em] text-slate-400">SECTION {n}</div><div className="mt-1 text-sm font-semibold">{title}</div><p className="mt-2 text-xs leading-5 text-slate-500">{details}</p></div>)}
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[285px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-5">
            <div className="px-3 py-3">
              <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</div>
              <div className="mt-1 text-sm font-semibold">Class {cls} · {tools.length} tools</div>
            </div>
            <div className="space-y-1">
              {tools.map((tool) => <button key={tool.id} onClick={() => setSelected(tool.id)} className={`w-full rounded-2xl px-3 py-3 text-left transition ${selected === tool.id ? "bg-slate-950 text-white" : "hover:bg-slate-50"}`}><div className="flex items-center justify-between gap-2"><span className="text-sm font-semibold">{tool.title}</span><span className={`text-[9px] font-bold uppercase tracking-[.12em] ${selected === tool.id ? "text-slate-400" : "text-slate-400"}`}>{tool.eyebrow}</span></div><div className={`mt-1 text-[11px] leading-4 ${selected === tool.id ? "text-slate-300" : "text-slate-500"}`}>{tool.description}</div></button>)}
            </div>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Method</div>
              <p className="mt-2 text-xs leading-5 text-slate-500">History is treated here as a discipline of enquiry: chronology, context, evidence, interpretation and argument.</p>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex flex-col justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">{current.eyebrow} · Class {cls}</div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">{current.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{current.description}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500"><div className="font-semibold text-slate-900">CBSE 027</div><div>2026–27 workspace</div></div>
            </div>
            <ToolView id={selected} cls={cls} />
          </section>
        </div>

        <section className="mt-8 rounded-3xl bg-[#11151a] p-6 text-white sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">The core method</div>
              <h2 className="mt-2 text-2xl font-semibold">Event → Context → Source → Evidence → Interpretation → Argument</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">The syllabus explicitly frames History as a critical discipline and a process of enquiry. Every major tool on this page is designed around that idea.</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
              {["WHEN?", "WHERE?", "WHAT EVIDENCE?", "WHY?", "WHOSE VIEW?", "WHAT CHANGED?"].map((x) => <div key={x} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-slate-300">{x}</div>)}
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 py-6 text-xs text-slate-400">
          VGB History Tools · CBSE History 027 · Classes XI–XII · 2026–27 · Interactive historical enquiry workspace
        </footer>
      </div>
    </main>
  );
}
