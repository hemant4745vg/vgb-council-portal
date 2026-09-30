"use client";

import { useMemo, useState } from "react";

type ClassKey = "XI" | "XII";
type ToolId =
  | "constitution"
  | "rights"
  | "elections"
  | "executive"
  | "parliament"
  | "judiciary"
  | "federalism"
  | "theory"
  | "comparison"
  | "answer"
  | "world"
  | "india"
  | "research"
  | "exam";

type Tool = {
  id: ToolId;
  title: string;
  eyebrow: string;
  description: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const XI_THEMES = [
  ["I", "Indian Constitution at Work", "Constitution · Rights · Elections · Executive · Legislature · Judiciary · Federalism · Local Government · Amendments · Philosophy"],
  ["II", "Political Theory", "Political Theory · Freedom · Equality · Social Justice · Rights · Citizenship · Nationalism · Secularism"],
];

const XII_THEMES = [
  ["I", "Contemporary World Politics", "End of Bipolarity · Centres of Power · South Asia · International Organisations · Security · Environment · Globalisation"],
  ["II", "Politics in India Since Independence", "Nation-Building · Era of One-Party Dominance · Planned Development · India's External Relations · Congress System · Democratic Crisis · Regional Aspirations · Recent Developments"],
];

const XI_TOOLS: Tool[] = [
  { id: "constitution", title: "Constitution Explorer", eyebrow: "CONSTITUTION", description: "Manipulate constitutional design: authority, institutions, rights, federalism and limits on government." },
  { id: "rights", title: "Rights Lab", eyebrow: "RIGHTS", description: "Explore Fundamental Rights, reasonable restrictions and the relationship between rights and DPSP." },
  { id: "elections", title: "Election Simulator", eyebrow: "DEMOCRACY", description: "Compare FPTP and proportional representation and see how votes become seats." },
  { id: "executive", title: "Executive Explorer", eyebrow: "EXECUTIVE", description: "Compare parliamentary and presidential executives and trace the Indian executive structure." },
  { id: "parliament", title: "Parliament Simulator", eyebrow: "LEGISLATURE", description: "Follow a Bill through Parliament and test Lok Sabha, Rajya Sabha and committee roles." },
  { id: "judiciary", title: "Judiciary Lab", eyebrow: "JUDICIARY", description: "Explore jurisdiction, judicial independence, rights, review and institutional tensions." },
  { id: "federalism", title: "Federalism Explorer", eyebrow: "FEDERALISM", description: "Classify subjects and examine Union-State-Local relationships and decentralisation." },
  { id: "theory", title: "Political Theory Lab", eyebrow: "THEORY", description: "Work through freedom, equality, social justice, rights, citizenship, nationalism and secularism." },
  { id: "comparison", title: "Concept Comparison", eyebrow: "COMPARE", description: "Put political concepts side by side and identify the exact conceptual difference." },
  { id: "answer", title: "ARE Answer Builder", eyebrow: "ARGUMENT", description: "Build stronger CBSE answers using Assertion, Reasoning, Evidence and qualification." },
  { id: "research", title: "Research Lab", eyebrow: "RESEARCH", description: "Turn a political issue into a bounded research question, evidence plan and viva." },
  { id: "exam", title: "Exam Lab", eyebrow: "PRACTISE", description: "Practise knowledge, understanding, application and analysis-oriented questions." },
];

const XII_TOOLS: Tool[] = [
  { id: "world", title: "World Politics Atlas", eyebrow: "WORLD", description: "Trace Cold War, power centres, South Asia, security, environment and globalisation." },
  { id: "india", title: "India Since Independence", eyebrow: "INDIA", description: "Navigate a political timeline from independence through nation-building, crises and regional politics." },
  { id: "comparison", title: "Concept Comparison", eyebrow: "COMPARE", description: "Compare political concepts, institutions and international arrangements without flattening differences." },
  { id: "answer", title: "ARE Answer Builder", eyebrow: "ARGUMENT", description: "Build analytical CBSE answers with a visible chain from claim to evidence and qualification." },
  { id: "research", title: "Research Lab", eyebrow: "RESEARCH", description: "Build a project question, source strategy, analytical framework and viva defence." },
  { id: "exam", title: "Exam Lab", eyebrow: "PRACTISE", description: "Practise competency-oriented questions across contemporary world politics and Indian politics." },
];

const RIGHTS = [
  ["Right to Equality", "Equality before law, equal protection and constitutional limits on discrimination."],
  ["Right to Freedom", "A cluster of freedoms subject to constitutionally recognised restrictions."],
  ["Right against Exploitation", "Protections against forms of exploitation prohibited by the Constitution."],
  ["Right to Freedom of Religion", "Freedom of conscience and religious practice within constitutional limits."],
  ["Cultural and Educational Rights", "Protections connected with cultural identity and educational institutions."],
  ["Right to Constitutional Remedies", "A route to approach the judiciary for enforcement of Fundamental Rights."],
];

const SUBJECTS = [
  ["Union List", "Parliament has exclusive legislative competence over subjects assigned to the Union."],
  ["State List", "States ordinarily legislate on subjects assigned to the State field."],
  ["Concurrent List", "Both Union and State legislatures have competence, subject to constitutional rules."],
];

const THEORY_CONCEPTS = [
  {
    id: "freedom",
    title: "Freedom",
    description: "The ideal of freedom, constraints, the Harm Principle, and negative and positive liberty.",
    prompt: "A restriction is proposed because an action may seriously harm another person. Which concept should you examine first?",
    answer: "Mill's Harm Principle",
  },
  {
    id: "equality",
    title: "Equality",
    description: "Why equality matters and how formal equality can differ from substantive equality.",
    prompt: "Two people receive identical treatment despite radically different starting conditions. What analytical issue does this raise?",
    answer: "Whether formal equality is sufficient for substantive equality",
  },
  {
    id: "justice",
    title: "Social Justice",
    description: "Justice, recognition, distribution and the role of institutions in addressing disadvantage.",
    prompt: "A policy allocates resources using a rule designed without knowing your own social position. Which framework is relevant?",
    answer: "Rawlsian reasoning / veil of ignorance",
  },
  {
    id: "rights",
    title: "Rights",
    description: "Rights as justified claims and the relationship between individual liberty and social order.",
    prompt: "A right creates a claim that others and institutions may have duties to respect. What should you analyse?",
    answer: "The right, its justification, duties and legitimate limitations",
  },
  {
    id: "citizenship",
    title: "Citizenship",
    description: "Membership in a political community and the rights and responsibilities attached to it.",
    prompt: "A person has formal membership in a state but limited access to political participation. What distinction matters?",
    answer: "Formal citizenship versus substantive political participation",
  },
  {
    id: "nationalism",
    title: "Nationalism",
    description: "Political belonging, national identity and the relationship between nation and state.",
    prompt: "A national identity is presented as a shared political project rather than a single ethnic identity. What should you examine?",
    answer: "Civic conceptions of national identity and their institutional implications",
  },
  {
    id: "secularism",
    title: "Secularism",
    description: "Different models of state-religion relations, including the Indian emphasis on addressing domination.",
    prompt: "The state intervenes in a religious practice to address a form of social domination. Which model deserves examination?",
    answer: "The Indian conception of principled intervention and equal respect",
  },
];

const COMPARISONS: Record<string, string[][]> = {
  "FPTP vs Proportional Representation": [
    ["Basic mechanism", "Candidate with the most votes in a constituency wins.", "Seats are allocated to reflect vote shares more proportionally."],
    ["Constituency", "Usually territorial single-member constituencies.", "May use multi-member constituencies or party-list systems."],
    ["Representation", "Can convert a plurality of votes into a large seat advantage.", "Generally seeks closer correspondence between votes and seats."],
    ["CBSE question", "Why did India adopt FPTP?", "How do electoral rules shape representation and party systems?"],
  ],
  "Parliamentary vs Presidential Executive": [
    ["Political basis", "Executive is drawn from and responsible to the legislature.", "Executive authority is institutionally separated from the legislature."],
    ["Head of government", "Prime Minister leads the government.", "President is the principal executive in a presidential system."],
    ["Accountability", "Government survives while retaining legislative confidence.", "Executive tenure is generally not dependent on a legislative confidence vote."],
    ["Key analytical issue", "Collective responsibility and legislative accountability.", "Separation of powers and fixed executive tenure."],
  ],
  "Negative vs Positive Liberty": [
    ["Core question", "What restraints interfere with my action?", "What conditions enable me to genuinely exercise freedom?"],
    ["Threat", "External interference can restrict liberty.", "Social and economic conditions can make formal freedom ineffective."],
    ["Typical tension", "When does regulation become unjustified interference?", "When do institutions need to create enabling conditions?"],
    ["Thinker connection", "Mill's defence of individual freedom is relevant.", "The distinction highlights the enabling conditions of freedom."],
  ],
  "Rights vs DPSP": [
    ["Constitutional role", "Fundamental Rights primarily protect constitutionally guaranteed claims.", "Directive Principles guide the state toward social and economic goals."],
    ["Judicial enforceability", "Certain Fundamental Rights are enforceable through courts.", "Directive Principles are not enforceable in the same way."],
    ["Relationship", "The syllabus asks students to examine their relationship rather than treat them as isolated lists.", "Policy goals can interact with rights and constitutional interpretation."],
    ["Analytical question", "How should rights be protected?", "How should social transformation be pursued consistently with constitutional values?"],
  ],
};

const ELECTION_CASES = [
  { name: "Scenario A", votes: [42, 31, 18, 9], label: "Four candidates in one constituency" },
  { name: "Scenario B", votes: [34, 33, 20, 13], label: "A closely divided constituency" },
  { name: "Scenario C", votes: [51, 24, 15, 10], label: "A candidate wins an outright majority" },
];

const TIMELINE_XII = [
  [1947, "Independence and Partition", "Nation-building begins under extraordinary political and social conditions."],
  [1950, "Constitution comes into force", "The constitutional order becomes the framework of democratic government."],
  [1952, "First general election", "Universal adult franchise is operationalised through India's first general election."],
  [1962, "India-China war", "External security becomes a major dimension of India's political experience."],
  [1967, "Fourth general election", "The period is associated with important changes in the Congress system and state-level politics."],
  [1975, "Emergency declared", "A major democratic crisis and a central case for studying institutional safeguards."],
  [1977, "General election after the Emergency", "A change of government demonstrates electoral accountability."],
  [1989, "Coalition era develops", "The party system enters a period of greater fragmentation and coalition politics."],
  [1991, "Economic and political transition", "A major period of change in economic policy and India's political environment."],
  [1992, "Ayodhya and political consequences", "A major episode in debates about secularism, identity and democratic politics."],
  [2004, "Change in national government", "Coalition politics remains important in national government formation."],
  [2014, "Major national political shift", "A new phase in national party politics begins."],
];

const WORLD_NODES = [
  ["USA", "Superpower", "Military, economic and institutional influence in the post-Cold War order."],
  ["Russia", "Successor power", "The dissolution of the USSR changes the structure of global power."],
  ["European Union", "Regional power", "A distinctive experiment in regional integration and collective power."],
  ["China", "Rising centre", "Economic transformation and state power reshape global politics."],
  ["Japan", "Economic power", "A major economic centre with a distinctive post-war political trajectory."],
  ["South Asia", "Regional system", "India, Pakistan, Bangladesh, Sri Lanka, Nepal, Bhutan and Maldives form an interconnected regional political space."],
  ["UN", "International organisation", "A central institutional arena for international cooperation and conflict."],
  ["Global South", "Political category", "A broad and contested category used to analyse development, representation and global inequality."],
];

const EXAM_QUESTIONS: QuizQuestion[] = [
  {
    question: "Which feature is most directly connected to the idea of a constitution as a limitation on government?",
    options: ["Government can exercise unlimited authority", "Government powers are defined and constrained by constitutional rules", "Only courts can make laws", "Elections become unnecessary"],
    answer: 1,
    explanation: "A constitution specifies powers and places limits on governmental authority.",
  },
  {
    question: "Why is the distinction between FPTP and proportional representation analytically useful?",
    options: ["They are two names for exactly the same system", "They show how electoral rules can affect the translation of votes into representation", "They eliminate the need for political parties", "They determine whether a constitution exists"],
    answer: 1,
    explanation: "Electoral systems create different relationships between votes, constituencies and seats.",
  },
  {
    question: "Which statement best captures the idea of judicial review?",
    options: ["Courts conduct elections", "Courts can examine the constitutional validity of governmental action", "Parliament appoints every civil servant", "The executive can ignore court decisions"],
    answer: 1,
    explanation: "Judicial review concerns constitutional scrutiny of laws or governmental action.",
  },
  {
    question: "A policy treats everyone identically but leaves historically disadvantaged groups unable to access the same opportunities. What should a political theorist examine?",
    options: ["Only whether the rule uses identical language", "The difference between formal and substantive equality", "Whether elections are held", "Whether the policy concerns foreign affairs"],
    answer: 1,
    explanation: "Political theory distinguishes identical treatment from equality understood in substantive terms.",
  },
  {
    question: "Which is the strongest first step when evaluating a political claim?",
    options: ["Repeat it because it sounds plausible", "Identify the claim, reasoning and evidence supporting it", "Choose the side you already prefer", "Ignore contrary evidence"],
    answer: 1,
    explanation: "Good political analysis separates assertion, reasoning and evidence before reaching a conclusion.",
  },
];

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
      type="button"
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
        {eyebrow && (
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
            {eyebrow}
          </div>
        )}
        <h2 className="mt-1 text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function ConstitutionExplorer() {
  const [focus, setFocus] = useState("Authority");
  const [checks, setChecks] = useState<string[]>([]);

  const cards = [
    ["Authority", "How was the Constitution made, promulgated and given legitimacy?"],
    ["Institutions", "How are legislative, executive and judicial powers distributed?"],
    ["Rights", "How are individual claims protected against arbitrary power?"],
    ["Federalism", "How are powers divided across levels of government?"],
    ["Amendment", "How can a constitution change while retaining constitutional continuity?"],
    ["Philosophy", "What political values and goals are embedded in constitutional design?"],
  ];

  const principles: Record<string, string[]> = {
    Authority: ["Constituent Assembly", "Mode of promulgation", "Substantive provisions", "Balanced institutional design"],
    Institutions: ["Legislature", "Executive", "Judiciary", "Checks and balances"],
    Rights: ["Fundamental Rights", "Reasonable restrictions", "Constitutional remedies", "Judicial protection"],
    Federalism: ["Union", "States", "Local government", "Distribution of subjects"],
    Amendment: ["Constitutional change", "Political consensus", "Judicial interpretation", "Basic structure"],
    Philosophy: ["Individual freedom", "Social justice", "Diversity", "Secularism", "Universal franchise", "Federalism"],
  };

  return (
    <Panel
      title="Constitution Explorer"
      eyebrow="Indian Constitution at Work"
      description="Treat the Constitution as an institutional design problem. Select a dimension, then test which elements belong to it."
    >
      <div className="grid gap-5 lg:grid-cols-[250px_1fr]">
        <div className="space-y-2">
          {cards.map(([id, title, description]) => (
            <button
              type="button"
              key={id}
              onClick={() => setFocus(id)}
              className={`w-full rounded-2xl p-4 text-left ${
                focus === id ? "bg-slate-950 text-white" : "bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <div className="text-sm font-semibold">{title}</div>
              <div className={`mt-1 text-xs leading-5 ${focus === id ? "text-slate-300" : "text-slate-500"}`}>
                {description}
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-3xl bg-[#11151a] p-5 text-white sm:p-6">
          <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
            Design dimension
          </div>
          <h3 className="mt-2 text-2xl font-semibold">{focus}</h3>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {principles[focus].map((item) => {
              const selected = checks.includes(`${focus}:${item}`);
              return (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    setChecks((current) =>
                      selected
                        ? current.filter((x) => x !== `${focus}:${item}`)
                        : [...current, `${focus}:${item}`]
                    )
                  }
                  className={`rounded-2xl border p-4 text-left text-sm transition ${
                    selected
                      ? "border-white/30 bg-white text-slate-950"
                      : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
                  }`}
                >
                  <span className="mr-2">{selected ? "✓" : "○"}</span>
                  {item}
                </button>
              );
            })}
          </div>
          <div className="mt-5 rounded-2xl bg-white/5 p-4 text-xs leading-5 text-slate-300">
            Analytical prompt: <span className="font-semibold text-white">What problem is this constitutional feature trying to solve?</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function RightsLab() {
  const [selected, setSelected] = useState(0);
  const [restriction, setRestriction] = useState(50);
  const [dpsp, setDpsp] = useState(true);

  return (
    <Panel
      title="Rights Lab"
      eyebrow="Fundamental Rights + DPSP"
      description="Explore rights as constitutional claims, then examine why rights are not simply unlimited permissions."
    >
      <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-2">
          {RIGHTS.map(([title]) => (
            <button
              type="button"
              key={title}
              onClick={() => setSelected(RIGHTS.findIndex(([x]) => x === title))}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                selected === RIGHTS.findIndex(([x]) => x === title)
                  ? "bg-slate-950 text-white"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              }`}
            >
              {title}
            </button>
          ))}
        </div>
        <div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Selected right</div>
            <h3 className="mt-1 text-xl font-semibold">{RIGHTS[selected][0]}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{RIGHTS[selected][1]}</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 p-5">
              <div className="text-xs font-bold uppercase tracking-[.15em] text-slate-400">Restriction dial</div>
              <p className="mt-2 text-sm text-slate-600">
                Use the dial to think about the analytical question, not to invent a legal test.
              </p>
              <input
                type="range"
                min="0"
                max="100"
                value={restriction}
                onChange={(e) => setRestriction(Number(e.target.value))}
                className="mt-6 w-full accent-slate-950"
              />
              <div className="mt-2 flex justify-between text-[10px] font-bold uppercase text-slate-400">
                <span>Minimal restriction</span><span>High restriction</span>
              </div>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                Ask: <b>What constitutional value justifies the restriction, and what prevents the restriction from becoming arbitrary?</b>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 p-5">
              <div className="text-xs font-bold uppercase tracking-[.15em] text-slate-400">Rights ↔ DPSP</div>
              <button
                type="button"
                onClick={() => setDpsp(!dpsp)}
                className="mt-4 flex w-full items-center justify-between rounded-2xl bg-slate-950 px-4 py-3 text-left text-sm font-semibold text-white"
              >
                <span>{dpsp ? "Relationship view" : "Rights-only view"}</span>
                <span>{dpsp ? "ON" : "OFF"}</span>
              </button>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                {dpsp
                  ? "The syllabus explicitly asks students to examine the relationship between Fundamental Rights and Directive Principles rather than memorise two disconnected lists."
                  : "You are isolating the enforceable rights dimension. Turn the relationship view back on to analyse constitutional balance."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ElectionSimulator() {
  const [scenario, setScenario] = useState(0);
  const [method, setMethod] = useState<"FPTP" | "PR">("FPTP");
  const current = ELECTION_CASES[scenario];

  const seats = useMemo(() => {
    if (method === "FPTP") {
      const max = Math.max(...current.votes);
      return current.votes.map((v) => (v === max ? 1 : 0));
    }
    const total = current.votes.reduce((a, b) => a + b, 0);
    const raw = current.votes.map((v) => (v / total) * 10);
    const base = raw.map(Math.floor);
    let remaining = 10 - base.reduce((a, b) => a + b, 0);
    const order = raw.map((v, i) => ({ i, frac: v - Math.floor(v) })).sort((a, b) => b.frac - a.frac);
    for (const item of order) {
      if (remaining <= 0) break;
      base[item.i] += 1;
      remaining -= 1;
    }
    return base;
  }, [current, method]);

  return (
    <Panel
      title="Election Simulator"
      eyebrow="Election and Representation"
      description="See how the same votes can generate different representation under different electoral rules. This is a model, not a prediction of any real election."
    >
      <div className="flex flex-wrap gap-2">
        {ELECTION_CASES.map((x, i) => (
          <button
            type="button"
            key={x.name}
            onClick={() => setScenario(i)}
            className={`rounded-xl px-3 py-2 text-xs font-semibold ${scenario === i ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {x.name}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          {(["FPTP", "PR"] as const).map((x) => (
            <button
              type="button"
              key={x}
              onClick={() => setMethod(x)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold ${method === x ? "bg-slate-800 text-white" : "border border-slate-200"}`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-3xl bg-slate-50 p-5">
        <div className="text-xs font-semibold text-slate-500">{current.label}</div>
        <div className="mt-5 space-y-3">
          {current.votes.map((vote, i) => (
            <div key={vote + i}>
              <div className="flex justify-between text-xs font-semibold">
                <span>Candidate {String.fromCharCode(65 + i)}</span>
                <span>{vote}% votes · {seats[i]} seat{seats[i] === 1 ? "" : "s"}</span>
              </div>
              <div className="mt-1 h-3 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-slate-900" style={{ width: `${vote}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Votes</div>
          <div className="mt-1 text-xl font-semibold">100%</div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Rule</div>
          <div className="mt-1 text-xl font-semibold">{method === "FPTP" ? "Plurality" : "Proportional"}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Question</div>
          <div className="mt-1 text-sm font-semibold">How does the rule shape representation?</div>
        </div>
      </div>
    </Panel>
  );
}

function ExecutiveExplorer() {
  const [system, setSystem] = useState<"Parliamentary" | "Presidential">("Parliamentary");
  const rows = system === "Parliamentary"
    ? [
        ["Executive-legislative relationship", "Executive is drawn from the legislature and is politically responsible to it."],
        ["Government leadership", "Prime Minister and Council of Ministers lead the government."],
        ["Head of state", "President is the constitutional head of the Union."],
        ["Accountability", "Collective responsibility to the lower house is central to parliamentary government."],
        ["Permanent executive", "Civil services provide continuity to administration."],
      ]
    : [
        ["Executive-legislative relationship", "Executive authority is institutionally separated from the legislature."],
        ["Government leadership", "President is the principal executive in a presidential system."],
        ["Political tenure", "Executive tenure is not ordinarily dependent on a legislative confidence vote."],
        ["Accountability", "Accountability operates through constitutional institutions, elections and separation of powers."],
        ["Comparison question", "What are the advantages and tensions of separating executive and legislative authority?"],
      ];

  return (
    <Panel
      title="Executive Explorer"
      eyebrow="Executive"
      description="Compare executive structures, then zoom into the Indian parliamentary executive."
    >
      <div className="flex gap-2">
        {(["Parliamentary", "Presidential"] as const).map((x) => (
          <button type="button" key={x} onClick={() => setSystem(x)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${system === x ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>
            {x}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {rows.map(([title, text]) => (
          <div key={title} className="rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-semibold">{title}</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-3xl bg-slate-950 p-5 text-white">
        <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Indian executive chain</div>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {["President", "Prime Minister", "Council of Ministers", "Permanent Executive"].map((x, i) => (
            <div key={x} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-sm font-semibold">
              <div className="text-[10px] text-slate-400">0{i + 1}</div>
              <div className="mt-1">{x}</div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ParliamentSimulator() {
  const steps = [
    ["Introduction", "A Bill is introduced according to the relevant parliamentary procedure."],
    ["Consideration", "The House debates, scrutinises and may refer the Bill to a committee."],
    ["Passage", "The House considers and votes on the Bill."],
    ["Second House", "Where constitutionally required, the other House considers the Bill."],
    ["President", "The Bill proceeds to the President according to constitutional procedure."],
    ["Law", "After the constitutional process is completed, the Bill becomes law."],
  ];
  const [step, setStep] = useState(0);

  return (
    <Panel
      title="Parliament Simulator"
      eyebrow="Legislature"
      description="Follow the broad legislative pathway and identify where parliamentary scrutiny enters the process."
    >
      <div className="grid gap-2 md:grid-cols-6">
        {steps.map(([title], i) => (
          <button type="button" key={title} onClick={() => setStep(i)} className={`rounded-2xl p-3 text-left ${step === i ? "bg-slate-950 text-white" : "bg-slate-50"}`}>
            <div className="text-[10px] font-bold">{String(i + 1).padStart(2, "0")}</div>
            <div className="mt-1 text-xs font-semibold">{title}</div>
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-6">
        <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Stage {step + 1}</div>
        <h3 className="mt-1 text-2xl font-semibold">{steps[step][0]}</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{steps[step][1]}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ["Lok Sabha", "Directly elected House with important roles in law-making, financial matters and executive accountability."],
          ["Rajya Sabha", "Council of States with constitutionally significant legislative and federal functions."],
          ["Committees", "Smaller forums that scrutinise bills, expenditure, policies and government work in greater detail."],
        ].map(([title, text]) => (
          <div key={title} className="rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-semibold">{title}</div>
            <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function JudiciaryLab() {
  const [jurisdiction, setJurisdiction] = useState("Writ");
  const items: Record<string, string> = {
    Original: "The Court hears certain disputes at the first instance under constitutional authority.",
    Writ: "The Court can issue constitutional writs in the exercise of its writ jurisdiction.",
    Appellate: "The Court hears appeals from lower courts and tribunals according to law.",
    Advisory: "The Court may give advisory opinions when constitutionally referred matters are placed before it.",
  };

  return (
    <Panel
      title="Judiciary Lab"
      eyebrow="Judiciary"
      description="Explore the Supreme Court's major jurisdictions and the institutional ideas behind judicial independence and review."
    >
      <div className="grid gap-5 lg:grid-cols-[230px_1fr]">
        <div className="space-y-2">
          {Object.keys(items).map((x) => (
            <button type="button" key={x} onClick={() => setJurisdiction(x)} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold ${jurisdiction === x ? "bg-slate-950 text-white" : "bg-slate-50"}`}>
              {x} Jurisdiction
            </button>
          ))}
        </div>
        <div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Selected jurisdiction</div>
            <h3 className="mt-2 text-2xl font-semibold">{jurisdiction}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">{items[jurisdiction]}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              ["Independence", "Appointment, tenure and institutional safeguards are studied as conditions for judicial independence."],
              ["Rights", "The judiciary has an important constitutional role in enforcing rights."],
              ["Parliament", "The syllabus asks students to analyse the relationship between Judiciary and Parliament."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-slate-200 p-4">
                <div className="text-sm font-semibold">{title}</div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function FederalismExplorer() {
  const [level, setLevel] = useState(0);
  const [subject, setSubject] = useState(0);

  return (
    <Panel
      title="Federalism Explorer"
      eyebrow="Federalism + Local Government"
      description="Move between levels of government and classify the constitutional distribution of legislative subjects."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["Union", "State", "Local"].map((x, i) => (
              <button type="button" key={x} onClick={() => setLevel(i)} className={`rounded-2xl p-5 text-left ${level === i ? "bg-slate-950 text-white" : "bg-slate-50"}`}>
                <div className="text-[10px] font-bold uppercase tracking-[.15em]">Level 0{i + 1}</div>
                <div className="mt-1 text-lg font-semibold">{x}</div>
                <div className={`mt-2 text-xs ${level === i ? "text-slate-300" : "text-slate-500"}`}>
                  {i === 0 ? "National constitutional and legislative institutions." : i === 1 ? "State governments and state-level political institutions." : "Decentralised government through rural and urban local bodies."}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-3xl border border-slate-200 p-5">
            <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Constitutional distribution</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {SUBJECTS.map(([title, text], i) => (
                <button type="button" key={title} onClick={() => setSubject(i)} className={`rounded-2xl border p-4 text-left ${subject === i ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
                  <div className="text-sm font-semibold">{title}</div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">{text}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-[#11151a] p-5 text-white">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Decentralisation</div>
          <h3 className="mt-2 text-xl font-semibold">73rd + 74th Amendments</h3>
          <div className="mt-4 space-y-2 text-xs text-slate-300">
            {["Three-tier rural structure", "Urban local government", "Elections", "Reservations", "State Election Commissioners", "State Finance Commission", "Transfer of subjects"].map((x) => (
              <div key={x} className="rounded-xl bg-white/5 px-3 py-2">{x}</div>
            ))}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function PoliticalTheoryLab() {
  const [selected, setSelected] = useState(THEORY_CONCEPTS[0]);
  const [revealed, setRevealed] = useState(false);

  return (
    <Panel
      title="Political Theory Lab"
      eyebrow="Political Theory"
      description="Political theory is treated as systematic reflection and critical analysis, not as a glossary with better typography."
    >
      <div className="flex flex-wrap gap-2">
        {THEORY_CONCEPTS.map((concept) => (
          <button
            type="button"
            key={concept.id}
            onClick={() => {
              setSelected(concept);
              setRevealed(false);
            }}
            className={`rounded-xl px-3 py-2 text-xs font-semibold ${selected.id === concept.id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {concept.title}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="rounded-3xl bg-slate-50 p-6">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Concept</div>
          <h3 className="mt-1 text-3xl font-semibold">{selected.title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{selected.description}</p>
        </div>
        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Think with it</div>
          <p className="mt-3 text-sm leading-6 text-slate-200">{selected.prompt}</p>
          <button type="button" onClick={() => setRevealed(!revealed)} className="mt-5 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950">
            {revealed ? "Hide analytical route" : "Reveal analytical route"}
          </button>
          {revealed && <div className="mt-4 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-slate-300">{selected.answer}</div>}
        </div>
      </div>
    </Panel>
  );
}

function ConceptComparison() {
  const keys = Object.keys(COMPARISONS);
  const [selected, setSelected] = useState(keys[0]);

  return (
    <Panel
      title="Concept Comparison"
      eyebrow="Compare"
      description="The aim is not to find a winner. Political concepts are useful precisely because their differences change the question being asked."
    >
      <div className="flex flex-wrap gap-2">
        {keys.map((x) => (
          <button type="button" key={x} onClick={() => setSelected(x)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${selected === x ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>
            {x}
          </button>
        ))}
      </div>
      <div className="mt-5 overflow-x-auto rounded-3xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-950 text-white">
            <tr>
              <th className="px-4 py-3 font-semibold">Dimension</th>
              <th className="px-4 py-3 font-semibold">A</th>
              <th className="px-4 py-3 font-semibold">B</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISONS[selected].map(([dimension, a, b]) => (
              <tr key={dimension} className="border-t border-slate-200">
                <td className="px-4 py-4 font-semibold align-top">{dimension}</td>
                <td className="px-4 py-4 text-xs leading-5 text-slate-600 align-top">{a}</td>
                <td className="px-4 py-4 text-xs leading-5 text-slate-600 align-top">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function AREAnswerBuilder() {
  const [a, setA] = useState("");
  const [r, setR] = useState("");
  const [e, setE] = useState("");
  const [q, setQ] = useState("");

  const completeness = [a, r, e, q].filter((x) => x.trim()).length;

  return (
    <Panel
      title="ARE Answer Builder"
      eyebrow="Assertion · Reasoning · Evidence"
      description="A compact writing scaffold based on the user's existing ARE framework. Add qualification before turning an argument into a conclusion."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["Assertion", a, setA, "What exactly are you claiming?"],
          ["Reasoning", r, setR, "Why does the claim follow?"],
          ["Evidence", e, setE, "What constitutional provision, institutional fact, case, example or source supports it?"],
          ["Qualification", q, setQ, "What limitation, counterpoint or condition prevents overclaiming?"],
        ].map(([label, value, setter, placeholder]) => (
          <label key={label as string} className="block">
            <span className="text-xs font-bold uppercase tracking-[.15em] text-slate-500">{label as string}</span>
            <textarea
              rows={5}
              value={value as string}
              onChange={(event) => (setter as (value: string) => void)(event.target.value)}
              placeholder={placeholder as string}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-slate-400 focus:bg-white"
            />
          </label>
        ))}
      </div>
      <div className="mt-4 rounded-3xl bg-slate-950 p-5 text-white">
        <div className="flex items-center justify-between">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Argument status</div>
          <div className="text-sm font-semibold">{completeness}/4 components</div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full bg-white transition-all" style={{ width: `${completeness * 25}%` }} />
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-300">
          Strong answers do not merely contain facts. They make the relationship between claim, reasoning and evidence visible.
        </p>
      </div>
    </Panel>
  );
}

function ResearchLab() {
  const stages = ["Question", "Sources", "Evidence", "Analysis", "Conclusion", "Bibliography", "Viva"];
  const [stage, setStage] = useState(0);
  const [question, setQuestion] = useState("");
  const guidance = [
    "Bound the topic by institution, period, concept, policy or political problem. A research question should be answerable, not merely interesting.",
    "Prefer primary evidence where appropriate and use authenticated secondary sources to establish context and competing interpretations.",
    "Record what each source actually establishes. Separate direct evidence from inference.",
    "Explain how evidence supports or complicates the research question. Do not turn a pile of quotations into analysis.",
    "State what your evidence supports, what remains uncertain and the limits of your project.",
    "Record references as you work. Academic archaeology at 11:58 p.m. is not a research method.",
    "Prepare to explain why you chose your question, sources, method and conclusion.",
  ];

  return (
    <Panel
      title="Political Science Research Lab"
      eyebrow="Project + Viva"
      description="A project workspace aligned with CBSE's emphasis on research questions, primary evidence, analysis, limitations, references and viva."
    >
      <div className="flex flex-wrap gap-2">
        {stages.map((x, i) => (
          <button type="button" key={x} onClick={() => setStage(i)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${stage === i ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>
            {i + 1}. {x}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Working research question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={6}
            placeholder="Example: How does the relationship between Fundamental Rights and Directive Principles illustrate competing constitutional goals?"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 outline-none focus:border-slate-400 focus:bg-white"
          />
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {["Specific", "Evidence-based", "Manageable", "Allows analysis", "Uses multiple sources", "Includes limitations"].map((x) => (
              <div key={x} className="rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">□ {x}</div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-slate-950 p-6 text-white">
          <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{stages[stage]}</div>
          <p className="mt-3 text-sm leading-6 text-slate-300">{guidance[stage]}</p>
          <div className="mt-6 rounded-2xl bg-white/10 p-4 text-xs leading-5 text-slate-300">
            CBSE project: <b className="text-white">20 marks</b>, including project work and viva as specified in the syllabus.
          </div>
        </div>
      </div>
    </Panel>
  );
}

function ExamLab() {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [competency, setCompetency] = useState("Analysis");

  const question = EXAM_QUESTIONS[index];
  const next = () => {
    setIndex((index + 1) % EXAM_QUESTIONS.length);
    setPicked(null);
  };

  return (
    <Panel
      title="Exam Lab"
      eyebrow="CBSE competencies"
      description="Practice across knowledge, understanding, application and analysis/evaluation. The interface is deliberately built around thinking moves, not chapter labels."
    >
      <div className="flex flex-wrap gap-2">
        {["Knowledge", "Understanding", "Application", "Analysis"].map((x) => (
          <button type="button" key={x} onClick={() => setCompetency(x)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${competency === x ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>
            {x}
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-3xl border border-slate-200 p-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">{competency}</span>
          <span className="text-xs text-slate-400">{index + 1}/{EXAM_QUESTIONS.length}</span>
        </div>
        <h3 className="mt-5 text-lg font-semibold leading-7">{question.question}</h3>
        <div className="mt-5 grid gap-2">
          {question.options.map((option, i) => {
            const active = picked === i;
            const correct = picked !== null && i === question.answer;
            return (
              <button
                type="button"
                key={option}
                onClick={() => setPicked(i)}
                className={`rounded-2xl border p-4 text-left text-sm ${
                  active
                    ? correct
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-rose-300 bg-rose-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                {String.fromCharCode(65 + i)}. {option}
              </button>
            );
          })}
        </div>
        {picked !== null && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
            <b>{picked === question.answer ? "Correct." : "Revisit the distinction."}</b> {question.explanation}
          </div>
        )}
        <button type="button" disabled={picked === null} onClick={next} className="mt-4 rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-30">
          Next question →
        </button>
      </div>
    </Panel>
  );
}

function WorldPoliticsAtlas() {
  const [selected, setSelected] = useState(0);

  return (
    <Panel
      title="World Politics Atlas"
      eyebrow="Contemporary World Politics"
      description="A conceptual map of the Class XII world-politics units. Select a node to see the analytical role it plays."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {WORLD_NODES.map(([name, type, text], i) => (
          <button type="button" key={name} onClick={() => setSelected(i)} className={`rounded-2xl p-4 text-left ${selected === i ? "bg-slate-950 text-white" : "bg-slate-50 hover:bg-slate-100"}`}>
            <div className="text-[10px] font-bold uppercase tracking-[.15em] opacity-60">{type}</div>
            <div className="mt-1 text-sm font-semibold">{name}</div>
            <p className={`mt-2 text-xs leading-5 ${selected === i ? "text-slate-300" : "text-slate-500"}`}>{text}</p>
          </button>
        ))}
      </div>
      <div className="mt-5 rounded-3xl bg-[#11151a] p-6 text-white">
        <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Analytical lens</div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {["Power", "Institutions", "Interdependence", "Conflict / Cooperation"].map((x) => (
            <div key={x} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center text-xs font-semibold text-slate-200">{x}</div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function IndiaSinceIndependence() {
  const [selected, setSelected] = useState(0);
  const event = TIMELINE_XII[selected];

  return (
    <Panel
      title="India Since Independence"
      eyebrow="Political timeline"
      description="Move through major syllabus-era developments and ask how institutions, parties, policies and democratic practices interacted."
    >
      <div className="relative overflow-x-auto pb-3">
        <div className="flex min-w-[1000px] items-start gap-0">
          {TIMELINE_XII.map(([year, title], i) => (
            <button type="button" key={year as number} onClick={() => setSelected(i)} className="group relative flex-1 text-center">
              <div className={`mx-auto h-4 w-4 rounded-full border-4 border-white ${selected === i ? "bg-slate-950 ring-4 ring-slate-200" : "bg-slate-300"}`} />
              <div className="mt-3 text-[10px] font-bold text-slate-400">{year}</div>
              <div className="mt-1 px-2 text-xs font-semibold">{title}</div>
            </button>
          ))}
        </div>
        <div className="absolute left-2 right-2 top-1.5 -z-0 h-px bg-slate-200" />
      </div>
      <div className="mt-6 rounded-3xl bg-slate-950 p-6 text-white">
        <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">{event[0]}</div>
        <h3 className="mt-1 text-2xl font-semibold">{event[1]}</h3>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">{event[2]}</p>
      </div>
    </Panel>
  );
}

function ToolView({ id, cls }: { id: ToolId; cls: ClassKey }) {
  if (id === "constitution") return <ConstitutionExplorer />;
  if (id === "rights") return <RightsLab />;
  if (id === "elections") return <ElectionSimulator />;
  if (id === "executive") return <ExecutiveExplorer />;
  if (id === "parliament") return <ParliamentSimulator />;
  if (id === "judiciary") return <JudiciaryLab />;
  if (id === "federalism") return <FederalismExplorer />;
  if (id === "theory") return <PoliticalTheoryLab />;
  if (id === "comparison") return <ConceptComparison />;
  if (id === "answer") return <AREAnswerBuilder />;
  if (id === "research") return <ResearchLab />;
  if (id === "exam") return <ExamLab />;
  if (id === "world") return <WorldPoliticsAtlas />;
  if (id === "india") return <IndiaSinceIndependence />;
  return <ExamLab />;
}

export default function PoliticalScienceToolsPage() {
  const [cls, setCls] = useState<ClassKey>("XI");
  const [selected, setSelected] = useState<ToolId>("constitution");

  const tools = cls === "XI" ? XI_TOOLS : XII_TOOLS;
  const current = tools.find((tool) => tool.id === selected) ?? tools[0];
  const themes = cls === "XI" ? XI_THEMES : XII_THEMES;

  const chooseClass = (next: ClassKey) => {
    setCls(next);
    setSelected(next === "XI" ? "constitution" : "world");
  };

  const quick = useMemo(
    () =>
      cls === "XI"
        ? [
            ["INSTITUTIONS", "Constitution", "Explore constitutional design and limits on government."],
            ["DEMOCRACY", "Elections", "See how electoral rules translate votes into representation."],
            ["THEORY", "Political Theory", "Manipulate concepts rather than memorise definitions."],
            ["ARGUMENT", "ARE Builder", "Turn facts into an analytical answer."],
          ]
        : [
            ["WORLD", "World Politics", "Trace power, institutions, security and interdependence."],
            ["INDIA", "Since Independence", "Follow nation-building, party systems and democratic crises."],
            ["COMPARE", "Comparison", "Separate similar-looking concepts precisely."],
            ["ARGUMENT", "ARE Builder", "Build evidence-led answers."],
          ],
    [cls]
  );

  const quickTarget = (title: string): ToolId => {
    if (title === "Constitution") return "constitution";
    if (title === "Elections") return "elections";
    if (title === "Political Theory") return "theory";
    if (title === "World Politics") return "world";
    if (title === "Since Independence") return "india";
    if (title === "Comparison") return "comparison";
    return "answer";
  };

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-[2rem] bg-[#11151a] px-6 py-10 text-white shadow-sm sm:px-10 sm:py-14">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute -right-5 -top-5 h-44 w-44 rounded-full border border-white/10" />
          <div className="absolute bottom-0 right-0 h-32 w-2/3 opacity-20" style={{ backgroundImage: "linear-gradient(135deg, transparent 48%, #8ea7c7 49%, transparent 50%), linear-gradient(45deg, transparent 48%, #8ea7c7 49%, transparent 50%)", backgroundSize: "34px 34px" }} />
          <div className="relative max-w-4xl">
            <div className="text-[10px] font-bold uppercase tracking-[.22em] text-slate-400">
              VGB Tools · Political Science · Subject Code 028
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-.03em] sm:text-6xl">
              The Political Science Lab
            </h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
              Understand institutions. Analyse power. Test political ideas. An interactive CBSE workspace built around constitutional reasoning, political theory, comparison, evidence and argument.
            </p>
            <div className="mt-7 flex flex-wrap gap-2">
              <SectionButton active={cls === "XI"} onClick={() => chooseClass("XI")}>
                Class XI · Constitution + Theory
              </SectionButton>
              <SectionButton active={cls === "XII"} onClick={() => chooseClass("XII")}>
                Class XII · World + India
              </SectionButton>
            </div>
          </div>

          <div className="relative mt-10 grid gap-2 sm:grid-cols-4">
            {quick.map(([eyebrow, title, description]) => (
              <button
                type="button"
                key={title}
                onClick={() => setSelected(quickTarget(title))}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur transition hover:bg-white/10"
              >
                <div className="text-[9px] font-bold tracking-[.18em] text-slate-400">{eyebrow}</div>
                <div className="mt-1 text-sm font-semibold">{title}</div>
                <div className="mt-1 text-[11px] leading-4 text-slate-400">{description}</div>
              </button>
            ))}
          </div>
        </header>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-500">
                Syllabus map · Class {cls}
              </div>
              <h2 className="mt-1 text-xl font-semibold">What you are actually expected to understand</h2>
            </div>
            <div className="text-xs text-slate-500">CBSE Political Science 028 · 2026–27</div>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {themes.map(([number, title, details]) => (
              <div key={number} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[10px] font-bold tracking-[.15em] text-slate-400">PART {number}</div>
                <div className="mt-1 text-sm font-semibold">{title}</div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{details}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-[285px_minmax(0,1fr)]">
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-3 shadow-sm lg:sticky lg:top-5">
            <div className="px-3 py-3">
              <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">Workspace</div>
              <div className="mt-1 text-sm font-semibold">Class {cls} · {tools.length} tools</div>
            </div>
            <div className="space-y-1">
              {tools.map((tool) => (
                <button
                  type="button"
                  key={tool.id}
                  onClick={() => setSelected(tool.id)}
                  className={`w-full rounded-2xl px-3 py-3 text-left transition ${
                    selected === tool.id ? "bg-slate-950 text-white" : "hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{tool.title}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-[.12em] ${selected === tool.id ? "text-slate-400" : "text-slate-400"}`}>
                      {tool.eyebrow}
                    </span>
                  </div>
                  <div className={`mt-1 text-[11px] leading-4 ${selected === tool.id ? "text-slate-300" : "text-slate-500"}`}>
                    {tool.description}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-3 rounded-2xl bg-slate-50 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[.15em] text-slate-400">Method</div>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                Learn → Manipulate → Compare → Apply → Analyse → Produce.
              </p>
            </div>
          </aside>

          <section>
            <div className="mb-4 flex flex-col justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
                  {current.eyebrow} · Class {cls}
                </div>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">{current.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{current.description}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <div className="font-semibold text-slate-900">CBSE 028</div>
                <div>2026–27 workspace</div>
              </div>
            </div>
            <ToolView id={selected} cls={cls} />
          </section>
        </div>

        <section className="mt-8 rounded-3xl bg-[#11151a] p-6 text-white sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">The core method</div>
              <h2 className="mt-2 text-2xl font-semibold">
                Institution → Concept → Evidence → Application → Analysis → Argument
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                The CBSE syllabus asks students to understand political ideas and institutions, compare systems, apply concepts, analyse political processes and communicate reasoned arguments. The tools above are designed around that progression.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold">
              {["WHAT?","WHY?","HOW?","WHO?","WHAT EVIDENCE?","WHAT FOLLOWS?"].map((x) => (
                <div key={x} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4 text-slate-300">{x}</div>
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-slate-200 py-6 text-xs text-slate-400">
          VGB Political Science Tools · CBSE 028 · Classes XI–XII · 2026–27 · Interactive political enquiry workspace
        </footer>
      </div>
    </main>
  );
}
