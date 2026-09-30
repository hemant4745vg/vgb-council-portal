"use client";

import { useMemo, useState } from "react";

type Tab =
  | "overview"
  | "molecular"
  | "cell"
  | "genetics"
  | "plant"
  | "physiology"
  | "microscope"
  | "data"
  | "practice"
  | "systems";

type CellType = "animal" | "plant" | "prokaryote";
type Mutation = "none" | "substitution" | "insertion" | "deletion";
type SystemLab = "control" | "molecular" | "membrane" | "photosynthesis" | "plant" | "heart" | "lungs" | "nephron" | "ecosystem";

type Question = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

const syllabus = [
  ["I", "Diversity of Living Organisms", "The Living World · Biological Classification · Plant Kingdom · Animal Kingdom"],
  ["II", "Structural Organisation", "Morphology · Anatomy · Structural Organisation in Animals"],
  ["III", "Cell: Structure & Function", "Cell · Biomolecules · Cell Cycle and Cell Division"],
  ["IV", "Plant Physiology", "Photosynthesis · Respiration · Plant Growth and Development"],
  ["V", "Human Physiology", "Breathing · Circulation · Excretion · Locomotion · Neural Control · Chemical Coordination"],
] as const;

const organelles = [
  { id: "nucleus", name: "Nucleus", tag: "Control + genetic information", text: "Contains most of the cell's DNA and coordinates gene expression and cell activity.", type: "Eukaryotic" },
  { id: "mitochondria", name: "Mitochondrion", tag: "Aerobic respiration", text: "Uses energy-rich molecules to generate ATP through cellular respiration.", type: "Eukaryotic" },
  { id: "ribosome", name: "Ribosome", tag: "Protein synthesis", text: "Reads mRNA and joins amino acids into polypeptide chains.", type: "All cells" },
  { id: "chloroplast", name: "Chloroplast", tag: "Photosynthesis", text: "Captures light energy and uses it to drive carbon fixation in photosynthetic eukaryotes.", type: "Plant cell" },
  { id: "vacuole", name: "Large vacuole", tag: "Storage + turgor", text: "Stores water and solutes and contributes strongly to plant-cell turgor.", type: "Plant cell" },
  { id: "membrane", name: "Plasma membrane", tag: "Selective boundary", text: "Controls movement between the cell and its environment using a fluid mosaic membrane.", type: "All cells" },
];

const specimens = [
  { id: "onion", name: "Onion epidermis", type: "Plant tissue", clue: "Regular rectangular cells with prominent cell walls and large vacuoles.", answer: "Plant epidermal tissue", magnification: "100×" },
  { id: "cheek", name: "Human cheek smear", type: "Animal cell", clue: "Irregularly shaped cells without a rigid cell wall; a stained nucleus is visible.", answer: "Squamous epithelial cells", magnification: "400×" },
  { id: "blood", name: "Blood smear", type: "Connective tissue", clue: "Many small anucleate cells plus fewer larger nucleated cells.", answer: "Blood", magnification: "400×" },
  { id: "stoma", name: "Leaf surface", type: "Plant structure", clue: "A pore bordered by two guard cells controls gas exchange and water loss.", answer: "Stoma", magnification: "400×" },
];

const questions: Question[] = [
  { prompt: "A plant cell is placed in a hypertonic solution. Which change is most directly expected?", options: ["Water enters and turgor rises", "Water leaves and plasmolysis may occur", "The cell wall dissolves", "The nucleus immediately divides"], answer: 1, explanation: "Water moves out of the cell when the external solution has lower water potential. Loss of water can cause the protoplast to pull away from the wall." },
  { prompt: "A DNA template contains TAC. What mRNA sequence is produced during transcription?", options: ["AUG", "UAC", "ATG", "GUA"], answer: 0, explanation: "RNA bases pair with the template: T→A, A→U, C→G, giving AUG." },
  { prompt: "Why is alveolar ventilation lower than minute ventilation when dead space is present?", options: ["Some inhaled air does not reach gas-exchanging surfaces", "The heart removes oxygen from the lungs", "Alveoli contain no capillaries", "Expiration stops gas exchange"], answer: 0, explanation: "Alveolar ventilation uses tidal volume minus dead-space volume because only the remaining air participates directly in alveolar gas exchange." },
  { prompt: "In a monohybrid cross Aa × Aa, what proportion of offspring is expected to be aa?", options: ["0%", "25%", "50%", "75%"], answer: 1, explanation: "The four equally likely genotype combinations are AA, Aa, Aa and aa. Thus aa is 1/4." },
  { prompt: "A student increases light intensity but photosynthesis stops increasing. The best interpretation is that...", options: ["Light can never affect photosynthesis", "another factor has become limiting", "chlorophyll has disappeared", "CO₂ is no longer a reactant"], answer: 1, explanation: "A plateau can occur when another limiting factor, such as CO₂ concentration or temperature, constrains the rate." },
];

const codonTable: Record<string, string> = {
  UUU: "Phe", UUC: "Phe", UUA: "Leu", UUG: "Leu", CUU: "Leu", CUC: "Leu", CUA: "Leu", CUG: "Leu",
  AUU: "Ile", AUC: "Ile", AUA: "Ile", AUG: "Met", GUU: "Val", GUC: "Val", GUA: "Val", GUG: "Val",
  UCU: "Ser", UCC: "Ser", UCA: "Ser", UCG: "Ser", CCU: "Pro", CCC: "Pro", CCA: "Pro", CCG: "Pro",
  ACU: "Thr", ACC: "Thr", ACA: "Thr", ACG: "Thr", GCU: "Ala", GCC: "Ala", GCA: "Ala", GCG: "Ala",
  UAU: "Tyr", UAC: "Tyr", UAA: "STOP", UAG: "STOP", CAU: "His", CAC: "His", CAA: "Gln", CAG: "Gln",
  AAU: "Asn", AAC: "Asn", AAA: "Lys", AAG: "Lys", GAU: "Asp", GAC: "Asp", GAA: "Glu", GAG: "Glu",
  UGU: "Cys", UGC: "Cys", UGA: "STOP", UGG: "Trp", CGU: "Arg", CGC: "Arg", CGA: "Arg", CGG: "Arg",
  AGU: "Ser", AGC: "Ser", AGA: "Arg", AGG: "Arg", GGU: "Gly", GGC: "Gly", GGA: "Gly", GGG: "Gly",
};

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function complementDNA(base: string) {
  return base === "A" ? "T" : base === "T" ? "A" : base === "C" ? "G" : "C";
}

function templateToMrna(template: string) {
  return template.split("").map((b) => (b === "A" ? "U" : b === "T" ? "A" : b === "C" ? "G" : "C")).join("");
}

function translate(mrna: string) {
  const amino: string[] = [];
  for (let i = 0; i + 2 < mrna.length; i += 3) {
    const codon = mrna.slice(i, i + 3);
    const aa = codonTable[codon] ?? "?";
    amino.push(aa);
    if (aa === "STOP") break;
  }
  return amino;
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="bio-section-heading"><span className="bio-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div>;
}

function ToolCard({ icon, title, text, onClick }: { icon: string; title: string; text: string; onClick: () => void }) {
  return <button className="tool-card" onClick={onClick}><span className="tool-icon">{icon}</span><span className="tool-copy"><strong>{title}</strong><small>{text}</small></span><span className="tool-arrow">↗</span></button>;
}

function Metric({ label, value, unit, note }: { label: string; value: string; unit?: string; note?: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}{unit && <em>{unit}</em>}</strong>{note && <small>{note}</small>}</div>;
}

function Slider({ label, value, min, max, step = 1, unit, onChange }: { label: string; value: number; min: number; max: number; step?: number; unit?: string; onChange: (v: number) => void }) {
  return <label className="slider-row"><span>{label}</span><input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} /><output>{value}{unit ?? ""}</output></label>;
}


function SystemsLab() {
  const [lab, setLab] = useState<SystemLab>("control");
  const [dna, setDna] = useState("TACTACGGTACCAA");
  const [mutation, setMutation] = useState<Mutation>("none");
  const [mutationIndex, setMutationIndex] = useState(3);
  const [mutationBase, setMutationBase] = useState("G");
  const [inside, setInside] = useState(35);
  const [outside, setOutside] = useState(70);
  const [permeability, setPermeability] = useState(70);
  const [atp, setAtp] = useState(50);
  const [membraneMode, setMembraneMode] = useState<"osmosis" | "diffusion" | "active">("osmosis");
  const [light, setLight] = useState(65);
  const [co2, setCo2] = useState(60);
  const [temperature, setTemperature] = useState(25);
  const [water, setWater] = useState(75);
  const [soilWater, setSoilWater] = useState(70);
  const [humidity, setHumidity] = useState(55);
  const [wind, setWind] = useState(35);
  const [stomata, setStomata] = useState(65);
  const [heartRate, setHeartRate] = useState(72);
  const [strokeVolume, setStrokeVolume] = useState(70);
  const [respRate, setRespRate] = useState(14);
  const [tidal, setTidal] = useState(500);
  const [deadSpace, setDeadSpace] = useState(150);
  const [nephronStage, setNephronStage] = useState<"filtration" | "reabsorption" | "secretion">("filtration");
  const [substance, setSubstance] = useState<"water" | "glucose" | "urea">("water");
  const [plants, setPlants] = useState(70);
  const [herbivores, setHerbivores] = useState(45);
  const [predators, setPredators] = useState(20);
  const [rain, setRain] = useState(60);

  const labs: [SystemLab, string][] = [
    ["control", "Systems Control"],
    ["molecular", "DNA Studio"],
    ["membrane", "Membrane"],
    ["photosynthesis", "Photosynthesis"],
    ["plant", "Plant Transport"],
    ["heart", "Circulation"],
    ["lungs", "Respiration"],
    ["nephron", "Nephron"],
    ["ecosystem", "Ecosystem"],
  ];

  const effectiveDNA = useMemo(() => {
    const chars = dna.split("");
    if (mutation === "substitution" && chars.length) chars[clamp(mutationIndex, 0, chars.length - 1)] = mutationBase;
    if (mutation === "insertion") chars.splice(clamp(mutationIndex, 0, chars.length), 0, mutationBase);
    if (mutation === "deletion" && chars.length) chars.splice(clamp(mutationIndex, 0, chars.length - 1), 1);
    return chars.join("");
  }, [dna, mutation, mutationIndex, mutationBase]);
  const mrna = templateToMrna(effectiveDNA);
  const amino = translate(mrna);
  const frameShift = (mutation === "insertion" || mutation === "deletion") && (effectiveDNA.length - dna.length) % 3 !== 0;

  const membraneResponse = useMemo(() => {
    const gradient = Math.abs(outside - inside);
    if (membraneMode === "active") return Math.round(clamp((atp / 100) * permeability, 0, 100));
    return Math.round(clamp(gradient * (permeability / 100), 0, 100));
  }, [inside, outside, permeability, atp, membraneMode]);

  const photoRate = useMemo(() => {
    const lightFactor = 1 - Math.exp(-light / 43);
    const co2Factor = 0.35 + co2 / 155;
    const tempFactor = temperature <= 30
      ? 1 - Math.abs(temperature - 25) * 0.018
      : Math.max(0.45, 1 - (temperature - 30) * 0.04);
    const waterFactor = 0.45 + water / 180;
    return Math.round(clamp(lightFactor * co2Factor * tempFactor * waterFactor * 100, 0, 100));
  }, [light, co2, temperature, water]);

  const plantTransport = useMemo(() => {
    const waterSupply = soilWater / 100;
    const evaporativeDemand = ((100 - humidity) * 0.55 + wind * 0.45) / 100;
    const stomatalFlow = stomata / 100;
    const transpiration = clamp((evaporativeDemand * 70 + stomatalFlow * 30) * (0.55 + waterSupply * 0.45), 0, 100);
    const uptake = clamp(soilWater * 0.72 + stomata * 0.12 - temperature * 0.2, 0, 100);
    return { transpiration: Math.round(transpiration), uptake: Math.round(uptake), stress: Math.round(clamp((100 - soilWater) * 0.8 + wind * 0.15 - humidity * 0.05, 0, 100)) };
  }, [soilWater, humidity, wind, stomata, temperature]);

  const cardiacOutput = heartRate * strokeVolume / 1000;
  const minuteVentilation = respRate * tidal / 1000;
  const alveolarVentilation = respRate * Math.max(0, tidal - deadSpace) / 1000;

  const nephronRemaining = useMemo(() => {
    const base: Record<"water" | "glucose" | "urea", number> = { water: 100, glucose: 100, urea: 100 };
    if (nephronStage === "filtration") return base[substance];
    if (nephronStage === "reabsorption") {
      return substance === "glucose" ? 2 : substance === "water" ? 35 : 85;
    }
    return substance === "urea" ? 92 : substance === "water" ? 30 : 2;
  }, [nephronStage, substance]);

  const ecosystem = useMemo(() => {
    const plantGrowth = clamp(rain * 0.65 + 25 - herbivores * 0.18, 0, 100);
    const herbivoreGrowth = clamp(plants * 0.55 + rain * 0.2 - predators * 0.3, 0, 100);
    const predatorGrowth = clamp(herbivores * 0.72 - predators * 0.25, 0, 100);
    return [
      { name: "Plants", current: plants, response: plantGrowth },
      { name: "Herbivores", current: herbivores, response: herbivoreGrowth },
      { name: "Predators", current: predators, response: predatorGrowth },
    ] as { name: string; current: number; response: number }[];
  }, [plants, herbivores, predators, rain]);

  const limiting = useMemo(() => {
    const factors: [string, number][] = [
      ["Light", light],
      ["CO₂", co2],
      ["Water", water],
      ["Temperature", clamp(100 - Math.abs(temperature - 25) * 4, 0, 100)],
    ];
    return factors.sort((a, b) => a[1] - b[1])[0][0];
  }, [light, co2, water, temperature]);

  const resetSystems = () => {
    setDna("TACTACGGTACCAA"); setMutation("none"); setMutationIndex(3); setMutationBase("G");
    setInside(35); setOutside(70); setPermeability(70); setAtp(50); setMembraneMode("osmosis");
    setLight(65); setCo2(60); setTemperature(25); setWater(75);
    setSoilWater(70); setHumidity(55); setWind(35); setStomata(65);
    setHeartRate(72); setStrokeVolume(70); setRespRate(14); setTidal(500); setDeadSpace(150);
    setNephronStage("filtration"); setSubstance("water"); setPlants(70); setHerbivores(45); setPredators(20); setRain(60);
  };

  return <section className="section"><div className="bio-shell">
    <SectionHeading eyebrow="Advanced interactive lab" title="Biological systems: change one thing, watch the system respond." text="This is the extension layer. Each model exposes a small set of controllable variables so you can trace mechanism, feedback, flow and trade-offs rather than merely memorising labels." />
    <div className="systems-toolbar"><div className="segmented systems-segmented">{labs.map(([id, label]) => <button key={id} className={lab === id ? "active" : ""} onClick={() => setLab(id)}>{label}</button>)}</div><button className="chip" onClick={resetSystems}>Reset models</button></div>

    {lab === "control" && <div className="two-col">
      <div className="panel"><div className="panel-header"><div><h3>Live systems dashboard</h3><p>Move the controls and treat each output as a model, not a claim about every real organism.</p></div><span className="chip active">Systems thinking</span></div>
        <div className="slider-stack"><Slider label="Light" value={light} min={0} max={100} onChange={setLight}/><Slider label="CO₂" value={co2} min={0} max={100} onChange={setCo2}/><Slider label="Water" value={water} min={0} max={100} onChange={setWater}/><Slider label="Heart rate" value={heartRate} min={40} max={180} unit=" bpm" onChange={setHeartRate}/></div>
        <div className="metric-grid" style={{marginTop:20}}><Metric label="Photosynthesis" value={String(photoRate)} unit="%"/><Metric label="Limiting factor" value={limiting}/><Metric label="Cardiac output" value={cardiacOutput.toFixed(2)} unit="L/min"/><Metric label="Alveolar ventilation" value={alveolarVentilation.toFixed(2)} unit="L/min"/></div>
      </div>
      <div className="panel"><div className="panel-header"><div><h3>Trace the causal chain</h3><p>Use this as a reasoning scaffold when studying any biological process.</p></div></div>
        <div className="system-chain"><div><span>01</span><strong>Input</strong><p>Change an environmental or physiological variable.</p></div><b>→</b><div><span>02</span><strong>Mechanism</strong><p>Identify the structure or process that responds.</p></div><b>→</b><div><span>03</span><strong>Output</strong><p>Measure a rate, flow, concentration or population response.</p></div><b>→</b><div><span>04</span><strong>Feedback</strong><p>Ask whether the output changes the next input.</p></div></div>
        <div className="mini" style={{marginTop:18}}><span>Current model reading</span><strong>{limiting} is the lowest relative input in the photosynthesis model.</strong><p>That identifies a model constraint. It does not prove causation in an uncontrolled real-world experiment.</p></div>
      </div>
    </div>}

    {lab === "molecular" && <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>DNA mutation studio</h3><p>Edit the template and follow the sequence into translation.</p></div></div>
      <input value={dna} onChange={e => setDna(e.target.value.toUpperCase().replace(/[^ATCG]/g, "").slice(0, 36))} style={{width:"100%",padding:"13px",border:"1px solid var(--bio-line)",borderRadius:10,letterSpacing:".16em",fontWeight:800}}/>
      <div className="chip-row" style={{marginTop:14}}>{(["none","substitution","insertion","deletion"] as Mutation[]).map(m => <button key={m} className={`chip ${mutation===m?"active":""}`} onClick={() => setMutation(m)}>{m}</button>)}</div>
      {mutation !== "none" && <div style={{marginTop:14}}><Slider label="Position" value={mutationIndex} min={0} max={mutation === "insertion" ? dna.length : Math.max(0,dna.length-1)} onChange={setMutationIndex}/><div className="chip-row" style={{marginTop:10}}>{["A","T","C","G"].map(b => <button key={b} className={`chip ${mutationBase===b?"active":""}`} onClick={() => setMutationBase(b)}>{b}</button>)}</div></div>}
      <div className="sequence-label" style={{marginTop:18}}>Mutated template DNA</div><div className="sequence">{effectiveDNA.split("").map((b,i)=><span className={`base ${b.toLowerCase()}`} key={`${i}-${b}`}>{b}</span>)}</div>
      <div className="sequence-label">mRNA</div><div className="sequence">{mrna.split("").map((b,i)=><span className={`base ${b.toLowerCase()}`} key={`${i}-${b}`}>{b}</span>)}</div>
      <div className="flow"><div><span>DNA</span><strong>{effectiveDNA.length} bases</strong></div><div className="flow-arrow">→</div><div><span>mRNA</span><strong>{mrna.length} bases</strong></div><div className="flow-arrow">→</div><div><span>Protein</span><strong>{amino.length} units</strong></div></div>
    </div><div className="panel"><div className="panel-header"><div><h3>Mutation interpretation</h3><p>Sequence edits are useful because their consequences can be followed.</p></div></div><div className="three-col"><div className="mini"><span>Sequence</span><strong>{mutation === "none" ? "Unchanged" : mutation}</strong><p>Compare the edited sequence with the baseline strand.</p></div><div className="mini"><span>Reading frame</span><strong>{frameShift ? "Shifted" : "Preserved"}</strong><p>Insertions/deletions that are not multiples of three can shift downstream codons.</p></div><div className="mini"><span>Translation</span><strong>{amino.join(" · ") || "No complete codon"}</strong><p>STOP terminates the simple translation model.</p></div></div></div></div>}

    {lab === "membrane" && <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Membrane transport lab</h3><p>Explore gradient, permeability and ATP as separate controls.</p></div><div className="segmented">{(["osmosis","diffusion","active"] as const).map(mode => <button key={mode} className={membraneMode===mode?"active":""} onClick={() => setMembraneMode(mode)}>{mode}</button>)}</div></div><div className="slider-stack"><Slider label="Outside concentration" value={outside} min={0} max={100} onChange={setOutside}/><Slider label="Inside concentration" value={inside} min={0} max={100} onChange={setInside}/><Slider label="Permeability" value={permeability} min={0} max={100} onChange={setPermeability}/><Slider label="ATP availability" value={atp} min={0} max={100} onChange={setAtp}/></div><div className="membrane" style={{marginTop:20}}><div className="membrane-side"><span>Outside</span><strong>{outside}</strong></div><div className="membrane-bar"><span>membrane</span></div><div className="membrane-side"><span>Inside</span><strong>{inside}</strong></div></div></div><div className="panel"><div className="panel-header"><div><h3>Interpretation</h3><p>Use the gradient first, then ask whether the membrane permits movement.</p></div></div><div className="metric-grid"><Metric label="Gradient" value={String(Math.abs(outside-inside))}/><Metric label="Transport response" value={String(membraneResponse)} unit="%"/><Metric label="Energy" value={String(atp)} unit="%"/></div><div className="mini" style={{marginTop:14}}><span>Mechanism</span><strong>{membraneMode === "active" ? "ATP-powered transport can move substances against a gradient." : membraneMode === "osmosis" ? "Water tends to move toward the side with lower water potential." : outside > inside ? "Net solute movement tends inward when the membrane is permeable." : outside < inside ? "Net solute movement tends outward when the membrane is permeable." : "No concentration gradient."}</strong><p>For osmosis, water movement depends on water potential rather than simply treating solute concentration as a universal movement rule. Active transport requires energy and transport proteins.</p></div></div></div>}

    {lab === "photosynthesis" && <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Photosynthesis control room</h3><p>Change light, CO₂, temperature and water together.</p></div><span className="chip active">Rate model</span></div><div className="slider-stack"><Slider label="Light" value={light} min={0} max={100} onChange={setLight}/><Slider label="CO₂" value={co2} min={0} max={100} onChange={setCo2}/><Slider label="Temperature" value={temperature} min={5} max={45} unit="°C" onChange={setTemperature}/><Slider label="Water" value={water} min={0} max={100} onChange={setWater}/></div><div className="metric-grid" style={{marginTop:20}}><Metric label="Relative rate" value={String(photoRate)} unit="%"/><Metric label="Limiting factor" value={limiting}/></div></div><div className="panel"><div className="panel-header"><div><h3>Rate response</h3><p>A deliberately simplified model for comparing variables.</p></div></div><div className="plant-chart">{[15,28,42,56,68,78,86,92].map((x,i)=><div key={i} style={{flex:1,height:`${clamp(x*(0.55+photoRate/210),8,100)}%`}}><div className="bar" style={{height:"100%"}}><span>{Math.round(x*(0.55+photoRate/210))}</span></div><div className="bar-label">{i+1}</div></div>)}</div><div className="mini" style={{marginTop:14}}><span>Current inference</span><strong>{photoRate < 35 ? "The rate is strongly constrained." : photoRate > 82 ? "The system is approaching a high-rate plateau." : "The rate is responding while constraints remain."}</strong><p>Change one variable at a time when you want to isolate a causal relationship.</p></div></div></div>}

    {lab === "plant" && <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Plant transport simulator</h3><p>Model the balance between soil water supply and evaporative demand.</p></div></div><div className="slider-stack"><Slider label="Soil water" value={soilWater} min={0} max={100} onChange={setSoilWater}/><Slider label="Humidity" value={humidity} min={0} max={100} onChange={setHumidity}/><Slider label="Wind" value={wind} min={0} max={100} onChange={setWind}/><Slider label="Stomatal opening" value={stomata} min={0} max={100} onChange={setStomata}/><Slider label="Temperature" value={temperature} min={5} max={45} unit="°C" onChange={setTemperature}/></div></div><div className="panel"><div className="panel-header"><div><h3>Xylem flow model</h3><p>Follow water from soil through root uptake and transpiration.</p></div></div><div className="flow vertical-flow"><div><span>Soil</span><strong>{soilWater}% water</strong></div><div className="flow-arrow">↓</div><div><span>Roots</span><strong>{plantTransport.uptake}% uptake</strong></div><div className="flow-arrow">↓</div><div><span>Xylem</span><strong>{Math.round((plantTransport.uptake+plantTransport.transpiration)/2)}% flow</strong></div><div className="flow-arrow">↓</div><div><span>Leaves</span><strong>{plantTransport.transpiration}% transpiration</strong></div></div><div className="metric-grid" style={{marginTop:18}}><Metric label="Uptake" value={String(plantTransport.uptake)} unit="%"/><Metric label="Transpiration" value={String(plantTransport.transpiration)} unit="%"/><Metric label="Stress" value={String(plantTransport.stress)} unit="%"/></div></div></div>}

    {lab === "heart" && <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Circulation simulator</h3><p>Cardiac output changes when rate or stroke volume changes.</p></div></div><div className="slider-stack"><Slider label="Heart rate" value={heartRate} min={40} max={180} unit=" bpm" onChange={setHeartRate}/><Slider label="Stroke volume" value={strokeVolume} min={30} max={130} unit=" mL" onChange={setStrokeVolume}/></div><div className="metric-grid" style={{marginTop:20}}><Metric label="Cardiac output" value={cardiacOutput.toFixed(2)} unit="L/min"/><Metric label="Heart rate" value={String(heartRate)} unit="bpm"/><Metric label="Stroke volume" value={String(strokeVolume)} unit="mL"/></div></div><div className="panel"><div className="panel-header"><div><h3>Blood pathway</h3><p>Trace the two linked circuits.</p></div></div><div className="physiology-path"><span className="path-node">Body</span><span className="path-arrow">→</span><span className="path-node">Venae cavae</span><span className="path-arrow">→</span><span className="path-node">Right heart</span><span className="path-arrow">→</span><span className="path-node">Lungs</span><span className="path-arrow">→</span><span className="path-node">Left heart</span><span className="path-arrow">→</span><span className="path-node">Aorta</span><span className="path-arrow">→</span><span className="path-node">Body</span></div><div className="mini" style={{marginTop:16}}><span>Reasoning</span><strong>CO = heart rate × stroke volume.</strong><p>Changing either term changes the modelled volume pumped per minute.</p></div></div></div>}

    {lab === "lungs" && <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Respiratory mechanics</h3><p>Separate total ventilation from the portion reaching gas-exchanging surfaces.</p></div></div><div className="slider-stack"><Slider label="Respiratory rate" value={respRate} min={6} max={40} unit=" /min" onChange={setRespRate}/><Slider label="Tidal volume" value={tidal} min={250} max={900} step={10} unit=" mL" onChange={setTidal}/><Slider label="Dead space" value={deadSpace} min={50} max={300} step={10} unit=" mL" onChange={setDeadSpace}/></div></div><div className="panel"><div className="metric-grid"><Metric label="Minute ventilation" value={minuteVentilation.toFixed(2)} unit="L/min"/><Metric label="Alveolar ventilation" value={alveolarVentilation.toFixed(2)} unit="L/min"/><Metric label="Effective fraction" value={String(Math.round(clamp((tidal-deadSpace)/tidal*100,0,100)))} unit="%"/></div><div className="mini" style={{marginTop:16}}><span>Key idea</span><strong>Dead space reduces the part of each breath available for alveolar exchange.</strong><p>Alveolar ventilation = respiratory rate × (tidal volume − dead-space volume).</p></div></div></div>}

    {lab === "nephron" && <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Nephron simulator</h3><p>Follow a substance through filtration, reabsorption and secretion.</p></div></div><div className="chip-row">{(["filtration","reabsorption","secretion"] as const).map(stage => <button key={stage} className={`chip ${nephronStage===stage?"active":""}`} onClick={() => setNephronStage(stage)}>{stage}</button>)}{(["water","glucose","urea"] as const).map(item => <button key={item} className={`chip ${substance===item?"active":""}`} onClick={() => setSubstance(item)}>{item}</button>)}</div><div className="flow vertical-flow" style={{marginTop:20}}><div><span>Filtrate enters</span><strong>Bowman's capsule</strong></div><div className="flow-arrow">↓</div><div><span>Processing</span><strong>{nephronStage}</strong></div><div className="flow-arrow">↓</div><div><span>Output</span><strong>Urine pathway</strong></div></div></div><div className="panel"><div className="metric-grid"><Metric label="Substance" value={substance}/><Metric label="Remaining" value={String(nephronRemaining)} unit="%"/></div><div className="bar-track" style={{marginTop:18}}><div className="bar-fill" style={{width:`${nephronRemaining}%`}}/></div><div className="mini" style={{marginTop:16}}><span>Interpretation</span><strong>{nephronStage === "filtration" ? "Filtration moves small dissolved substances into the filtrate." : nephronStage === "reabsorption" ? "Useful substances and much water can return to the blood." : "Secretion adds selected substances from blood into the tubular fluid."}</strong><p>This is a conceptual model, not a quantitative clinical simulation.</p></div></div></div>}

    {lab === "ecosystem" && <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Ecosystem feedback simulator</h3><p>Change rainfall and population sizes, then inspect the linked responses.</p></div></div><div className="slider-stack"><Slider label="Plants" value={plants} min={0} max={100} onChange={setPlants}/><Slider label="Herbivores" value={herbivores} min={0} max={100} onChange={setHerbivores}/><Slider label="Predators" value={predators} min={0} max={100} onChange={setPredators}/><Slider label="Rainfall" value={rain} min={0} max={100} onChange={setRain}/></div></div><div className="panel"><div className="panel-header"><div><h3>Population responses</h3><p>These bars show model response, not field measurements.</p></div></div><div className="ecosystem-bars">{ecosystem.map(({name,current,response}) => <div className="eco-item" key={name}><div className="eco-head"><strong>{name}</strong><span>Current {current}%</span></div><div className="eco-track"><div className="eco-fill" style={{width:`${response}%`}}/></div><small>Response: {Math.round(response)}%</small></div>)}</div><div className="mini" style={{marginTop:18}}><span>Systems question</span><strong>Which change creates the largest downstream effect?</strong><p>Try reducing plants, increasing herbivores, then changing rainfall. Track the direction of the response rather than memorising one fixed outcome.</p></div></div></div>}
  </div></section>;
}

export default function BiologyToolsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [cellType, setCellType] = useState<CellType>("animal");
  const [organelle, setOrganelle] = useState("nucleus");
  const [outside, setOutside] = useState(70);
  const [inside, setInside] = useState(40);
  const [transport, setTransport] = useState<"osmosis" | "diffusion" | "active">("osmosis");
  const [template, setTemplate] = useState("TACTACGGTACCAA");
  const [mutation, setMutation] = useState<Mutation>("none");
  const [mutationIndex, setMutationIndex] = useState(3);
  const [parentA, setParentA] = useState("Aa");
  const [parentB, setParentB] = useState("Aa");
  const [light, setLight] = useState(55);
  const [co2, setCo2] = useState(50);
  const [temp, setTemp] = useState(25);
  const [heartRate, setHeartRate] = useState(72);
  const [strokeVolume, setStrokeVolume] = useState(70);
  const [respRate, setRespRate] = useState(14);
  const [tidal, setTidal] = useState(500);
  const [deadSpace, setDeadSpace] = useState(150);
  const [specimen, setSpecimen] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [data, setData] = useState([12, 18, 27, 34, 42]);
  const [question, setQuestion] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);

  const activeOrganelle = organelles.find((o) => o.id === organelle) ?? organelles[0];
  const effectiveDNA = useMemo(() => {
    const chars = template.split("");
    if (mutation === "substitution") chars[mutationIndex] = complementDNA(chars[mutationIndex] ?? "A");
    if (mutation === "insertion") chars.splice(mutationIndex, 0, "G");
    if (mutation === "deletion") chars.splice(mutationIndex, 1);
    return chars.join("");
  }, [template, mutation, mutationIndex]);
  const codingStrand = effectiveDNA.split("").map(complementDNA).join("");
  const mrna = templateToMrna(effectiveDNA);
  const amino = translate(mrna);
  const baselineMrna = templateToMrna(template);
  const baselineAmino = translate(baselineMrna);
  const mutationEffect = useMemo(() => {
    if (mutation === "none") return "No mutation: the sequence and translated peptide remain unchanged.";
    if (mutation === "substitution") return "A substitution changes one base. Its effect can be silent, missense or nonsense depending on the codon.";
    return "A frameshift-inducing insertion/deletion can alter every downstream codon when the number of added or removed bases is not a multiple of three.";
  }, [mutation]);

  const gametesA = parentA.split("");
  const gametesB = parentB.split("");
  const punnett = gametesA.flatMap((a) => gametesB.map((b) => a + b));
  const dominant = punnett.filter((g) => g.includes("A")).length / punnett.length;
  const recessive = punnett.filter((g) => g === "aa").length / punnett.length;
  const heterozygous = punnett.filter((g) => g === "Aa" || g === "aA").length / punnett.length;

  const waterDirection = outside > inside ? "Water tends to move out" : outside < inside ? "Water tends to move in" : "No net movement";
  const waterGradient = clamp(Math.abs(outside - inside), 0, 100);
  const photoRate = useMemo(() => {
    const lightFactor = 1 - Math.exp(-light / 43);
    const co2Factor = 0.35 + co2 / 155;
    const tempFactor = temp <= 30 ? 1 - Math.abs(temp - 25) * 0.018 : Math.max(0.45, 1 - (temp - 30) * 0.04);
    return Math.round(clamp(lightFactor * co2Factor * tempFactor * 100, 0, 100));
  }, [light, co2, temp]);
  const cardiacOutput = (heartRate * strokeVolume) / 1000;
  const minuteVentilation = (respRate * tidal) / 1000;
  const alveolarVentilation = (respRate * Math.max(0, tidal - deadSpace)) / 1000;
  const dataMax = Math.max(...data, 1);

  const go = (next: Tab) => {
    setTab(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateData = (i: number, v: number) => setData((d) => d.map((x, j) => j === i ? clamp(v, 0, 100) : x));
  const currentQuestion = questions[question];

  return (
    <main className="biology-page">
      <style jsx global>{`
        :root { --bio-ink:#10231c; --bio-muted:#66776f; --bio-line:#dce8e2; --bio-bg:#f5f8f6; --bio-panel:#ffffff; --bio-accent:#16835d; --bio-accent-dark:#0d5d42; --bio-soft:#e8f5ef; --bio-gold:#c58b31; }
        * { box-sizing:border-box; }
        .biology-page { min-height:100vh; background:var(--bio-bg); color:var(--bio-ink); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; }
        button,input { font:inherit; }
        button { cursor:pointer; }
        .bio-shell { width:min(1180px,calc(100% - 36px)); margin:0 auto; }
        .bio-hero { background:linear-gradient(135deg,#10271f 0%,#164d38 62%,#1e6d4d 100%); color:#fff; padding:70px 0 28px; overflow:hidden; position:relative; }
        .bio-hero:after { content:""; position:absolute; width:520px; height:520px; border:1px solid rgba(255,255,255,.12); border-radius:50%; right:-180px; top:-240px; box-shadow:0 0 0 70px rgba(255,255,255,.025),0 0 0 140px rgba(255,255,255,.018); }
        .kicker,.bio-eyebrow { text-transform:uppercase; letter-spacing:.14em; font-size:11px; font-weight:800; }
        .kicker { color:#bde6d4; }
        .hero-grid { display:grid; grid-template-columns:1.35fr .65fr; gap:40px; align-items:center; padding:28px 0 48px; }
        .hero-grid h1 { font-size:clamp(48px,7vw,82px); line-height:.9; letter-spacing:-.055em; margin:0; }
        .hero-grid h1 span { color:#9fe0c2; }
        .hero-copy { max-width:670px; color:#d9eee5; font-size:17px; line-height:1.75; margin:28px 0; }
        .hero-actions,.button-row,.chip-row { display:flex; flex-wrap:wrap; gap:10px; }
        .bio-button { border:1px solid transparent; border-radius:10px; padding:11px 16px; font-weight:750; transition:.2s; }
        .bio-button.primary { background:#d9f5e8; color:#104b36; }
        .bio-button.secondary { background:transparent; color:#fff; border-color:rgba(255,255,255,.25); }
        .bio-button:hover,.tool-card:hover { transform:translateY(-1px); }
        .hero-cell { width:260px; height:260px; margin:auto; border-radius:50% 44% 48% 42%; background:radial-gradient(circle at 42% 35%,#b8f2d6 0 8%,#5dc593 9% 25%,#277b59 26% 68%,#17553e 69%); border:10px solid rgba(255,255,255,.13); position:relative; box-shadow:0 0 0 22px rgba(255,255,255,.04); animation:float 5s ease-in-out infinite; }
        .hero-cell:before,.hero-cell:after { content:""; position:absolute; border-radius:50%; border:3px solid rgba(220,255,239,.65); }
        .hero-cell:before { width:70px;height:52px;left:80px;top:92px;transform:rotate(-20deg); }
        .hero-cell:after { width:26px;height:26px;left:42px;top:58px; box-shadow:110px 100px 0 -3px rgba(220,255,239,.5),90px -38px 0 -6px rgba(220,255,239,.45); }
        @keyframes float { 50%{transform:translateY(-8px) rotate(2deg)} }
        .stats { display:grid; grid-template-columns:repeat(4,1fr); border-top:1px solid rgba(255,255,255,.15); }
        .stat { padding:20px 16px 8px; border-right:1px solid rgba(255,255,255,.12); }
        .stat:last-child{border:0}.stat strong{display:block;font-size:24px}.stat span{font-size:12px;color:#b9d8cc}
        .bio-nav { position:sticky; top:0; z-index:20; background:rgba(255,255,255,.92); backdrop-filter:blur(14px); border-bottom:1px solid var(--bio-line); }
        .nav-inner { display:flex; gap:4px; overflow:auto; scrollbar-width:none; }.nav-inner::-webkit-scrollbar{display:none}
        .nav-inner button { white-space:nowrap; border:0; background:none; padding:14px 13px; color:var(--bio-muted); font-weight:700; font-size:13px; border-bottom:2px solid transparent; }.nav-inner button.active{color:var(--bio-accent-dark);border-bottom-color:var(--bio-accent)}
        .section { padding:68px 0; }.section.alt{background:#edf5f1}.section-heading{max-width:720px;margin-bottom:30px}.bio-eyebrow{color:var(--bio-accent-dark)}.section-heading h2{font-size:clamp(30px,4vw,46px);letter-spacing:-.035em;line-height:1.05;margin:9px 0 12px}.section-heading p{color:var(--bio-muted);line-height:1.7;margin:0}
        .tool-grid { display:grid;grid-template-columns:repeat(3,1fr);gap:14px }.tool-card{display:flex;align-items:flex-start;text-align:left;gap:14px;border:1px solid var(--bio-line);background:#fff;border-radius:16px;padding:18px;min-height:120px;transition:.2s;box-shadow:0 7px 25px rgba(20,55,42,.035)}.tool-icon{font-size:26px}.tool-copy{display:grid;gap:7px}.tool-copy strong{font-size:15px}.tool-copy small{color:var(--bio-muted);line-height:1.5}.tool-arrow{margin-left:auto;color:var(--bio-accent)}
        .panel { background:var(--bio-panel);border:1px solid var(--bio-line);border-radius:18px;padding:24px;box-shadow:0 10px 35px rgba(20,55,42,.045) }.panel + .panel{margin-top:16px}.panel-header{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;margin-bottom:20px}.panel-header h3{margin:4px 0 6px;font-size:21px}.panel-header p{margin:0;color:var(--bio-muted);line-height:1.55}.chip{display:inline-flex;align-items:center;border:1px solid var(--bio-line);background:#fff;border-radius:999px;padding:7px 10px;font-size:11px;font-weight:800;color:var(--bio-muted)}.chip.active{background:var(--bio-soft);border-color:#bde2d1;color:var(--bio-accent-dark)}
        .two-col{display:grid;grid-template-columns:1.1fr .9fr;gap:18px}.three-col{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.four-col{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .segmented{display:flex;flex-wrap:wrap;gap:6px;background:#edf3f0;padding:5px;border-radius:12px;width:max-content;max-width:100%}.segmented button{border:0;background:transparent;border-radius:8px;padding:8px 11px;font-size:12px;font-weight:750;color:var(--bio-muted)}.segmented button.active{background:#fff;color:var(--bio-ink);box-shadow:0 2px 7px rgba(20,55,42,.08)}
        .cell-stage{min-height:420px;border:1px solid var(--bio-line);border-radius:16px;background:radial-gradient(circle at 50% 45%,#f4fbf7,#e7f2ed);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}.cell-model{width:330px;height:245px;border-radius:48% 52% 46% 54%;background:#d7efe2;border:10px solid #7ab79d;position:relative;box-shadow:inset 0 0 0 14px #b5ddca}.cell-model.plant{border-radius:22px;background:#d8efd5;border-color:#57996a;box-shadow:inset 0 0 0 15px #b2dcae}.cell-model.prokaryote{width:340px;height:190px;border-radius:50%;background:#e9d9bc;border-color:#b98f55;box-shadow:inset 0 0 0 10px #dbc29d}.nucleus{position:absolute;width:88px;height:68px;left:122px;top:84px;border-radius:50%;background:#a9d2ef;border:5px solid #5f8fae}.plant .nucleus{left:55px;top:82px}.prokaryote .nucleus{display:none}.org-dot{position:absolute;width:22px;height:15px;border-radius:50%;background:#d18b66}.mito1{left:58px;top:54px}.mito2{right:48px;bottom:48px}.rib1,.rib2,.rib3{width:10px;height:10px;background:#8667a6;border-radius:50%}.rib1{left:190px;top:44px}.rib2{left:215px;bottom:55px}.rib3{left:95px;bottom:45px}.chlor1,.chlor2{display:none;width:46px;height:18px;border-radius:50%;background:#63a76b;border:3px solid #377847}.plant .chlor1,.plant .chlor2{display:block}.chlor1{right:52px;top:46px}.chlor2{right:45px;bottom:50px}.vacuole{display:none}.plant .vacuole{display:block;position:absolute;width:115px;height:95px;right:82px;top:75px;border-radius:30%;background:rgba(133,189,213,.38);border:3px solid rgba(79,133,157,.4)}.membrane-dot{position:absolute;width:8px;height:8px;background:#fff;border-radius:50%;box-shadow:0 0 0 2px #57996a}.prokaryote .membrane-dot{background:#9b7042}.cell-labels{position:absolute;inset:0;pointer-events:none}.cell-label{position:absolute;font-size:10px;font-weight:800;color:#38574a;background:rgba(255,255,255,.86);padding:5px 7px;border-radius:7px;border:1px solid #d6e5de}.label-n{left:16px;top:25px}.label-m{right:15px;top:24px}.label-r{left:22px;bottom:24px}.label-c{right:16px;bottom:24px}.label-v{right:28px;top:50%}
        .side-stack{display:grid;gap:12px}.mini{padding:15px;border:1px solid var(--bio-line);border-radius:13px;background:#fbfdfc}.mini span{font-size:10px;text-transform:uppercase;letter-spacing:.12em;font-weight:800;color:var(--bio-accent)}.mini strong{display:block;margin:6px 0}.mini p{margin:0;color:var(--bio-muted);line-height:1.55;font-size:13px}.list-buttons{display:grid;gap:7px}.list-buttons button{text-align:left;background:#fff;border:1px solid var(--bio-line);border-radius:10px;padding:11px}.list-buttons button.active{border-color:#9bd0b9;background:var(--bio-soft)}
        .slider-stack{display:grid;gap:16px}.slider-row{display:grid;grid-template-columns:145px 1fr 58px;align-items:center;gap:12px;font-size:13px}.slider-row span{font-weight:700}.slider-row input{width:100%;accent-color:var(--bio-accent)}.slider-row output{text-align:right;font-weight:800;color:var(--bio-accent-dark)}
        .lab-visual{min-height:240px;border:1px solid var(--bio-line);border-radius:15px;background:#f7faf8;padding:20px;display:grid;place-items:center}.membrane{width:100%;max-width:620px;height:155px;display:grid;grid-template-columns:1fr 74px 1fr;align-items:stretch;gap:8px}.fluid{border:1px solid #c9ddd4;border-radius:12px;background:linear-gradient(180deg,#eaf7f1,#f9fcfa);padding:15px}.fluid strong{font-size:12px}.dots{display:flex;flex-wrap:wrap;align-content:center;gap:8px}.dot{width:10px;height:10px;border-radius:50%;background:#4f9e7a}.membrane-wall{border-radius:12px;background:repeating-linear-gradient(90deg,#d8b05f 0 7px,#b58a3d 7px 11px);position:relative}.arrow-flow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;border-radius:999px;padding:5px 8px;font-weight:900;color:#76581f}
        .molecular-hero{background:linear-gradient(145deg,#f0f8f4,#fff);border:1px solid var(--bio-line);border-radius:18px;padding:24px}.sequence{display:flex;flex-wrap:wrap;gap:5px;margin:16px 0}.base{width:30px;height:30px;border-radius:8px;display:grid;place-items:center;font-weight:900;font-size:12px;background:#fff;border:1px solid #cbded5}.base.a{color:#2371a2}.base.t{color:#a65a37}.base.c{color:#8a5aa1}.base.g{color:#4c8a53}.sequence-label{font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:var(--bio-muted);font-weight:800}.flow{display:grid;grid-template-columns:1fr auto 1fr auto 1fr;gap:10px;align-items:center}.flow-node{padding:15px;border:1px solid var(--bio-line);border-radius:13px;background:#fff}.flow-node strong{display:block}.flow-node small{color:var(--bio-muted);display:block;margin-top:5px}.flow-arrow{font-size:22px;color:var(--bio-accent)}.codons{display:flex;flex-wrap:wrap;gap:7px}.codon{border-radius:8px;padding:8px 9px;background:#eef7f2;border:1px solid #cce4d8;font-size:12px;font-weight:800}.mutation-note{padding:12px 14px;border-left:3px solid var(--bio-gold);background:#fff8eb;color:#705326;border-radius:7px;font-size:13px;line-height:1.55}
        .punnett{display:grid;grid-template-columns:36px repeat(2,1fr);max-width:390px}.punnett div{min-height:56px;display:grid;place-items:center;border:1px solid var(--bio-line);font-weight:800;background:#fff}.punnett .head{background:#edf5f1;color:var(--bio-accent-dark)}.probability{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.prob{padding:15px;border-radius:12px;background:#f6faf8;border:1px solid var(--bio-line)}.prob span{font-size:11px;color:var(--bio-muted)}.prob strong{display:block;font-size:25px;margin-top:4px}
        .plant-chart{height:210px;display:flex;align-items:end;gap:10px;padding:18px;border:1px solid var(--bio-line);border-radius:14px;background:#fbfdfc}.bar{flex:1;background:linear-gradient(180deg,#62b78d,#23825d);border-radius:7px 7px 2px 2px;min-height:8px;position:relative}.bar span{position:absolute;top:-22px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:800}.bar-label{text-align:center;font-size:10px;color:var(--bio-muted);margin-top:7px}
        .physiology-path{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;padding:22px;background:#f7faf8;border:1px solid var(--bio-line);border-radius:15px}.path-node{padding:11px 13px;border-radius:10px;background:#fff;border:1px solid var(--bio-line);font-size:12px;font-weight:800}.path-arrow{color:var(--bio-accent);font-weight:900}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.metric{padding:15px;border:1px solid var(--bio-line);border-radius:12px;background:#fff}.metric span{display:block;color:var(--bio-muted);font-size:11px;font-weight:700}.metric strong{display:block;font-size:25px;margin-top:5px}.metric em{font-size:11px;font-style:normal;margin-left:3px;color:var(--bio-muted)}.metric small{display:block;margin-top:4px;color:var(--bio-muted)}
        .scope{display:grid;grid-template-columns:1fr 180px;gap:16px}.specimen-view{min-height:370px;border-radius:16px;background:radial-gradient(circle at 50% 50%,#e8f4ec 0 18%,#d7eadf 19% 40%,#bfd9cb 41% 62%,#a5c8b7 63%);border:1px solid #b7d4c6;position:relative;overflow:hidden;display:grid;place-items:center}.specimen-view:after{content:"";position:absolute;inset:20px;border:2px solid rgba(37,93,68,.22);border-radius:50%;box-shadow:0 0 0 45px rgba(255,255,255,.05),0 0 0 90px rgba(255,255,255,.04)}.specimen-card{position:relative;z-index:2;width:min(70%,420px);padding:22px;border-radius:15px;background:rgba(255,255,255,.86);backdrop-filter:blur(5px);border:1px solid rgba(255,255,255,.9);text-align:center}.specimen-card .symbol{font-size:54px}.specimen-card h3{margin:5px 0}.specimen-card p{color:var(--bio-muted);line-height:1.5;font-size:13px}.zoom{display:flex;align-items:center;gap:7px}.zoom button{border:1px solid var(--bio-line);background:#fff;border-radius:8px;width:32px;height:32px}.zoom span{font-size:12px;font-weight:800}
        .data-table{width:100%;border-collapse:collapse}.data-table th,.data-table td{padding:9px;border-bottom:1px solid var(--bio-line);text-align:left;font-size:12px}.data-table input{width:75px;border:1px solid var(--bio-line);border-radius:7px;padding:6px}.data-bars{display:flex;align-items:end;gap:9px;height:210px;padding:15px;border:1px solid var(--bio-line);border-radius:14px;background:#fbfdfc}.data-bar{flex:1;min-height:8px;border-radius:5px 5px 0 0;background:#4f9e7a;position:relative}.data-bar span{position:absolute;top:-19px;left:50%;transform:translateX(-50%);font-size:10px;font-weight:800}.data-label{text-align:center;font-size:10px;color:var(--bio-muted)}
        .question{font-size:20px;line-height:1.4;margin:5px 0 20px}.options{display:grid;gap:9px}.option{border:1px solid var(--bio-line);background:#fff;text-align:left;padding:13px 14px;border-radius:10px}.option.correct{border-color:#86c5a5;background:#eaf7ef}.option.wrong{border-color:#e4b0a5;background:#fff1ee}.answer-box{margin-top:15px;padding:14px;border-radius:10px;background:#f2f7f4;border:1px solid var(--bio-line);line-height:1.55;font-size:13px}
        .syllabus{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}.syllabus-card{padding:16px;border:1px solid var(--bio-line);border-radius:13px;background:#fff}.syllabus-card b{font-size:11px;color:var(--bio-accent)}.syllabus-card h4{margin:7px 0;font-size:14px}.syllabus-card p{font-size:11px;color:var(--bio-muted);line-height:1.5;margin:0}
        .systems-toolbar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:18px}.systems-segmented{display:flex;flex-wrap:wrap;gap:6px;background:var(--bio-soft);padding:6px;border-radius:12px}.systems-segmented button{border:0;background:transparent;color:var(--bio-muted);padding:9px 11px;border-radius:8px;font-size:12px;font-weight:750}.systems-segmented button.active{background:#fff;color:var(--bio-accent-dark);box-shadow:0 2px 8px rgba(16,35,28,.08)}
        .system-chain{display:grid;grid-template-columns:1fr auto 1fr auto 1fr auto 1fr;align-items:stretch;gap:10px}.system-chain>div{background:var(--bio-soft);border:1px solid var(--bio-line);border-radius:12px;padding:14px}.system-chain span,.eco-head span{display:block;color:var(--bio-muted);font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:800}.system-chain strong{display:block;margin:5px 0}.system-chain p{margin:0;color:var(--bio-muted);font-size:12px;line-height:1.5}.system-chain>b{align-self:center;color:var(--bio-accent);font-size:20px}.vertical-flow{display:flex;flex-direction:column;align-items:center;gap:8px}.vertical-flow>div:not(.flow-arrow){width:min(100%,320px);text-align:center}.vertical-flow .flow-arrow{transform:none}.bar-track{height:12px;background:var(--bio-soft);border-radius:999px;overflow:hidden}.bar-fill{height:100%;background:var(--bio-accent);border-radius:999px}.ecosystem-bars{display:grid;gap:18px}.eco-head{display:flex;justify-content:space-between;gap:10px;margin-bottom:7px}.eco-track{height:14px;background:var(--bio-soft);border-radius:999px;overflow:hidden}.eco-fill{height:100%;background:var(--bio-accent);border-radius:999px;transition:width .2s ease}.eco-item small{display:block;margin-top:5px;color:var(--bio-muted);font-size:11px}.systems-toolbar .chip{white-space:nowrap}
        .footer{padding:30px 0;border-top:1px solid var(--bio-line);color:var(--bio-muted);font-size:12px}.footer strong{color:var(--bio-ink)}
        @media(max-width:900px){.system-chain{grid-template-columns:1fr}.system-chain>b{transform:rotate(90deg);justify-self:center}.systems-toolbar{align-items:flex-start;flex-direction:column}.hero-grid,.two-col,.scope{grid-template-columns:1fr}.tool-grid{grid-template-columns:1fr 1fr}.three-col{grid-template-columns:1fr 1fr}.four-col,.metric-grid{grid-template-columns:1fr 1fr}.syllabus{grid-template-columns:1fr 1fr}.hero-cell{width:210px;height:210px}.flow{grid-template-columns:1fr;}.flow-arrow{transform:rotate(90deg);justify-self:center}.stats{grid-template-columns:1fr 1fr}}
        @media(max-width:620px){.bio-shell{width:min(100% - 24px,1180px)}.hero-grid h1{font-size:50px}.tool-grid,.three-col,.four-col,.metric-grid,.syllabus,.probability{grid-template-columns:1fr}.section{padding:48px 0}.panel{padding:17px}.cell-stage{min-height:340px}.cell-model{transform:scale(.82)}.slider-row{grid-template-columns:100px 1fr 50px}.stats{grid-template-columns:1fr 1fr}.stat{padding:15px 9px}.membrane{grid-template-columns:1fr 45px 1fr}.scope{grid-template-columns:1fr}.specimen-view{min-height:300px}.hero-actions .bio-button{flex:1}}
      `}</style>

      <header className="bio-hero">
        <div className="bio-shell">
          <span className="kicker">VGB Learning Tools · Biology 044 · Class XI 2026–27</span>
          <div className="hero-grid">
            <div>
              <h1>Biology.<br /><span>The living lab.</span></h1>
              <p className="hero-copy">Stop treating biology as a museum of vocabulary. Build sequences, cross organisms, change variables, interpret data and trace cause through living systems.</p>
              <div className="hero-actions"><button className="bio-button primary" onClick={() => go("molecular")}>Open molecular lab</button><button className="bio-button secondary" onClick={() => go("physiology")}>Explore physiology</button></div>
            </div>
            <div className="hero-cell" aria-hidden="true" />
          </div>
          <div className="stats"><div className="stat"><strong>9</strong><span>interactive labs</span></div><div className="stat"><strong>5</strong><span>CBSE theory units</span></div><div className="stat"><strong>DNA → data</strong><span>concept chain</span></div><div className="stat"><strong>XI</strong><span>2026–27 focus</span></div></div>
        </div>
      </header>

      <nav className="bio-nav"><div className="bio-shell nav-inner">{([ ["overview","Overview"],["molecular","Molecular"],["cell","Cell Lab"],["genetics","Genetics"],["plant","Plant Lab"],["physiology","Physiology"],["systems","Systems Lab"],["microscope","Microscope"],["data","Data Lab"],["practice","Practice"] ] as [Tab,string][]).map(([id,label]) => <button key={id} className={tab===id?"active":""} onClick={() => go(id)}>{label}</button>)}</div></nav>

      {tab === "overview" && <>
        <section className="section"><div className="bio-shell"><SectionHeading eyebrow="Designed around reasoning" title="Biology is a system, not a list." text="Each tool follows the same loop: model a system, change a variable, observe a consequence, then explain the mechanism. That is much closer to actual biology than highlighting another paragraph." />
          <div className="tool-grid">
            <ToolCard icon="🧬" title="DNA → RNA → Protein" text="Transcribe, translate and introduce mutations." onClick={() => go("molecular")} />
            <ToolCard icon="🧬" title="Genetics Lab" text="Build Punnett crosses and inspect probabilities." onClick={() => go("genetics")} />
            <ToolCard icon="🔬" title="Cell & Membrane Lab" text="Compare cells and model transport." onClick={() => go("cell")} />
            <ToolCard icon="🌿" title="Plant Physiology" text="Test light, CO₂ and temperature effects." onClick={() => go("plant")} />
            <ToolCard icon="🫀" title="Human Physiology" text="Trace circulation, ventilation and calculated outputs." onClick={() => go("physiology")} />
            <ToolCard icon="🔎" title="Virtual Microscope" text="Identify specimens from structural clues." onClick={() => go("microscope")} />
            <ToolCard icon="📊" title="Evidence Lab" text="Edit observations and interpret graphs." onClick={() => go("data")} />
            <ToolCard icon="🎯" title="CBSE Practice" text="Move from recall to application and analysis." onClick={() => go("practice")} />
            <ToolCard icon="⚙️" title="Biology Systems Lab" text="Run deeper models for transport, plant flow, respiration, nephrons and ecosystems." onClick={() => go("systems")} />
          </div>
        </div></section>
        <section className="section alt"><div className="bio-shell"><SectionHeading eyebrow="The curriculum map" title="Five units. One connected story." text="Use the tools alongside the NCERT/CBSE sequence rather than treating each chapter as an isolated island." /><div className="syllabus">{syllabus.map(([unit,title,chapters]) => <div className="syllabus-card" key={unit}><b>UNIT {unit}</b><h4>{title}</h4><p>{chapters}</p></div>)}</div></div></section>
      </>}

      {tab === "molecular" && <section className="section"><div className="bio-shell"><SectionHeading eyebrow="Signature lab · Molecular biology" title="DNA → RNA → protein" text="Use a template strand, follow base-pairing rules and watch how sequence changes propagate into codons and amino acids." />
        <div className="panel molecular-hero"><div className="panel-header"><div><h3>Sequence editor</h3><p>Enter a DNA template strand using A, T, C and G.</p></div><span className="chip active">Central dogma</span></div>
          <input value={template} onChange={(e) => setTemplate(e.target.value.toUpperCase().replace(/[^ATCG]/g, "").slice(0,30))} style={{width:"100%",padding:"13px",border:"1px solid var(--bio-line)",borderRadius:10,letterSpacing:".18em",fontWeight:800}} />
          <div className="chip-row" style={{marginTop:15}}>{(["none","substitution","insertion","deletion"] as Mutation[]).map((m) => <button className={`chip ${mutation===m?"active":""}`} key={m} onClick={() => setMutation(m)}>{m}</button>)}</div>
          {mutation !== "none" && <div style={{marginTop:14}}><Slider label="Mutation position" value={mutationIndex} min={0} max={Math.max(0,template.length-1)} onChange={setMutationIndex} /></div>}
          <div className="sequence-label" style={{marginTop:20}}>Template DNA</div><div className="sequence">{effectiveDNA.split("").map((b,i) => <span className={`base ${b.toLowerCase()}`} key={`${i}-${b}`}>{b}</span>)}</div>
          <div className="sequence-label">mRNA</div><div className="sequence">{mrna.split("").map((b,i) => <span className={`base ${b.toLowerCase()}`} key={`${i}-${b}`}>{b}</span>)}</div>
          <div className="flow"><div className="flow-node"><strong>DNA</strong><small>Template strand</small></div><span className="flow-arrow">→</span><div className="flow-node"><strong>mRNA</strong><small>Transcription</small></div><span className="flow-arrow">→</span><div className="flow-node"><strong>Polypeptide</strong><small>Translation</small></div></div>
          <div style={{marginTop:20}}><div className="sequence-label">Codons → amino acids</div><div className="codons" style={{marginTop:8}}>{Array.from({length:Math.ceil(mrna.length/3)},(_,i)=>mrna.slice(i*3,i*3+3)).filter(Boolean).map((c,i)=><span className="codon" key={i}>{c} → {codonTable[c] ?? "?"}</span>)}</div></div>
          <div className="mutation-note" style={{marginTop:16}}><strong>Interpretation:</strong> {mutationEffect} {mutation !== "none" && <span>Baseline peptide: {baselineAmino.join(" – ")} · Current peptide: {amino.join(" – ")}</span>}</div>
        </div>
        <div className="two-col" style={{marginTop:18}}><div className="panel"><div className="panel-header"><div><h3>Complementary strand</h3><p>Base-pairing is a rule you can derive, not a fact to chant.</p></div></div><div className="sequence">{codingStrand.split("").map((b,i)=><span className={`base ${b.toLowerCase()}`} key={i}>{b}</span>)}</div><div className="mini"><span>Pairing</span><strong>A ↔ T · C ↔ G</strong><p>During transcription, RNA uses U in place of T.</p></div></div><div className="panel"><div className="panel-header"><div><h3>Mutation reasoning</h3><p>Look at the sequence consequence before naming the mutation.</p></div></div><div className="three-col"><div className="mini"><span>Substitution</span><strong>One base replaced</strong><p>Can leave the amino acid unchanged or alter it.</p></div><div className="mini"><span>Insertion</span><strong>Base added</strong><p>Often causes a frameshift if not in groups of three.</p></div><div className="mini"><span>Deletion</span><strong>Base removed</strong><p>Can shift the reading frame downstream.</p></div></div></div></div>
      </div></section>}

      {tab === "cell" && <section className="section"><div className="bio-shell"><SectionHeading eyebrow="Cell biology" title="Cell explorer + membrane lab" text="Compare structural organisation, then test what happens when concentration gradients change. The useful question is always: what causes the movement?" />
        <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Interactive cell model</h3><p>Select a cell type and inspect a structure.</p></div><div className="segmented">{([ ["animal","Animal"],["plant","Plant"],["prokaryote","Prokaryote"] ] as [CellType,string][]).map(([id,label])=><button className={cellType===id?"active":""} key={id} onClick={()=>setCellType(id)}>{label}</button>)}</div></div><div className="cell-stage"><div className={`cell-model ${cellType}`}>{cellType!=="prokaryote" && <div className="nucleus"/>}<div className="org-dot mito1"/><div className="org-dot mito2"/><div className="org-dot rib1"/><div className="org-dot rib2"/><div className="org-dot rib3"/><div className="chlor1"/><div className="chlor2"/><div className="vacuole"/><div className="cell-labels"><span className="cell-label label-n">nucleus / nucleoid</span><span className="cell-label label-m">membrane</span><span className="cell-label label-r">ribosomes</span><span className="cell-label label-c">mitochondria</span><span className="cell-label label-v">vacuole</span></div></div></div></div>
          <div className="panel"><div className="panel-header"><div><h3>Structure inspector</h3><p>Choose a structure to connect form to function.</p></div></div><div className="list-buttons">{organelles.filter(o=>cellType==="plant"||o.id!=="chloroplast").map(o=><button key={o.id} className={organelle===o.id?"active":""} onClick={()=>setOrganelle(o.id)}><strong>{o.name}</strong><br/><small>{o.tag}</small></button>)}</div><div className="mini" style={{marginTop:12}}><span>{activeOrganelle.type}</span><strong>{activeOrganelle.name}</strong><p>{activeOrganelle.text}</p></div></div></div>
        <div className="panel" style={{marginTop:18}}><div className="panel-header"><div><h3>Membrane transport simulator</h3><p>Concentration here is a simplified model. Real transport depends on membrane permeability, gradients and transport proteins.</p></div><div className="segmented">{(["osmosis","diffusion","active"] as const).map(m=><button key={m} className={transport===m?"active":""} onClick={()=>setTransport(m)}>{m}</button>)}</div></div><div className="two-col"><div><div className="slider-stack"><Slider label="Outside concentration" value={outside} min={0} max={100} onChange={setOutside}/><Slider label="Inside concentration" value={inside} min={0} max={100} onChange={setInside}/></div><div className="mini" style={{marginTop:18}}><span>Prediction</span><strong>{transport === "active" ? "Transport can move against a gradient" : waterDirection}</strong><p>{transport === "osmosis" ? "For osmosis, track water rather than solute. A difference in solute concentration can create a water-potential gradient." : transport === "diffusion" ? "Diffusion moves particles down their concentration gradient when the membrane permits passage." : "Active transport uses cellular energy to move substances against their gradient through transport proteins."}</p></div></div><div className="lab-visual"><div className="membrane"><div className="fluid"><strong>Outside</strong><div className="dots">{Array.from({length:Math.round(outside/5)},(_,i)=><span className="dot" key={i}/>)}</div></div><div className="membrane-wall"><span className="arrow-flow">{transport==="active"?"ATP →":"→"}</span></div><div className="fluid"><strong>Inside</strong><div className="dots">{Array.from({length:Math.round(inside/5)},(_,i)=><span className="dot" key={i}/>)}</div></div></div><div style={{fontSize:12,color:"var(--bio-muted)",marginTop:10}}>Gradient magnitude: <strong>{waterGradient}%</strong></div></div></div></div>
      </div></section>}

      {tab === "genetics" && <section className="section"><div className="bio-shell"><SectionHeading eyebrow="Genetics lab" title="Cross the alleles. Read the probability." text="Build a simple Mendelian cross and inspect genotype and phenotype probabilities. This is a probability model, not a promise about a particular family." />
        <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Parents</h3><p>Use A/a for one gene with complete dominance.</p></div></div><div className="four-col"><label className="mini"><span>Parent 1</span><select value={parentA} onChange={e=>setParentA(e.target.value)} style={{marginTop:8,width:"100%",padding:8,borderRadius:8,border:"1px solid var(--bio-line)"}}><option>AA</option><option>Aa</option><option>aa</option></select></label><label className="mini"><span>Parent 2</span><select value={parentB} onChange={e=>setParentB(e.target.value)} style={{marginTop:8,width:"100%",padding:8,borderRadius:8,border:"1px solid var(--bio-line)"}}><option>AA</option><option>Aa</option><option>aa</option></select></label></div><div style={{marginTop:20}}><div className="sequence-label">Punnett square</div><div className="punnett" style={{marginTop:9}}><div></div><div className="head">{gametesB[0]}</div><div className="head">{gametesB[1]}</div><div className="head">{gametesA[0]}</div><div>{punnett[0]}</div><div>{punnett[1]}</div><div className="head">{gametesA[1]}</div><div>{punnett[2]}</div><div>{punnett[3]}</div></div></div></div><div className="panel"><div className="panel-header"><div><h3>Probability readout</h3><p>Assuming the gametes represented by the simple square are equally likely.</p></div></div><div className="probability"><div className="prob"><span>Dominant phenotype</span><strong>{Math.round(dominant*100)}%</strong></div><div className="prob"><span>Recessive phenotype</span><strong>{Math.round(recessive*100)}%</strong></div><div className="prob"><span>Heterozygous</span><strong>{Math.round(heterozygous*100)}%</strong></div></div><div className="mini" style={{marginTop:14}}><span>Reasoning rule</span><strong>Probability describes expected proportions over many trials.</strong><p>It does not mean every small family will reproduce the exact ratio. Sampling variation is not a violation of Mendelian genetics.</p></div></div></div>
      </div></section>}

      {tab === "plant" && <section className="section"><div className="bio-shell"><SectionHeading eyebrow="Plant physiology" title="Find the limiting factor." text="Change light, CO₂ and temperature. The model deliberately gives you a plateau rather than a magical straight line, because biological systems are inconveniently biological." />
        <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Photosynthesis sandbox</h3><p>Relative rate, scaled 0–100.</p></div><span className="chip active">Experimental model</span></div><div className="slider-stack"><Slider label="Light intensity" value={light} min={0} max={100} onChange={setLight}/><Slider label="CO₂ concentration" value={co2} min={0} max={100} onChange={setCo2}/><Slider label="Temperature" value={temp} min={5} max={45} unit="°C" onChange={setTemp}/></div><div className="metric-grid" style={{marginTop:20}}><Metric label="Relative rate" value={String(photoRate)} unit="%"/><Metric label="Light" value={String(light)} unit="%"/><Metric label="CO₂" value={String(co2)} unit="%"/><Metric label="Temperature" value={String(temp)} unit="°C"/></div></div><div className="panel"><div className="panel-header"><div><h3>What does the graph say?</h3><p>Compare the current rate with what you would expect if another factor became limiting.</p></div></div><div className="plant-chart">{[20,35,52,68,80,88,92,95].map((x,i)=><div key={i} style={{flex:1,height:`${clamp((x*(0.55+photoRate/200)),8,100)}%`}}><div className="bar" style={{height:"100%"}}><span>{Math.round(x*(0.55+photoRate/200))}</span></div><div className="bar-label">{i+1}</div></div>)}</div><div className="mini" style={{marginTop:14}}><span>Current inference</span><strong>{photoRate < 35 ? "A resource is strongly constraining the rate." : photoRate > 82 ? "The system is approaching a high-rate plateau." : "Rate is responding, but one or more factors still constrain it."}</strong><p>Do not confuse correlation with causation. In a real experiment, control the variables you are not testing.</p></div></div></div>
      </div></section>}

      {tab === "physiology" && <section className="section"><div className="bio-shell"><SectionHeading eyebrow="Human physiology" title="Trace the numbers through the system." text="Use simple physiological equations to connect structure, flow and function. The point is not to worship formulas. It is to understand what each term means." />
        <div className="panel"><div className="panel-header"><div><h3>Circulation pathway</h3><p>Track blood through the pulmonary and systemic circuits.</p></div></div><div className="physiology-path"><span className="path-node">Body tissues</span><span className="path-arrow">→</span><span className="path-node">Venae cavae</span><span className="path-arrow">→</span><span className="path-node">Right heart</span><span className="path-arrow">→</span><span className="path-node">Pulmonary arteries</span><span className="path-arrow">→</span><span className="path-node">Lungs</span><span className="path-arrow">→</span><span className="path-node">Pulmonary veins</span><span className="path-arrow">→</span><span className="path-node">Left heart</span><span className="path-arrow">→</span><span className="path-node">Aorta</span></div></div>
        <div className="two-col" style={{marginTop:18}}><div className="panel"><div className="panel-header"><div><h3>Cardiac output</h3><p>CO = heart rate × stroke volume.</p></div></div><div className="slider-stack"><Slider label="Heart rate" value={heartRate} min={40} max={180} unit=" bpm" onChange={setHeartRate}/><Slider label="Stroke volume" value={strokeVolume} min={30} max={130} unit=" mL" onChange={setStrokeVolume}/></div><div className="metric-grid" style={{marginTop:20}}><Metric label="Cardiac output" value={cardiacOutput.toFixed(2)} unit="L/min"/><Metric label="Heart rate" value={String(heartRate)} unit="bpm"/></div></div><div className="panel"><div className="panel-header"><div><h3>Ventilation</h3><p>Minute ventilation = RR × tidal volume. Alveolar ventilation subtracts dead space.</p></div></div><div className="slider-stack"><Slider label="Respiratory rate" value={respRate} min={6} max={40} unit=" /min" onChange={setRespRate}/><Slider label="Tidal volume" value={tidal} min={250} max={900} step={10} unit="mL" onChange={setTidal}/><Slider label="Dead space" value={deadSpace} min={50} max={300} step={10} unit="mL" onChange={setDeadSpace}/></div><div className="metric-grid" style={{marginTop:20}}><Metric label="Minute ventilation" value={minuteVentilation.toFixed(2)} unit="L/min"/><Metric label="Alveolar ventilation" value={alveolarVentilation.toFixed(2)} unit="L/min"/></div></div></div>
      </div></section>}

      {tab === "systems" && <SystemsLab />}

      {tab === "microscope" && <section className="section"><div className="bio-shell"><SectionHeading eyebrow="Practical skills" title="Virtual microscope: observe before naming." text="Choose a specimen, adjust magnification and use the structural clue. Biology practicals reward observation and inference, not just recognition." />
        <div className="scope"><div className="panel"><div className="specimen-view"><div className="specimen-card" style={{transform:`scale(${zoom/100})`}}><div className="symbol">{specimen===0?"▦":specimen===1?"◉":specimen===2?"⊙":"✺"}</div><h3>{specimens[specimen].name}</h3><p>{specimens[specimen].clue}</p><span className="chip active">{specimens[specimen].type}</span></div></div><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12}}><div className="zoom"><button onClick={()=>setZoom(clamp(zoom-10,80,130))}>−</button><span>{zoom}%</span><button onClick={()=>setZoom(clamp(zoom+10,80,130))}>+</button></div><span className="chip">{specimens[specimen].magnification}</span></div></div><div className="panel"><div className="panel-header"><div><h3>Specimen tray</h3><p>Pick one to inspect.</p></div></div><div className="list-buttons">{specimens.map((s,i)=><button key={s.id} className={specimen===i?"active":""} onClick={()=>setSpecimen(i)}><strong>{s.name}</strong><br/><small>{s.type}</small></button>)}</div><div className="mini" style={{marginTop:12}}><span>Observation → inference</span><strong>{specimens[specimen].answer}</strong><p>{specimens[specimen].clue}</p></div></div></div>
      </div></section>}

      {tab === "data" && <section className="section"><div className="bio-shell"><SectionHeading eyebrow="Evidence lab" title="Make the graph earn its existence." text="Edit observations, compare the distribution and practise separating what the data show from what you think the data mean." />
        <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Observation table</h3><p>Five experimental observations, editable.</p></div></div><table className="data-table"><thead><tr><th>Trial</th><th>Observation</th></tr></thead><tbody>{data.map((v,i)=><tr key={i}><td>Trial {i+1}</td><td><input type="number" value={v} onChange={e=>updateData(i,Number(e.target.value))}/></td></tr>)}</tbody></table><div className="metric-grid" style={{marginTop:15}}><Metric label="Mean" value={(data.reduce((a,b)=>a+b,0)/data.length).toFixed(1)}/><Metric label="Minimum" value={String(Math.min(...data))}/><Metric label="Maximum" value={String(Math.max(...data))}/><Metric label="Range" value={String(Math.max(...data)-Math.min(...data))}/></div></div><div className="panel"><div className="panel-header"><div><h3>Visual distribution</h3><p>Scale is relative to the largest observation.</p></div></div><div className="data-bars">{data.map((v,i)=><div key={i} style={{flex:1,height:`${clamp(v/dataMax*100,5,100)}%`}}><div className="data-bar" style={{height:"100%"}}><span>{v}</span></div><div className="data-label">T{i+1}</div></div>)}</div><div className="mini" style={{marginTop:14}}><span>Scientific reading</span><strong>{data[data.length-1] > data[0] ? "The measured value rises across these trials." : data[data.length-1] < data[0] ? "The measured value falls across these trials." : "The endpoints are equal."}</strong><p>That statement is descriptive. A causal explanation requires information about the experimental design and controlled variables.</p></div></div></div>
      </div></section>}

      {tab === "practice" && <section className="section"><div className="bio-shell"><SectionHeading eyebrow="CBSE practice engine" title="Recall is the beginning, not the finish." text="Answer, inspect the reasoning, then move on. The questions mix cell biology, genetics, physiology and experimental reasoning." />
        <div className="two-col"><div className="panel"><div className="panel-header"><div><h3>Question {question+1} / {questions.length}</h3><span className="chip active">Application</span></div><button className="chip" onClick={()=>{setQuestion((question+1)%questions.length);setAnswer(null)}}>Next →</button></div><div className="question">{currentQuestion.prompt}</div><div className="options">{currentQuestion.options.map((o,i)=><button key={o} className={`option ${answer!==null && i===currentQuestion.answer?"correct":""} ${answer===i && i!==currentQuestion.answer?"wrong":""}`} onClick={()=>setAnswer(i)}>{String.fromCharCode(65+i)}. {o}</button>)}</div>{answer!==null&&<div className="answer-box"><strong>{answer===currentQuestion.answer?"Correct.":"Not quite."}</strong> {currentQuestion.explanation}</div>}</div><div className="panel"><div className="panel-header"><div><h3>Three-layer rule</h3><p>Use the same method on textbook questions.</p></div></div><div className="three-col"><div className="mini"><span>1 · Recall</span><strong>Name it.</strong><p>Definitions, structures, terminology and equations.</p></div><div className="mini"><span>2 · Apply</span><strong>Use it.</strong><p>Transfer the concept to a new situation or dataset.</p></div><div className="mini"><span>3 · Analyse</span><strong>Defend it.</strong><p>Explain why the evidence supports your conclusion.</p></div></div><div className="mutation-note" style={{marginTop:15}}>Exam habit: before choosing an answer, identify the biological mechanism the question is testing. Humans love distractors. Biology has no obligation to protect you from them.</div></div></div>
      </div></section>}

      <footer className="footer"><div className="bio-shell"><strong>Biology Tools</strong> · VGB Student Council Portal · Class XI · 2026–27</div></footer>
    </main>
  );
}
