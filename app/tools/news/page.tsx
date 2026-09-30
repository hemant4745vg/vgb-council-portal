"use client";

import { useMemo, useState } from "react";

type ToolId =
  | "overview"
  | "analyzer"
  | "sources"
  | "claims"
  | "timeline"
  | "policy"
  | "geopolitics"
  | "economy"
  | "forecast"
  | "media"
  | "briefing";

type NewsTopic = {
  id: string;
  icon: string;
  title: string;
  description: string;
  accent: string;
};

const topics: NewsTopic[] = [
  {
    id: "india",
    icon: "🇮🇳",
    title: "India",
    description:
      "National politics, institutions, courts, society, policy and major developments.",
    accent: "National",
  },
  {
    id: "world",
    icon: "🌐",
    title: "World & Geopolitics",
    description:
      "International relations, conflicts, diplomacy, strategic competition and global institutions.",
    accent: "Global",
  },
  {
    id: "economy",
    icon: "💹",
    title: "Economy & Markets",
    description:
      "Growth, inflation, fiscal policy, monetary policy, trade and markets.",
    accent: "Economy",
  },
  {
    id: "geoeconomics",
    icon: "🌍",
    title: "Geoeconomics",
    description:
      "Trade routes, sanctions, supply chains, strategic resources and economic statecraft.",
    accent: "Strategy",
  },
  {
    id: "technology",
    icon: "🤖",
    title: "Technology & AI",
    description:
      "AI, computing, digital regulation, platforms, chips and emerging technologies.",
    accent: "Technology",
  },
  {
    id: "policy",
    icon: "🏛️",
    title: "Government & Public Policy",
    description:
      "Legislation, governance, public programmes, regulation and implementation.",
    accent: "Governance",
  },
  {
    id: "society",
    icon: "👥",
    title: "Society",
    description:
      "Demography, education, inequality, social change and major societal developments.",
    accent: "Society",
  },
  {
    id: "environment",
    icon: "🌱",
    title: "Environment & Disasters",
    description:
      "Climate, extreme events, natural hazards, resilience and environmental policy.",
    accent: "Environment",
  },
  {
    id: "up",
    icon: "📍",
    title: "Uttar Pradesh",
    description:
      "UP governance, economy, infrastructure, politics and regional developments.",
    accent: "UP",
  },
  {
    id: "brics",
    icon: "🌏",
    title: "BRICS & Global South",
    description:
      "BRICS, emerging economies, multilateral cooperation and Global South diplomacy.",
    accent: "Multilateral",
  },
  {
    id: "rupee",
    icon: "₹",
    title: "Rupee & Indian Economy",
    description:
      "Exchange rates, reserves, trade, external balances, monetary policy and macroeconomic signals.",
    accent: "Macro",
  },
  {
    id: "forecast",
    icon: "📊",
    title: "Forecasting & Data",
    description:
      "Forecasts, indicators, probabilities, scenarios, uncertainty and calibration.",
    accent: "Data",
  },
  {
    id: "legal",
    icon: "⚖️",
    title: "Political & Legal Cases",
    description:
      "Major political controversies, constitutional questions and institutional disputes.",
    accent: "Law",
  },
  {
    id: "media",
    icon: "🔎",
    title: "Controversies & Media Literacy",
    description:
      "Evidence quality, misinformation, framing, competing claims and contested narratives.",
    accent: "Media",
  },
];

const navItems: { id: ToolId; label: string; icon: string }[] = [
  ["overview", "Command Centre", "⌂"],
  ["analyzer", "News Analyzer", "🧠"],
  ["sources", "Source Lab", "🔬"],
  ["claims", "Claim Checker", "✓"],
  ["timeline", "Timeline", "◷"],
  ["policy", "Policy Mapper", "🏛️"],
  ["geopolitics", "Geopolitics", "🌐"],
  ["economy", "Economy Desk", "₹"],
  ["forecast", "Forecasting", "📊"],
  ["media", "Media Literacy", "🔎"],
  ["briefing", "Briefing Builder", "📰"],
];

const sampleStories = [
  {
    title: "India's external sector",
    topic: "Rupee & Indian Economy",
    description:
      "Use the external-sector framework to separate exchange-rate movement from the underlying balance-of-payments story.",
  },
  {
    title: "BRICS expansion",
    topic: "BRICS & Global South",
    description:
      "Analyse membership, institutional capacity, trade, financial cooperation and geopolitical signalling separately.",
  },
  {
    title: "AI regulation",
    topic: "Technology & AI",
    description:
      "Map regulation from stated objective through mechanism, affected actors, compliance burden and possible unintended effects.",
  },
  {
    title: "A contested political claim",
    topic: "Controversies & Media Literacy",
    description:
      "Separate the original claim, evidence, counter-evidence, interpretation and unresolved uncertainty.",
  },
];

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
    <section className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
      {eyebrow && (
        <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">
          {eyebrow}
        </p>
      )}

      <h2 className="mt-2 text-2xl font-black tracking-tight">{title}</h2>

      {description && (
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

      <div className="mt-6">{children}</div>
    </section>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border bg-slate-50 p-5">
      <div className="text-xs font-black uppercase tracking-wider text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-2xl font-black">{value}</div>

      {detail && (
        <div className="mt-1 text-xs leading-5 text-slate-500">
          {detail}
        </div>
      )}
    </div>
  );
}

function ScoreBar({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div>
      <div className="flex justify-between text-xs font-bold">
        <span>{label}</span>
        <span>{value}/5</span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-slate-950 transition-all"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

function CommandCentre({
  setTool,
}: {
  setTool: (tool: ToolId) => void;
}) {
  return (
    <div className="space-y-6">
      <Panel
        eyebrow="News intelligence"
        title="Current Affairs Command Centre"
        description="A workspace for turning headlines into structured understanding. The page deliberately separates reporting, evidence, interpretation and forecasting, because humans apparently enjoy mixing all four together."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="News desks"
            value="14"
            detail="India, geopolitics, economy, AI, UP and more"
          />

          <Stat
            label="Analysis tools"
            value="10"
            detail="Claims, sources, timelines, policy and forecasting"
          />

          <Stat
            label="Core workflow"
            value="5 steps"
            detail="Observe → verify → explain → connect → assess"
          />

          <Stat
            label="Primary rule"
            value="Evidence"
            detail="Separate what is known from what is inferred"
          />
        </div>
      </Panel>

      <Panel
        eyebrow="Workflow"
        title="How to use the News Lab"
        description="Start with an event or article, then move through the analytical layers."
      >
        <div className="grid gap-3 md:grid-cols-5">
          {[
            ["01", "Observe", "What happened?"],
            ["02", "Verify", "What is the evidence?"],
            ["03", "Explain", "Why does it matter?"],
            ["04", "Connect", "What systems are involved?"],
            ["05", "Assess", "What remains uncertain?"],
          ].map(([number, title, text]) => (
            <div
              key={number}
              className="rounded-2xl border p-5"
            >
              <div className="text-xs font-black text-slate-400">
                {number}
              </div>

              <div className="mt-3 font-black">{title}</div>

              <div className="mt-1 text-sm text-slate-500">
                {text}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Analysis desks"
        title="Start with a desk"
        description="These are analytical categories, not claims about what today's news is. Live reporting remains on the News page."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <a
              key={topic.id}
              href="/news"
              className="group rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-3xl">{topic.icon}</div>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-500">
                  {topic.accent}
                </span>
              </div>

              <h3 className="mt-5 font-black">{topic.title}</h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {topic.description}
              </p>
            </a>
          ))}
        </div>
      </Panel>

      <Panel
        eyebrow="Tools"
        title="Analytical shortcuts"
        description="The fastest route to the tools that matter most."
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["🧠", "News Analyzer", "Break a story into analytical components.", "analyzer"],
            ["🔬", "Source Lab", "Evaluate evidence quality.", "sources"],
            ["✓", "Claim Checker", "Separate facts from interpretation.", "claims"],
            ["📊", "Forecasting", "Build explicit scenarios.", "forecast"],
          ].map(([icon, title, text, id]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTool(id as ToolId)}
              className="rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
            >
              <div className="text-2xl">{icon}</div>
              <div className="mt-4 font-black">{title}</div>
              <div className="mt-1 text-sm leading-6 text-slate-500">
                {text}
              </div>
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function NewsAnalyzer() {
  const [headline, setHeadline] = useState("");
  const [event, setEvent] = useState("");
  const [actors, setActors] = useState("");
  const [mechanism, setMechanism] = useState("");
  const [uncertainty, setUncertainty] = useState("");

  const completeness = [
    headline,
    event,
    actors,
    mechanism,
    uncertainty,
  ].filter(Boolean).length;

  return (
    <Panel
      eyebrow="Structured analysis"
      title="News Analyzer"
      description="Turn an article or headline into a structured analytical note. This tool does not decide whether a claim is true. It helps you identify what needs verification."
    >
      <div className="grid gap-5">
        <label>
          <span className="text-sm font-black">Headline / topic</span>

          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. Government announces a new policy..."
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-slate-950"
          />
        </label>

        <label>
          <span className="text-sm font-black">
            1. What happened?
          </span>

          <textarea
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            placeholder="Write only the observable event first."
            className="mt-2 min-h-24 w-full rounded-xl border p-4 outline-none focus:border-slate-950"
          />
        </label>

        <label>
          <span className="text-sm font-black">
            2. Who are the relevant actors?
          </span>

          <input
            value={actors}
            onChange={(e) => setActors(e.target.value)}
            placeholder="Government, court, company, country, institution..."
            className="mt-2 w-full rounded-xl border px-4 py-3 outline-none focus:border-slate-950"
          />
        </label>

        <label>
          <span className="text-sm font-black">
            3. What is the mechanism?
          </span>

          <textarea
            value={mechanism}
            onChange={(e) => setMechanism(e.target.value)}
            placeholder="How could the event produce its claimed effect?"
            className="mt-2 min-h-24 w-full rounded-xl border p-4 outline-none focus:border-slate-950"
          />
        </label>

        <label>
          <span className="text-sm font-black">
            4. What remains uncertain?
          </span>

          <textarea
            value={uncertainty}
            onChange={(e) => setUncertainty(e.target.value)}
            placeholder="Missing data, competing explanations, unclear timing..."
            className="mt-2 min-h-24 w-full rounded-xl border p-4 outline-none focus:border-slate-950"
          />
        </label>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Completed"
          value={`${completeness}/5`}
          detail="Analytical fields completed"
        />

        <Stat
          label="Evidence gap"
          value={uncertainty ? "Identified" : "Open"}
          detail="Uncertainty should be explicit"
        />

        <Stat
          label="Next step"
          value="Verify"
          detail="Check claims against sources"
        />
      </div>
    </Panel>
  );
}

function SourceLab() {
  const [primary, setPrimary] = useState(0);
  const [specific, setSpecific] = useState(0);
  const [evidence, setEvidence] = useState(0);
  const [independent, setIndependent] = useState(0);
  const [date, setDate] = useState(0);

  const score = primary + specific + evidence + independent + date;

  return (
    <Panel
      eyebrow="Evidence quality"
      title="Source Lab"
      description="Assess a source across several dimensions. A high score does not make a source infallible. Humans have somehow managed to turn scoring systems into religions, so keep the result diagnostic."
    >
      <div className="grid gap-6 md:grid-cols-2">
        {[
          [
            "Primary-source proximity",
            primary,
            setPrimary,
            "Is the source close to the original document, data or statement?",
          ],
          [
            "Specificity",
            specific,
            setSpecific,
            "Does it identify people, documents, dates, data or concrete evidence?",
          ],
          [
            "Evidence",
            evidence,
            setEvidence,
            "Does it show the evidence behind the claim?",
          ],
          [
            "Independent corroboration",
            independent,
            setIndependent,
            "Is the claim supported independently rather than repeated?",
          ],
          [
            "Recency / relevance",
            date,
            setDate,
            "Is the source appropriately current for the question?",
          ],
        ].map(([label, value, setter, help]) => (
          <div key={String(label)} className="rounded-2xl border p-5">
            <div className="font-black">{String(label)}</div>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {String(help)}
            </p>

            <input
              type="range"
              min="0"
              max="5"
              value={Number(value)}
              onChange={(e) =>
                (setter as React.Dispatch<React.SetStateAction<number>>)(
                  Number(e.target.value)
                )
              }
              className="mt-5 w-full"
            />

            <div className="mt-3">
              <ScoreBar
                label="Assessment"
                value={Number(value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Score"
          value={`${score}/25`}
          detail="Diagnostic only"
        />

        <Stat
          label="Strongest"
          value={Math.max(
            primary,
            specific,
            evidence,
            independent,
            date
          ).toString()}
          detail="Highest dimension"
        />

        <Stat
          label="Weakest"
          value={Math.min(
            primary,
            specific,
            evidence,
            independent,
            date
          ).toString()}
          detail="Dimension requiring attention"
        />
      </div>
    </Panel>
  );
}

function ClaimChecker() {
  const [claim, setClaim] = useState("");
  const [classification, setClassification] = useState<
    "fact" | "claim" | "interpretation" | "opinion" | null
  >(null);

  const categories = [
    ["fact", "Fact", "Directly observable or independently verifiable statement."],
    ["claim", "Claim", "A proposition that requires evidence before acceptance."],
    ["interpretation", "Interpretation", "An explanation of what evidence may mean."],
    ["opinion", "Opinion", "A value judgment or preference."],
  ] as const;

  return (
    <Panel
      eyebrow="Claim discipline"
      title="Claim Checker"
      description="Classify the type of statement before debating it. A surprising amount of online discourse consists of people arguing over different categories of sentence."
    >
      <textarea
        value={claim}
        onChange={(e) => setClaim(e.target.value)}
        placeholder="Paste or write a statement..."
        className="min-h-32 w-full rounded-2xl border p-4 outline-none focus:border-slate-950"
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {categories.map(([id, title, description]) => (
          <button
            key={id}
            type="button"
            onClick={() => setClassification(id)}
            className={`rounded-2xl border p-5 text-left transition ${
              classification === id
                ? "border-slate-950 bg-slate-950 text-white"
                : "hover:border-slate-400"
            }`}
          >
            <div className="font-black">{title}</div>

            <div
              className={`mt-2 text-sm leading-6 ${
                classification === id
                  ? "text-slate-300"
                  : "text-slate-500"
              }`}
            >
              {description}
            </div>
          </button>
        ))}
      </div>

      {classification && (
        <div className="mt-5 rounded-2xl bg-slate-50 p-5">
          <div className="text-xs font-black uppercase tracking-wider text-slate-500">
            Current classification
          </div>

          <div className="mt-2 text-xl font-black capitalize">
            {classification}
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Classification is not verification. A factual-looking statement
            can still be false, and an interpretation can still be strongly
            or weakly supported.
          </p>
        </div>
      )}
    </Panel>
  );
}

function TimelineBuilder() {
  const [events, setEvents] = useState<
    { date: string; title: string; detail: string }[]
  >([
    {
      date: "",
      title: "",
      detail: "",
    },
  ]);

  function update(
    index: number,
    field: "date" | "title" | "detail",
    value: string
  ) {
    setEvents((items) =>
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addEvent() {
    setEvents((items) => [
      ...items,
      {
        date: "",
        title: "",
        detail: "",
      },
    ]);
  }

  return (
    <Panel
      eyebrow="Chronology"
      title="Timeline Builder"
      description="Build a chronological sequence before interpreting an event. Timelines are especially useful for legal cases, diplomatic crises, policy changes and controversies."
    >
      <div className="space-y-4">
        {events.map((event, index) => (
          <div
            key={index}
            className="rounded-2xl border p-5"
          >
            <div className="grid gap-3 md:grid-cols-[180px_1fr]">
              <input
                value={event.date}
                onChange={(e) =>
                  update(index, "date", e.target.value)
                }
                placeholder="Date / period"
                className="rounded-xl border px-4 py-3"
              />

              <input
                value={event.title}
                onChange={(e) =>
                  update(index, "title", e.target.value)
                }
                placeholder="Event"
                className="rounded-xl border px-4 py-3"
              />
            </div>

            <textarea
              value={event.detail}
              onChange={(e) =>
                update(index, "detail", e.target.value)
              }
              placeholder="What happened? Add evidence or source notes."
              className="mt-3 min-h-20 w-full rounded-xl border p-4"
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEvent}
        className="mt-5 rounded-xl bg-slate-950 px-5 py-3 font-bold text-white"
      >
        + Add event
      </button>
    </Panel>
  );
}

function PolicyMapper() {
  const [policy, setPolicy] = useState("");
  const [objective, setObjective] = useState("");
  const [mechanism, setMechanism] = useState("");
  const [beneficiaries, setBeneficiaries] = useState("");
  const [costs, setCosts] = useState("");
  const [risks, setRisks] = useState("");

  const fields = [
    ["Policy / law", policy, setPolicy, "Name or describe the intervention."],
    ["Stated objective", objective, setObjective, "What problem does it claim to address?"],
    ["Mechanism", mechanism, setMechanism, "How is the policy supposed to produce change?"],
    ["Beneficiaries / affected groups", beneficiaries, setBeneficiaries, "Who gains, loses or changes behaviour?"],
    ["Costs / trade-offs", costs, setCosts, "What resources or opportunity costs are involved?"],
    ["Risks / unintended effects", risks, setRisks, "What could happen outside the intended pathway?"],
  ];

  return (
    <Panel
      eyebrow="Public policy"
      title="Policy Impact Mapper"
      description="Move from a policy announcement to a causal chain. Keep the stated objective separate from the actual mechanism and from your assessment of likely effects."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(([label, value, setter, placeholder]) => (
          <label key={String(label)}>
            <span className="text-sm font-black">
              {String(label)}
            </span>

            <textarea
              value={String(value)}
              onChange={(e) =>
                (
                  setter as React.Dispatch<
                    React.SetStateAction<string>
                  >
                )(e.target.value)
              }
              placeholder={String(placeholder)}
              className="mt-2 min-h-24 w-full rounded-xl border p-4"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-950 p-6 text-white">
        <div className="text-xs font-black uppercase tracking-wider text-slate-400">
          Causal chain
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm font-bold">
          <span className="rounded-full bg-white/10 px-4 py-2">
            Policy
          </span>

          <span>→</span>

          <span className="rounded-full bg-white/10 px-4 py-2">
            Mechanism
          </span>

          <span>→</span>

          <span className="rounded-full bg-white/10 px-4 py-2">
            Behaviour
          </span>

          <span>→</span>

          <span className="rounded-full bg-white/10 px-4 py-2">
            Outcomes
          </span>

          <span>→</span>

          <span className="rounded-full bg-white/10 px-4 py-2">
            Distribution
          </span>
        </div>
      </div>
    </Panel>
  );
}

function Geopolitics() {
  const [countryA, setCountryA] = useState("India");
  const [countryB, setCountryB] = useState("United States");
  const [relationship, setRelationship] = useState("Strategic cooperation");
  const [security, setSecurity] = useState(3);
  const [trade, setTrade] = useState(4);
  const [technology, setTechnology] = useState(3);
  const [diplomacy, setDiplomacy] = useState(4);

  const dimensions = [
    ["Security", security, setSecurity],
    ["Trade", trade, setTrade],
    ["Technology", technology, setTechnology],
    ["Diplomacy", diplomacy, setDiplomacy],
  ] as const;

  return (
    <Panel
      eyebrow="International relations"
      title="Geopolitical Relationship Mapper"
      description="Map a bilateral relationship across dimensions instead of reducing it to a single label. States can cooperate in one domain while competing in another."
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="text-sm font-black">Actor A</span>
          <input
            value={countryA}
            onChange={(e) => setCountryA(e.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </label>

        <label>
          <span className="text-sm font-black">Actor B</span>
          <input
            value={countryB}
            onChange={(e) => setCountryB(e.target.value)}
            className="mt-2 w-full rounded-xl border px-4 py-3"
          />
        </label>
      </div>

      <label className="mt-4 block">
        <span className="text-sm font-black">
          Relationship description
        </span>

        <input
          value={relationship}
          onChange={(e) => setRelationship(e.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-3"
        />
      </label>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {dimensions.map(([label, value, setter]) => (
          <div key={label} className="rounded-2xl border p-5">
            <ScoreBar label={label} value={value} />

            <input
              type="range"
              min="0"
              max="5"
              value={value}
              onChange={(e) => setter(Number(e.target.value))}
              className="mt-4 w-full"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500">
          Relationship map
        </div>

        <div className="mt-3 text-xl font-black">
          {countryA} ↔ {countryB}
        </div>

        <div className="mt-2 text-sm text-slate-600">
          {relationship}
        </div>
      </div>
    </Panel>
  );
}

function EconomyDesk() {
  const [inflation, setInflation] = useState("4.0");
  const [growth, setGrowth] = useState("6.5");
  const [rate, setRate] = useState("6.5");
  const [rupee, setRupee] = useState("85");

  const realRate =
    Number(rate) - Number(inflation);

  const values = [
    ["Inflation", inflation, "%"],
    ["Growth", growth, "%"],
    ["Policy rate", rate, "%"],
    ["₹ / USD", rupee, "₹"],
  ];

  return (
    <Panel
      eyebrow="Macro desk"
      title="Economic Indicator Workspace"
      description="Enter figures from an authoritative source and examine them together. Values below are user inputs, not live market data."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Inflation", inflation, setInflation],
          ["Real / output growth", growth, setGrowth],
          ["Policy rate", rate, setRate],
          ["Exchange rate", rupee, setRupee],
        ].map(([label, value, setter]) => (
          <label key={String(label)}>
            <span className="text-sm font-black">
              {String(label)}
            </span>

            <input
              type="number"
              value={String(value)}
              onChange={(e) =>
                (
                  setter as React.Dispatch<
                    React.SetStateAction<string>
                  >
                )(e.target.value)
              }
              className="mt-2 w-full rounded-xl border px-4 py-3"
            />
          </label>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {values.map(([label, value, unit]) => (
          <Stat
            key={String(label)}
            label={String(label)}
            value={`${value}${unit}`}
          />
        ))}
      </div>

      <div className="mt-6 rounded-2xl border p-5">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500">
          Simple real-rate calculation
        </div>

        <div className="mt-2 text-2xl font-black">
          {Number.isFinite(realRate)
            ? `${realRate.toFixed(2)} percentage points`
            : "—"}
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          This is a simplified nominal-rate-minus-inflation calculation,
          not a complete measure of real interest rates.
        </p>
      </div>
    </Panel>
  );
}

function ForecastingLab() {
  const [base, setBase] = useState(50);
  const [upside, setUpside] = useState(25);
  const [downside, setDownside] = useState(25);

  const total = base + upside + downside;

  const normalized =
    total > 0
      ? {
          base: (base / total) * 100,
          upside: (upside / total) * 100,
          downside: (downside / total) * 100,
        }
      : {
          base: 0,
          upside: 0,
          downside: 0,
        };

  return (
    <Panel
      eyebrow="Uncertainty"
      title="Forecasting & Scenario Lab"
      description="Use explicit scenarios rather than pretending a single prediction is certainty. The tool normalizes your weights to 100% so the arithmetic does not stage a coup."
    >
      <label className="block">
        <span className="text-sm font-black">
          Question being forecast
        </span>

        <input
          placeholder="What outcome are you estimating?"
          className="mt-2 w-full rounded-xl border px-4 py-3"
        />
      </label>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {[
          ["Base scenario", base, setBase],
          ["Upside scenario", upside, setUpside],
          ["Downside scenario", downside, setDownside],
        ].map(([label, value, setter]) => (
          <div key={String(label)} className="rounded-2xl border p-5">
            <div className="font-black">{String(label)}</div>

            <input
              type="range"
              min="0"
              max="100"
              value={Number(value)}
              onChange={(e) =>
                (
                  setter as React.Dispatch<
                    React.SetStateAction<number>
                  >
                )(Number(e.target.value))
              }
              className="mt-5 w-full"
            />

            <div className="mt-3 text-2xl font-black">
              {Number(value)}%
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Base"
          value={`${normalized.base.toFixed(1)}%`}
        />

        <Stat
          label="Upside"
          value={`${normalized.upside.toFixed(1)}%`}
        />

        <Stat
          label="Downside"
          value={`${normalized.downside.toFixed(1)}%`}
        />
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
        <strong className="text-slate-950">
          Forecasting discipline:
        </strong>{" "}
        define the outcome, specify the time horizon, identify the base rate,
        list major drivers, assign probabilities, record the forecast date,
        and later compare the forecast with what actually happened.
      </div>
    </Panel>
  );
}

function MediaLiteracy() {
  const checks = [
    "Does the headline accurately represent the underlying article?",
    "Is the original source identifiable?",
    "Are numbers given without a denominator or baseline?",
    "Is correlation being presented as causation?",
    "Has relevant counter-evidence been omitted?",
    "Are old images or events being presented as recent?",
    "Does the conclusion go beyond what the evidence establishes?",
    "Are quoted claims attributed to identifiable sources?",
  ];

  const [checked, setChecked] = useState<boolean[]>(
    checks.map(() => false)
  );

  const count = checked.filter(Boolean).length;

  return (
    <Panel
      eyebrow="Critical reading"
      title="Media Literacy Lab"
      description="Use this as a checklist when encountering a viral claim, political controversy, infographic or emotionally charged headline."
    >
      <div className="space-y-3">
        {checks.map((check, index) => (
          <label
            key={check}
            className={`flex cursor-pointer gap-4 rounded-2xl border p-4 transition ${
              checked[index]
                ? "border-slate-950 bg-slate-50"
                : ""
            }`}
          >
            <input
              type="checkbox"
              checked={checked[index]}
              onChange={(e) =>
                setChecked((items) =>
                  items.map((item, i) =>
                    i === index ? e.target.checked : item
                  )
                )
              }
              className="mt-1 h-5 w-5"
            />

            <span className="text-sm leading-6">
              {check}
            </span>
          </label>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Stat
          label="Checks completed"
          value={`${count}/${checks.length}`}
        />

        <Stat
          label="Unchecked"
          value={String(checks.length - count)}
        />

        <Stat
          label="Rule"
          value="Verify"
          detail="Checklist ≠ proof"
        />
      </div>
    </Panel>
  );
}

function BriefingBuilder() {
  const sections = [
    "India",
    "World & Geopolitics",
    "Economy & Markets",
    "Technology & AI",
    "Government & Public Policy",
    "Society",
    "Environment & Disasters",
    "Uttar Pradesh",
    "BRICS & Global South",
    "Rupee & Indian Economy",
    "Forecasting & Data",
    "Political & Legal Cases",
  ];

  const [selected, setSelected] = useState<string[]>([
    "India",
    "World & Geopolitics",
    "Economy & Markets",
    "Technology & AI",
    "BRICS & Global South",
    "Rupee & Indian Economy",
  ]);

  const toggle = (section: string) => {
    setSelected((items) =>
      items.includes(section)
        ? items.filter((item) => item !== section)
        : [...items, section]
    );
  };

  return (
    <Panel
      eyebrow="Daily briefing"
      title="Briefing Builder"
      description="Choose the desks that should appear in a structured daily briefing. This page configures the briefing; it does not pretend these are today's headlines."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => {
          const active = selected.includes(section);

          return (
            <button
              key={section}
              type="button"
              onClick={() => toggle(section)}
              className={`rounded-2xl border p-4 text-left font-bold transition ${
                active
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "hover:border-slate-400"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{section}</span>
                <span>{active ? "✓" : "+"}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl bg-slate-50 p-5">
        <div className="text-xs font-black uppercase tracking-wider text-slate-500">
          Briefing configuration
        </div>

        <div className="mt-2 text-2xl font-black">
          {selected.length} desks selected
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {selected.map((item) => (
            <span
              key={item}
              className="rounded-full bg-white px-3 py-2 text-xs font-bold"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </Panel>
  );
}

function ToolContent({
  tool,
  setTool,
}: {
  tool: ToolId;
  setTool: (tool: ToolId) => void;
}) {
  if (tool === "overview") {
    return <CommandCentre setTool={setTool} />;
  }

  if (tool === "analyzer") {
    return <NewsAnalyzer />;
  }

  if (tool === "sources") {
    return <SourceLab />;
  }

  if (tool === "claims") {
    return <ClaimChecker />;
  }

  if (tool === "timeline") {
    return <TimelineBuilder />;
  }

  if (tool === "policy") {
    return <PolicyMapper />;
  }

  if (tool === "geopolitics") {
    return <Geopolitics />;
  }

  if (tool === "economy") {
    return <EconomyDesk />;
  }

  if (tool === "forecast") {
    return <ForecastingLab />;
  }

  if (tool === "media") {
    return <MediaLiteracy />;
  }

  return <BriefingBuilder />;
}

export default function NewsToolsPage() {
  const [tool, setTool] = useState<ToolId>("overview");
  const [search, setSearch] = useState("");

  const query = search.trim().toLowerCase();

  const filteredTopics = useMemo(() => {
    if (!query) return topics;

    return topics.filter((topic) =>
      `${topic.title} ${topic.description} ${topic.accent}`
        .toLowerCase()
        .includes(query)
    );
  }, [query]);

  const activeNav = navItems.find((item) => item[0] === tool);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-slate-500">
              VidyaGyan Portal · Tools
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
              News Lab
            </h1>

            <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
              A current-affairs workspace for analysing events, checking
              evidence, mapping policy, understanding geopolitical systems
              and thinking explicitly about uncertainty.
            </p>
          </div>

          <a
            href="/news"
            className="inline-flex w-fit rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            Open News Desk →
          </a>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search news subjects..."
            className="rounded-2xl border bg-white px-5 py-4 outline-none focus:border-slate-950"
          />

          <div className="flex items-center justify-center rounded-2xl border bg-white px-5 py-4 text-sm font-bold text-slate-500">
            {filteredTopics.length} desks
          </div>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          {navItems.map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTool(id)}
              className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                tool === id
                  ? "bg-slate-950 text-white"
                  : "border bg-white text-slate-600 hover:border-slate-400"
              }`}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {tool !== "overview" && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">
                News Lab
              </p>

              <h2 className="mt-1 text-xl font-black">
                {activeNav?.[1]}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setTool("overview")}
              className="rounded-xl border bg-white px-4 py-2 text-sm font-bold"
            >
              ← Command Centre
            </button>
          </div>
        )}

        <div className="mt-6">
          <ToolContent tool={tool} setTool={setTool} />
        </div>

        <section className="mt-10 rounded-3xl bg-slate-950 p-7 text-white md:p-10">
          <p className="text-xs font-black uppercase tracking-[.2em] text-slate-400">
            Analytical principle
          </p>

          <h2 className="mt-3 max-w-3xl text-3xl font-black tracking-tight md:text-4xl">
            Facts first. Mechanisms second. Interpretation third. Forecasts
            with uncertainty attached.
          </h2>

          <p className="mt-4 max-w-3xl leading-7 text-slate-300">
            The News Lab is designed to make current affairs useful for
            school learning, civic understanding and serious analytical
            work without collapsing reporting, opinion and prediction into
            one enormous bucket of internet noise.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href="/news"
              className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950"
            >
              Read current news
            </a>

            <button
              type="button"
              onClick={() => setTool("analyzer")}
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white"
            >
              Analyse a story
            </button>

            <button
              type="button"
              onClick={() => setTool("forecast")}
              className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white"
            >
              Open Forecasting Lab
            </button>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-slate-500">
                Practice cases
              </p>

              <h2 className="mt-2 text-2xl font-black">
                Analytical prompts
              </h2>
            </div>

            <span className="text-xs font-bold text-slate-400">
              Use with verified reporting
            </span>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {sampleStories.map((story) => (
              <button
                key={story.title}
                type="button"
                onClick={() => setTool("analyzer")}
                className="rounded-3xl border bg-white p-6 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-sm"
              >
                <div className="text-xs font-black uppercase tracking-wider text-slate-500">
                  {story.topic}
                </div>

                <h3 className="mt-3 text-xl font-black">
                  {story.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {story.description}
                </p>

                <div className="mt-5 text-sm font-bold">
                  Analyse →
                </div>
              </button>
            ))}
          </div>
        </section>

        {query && (
          <section className="mt-10">
            <Panel
              eyebrow="Search"
              title="Matching news desks"
              description={`Results for “${search}”.`}
            >
              {filteredTopics.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredTopics.map((topic) => (
                    <a
                      key={topic.id}
                      href="/news"
                      className="rounded-2xl border p-4 hover:border-slate-400"
                    >
                      <div className="text-xl">{topic.icon}</div>
                      <div className="mt-3 font-black">
                        {topic.title}
                      </div>
                      <div className="mt-1 text-sm text-slate-500">
                        {topic.description}
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-slate-500">
                  No news desk matches “{search}”.
                </div>
              )}
            </Panel>
          </section>
        )}
      </section>
    </main>
  );
}
