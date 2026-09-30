"use client";

import { useMemo, useState } from "react";

type LabTab =
  | "overview"
  | "cell"
  | "lab"
  | "physiology"
  | "taxonomy"
  | "data"
  | "practice";

type CellType = "animal" | "plant" | "prokaryote";

type Taxon = {
  name: string;
  group: string;
  rank: string;
  traits: string[];
};

const syllabus = [
  {
    unit: "I",
    title: "Diversity of Living Organisms",
    marks: 15,
    chapters: [
      "The Living World",
      "Biological Classification",
      "Plant Kingdom",
      "Animal Kingdom",
    ],
  },
  {
    unit: "II",
    title: "Structural Organisation",
    marks: 10,
    chapters: [
      "Morphology of Flowering Plants",
      "Anatomy of Flowering Plants",
      "Structural Organisation in Animals",
    ],
  },
  {
    unit: "III",
    title: "Cell",
    marks: 15,
    chapters: [
      "Cell: The Unit of Life",
      "Biomolecules",
      "Cell Cycle and Cell Division",
    ],
  },
  {
    unit: "IV",
    title: "Plant Physiology",
    marks: 12,
    chapters: [
      "Photosynthesis in Higher Plants",
      "Respiration in Plants",
      "Plant Growth and Development",
    ],
  },
  {
    unit: "V",
    title: "Human Physiology",
    marks: 18,
    chapters: [
      "Breathing and Exchange of Gases",
      "Body Fluids and Circulation",
      "Excretory Products and their Elimination",
      "Locomotion and Movement",
      "Neural Control and Coordination",
      "Chemical Coordination and Integration",
    ],
  },
];

const organelles = [
  {
    id: "nucleus",
    name: "Nucleus",
    role: "Stores genetic material and coordinates cellular activity.",
    location: "Central / prominent in most eukaryotic cells",
    accent: "purple",
  },
  {
    id: "mitochondria",
    name: "Mitochondrion",
    role: "Site of aerobic respiration and major ATP production.",
    location: "Cytoplasm",
    accent: "orange",
  },
  {
    id: "chloroplast",
    name: "Chloroplast",
    role: "Captures light energy for photosynthesis in plants and algae.",
    location: "Plant-cell cytoplasm",
    accent: "green",
  },
  {
    id: "ribosome",
    name: "Ribosome",
    role: "Carries out protein synthesis.",
    location: "Free in cytoplasm or associated with rough ER",
    accent: "blue",
  },
  {
    id: "golgi",
    name: "Golgi apparatus",
    role: "Modifies, sorts and packages proteins and lipids.",
    location: "Near the ER and nucleus",
    accent: "pink",
  },
  {
    id: "vacuole",
    name: "Vacuole",
    role: "Stores substances and helps maintain turgor in plant cells.",
    location: "Large central compartment in mature plant cells",
    accent: "cyan",
  },
];

const taxa: Taxon[] = [
  {
    name: "Bryophyta",
    group: "Plant kingdom",
    rank: "Division",
    traits: ["Non-vascular", "Spore-producing", "Water important for fertilisation"],
  },
  {
    name: "Pteridophyta",
    group: "Plant kingdom",
    rank: "Division",
    traits: ["Vascular", "Seedless", "Spore-producing"],
  },
  {
    name: "Gymnosperms",
    group: "Plant kingdom",
    rank: "Group",
    traits: ["Vascular", "Seeds not enclosed by fruit", "Usually cone-bearing"],
  },
  {
    name: "Angiosperms",
    group: "Plant kingdom",
    rank: "Group",
    traits: ["Flowers", "Seeds enclosed in fruits", "Double fertilisation"],
  },
  {
    name: "Annelida",
    group: "Animal kingdom",
    rank: "Phylum",
    traits: ["Bilateral symmetry", "True coelom", "Segmented body"],
  },
  {
    name: "Arthropoda",
    group: "Animal kingdom",
    rank: "Phylum",
    traits: ["Jointed appendages", "Exoskeleton", "Segmented body"],
  },
  {
    name: "Chordata",
    group: "Animal kingdom",
    rank: "Phylum",
    traits: ["Notochord at some stage", "Dorsal hollow nerve cord", "Pharyngeal slits at some stage"],
  },
];

const questions = [
  {
    prompt:
      "A plant cell is placed in a hypertonic solution. Which observation is most directly expected?",
    options: [
      "Water enters the cell and turgor increases.",
      "The protoplast loses water and pulls away from the cell wall.",
      "The cell wall dissolves.",
      "The nucleus immediately divides.",
    ],
    answer: 1,
    explanation:
      "In a hypertonic external solution, water leaves the cell by osmosis. In a plant cell, this can cause plasmolysis.",
  },
  {
    prompt:
      "Which variable is the most appropriate dependent variable in a simple photosynthesis experiment where light intensity is changed?",
    options: [
      "Distance from the lamp",
      "Light intensity",
      "Rate of oxygen production",
      "Species chosen before the experiment",
    ],
    answer: 2,
    explanation:
      "The dependent variable is the response being measured. Oxygen production can be used as a proxy for photosynthetic rate.",
  },
  {
    prompt:
      "Why is alveolar ventilation lower than minute ventilation when dead space is present?",
    options: [
      "Some inhaled air does not participate directly in gas exchange.",
      "The heart removes oxygen from the lungs.",
      "Alveoli contain no blood vessels.",
      "Respiration stops during expiration.",
    ],
    answer: 0,
    explanation:
      "Alveolar ventilation accounts for the tidal volume that reaches gas-exchanging regions after subtracting dead-space volume.",
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function SectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="bio-section-heading">
      <span className="bio-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function ToolCard({
  icon,
  title,
  text,
  onClick,
}: {
  icon: string;
  title: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <button className="bio-tool-card" onClick={onClick}>
      <span className="bio-tool-icon">{icon}</span>
      <span>
        <strong>{title}</strong>
        <small>{text}</small>
      </span>
      <span className="bio-arrow">↗</span>
    </button>
  );
}

export default function BiologyToolsPage() {
  const [activeTab, setActiveTab] = useState<LabTab>("overview");
  const [cellType, setCellType] = useState<CellType>("animal");
  const [selectedOrganelle, setSelectedOrganelle] = useState("nucleus");
  const [membraneMode, setMembraneMode] = useState<
    "diffusion" | "osmosis" | "active"
  >("osmosis");
  const [outsideConcentration, setOutsideConcentration] = useState(70);
  const [insideConcentration, setInsideConcentration] = useState(40);
  const [light, setLight] = useState(55);
  const [co2, setCo2] = useState(50);
  const [temperature, setTemperature] = useState(25);
  const [heartRate, setHeartRate] = useState(72);
  const [strokeVolume, setStrokeVolume] = useState(70);
  const [respRate, setRespRate] = useState(14);
  const [tidalVolume, setTidalVolume] = useState(500);
  const [deadSpace, setDeadSpace] = useState(150);
  const [selectedTaxon, setSelectedTaxon] = useState("Angiosperms");
  const [dataValues, setDataValues] = useState([12, 18, 27, 34, 42]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const activeOrganelle =
    organelles.find((item) => item.id === selectedOrganelle) ?? organelles[0];

  const waterDirection =
    outsideConcentration > insideConcentration
      ? "Water tends to leave the cell"
      : outsideConcentration < insideConcentration
        ? "Water tends to enter the cell"
        : "No net osmotic movement";

  const waterMagnitude = Math.round(
    Math.min(100, Math.abs(outsideConcentration - insideConcentration) * 1.35),
  );

  const photosynthesisRate = useMemo(() => {
    const lightFactor = 1 - Math.exp(-light / 42);
    const co2Factor = 0.35 + co2 / 150;
    const tempPenalty =
      temperature <= 30
        ? 1 - Math.abs(25 - temperature) * 0.018
        : Math.max(0.5, 1 - (temperature - 30) * 0.035);
    return Math.round(clamp(100 * lightFactor * co2Factor * tempPenalty, 0, 100));
  }, [light, co2, temperature]);

  const cardiacOutput = (heartRate * strokeVolume) / 1000;
  const minuteVentilation = (respRate * tidalVolume) / 1000;
  const alveolarVentilation =
    (respRate * Math.max(0, tidalVolume - deadSpace)) / 1000;

  const nextQuestion = () => {
    setQuestionIndex((current) => (current + 1) % questions.length);
    setSelectedAnswer(null);
    setShowAnswer(false);
  };

  const setTab = (tab: LabTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateDataPoint = (index: number, value: number) => {
    setDataValues((current) =>
      current.map((item, i) => (i === index ? clamp(value, 0, 100) : item)),
    );
  };

  const dataMax = Math.max(...dataValues, 1);

  return (
    <main className="biology-page">
      <style jsx global>{`
        :root {
          --bio-ink: #10231d;
          --bio-muted: #66756e;
          --bio-line: #dfe9e3;
          --bio-paper: #f7faf8;
          --bio-card: #ffffff;
          --bio-green: #176b4d;
          --bio-green-2: #2e8b68;
          --bio-mint: #dff3e9;
          --bio-cyan: #1b9aaa;
          --bio-lime: #8fbd57;
          --bio-purple: #7567c7;
          --bio-orange: #d78342;
          --bio-shadow: 0 18px 50px rgba(16, 35, 29, 0.08);
        }

        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
          background: var(--bio-paper);
          color: var(--bio-ink);
        }

        button,
        input {
          font: inherit;
        }

        .biology-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at 88% 4%, rgba(112, 194, 148, 0.13), transparent 25rem),
            radial-gradient(circle at 6% 32%, rgba(27, 154, 170, 0.07), transparent 22rem),
            var(--bio-paper);
        }

        .bio-shell {
          width: min(1220px, calc(100% - 36px));
          margin: 0 auto;
        }

        .bio-hero {
          position: relative;
          overflow: hidden;
          padding: 54px 0 36px;
        }

        .bio-hero::before {
          content: "";
          position: absolute;
          width: 440px;
          height: 440px;
          border: 1px solid rgba(23, 107, 77, 0.12);
          border-radius: 50%;
          right: -150px;
          top: -180px;
          box-shadow:
            0 0 0 35px rgba(23, 107, 77, 0.025),
            0 0 0 70px rgba(23, 107, 77, 0.02);
        }

        .bio-kicker {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          color: var(--bio-green);
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .bio-kicker::before {
          content: "";
          width: 28px;
          height: 2px;
          background: var(--bio-green-2);
        }

        .bio-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
          gap: 48px;
          align-items: center;
          margin-top: 18px;
        }

        .bio-hero h1 {
          margin: 0;
          max-width: 760px;
          font-size: clamp(48px, 7vw, 88px);
          line-height: 0.92;
          letter-spacing: -0.065em;
        }

        .bio-hero h1 span {
          color: var(--bio-green);
        }

        .bio-hero-copy {
          max-width: 680px;
          margin: 24px 0 0;
          color: var(--bio-muted);
          font-size: 18px;
          line-height: 1.65;
        }

        .bio-hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 26px;
        }

        .bio-button {
          border: 0;
          border-radius: 12px;
          padding: 12px 17px;
          cursor: pointer;
          font-weight: 800;
          transition: 0.2s ease;
        }

        .bio-button:hover {
          transform: translateY(-1px);
        }

        .bio-button.primary {
          color: white;
          background: var(--bio-green);
          box-shadow: 0 10px 22px rgba(23, 107, 77, 0.18);
        }

        .bio-button.secondary {
          color: var(--bio-green);
          background: #e8f4ee;
        }

        .bio-hero-visual {
          min-height: 300px;
          position: relative;
          display: grid;
          place-items: center;
        }

        .cell-orbit {
          width: 255px;
          height: 255px;
          border: 1px solid rgba(23, 107, 77, 0.2);
          border-radius: 50%;
          position: relative;
          animation: bio-spin 30s linear infinite;
        }

        .cell-orbit::before,
        .cell-orbit::after {
          content: "";
          position: absolute;
          inset: 28px;
          border: 1px dashed rgba(27, 154, 170, 0.25);
          border-radius: 50%;
        }

        .cell-orbit::after {
          inset: 66px;
          border-style: solid;
          border-color: rgba(143, 189, 87, 0.3);
        }

        .cell-core {
          width: 112px;
          height: 112px;
          border-radius: 46% 54% 55% 45%;
          background: radial-gradient(circle at 35% 30%, #b4a7ec, #7567c7 62%, #5c50aa);
          box-shadow: 0 20px 45px rgba(117, 103, 199, 0.25);
          position: absolute;
          inset: 0;
          margin: auto;
          animation: bio-pulse 5s ease-in-out infinite;
        }

        .cell-dot {
          position: absolute;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--bio-green-2);
          box-shadow: 0 0 0 7px rgba(46, 139, 104, 0.08);
        }

        .cell-dot.d1 { top: 23px; left: 68px; }
        .cell-dot.d2 { top: 76px; right: 27px; }
        .cell-dot.d3 { bottom: 42px; left: 33px; }
        .cell-dot.d4 { bottom: 18px; right: 88px; }

        @keyframes bio-spin {
          to { transform: rotate(360deg); }
        }

        @keyframes bio-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        .bio-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-top: 38px;
        }

        .bio-stat {
          padding: 17px 18px;
          border: 1px solid var(--bio-line);
          border-radius: 16px;
          background: rgba(255,255,255,0.78);
        }

        .bio-stat strong {
          display: block;
          font-size: 22px;
        }

        .bio-stat span {
          display: block;
          margin-top: 4px;
          color: var(--bio-muted);
          font-size: 12px;
        }

        .bio-nav {
          position: sticky;
          top: 0;
          z-index: 20;
          backdrop-filter: blur(18px);
          background: rgba(247,250,248,0.88);
          border-top: 1px solid var(--bio-line);
          border-bottom: 1px solid var(--bio-line);
        }

        .bio-nav-inner {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding: 8px 0;
          scrollbar-width: none;
        }

        .bio-nav-inner::-webkit-scrollbar {
          display: none;
        }

        .bio-nav button {
          white-space: nowrap;
          border: 0;
          background: transparent;
          color: var(--bio-muted);
          padding: 9px 13px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 750;
        }

        .bio-nav button.active {
          color: var(--bio-green);
          background: #e4f3eb;
        }

        .bio-section {
          padding: 72px 0;
        }

        .bio-section-heading {
          max-width: 760px;
          margin-bottom: 28px;
        }

        .bio-eyebrow {
          color: var(--bio-green);
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .bio-section-heading h2 {
          margin: 8px 0 8px;
          font-size: clamp(30px, 4vw, 48px);
          letter-spacing: -0.04em;
        }

        .bio-section-heading p {
          margin: 0;
          color: var(--bio-muted);
          line-height: 1.65;
        }

        .bio-tool-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .bio-tool-card {
          position: relative;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 14px;
          align-items: center;
          min-height: 108px;
          border: 1px solid var(--bio-line);
          border-radius: 18px;
          background: var(--bio-card);
          padding: 18px;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 5px 18px rgba(16,35,29,0.025);
          transition: 0.2s ease;
        }

        .bio-tool-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--bio-shadow);
          border-color: #c6ddd0;
        }

        .bio-tool-icon {
          display: grid;
          place-items: center;
          width: 45px;
          height: 45px;
          border-radius: 13px;
          background: #edf7f2;
          font-size: 22px;
        }

        .bio-tool-card strong,
        .bio-tool-card small {
          display: block;
        }

        .bio-tool-card strong {
          color: var(--bio-ink);
          font-size: 14px;
        }

        .bio-tool-card small {
          margin-top: 5px;
          color: var(--bio-muted);
          line-height: 1.45;
          font-size: 12px;
        }

        .bio-arrow {
          color: #92a39b;
          font-size: 18px;
        }

        .bio-panel {
          border: 1px solid var(--bio-line);
          border-radius: 22px;
          background: var(--bio-card);
          box-shadow: var(--bio-shadow);
          overflow: hidden;
        }

        .bio-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 19px 22px;
          border-bottom: 1px solid var(--bio-line);
        }

        .bio-panel-header h3 {
          margin: 0;
          font-size: 18px;
        }

        .bio-panel-header p {
          margin: 4px 0 0;
          color: var(--bio-muted);
          font-size: 12px;
        }

        .bio-chip-row {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .bio-chip {
          border: 1px solid var(--bio-line);
          background: #f8fbf9;
          color: var(--bio-muted);
          border-radius: 999px;
          padding: 7px 10px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        .bio-chip.active {
          background: #e2f3ea;
          border-color: #b9dbc9;
          color: var(--bio-green);
        }

        .cell-lab-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(270px, 0.8fr);
          min-height: 530px;
        }

        .cell-stage {
          position: relative;
          min-height: 530px;
          display: grid;
          place-items: center;
          background:
            linear-gradient(rgba(23,107,77,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(23,107,77,0.035) 1px, transparent 1px),
            #fbfdfc;
          background-size: 28px 28px;
          overflow: hidden;
        }

        .cell {
          position: relative;
          width: 350px;
          height: 270px;
          border: 5px solid #3d9a75;
          background: rgba(191,235,211,0.45);
          border-radius: 49% 51% 48% 52%;
          box-shadow:
            inset 0 0 0 10px rgba(255,255,255,0.55),
            0 24px 55px rgba(23,107,77,0.12);
        }

        .cell.animal {
          border-color: #8c82c9;
          background: rgba(221,216,246,0.35);
          border-radius: 48% 52% 51% 49%;
        }

        .cell.prokaryote {
          width: 360px;
          height: 210px;
          border-color: #d28b51;
          background: rgba(250,224,196,0.42);
          border-radius: 43% 57% 55% 45%;
        }

        .organelle {
          position: absolute;
          border: 0;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .organelle:hover,
        .organelle.selected {
          transform: scale(1.08);
          filter: brightness(1.03);
        }

        .nucleus {
          width: 90px;
          height: 80px;
          left: 128px;
          top: 93px;
          border-radius: 48%;
          background: #7567c7;
          box-shadow: inset -9px -7px 0 rgba(72,61,145,0.25);
        }

        .nucleus::after {
          content: "";
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #c5bced;
          top: 29px;
          left: 35px;
        }

        .mitochondria {
          width: 62px;
          height: 30px;
          border-radius: 50%;
          background: #e89b5b;
          box-shadow: inset 0 -5px 0 rgba(160,82,33,0.2);
        }

        .m1 { left: 48px; top: 72px; transform: rotate(-18deg); }
        .m2 { right: 45px; top: 155px; transform: rotate(17deg); }

        .chloroplast {
          width: 64px;
          height: 31px;
          border-radius: 50%;
          background: #5ca66c;
          box-shadow: inset 0 -5px 0 rgba(37,94,53,0.22);
        }

        .c1 { left: 53px; bottom: 62px; transform: rotate(22deg); }
        .c2 { right: 53px; bottom: 50px; transform: rotate(-13deg); }

        .golgi {
          width: 62px;
          height: 36px;
          right: 96px;
          top: 60px;
          border-radius: 50%;
          background: repeating-linear-gradient(
            0deg,
            #e58ab1 0 5px,
            #f2b5cc 5px 8px
          );
          transform: rotate(-12deg);
        }

        .vacuole {
          width: 125px;
          height: 92px;
          right: 23px;
          top: 31px;
          border-radius: 46% 54% 55% 45%;
          background: rgba(85,187,207,0.28);
          border: 2px solid rgba(27,154,170,0.35);
        }

        .ribosome {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #367da8;
          box-shadow: 26px 10px #367da8, 53px -7px #367da8, 81px 12px #367da8;
        }

        .r1 { left: 102px; top: 53px; }
        .r2 { right: 103px; bottom: 61px; }

        .cell-label {
          position: absolute;
          left: 50%;
          bottom: 20px;
          transform: translateX(-50%);
          color: var(--bio-muted);
          font-size: 11px;
          font-weight: 800;
          background: rgba(255,255,255,0.8);
          padding: 7px 10px;
          border-radius: 999px;
        }

        .cell-side {
          padding: 24px;
          border-left: 1px solid var(--bio-line);
          background: #fff;
        }

        .cell-side h4 {
          margin: 0 0 8px;
          font-size: 24px;
          letter-spacing: -0.03em;
        }

        .cell-side p {
          color: var(--bio-muted);
          line-height: 1.6;
          font-size: 13px;
        }

        .bio-mini-card {
          padding: 14px;
          border: 1px solid var(--bio-line);
          border-radius: 14px;
          background: #f9fcfa;
          margin-top: 12px;
        }

        .bio-mini-card span {
          display: block;
          color: var(--bio-muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 800;
        }

        .bio-mini-card strong {
          display: block;
          margin-top: 5px;
          font-size: 13px;
          line-height: 1.45;
        }

        .lab-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .lab-card {
          padding: 22px;
          border: 1px solid var(--bio-line);
          border-radius: 20px;
          background: white;
          box-shadow: 0 10px 30px rgba(16,35,29,0.045);
        }

        .lab-card h3 {
          margin: 0;
          font-size: 20px;
          letter-spacing: -0.025em;
        }

        .lab-card > p {
          margin: 6px 0 20px;
          color: var(--bio-muted);
          font-size: 13px;
          line-height: 1.55;
        }

        .slider-row {
          display: grid;
          grid-template-columns: 150px 1fr 55px;
          gap: 10px;
          align-items: center;
          margin: 13px 0;
        }

        .slider-row label {
          color: var(--bio-muted);
          font-size: 12px;
        }

        .slider-row input {
          width: 100%;
          accent-color: var(--bio-green);
        }

        .slider-value {
          text-align: right;
          font-weight: 850;
          font-size: 12px;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 18px;
        }

        .metric {
          padding: 12px;
          border-radius: 12px;
          background: #f0f7f3;
        }

        .metric span {
          display: block;
          color: var(--bio-muted);
          font-size: 10px;
        }

        .metric strong {
          display: block;
          margin-top: 4px;
          font-size: 19px;
        }

        .osmosis-visual {
          display: grid;
          grid-template-columns: 1fr 100px 1fr;
          align-items: stretch;
          min-height: 190px;
          margin-top: 20px;
          overflow: hidden;
          border-radius: 15px;
          border: 1px solid var(--bio-line);
        }

        .solution {
          position: relative;
          padding: 18px;
          background:
            radial-gradient(circle at 20% 30%, rgba(27,154,170,0.16) 0 3px, transparent 4px),
            radial-gradient(circle at 70% 70%, rgba(27,154,170,0.13) 0 3px, transparent 4px),
            #eff9f8;
        }

        .solution.right {
          background:
            radial-gradient(circle at 35% 55%, rgba(23,107,77,0.15) 0 3px, transparent 4px),
            #eef8f2;
        }

        .solution h4 {
          margin: 0;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .solution strong {
          display: block;
          margin-top: 8px;
          font-size: 28px;
        }

        .membrane {
          position: relative;
          display: grid;
          place-items: center;
          background: repeating-linear-gradient(
            90deg,
            #e7c979 0 7px,
            #f4dfa5 7px 13px
          );
        }

        .water-arrow {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          font-size: 30px;
          color: #1b9aaa;
          animation: bio-flow 1.4s ease-in-out infinite;
        }

        @keyframes bio-flow {
          0%, 100% { transform: translateX(-50%) translateY(-4px); }
          50% { transform: translateX(-50%) translateY(5px); }
        }

        .result-banner {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          background: #e9f6ef;
          color: var(--bio-green);
          font-size: 12px;
          font-weight: 800;
        }

        .photosynthesis-gauge {
          margin-top: 22px;
          height: 180px;
          display: flex;
          align-items: end;
          gap: 9px;
          padding: 20px;
          border-radius: 15px;
          background:
            linear-gradient(rgba(23,107,77,0.05) 1px, transparent 1px),
            #f8fbf9;
          background-size: 100% 36px;
        }

        .photo-bar {
          flex: 1;
          min-width: 8px;
          border-radius: 8px 8px 2px 2px;
          background: linear-gradient(to top, #176b4d, #77bd91);
          transition: height 0.3s ease;
        }

        .body-grid {
          display: grid;
          grid-template-columns: minmax(260px, 0.75fr) minmax(0, 1.25fr);
          gap: 16px;
        }

        .body-map {
          position: relative;
          min-height: 560px;
          display: grid;
          place-items: center;
          border: 1px solid var(--bio-line);
          border-radius: 22px;
          background:
            radial-gradient(circle at 50% 20%, rgba(27,154,170,0.08), transparent 12rem),
            #fff;
        }

        .human {
          position: relative;
          width: 190px;
          height: 510px;
        }

        .head {
          position: absolute;
          top: 0;
          left: 67px;
          width: 56px;
          height: 68px;
          border-radius: 48%;
          background: #e7bd9f;
        }

        .neck {
          position: absolute;
          top: 59px;
          left: 81px;
          width: 29px;
          height: 35px;
          background: #e7bd9f;
        }

        .torso {
          position: absolute;
          top: 83px;
          left: 38px;
          width: 114px;
          height: 205px;
          border-radius: 43% 43% 24% 24%;
          background: #dfeee7;
          border: 3px solid #9ac8b1;
        }

        .arm {
          position: absolute;
          top: 100px;
          width: 31px;
          height: 180px;
          border-radius: 22px;
          background: #e7bd9f;
        }

        .arm.left { left: 13px; transform: rotate(8deg); }
        .arm.right { right: 13px; transform: rotate(-8deg); }

        .leg {
          position: absolute;
          top: 270px;
          width: 39px;
          height: 235px;
          border-radius: 20px;
          background: #cbded5;
        }

        .leg.left { left: 54px; }
        .leg.right { right: 54px; }

        .organ {
          position: absolute;
          border: 0;
          cursor: pointer;
          transition: 0.2s;
        }

        .organ:hover,
        .organ.active {
          transform: scale(1.1);
        }

        .heart {
          width: 32px;
          height: 36px;
          left: 79px;
          top: 123px;
          background: #d75f69;
          border-radius: 55% 45% 50% 50%;
          transform: rotate(45deg);
        }

        .lung {
          width: 38px;
          height: 55px;
          background: #78b9b4;
          border-radius: 48% 48% 55% 55%;
          top: 113px;
        }

        .lung.left { left: 48px; }
        .lung.right { right: 48px; }

        .brain {
          width: 46px;
          height: 42px;
          left: 72px;
          top: 14px;
          border-radius: 48%;
          background: #9a83bd;
          border: 3px solid #735b98;
        }

        .kidney {
          width: 27px;
          height: 40px;
          background: #b77a5b;
          border-radius: 55% 45% 55% 45%;
          top: 196px;
        }

        .kidney.left { left: 61px; }
        .kidney.right { right: 61px; }

        .body-info {
          border: 1px solid var(--bio-line);
          border-radius: 22px;
          background: white;
          overflow: hidden;
        }

        .body-info-top {
          padding: 22px;
          border-bottom: 1px solid var(--bio-line);
        }

        .body-info-top h3 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.04em;
        }

        .body-info-top p {
          color: var(--bio-muted);
          line-height: 1.6;
          font-size: 13px;
        }

        .phys-controls {
          padding: 18px 22px;
        }

        .taxonomy-layout {
          display: grid;
          grid-template-columns: 0.75fr 1.25fr;
          gap: 16px;
        }

        .taxon-list {
          display: grid;
          gap: 8px;
        }

        .taxon-button {
          border: 1px solid var(--bio-line);
          border-radius: 13px;
          background: white;
          text-align: left;
          padding: 13px;
          cursor: pointer;
        }

        .taxon-button.active {
          border-color: #abd0bd;
          background: #edf8f1;
        }

        .taxon-button strong {
          display: block;
          font-size: 13px;
        }

        .taxon-button span {
          display: block;
          margin-top: 4px;
          color: var(--bio-muted);
          font-size: 10px;
        }

        .tree {
          min-height: 390px;
          border: 1px solid var(--bio-line);
          border-radius: 22px;
          background: white;
          padding: 24px;
        }

        .tree-line {
          position: relative;
          padding-left: 30px;
          margin: 12px 0;
        }

        .tree-line::before {
          content: "";
          position: absolute;
          left: 10px;
          top: -12px;
          bottom: -12px;
          width: 1px;
          background: #b8cec2;
        }

        .tree-line::after {
          content: "";
          position: absolute;
          left: 10px;
          top: 50%;
          width: 20px;
          height: 1px;
          background: #b8cec2;
        }

        .tree-node {
          display: inline-flex;
          padding: 9px 12px;
          border-radius: 10px;
          background: #edf7f2;
          color: var(--bio-green);
          font-size: 12px;
          font-weight: 800;
        }

        .data-layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th,
        .data-table td {
          border-bottom: 1px solid var(--bio-line);
          padding: 10px 8px;
          text-align: left;
          font-size: 12px;
        }

        .data-table th {
          color: var(--bio-muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .data-table input {
          width: 75px;
          border: 1px solid var(--bio-line);
          border-radius: 7px;
          padding: 6px;
        }

        .chart {
          min-height: 300px;
          display: flex;
          align-items: end;
          gap: 13px;
          padding: 22px 18px 30px;
          border-radius: 16px;
          background:
            linear-gradient(rgba(23,107,77,0.06) 1px, transparent 1px),
            #f8fbf9;
          background-size: 100% 42px;
        }

        .chart-column {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: end;
          align-items: center;
          gap: 7px;
          height: 245px;
        }

        .chart-bar {
          width: 100%;
          max-width: 46px;
          min-height: 5px;
          border-radius: 7px 7px 2px 2px;
          background: #2e8b68;
          transition: height 0.25s ease;
        }

        .chart-column span {
          color: var(--bio-muted);
          font-size: 10px;
        }

        .practice-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 280px;
          gap: 16px;
        }

        .question-card {
          padding: 28px;
          border: 1px solid var(--bio-line);
          border-radius: 22px;
          background: white;
        }

        .question-number {
          color: var(--bio-green);
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .question-card h3 {
          max-width: 760px;
          margin: 10px 0 22px;
          font-size: clamp(21px, 3vw, 30px);
          line-height: 1.2;
          letter-spacing: -0.025em;
        }

        .option {
          width: 100%;
          display: grid;
          grid-template-columns: 28px 1fr;
          gap: 10px;
          align-items: start;
          margin: 8px 0;
          border: 1px solid var(--bio-line);
          border-radius: 12px;
          background: #fbfdfc;
          padding: 13px;
          cursor: pointer;
          text-align: left;
        }

        .option.selected {
          border-color: #9fcab2;
          background: #eef8f2;
        }

        .option.correct {
          border-color: #6eae88;
          background: #e7f6ed;
        }

        .option-letter {
          display: grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 7px;
          background: #e7efeb;
          color: var(--bio-green);
          font-size: 11px;
          font-weight: 850;
        }

        .explanation {
          margin-top: 18px;
          padding: 14px;
          border-radius: 13px;
          background: #f0f7f3;
          color: #3c5b4d;
          font-size: 12px;
          line-height: 1.55;
        }

        .practice-side {
          padding: 20px;
          border: 1px solid var(--bio-line);
          border-radius: 22px;
          background: #eff7f2;
        }

        .practice-side strong {
          display: block;
          font-size: 18px;
        }

        .practice-side p {
          color: var(--bio-muted);
          font-size: 12px;
          line-height: 1.6;
        }

        .syllabus-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
        }

        .syllabus-card {
          min-height: 220px;
          padding: 18px;
          border: 1px solid var(--bio-line);
          border-radius: 17px;
          background: white;
        }

        .unit-number {
          color: var(--bio-green);
          font-size: 11px;
          font-weight: 900;
        }

        .syllabus-card h3 {
          margin: 8px 0 5px;
          font-size: 15px;
        }

        .marks {
          color: var(--bio-muted);
          font-size: 11px;
        }

        .chapter-list {
          padding-left: 17px;
          margin: 14px 0 0;
        }

        .chapter-list li {
          margin: 7px 0;
          color: #52665c;
          font-size: 11px;
          line-height: 1.35;
        }

        .bio-footer {
          padding: 30px 0 60px;
          color: var(--bio-muted);
          font-size: 11px;
          text-align: center;
        }

        @media (max-width: 950px) {
          .bio-hero-grid,
          .cell-lab-grid,
          .body-grid,
          .taxonomy-layout,
          .data-layout,
          .practice-layout {
            grid-template-columns: 1fr;
          }

          .cell-side {
            border-left: 0;
            border-top: 1px solid var(--bio-line);
          }

          .bio-tool-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .syllabus-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .bio-stats {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 620px) {
          .bio-shell {
            width: min(100% - 24px, 1220px);
          }

          .bio-hero {
            padding-top: 35px;
          }

          .bio-hero h1 {
            font-size: 54px;
          }

          .bio-hero-visual {
            min-height: 240px;
          }

          .cell-orbit {
            width: 210px;
            height: 210px;
          }

          .bio-tool-grid,
          .lab-grid,
          .syllabus-grid {
            grid-template-columns: 1fr;
          }

          .bio-stats {
            grid-template-columns: 1fr 1fr;
          }

          .cell {
            transform: scale(0.78);
          }

          .cell-stage {
            min-height: 390px;
          }

          .osmosis-visual {
            grid-template-columns: 1fr 70px 1fr;
          }

          .slider-row {
            grid-template-columns: 110px 1fr 46px;
          }

          .metric-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="bio-hero">
        <div className="bio-shell">
          <span className="bio-kicker">VGB Learning Tools · Biology 044</span>

          <div className="bio-hero-grid">
            <div>
              <h1>
                Biology.
                <br />
                <span>The living lab.</span>
              </h1>

              <p className="bio-hero-copy">
                Explore living systems as models you can manipulate, measure and
                question. From organelles to ecosystems, turn biological
                processes into things you can actually see and test.
              </p>

              <div className="bio-hero-actions">
                <button className="bio-button primary" onClick={() => setTab("cell")}>
                  Open Cell Lab
                </button>
                <button className="bio-button secondary" onClick={() => setTab("lab")}>
                  Run an Experiment
                </button>
              </div>
            </div>

            <div className="bio-hero-visual" aria-hidden="true">
              <div className="cell-orbit">
                <div className="cell-core" />
                <div className="cell-dot d1" />
                <div className="cell-dot d2" />
                <div className="cell-dot d3" />
                <div className="cell-dot d4" />
              </div>
            </div>
          </div>

          <div className="bio-stats">
            <div className="bio-stat">
              <strong>5</strong>
              <span>CBSE theory units</span>
            </div>
            <div className="bio-stat">
              <strong>70 + 30</strong>
              <span>Theory + practical marks</span>
            </div>
            <div className="bio-stat">
              <strong>XI</strong>
              <span>2026–27 focus</span>
            </div>
            <div className="bio-stat">
              <strong>∞</strong>
              <span>Questions to investigate</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bio-nav">
        <div className="bio-shell bio-nav-inner">
          {[
            ["overview", "Overview"],
            ["cell", "Cell Lab"],
            ["lab", "Virtual Lab"],
            ["physiology", "Human Physiology"],
            ["taxonomy", "Classification"],
            ["data", "Data Lab"],
            ["practice", "Practice"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={activeTab === id ? "active" : ""}
              onClick={() => setTab(id as LabTab)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {activeTab === "overview" && (
        <>
          <section className="bio-section">
            <div className="bio-shell">
              <SectionHeading
                eyebrow="Explore"
                title="Biology is a system, not a list."
                text="Start with a question, open a model, change a variable and watch what follows. These tools are designed around the way biological reasoning actually works."
              />

              <div className="bio-tool-grid">
                <ToolCard
                  icon="🧬"
                  title="Cell Explorer"
                  text="Compare animal, plant and prokaryotic cells."
                  onClick={() => setTab("cell")}
                />
                <ToolCard
                  icon="🔬"
                  title="Virtual Microscope"
                  text="Prepare for slides, spotting and identification."
                  onClick={() => setTab("lab")}
                />
                <ToolCard
                  icon="💧"
                  title="Osmosis Lab"
                  text="Change concentration and observe water movement."
                  onClick={() => setTab("lab")}
                />
                <ToolCard
                  icon="🌿"
                  title="Photosynthesis Model"
                  text="Investigate light, CO₂ and temperature."
                  onClick={() => setTab("lab")}
                />
                <ToolCard
                  icon="❤️"
                  title="Circulation Lab"
                  text="Model heart rate, stroke volume and output."
                  onClick={() => setTab("physiology")}
                />
                <ToolCard
                  icon="🌳"
                  title="Taxonomy Explorer"
                  text="Navigate biological classification as a tree."
                  onClick={() => setTab("taxonomy")}
                />
                <ToolCard
                  icon="📊"
                  title="Biology Data Lab"
                  text="Turn observations into graphs and inferences."
                  onClick={() => setTab("data")}
                />
                <ToolCard
                  icon="🧠"
                  title="CBSE Practice"
                  text="Recall, apply and analyse instead of guessing."
                  onClick={() => setTab("practice")}
                />
                <ToolCard
                  icon="🧪"
                  title="Practical Mindset"
                  text="Train observation, variables, evidence and conclusion."
                  onClick={() => setTab("lab")}
                />
              </div>
            </div>
          </section>

          <section className="bio-section" style={{ paddingTop: 20 }}>
            <div className="bio-shell">
              <SectionHeading
                eyebrow="The learning loop"
                title="Observe → manipulate → measure → explain."
                text="Every major tool follows the same scientific loop. The interface is deliberately built to make variables and evidence visible."
              />

              <div className="bio-panel">
                <div className="bio-panel-header">
                  <div>
                    <h3>A living system in layers</h3>
                    <p>Clicking down the hierarchy changes the scale of the question.</p>
                  </div>
                  <span className="bio-chip active">Molecule → Biosphere</span>
                </div>

                <div style={{ padding: 22 }}>
                  <div className="bio-tool-grid">
                    {[
                      ["01", "Molecule", "Biochemistry"],
                      ["02", "Organelle", "Cell biology"],
                      ["03", "Cell", "Structure & function"],
                      ["04", "Organism", "Physiology"],
                      ["05", "Population", "Ecology"],
                      ["06", "Ecosystem", "Interactions"],
                    ].map(([n, title, sub]) => (
                      <div className="bio-mini-card" key={title}>
                        <span>{n}</span>
                        <strong>{title}</strong>
                        <small style={{ color: "#66756e", display: "block", marginTop: 4 }}>
                          {sub}
                        </small>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bio-section">
            <div className="bio-shell">
              <SectionHeading
                eyebrow="CBSE 2026–27"
                title="The syllabus, turned into a map."
                text="Five theory units form the backbone of the tools. Practical work sits alongside them instead of being exiled to the last page of the notebook."
              />

              <div className="syllabus-grid">
                {syllabus.map((unit) => (
                  <div className="syllabus-card" key={unit.unit}>
                    <span className="unit-number">UNIT {unit.unit}</span>
                    <h3>{unit.title}</h3>
                    <span className="marks">{unit.marks} theory marks</span>
                    <ul className="chapter-list">
                      {unit.chapters.map((chapter) => (
                        <li key={chapter}>{chapter}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      {activeTab === "cell" && (
        <section className="bio-section">
          <div className="bio-shell">
            <SectionHeading
              eyebrow="Interactive cell lab"
              title="Change the cell. Understand the cell."
              text="Select a cell type, then inspect organelles by function. The diagram is intentionally schematic rather than pretending a textbook cross-section is a photograph."
            />

            <div className="bio-panel">
              <div className="bio-panel-header">
                <div>
                  <h3>Cell Explorer</h3>
                  <p>Choose a model and inspect its components.</p>
                </div>
                <div className="bio-chip-row">
                  {[
                    ["animal", "Animal"],
                    ["plant", "Plant"],
                    ["prokaryote", "Prokaryotic"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      className={`bio-chip ${cellType === id ? "active" : ""}`}
                      onClick={() => setCellType(id as CellType)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cell-lab-grid">
                <div className="cell-stage">
                  <div className={`cell ${cellType}`}>
                    <button
                      className={`organelle nucleus ${selectedOrganelle === "nucleus" ? "selected" : ""}`}
                      aria-label="Nucleus"
                      onClick={() => setSelectedOrganelle("nucleus")}
                    />
                    {cellType !== "prokaryote" && (
                      <>
                        <button
                          className={`organelle mitochondria m1 ${selectedOrganelle === "mitochondria" ? "selected" : ""}`}
                          aria-label="Mitochondria"
                          onClick={() => setSelectedOrganelle("mitochondria")}
                        />
                        <button
                          className={`organelle mitochondria m2 ${selectedOrganelle === "mitochondria" ? "selected" : ""}`}
                          aria-label="Mitochondria"
                          onClick={() => setSelectedOrganelle("mitochondria")}
                        />
                        <button
                          className={`organelle golgi ${selectedOrganelle === "golgi" ? "selected" : ""}`}
                          aria-label="Golgi apparatus"
                          onClick={() => setSelectedOrganelle("golgi")}
                        />
                        <button
                          className={`organelle ribosome r1 ${selectedOrganelle === "ribosome" ? "selected" : ""}`}
                          aria-label="Ribosomes"
                          onClick={() => setSelectedOrganelle("ribosome")}
                        />
                        <button
                          className={`organelle ribosome r2 ${selectedOrganelle === "ribosome" ? "selected" : ""}`}
                          aria-label="Ribosomes"
                          onClick={() => setSelectedOrganelle("ribosome")}
                        />
                      </>
                    )}

                    {cellType === "plant" && (
                      <>
                        <button
                          className={`organelle chloroplast c1 ${selectedOrganelle === "chloroplast" ? "selected" : ""}`}
                          aria-label="Chloroplast"
                          onClick={() => setSelectedOrganelle("chloroplast")}
                        />
                        <button
                          className={`organelle chloroplast c2 ${selectedOrganelle === "chloroplast" ? "selected" : ""}`}
                          aria-label="Chloroplast"
                          onClick={() => setSelectedOrganelle("chloroplast")}
                        />
                        <button
                          className={`organelle vacuole ${selectedOrganelle === "vacuole" ? "selected" : ""}`}
                          aria-label="Vacuole"
                          onClick={() => setSelectedOrganelle("vacuole")}
                        />
                      </>
                    )}
                  </div>
                  <span className="cell-label">
                    {cellType === "plant"
                      ? "Plant cell · simplified teaching model"
                      : cellType === "animal"
                        ? "Animal cell · simplified teaching model"
                        : "Prokaryotic cell · simplified teaching model"}
                  </span>
                </div>

                <aside className="cell-side">
                  <span className="bio-eyebrow">Selected structure</span>
                  <h4>{activeOrganelle.name}</h4>
                  <p>{activeOrganelle.role}</p>

                  <div className="bio-mini-card">
                    <span>Typical location</span>
                    <strong>{activeOrganelle.location}</strong>
                  </div>

                  <div className="bio-mini-card">
                    <span>Reasoning prompt</span>
                    <strong>
                      What would happen to the cell if this structure could no
                      longer perform its function?
                    </strong>
                  </div>

                  <div className="bio-mini-card">
                    <span>Compare</span>
                    <strong>
                      Plant cells add a cell wall, chloroplasts and a large
                      central vacuole. Prokaryotes lack a membrane-bound nucleus.
                    </strong>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "lab" && (
        <section className="bio-section">
          <div className="bio-shell">
            <SectionHeading
              eyebrow="Virtual laboratory"
              title="Run the experiment, not just the definition."
              text="These are simplified educational models. Their job is to expose variables, relationships and reasoning, not to impersonate a real laboratory."
            />

            <div className="lab-grid">
              <div className="lab-card">
                <h3>💧 Membrane & Osmosis Lab</h3>
                <p>
                  Change the relative solute concentration. The model predicts
                  the direction and approximate strength of net water movement.
                </p>

                <div className="bio-chip-row">
                  {[
                    ["diffusion", "Diffusion"],
                    ["osmosis", "Osmosis"],
                    ["active", "Active transport"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      className={`bio-chip ${membraneMode === id ? "active" : ""}`}
                      onClick={() =>
                        setMembraneMode(
                          id as "diffusion" | "osmosis" | "active",
                        )
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="slider-row">
                  <label>Outside solute</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={outsideConcentration}
                    onChange={(e) =>
                      setOutsideConcentration(Number(e.target.value))
                    }
                  />
                  <span className="slider-value">{outsideConcentration}%</span>
                </div>

                <div className="slider-row">
                  <label>Inside solute</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={insideConcentration}
                    onChange={(e) =>
                      setInsideConcentration(Number(e.target.value))
                    }
                  />
                  <span className="slider-value">{insideConcentration}%</span>
                </div>

                <div className="osmosis-visual">
                  <div className="solution">
                    <h4>Outside</h4>
                    <strong>{outsideConcentration}%</strong>
                  </div>
                  <div className="membrane">
                    {membraneMode === "osmosis" && (
                      <span
                        className="water-arrow"
                        style={{
                          top:
                            outsideConcentration > insideConcentration
                              ? "58%"
                              : "35%",
                        }}
                      >
                        {outsideConcentration === insideConcentration
                          ? "↕"
                          : outsideConcentration > insideConcentration
                            ? "←"
                            : "→"}
                      </span>
                    )}
                    {membraneMode === "diffusion" && (
                      <span className="water-arrow" style={{ top: "42%" }}>
                        ⇄
                      </span>
                    )}
                    {membraneMode === "active" && (
                      <span className="water-arrow" style={{ top: "42%" }}>
                        ↑
                      </span>
                    )}
                  </div>
                  <div className="solution right">
                    <h4>Inside</h4>
                    <strong>{insideConcentration}%</strong>
                  </div>
                </div>

                <div className="result-banner">
                  {membraneMode === "osmosis"
                    ? waterDirection
                    : membraneMode === "diffusion"
                      ? "Particles tend to move down their concentration gradient when the membrane permits passage."
                      : "Active transport can move substances against a concentration gradient using energy."}
                </div>
              </div>

              <div className="lab-card">
                <h3>🌿 Photosynthesis Model</h3>
                <p>
                  Change light, carbon dioxide and temperature. The response is
                  a deliberately simplified model of limiting-factor behaviour.
                </p>

                <div className="slider-row">
                  <label>Light intensity</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={light}
                    onChange={(e) => setLight(Number(e.target.value))}
                  />
                  <span className="slider-value">{light}</span>
                </div>

                <div className="slider-row">
                  <label>CO₂ level</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={co2}
                    onChange={(e) => setCo2(Number(e.target.value))}
                  />
                  <span className="slider-value">{co2}</span>
                </div>

                <div className="slider-row">
                  <label>Temperature</label>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    value={temperature}
                    onChange={(e) => setTemperature(Number(e.target.value))}
                  />
                  <span className="slider-value">{temperature}°C</span>
                </div>

                <div className="photosynthesis-gauge">
                  {[0.35, 0.5, 0.65, 0.8, 0.95, 1, 0.92, 0.82, 0.7, 0.6].map(
                    (factor, index) => (
                      <div
                        className="photo-bar"
                        key={index}
                        style={{
                          height: `${Math.max(
                            7,
                            photosynthesisRate * factor * 1.25,
                          )}%`,
                        }}
                      />
                    ),
                  )}
                </div>

                <div className="metric-grid">
                  <div className="metric">
                    <span>Relative rate</span>
                    <strong>{photosynthesisRate}</strong>
                  </div>
                  <div className="metric">
                    <span>Light</span>
                    <strong>{light}</strong>
                  </div>
                  <div className="metric">
                    <span>Temperature</span>
                    <strong>{temperature}°C</strong>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }} className="lab-grid">
              <div className="lab-card">
                <h3>🔬 Virtual microscope</h3>
                <p>
                  Use the spotting workflow: observe → identify → give
                  diagnostic features. A practical exam rewards evidence, not
                  merely recognising a picture.
                </p>
                <div className="bio-panel" style={{ boxShadow: "none" }}>
                  <div
                    style={{
                      minHeight: 180,
                      display: "grid",
                      placeItems: "center",
                      background:
                        "radial-gradient(circle, rgba(143,189,87,.2), transparent 48%), #f6fbf7",
                    }}
                  >
                    <div
                      style={{
                        width: 130,
                        height: 130,
                        borderRadius: "50%",
                        border: "10px solid rgba(23,107,77,.2)",
                        background:
                          "radial-gradient(circle at 35% 35%, #b8d99b 0 7%, #5b9c68 8% 14%, #b8d99b 15% 100%)",
                        boxShadow: "inset 0 0 0 20px rgba(255,255,255,.25)",
                      }}
                    />
                  </div>
                  <div className="bio-panel-header">
                    <div>
                      <h3>Leaf tissue · 10×</h3>
                      <p>Try identifying the visible pattern before revealing labels.</p>
                    </div>
                    <button className="bio-chip active">Reveal</button>
                  </div>
                </div>
              </div>

              <div className="lab-card">
                <h3>🧪 Practical reasoning</h3>
                <p>
                  Before running any experiment, identify the independent
                  variable, dependent variable, controls and the evidence that
                  would support your conclusion.
                </p>
                <div className="bio-mini-card">
                  <span>Independent variable</span>
                  <strong>What you deliberately change</strong>
                </div>
                <div className="bio-mini-card">
                  <span>Dependent variable</span>
                  <strong>What you measure as the response</strong>
                </div>
                <div className="bio-mini-card">
                  <span>Control variables</span>
                  <strong>Conditions kept constant so the comparison is meaningful</strong>
                </div>
                <div className="bio-mini-card">
                  <span>Conclusion</span>
                  <strong>What the evidence actually supports, not what you hoped it would prove</strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "physiology" && (
        <section className="bio-section">
          <div className="bio-shell">
            <SectionHeading
              eyebrow="Human physiology"
              title="Model the body as a system."
              text="Select an organ, then change physiological parameters. The outputs are simple textbook models designed to make relationships visible."
            />

            <div className="body-grid">
              <div className="body-map">
                <div className="human">
                  <div className="head" />
                  <div className="neck" />
                  <div className="torso" />
                  <div className="arm left" />
                  <div className="arm right" />
                  <div className="leg left" />
                  <div className="leg right" />
                  <button className="organ brain active" aria-label="Brain" />
                  <button className="organ lung left" aria-label="Left lung" />
                  <button className="organ lung right" aria-label="Right lung" />
                  <button className="organ heart active" aria-label="Heart" />
                  <button className="organ kidney left" aria-label="Left kidney" />
                  <button className="organ kidney right" aria-label="Right kidney" />
                </div>
              </div>

              <div className="body-info">
                <div className="body-info-top">
                  <span className="bio-eyebrow">Circulation model</span>
                  <h3>❤️ Heart → cardiac output</h3>
                  <p>
                    Cardiac output links heart rate and stroke volume. Change
                    either input and observe the resulting flow per minute.
                  </p>
                </div>

                <div className="phys-controls">
                  <div className="slider-row">
                    <label>Heart rate</label>
                    <input
                      type="range"
                      min="40"
                      max="180"
                      value={heartRate}
                      onChange={(e) => setHeartRate(Number(e.target.value))}
                    />
                    <span className="slider-value">{heartRate} bpm</span>
                  </div>

                  <div className="slider-row">
                    <label>Stroke volume</label>
                    <input
                      type="range"
                      min="30"
                      max="120"
                      value={strokeVolume}
                      onChange={(e) => setStrokeVolume(Number(e.target.value))}
                    />
                    <span className="slider-value">{strokeVolume} mL</span>
                  </div>

                  <div className="metric-grid">
                    <div className="metric">
                      <span>Cardiac output</span>
                      <strong>{cardiacOutput.toFixed(2)} L/min</strong>
                    </div>
                    <div className="metric">
                      <span>Heart rate</span>
                      <strong>{heartRate}</strong>
                    </div>
                    <div className="metric">
                      <span>Stroke volume</span>
                      <strong>{strokeVolume} mL</strong>
                    </div>
                  </div>

                  <div className="bio-mini-card" style={{ marginTop: 22 }}>
                    <span>Model</span>
                    <strong>
                      Cardiac output = heart rate × stroke volume
                    </strong>
                  </div>

                  <div style={{ height: 1, background: "#dfe9e3", margin: "24px 0" }} />

                  <span className="bio-eyebrow">Respiration model</span>
                  <h3 style={{ margin: "8px 0" }}>🫁 Ventilation</h3>

                  <div className="slider-row">
                    <label>Respiratory rate</label>
                    <input
                      type="range"
                      min="6"
                      max="30"
                      value={respRate}
                      onChange={(e) => setRespRate(Number(e.target.value))}
                    />
                    <span className="slider-value">{respRate}/min</span>
                  </div>

                  <div className="slider-row">
                    <label>Tidal volume</label>
                    <input
                      type="range"
                      min="250"
                      max="900"
                      step="10"
                      value={tidalVolume}
                      onChange={(e) => setTidalVolume(Number(e.target.value))}
                    />
                    <span className="slider-value">{tidalVolume} mL</span>
                  </div>

                  <div className="slider-row">
                    <label>Dead space</label>
                    <input
                      type="range"
                      min="80"
                      max="250"
                      step="10"
                      value={deadSpace}
                      onChange={(e) => setDeadSpace(Number(e.target.value))}
                    />
                    <span className="slider-value">{deadSpace} mL</span>
                  </div>

                  <div className="metric-grid">
                    <div className="metric">
                      <span>Minute ventilation</span>
                      <strong>{minuteVentilation.toFixed(2)} L/min</strong>
                    </div>
                    <div className="metric">
                      <span>Alveolar ventilation</span>
                      <strong>{alveolarVentilation.toFixed(2)} L/min</strong>
                    </div>
                    <div className="metric">
                      <span>Effective fraction</span>
                      <strong>
                        {tidalVolume
                          ? Math.round(
                              ((tidalVolume - deadSpace) / tidalVolume) * 100,
                            )
                          : 0}
                        %
                      </strong>
                    </div>
                  </div>

                  <div className="bio-mini-card" style={{ marginTop: 18 }}>
                    <span>Model</span>
                    <strong>
                      Alveolar ventilation = respiratory rate × (tidal volume −
                      dead space)
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "taxonomy" && (
        <section className="bio-section">
          <div className="bio-shell">
            <SectionHeading
              eyebrow="Biological classification"
              title="Classification as a decision tree."
              text="Taxonomy becomes easier when characteristics do the work. Select a group to inspect its diagnostic traits, then trace its place in the larger tree."
            />

            <div className="taxonomy-layout">
              <div className="taxon-list">
                {taxa.map((taxon) => (
                  <button
                    className={`taxon-button ${selectedTaxon === taxon.name ? "active" : ""}`}
                    key={taxon.name}
                    onClick={() => setSelectedTaxon(taxon.name)}
                  >
                    <strong>{taxon.name}</strong>
                    <span>
                      {taxon.rank} · {taxon.group}
                    </span>
                  </button>
                ))}
              </div>

              <div className="tree">
                <span className="bio-eyebrow">Selected taxon</span>
                {(() => {
                  const selected =
                    taxa.find((taxon) => taxon.name === selectedTaxon) ?? taxa[0];
                  return (
                    <>
                      <h3 style={{ margin: "8px 0 5px", fontSize: 32 }}>
                        {selected.name}
                      </h3>
                      <p
                        style={{
                          color: "#66756e",
                          fontSize: 13,
                          lineHeight: 1.6,
                        }}
                      >
                        {selected.rank} · {selected.group}
                      </p>
                      <div className="bio-mini-card">
                        <span>Diagnostic traits</span>
                        <strong>{selected.traits.join(" · ")}</strong>
                      </div>

                      <div style={{ marginTop: 30 }}>
                        {[
                          "Life",
                          "Eukaryota",
                          selected.group,
                          selected.name,
                        ].map((node, index) => (
                          <div className="tree-line" key={`${node}-${index}`}>
                            <span className="tree-node">{node}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "data" && (
        <section className="bio-section">
          <div className="bio-shell">
            <SectionHeading
              eyebrow="Biology data lab"
              title="Numbers become evidence only after interpretation."
              text="Enter observations, inspect the pattern and ask what the data actually supports. This is the bridge from practical notebook to scientific argument."
            />

            <div className="data-layout">
              <div className="lab-card">
                <h3>Observation table</h3>
                <p>
                  Example: measured response across five experimental
                  conditions. Edit the observations and watch the graph update.
                </p>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Condition</th>
                      <th>Response</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataValues.map((value, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={value}
                            onChange={(e) =>
                              updateDataPoint(index, Number(e.target.value))
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="metric-grid">
                  <div className="metric">
                    <span>Mean</span>
                    <strong>
                      {(
                        dataValues.reduce((sum, value) => sum + value, 0) /
                        dataValues.length
                      ).toFixed(1)}
                    </strong>
                  </div>
                  <div className="metric">
                    <span>Minimum</span>
                    <strong>{Math.min(...dataValues)}</strong>
                  </div>
                  <div className="metric">
                    <span>Maximum</span>
                    <strong>{Math.max(...dataValues)}</strong>
                  </div>
                </div>
              </div>

              <div className="lab-card">
                <h3>Response graph</h3>
                <p>
                  A visual pattern is a starting point. It is not automatically
                  a causal explanation.
                </p>

                <div className="chart">
                  {dataValues.map((value, index) => (
                    <div className="chart-column" key={index}>
                      <div
                        className="chart-bar"
                        style={{ height: `${(value / dataMax) * 100}%` }}
                      />
                      <span>{index + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bio-panel" style={{ marginTop: 16 }}>
              <div className="bio-panel-header">
                <div>
                  <h3>Inference checklist</h3>
                  <p>Use these before turning a graph into a conclusion.</p>
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 12,
                  padding: 18,
                }}
              >
                {[
                  ["Pattern", "What trend or relationship is visible?"],
                  ["Evidence", "Which measurements support the claim?"],
                  ["Limitation", "What else could explain the observation?"],
                ].map(([title, text]) => (
                  <div className="bio-mini-card" key={title}>
                    <span>{title}</span>
                    <strong>{text}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeTab === "practice" && (
        <section className="bio-section">
          <div className="bio-shell">
            <SectionHeading
              eyebrow="CBSE practice"
              title="Recall less. Reason more."
              text="The practice engine separates direct knowledge from application and analysis. The goal is not to make the green tick appear. The goal is to make the explanation survive scrutiny."
            />

            <div className="practice-layout">
              <div className="question-card">
                <span className="question-number">
                  Question {questionIndex + 1} / {questions.length}
                </span>
                <h3>{questions[questionIndex].prompt}</h3>

                {questions[questionIndex].options.map((option, index) => {
                  const isCorrect = index === questions[questionIndex].answer;
                  const selected = selectedAnswer === index;
                  return (
                    <button
                      key={option}
                      className={`option ${selected ? "selected" : ""} ${
                        showAnswer && isCorrect ? "correct" : ""
                      }`}
                      onClick={() => {
                        setSelectedAnswer(index);
                        setShowAnswer(true);
                      }}
                    >
                      <span className="option-letter">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}

                {showAnswer && (
                  <div className="explanation">
                    <strong>
                      {selectedAnswer === questions[questionIndex].answer
                        ? "Correct."
                        : "Not quite."}
                    </strong>{" "}
                    {questions[questionIndex].explanation}
                  </div>
                )}

                <div style={{ marginTop: 20 }}>
                  <button className="bio-button primary" onClick={nextQuestion}>
                    Next question →
                  </button>
                </div>
              </div>

              <aside className="practice-side">
                <span className="bio-eyebrow">How to use this</span>
                <strong>Three layers of practice</strong>
                <p>
                  <b>Recall:</b> names, terms, structures and definitions.
                </p>
                <p>
                  <b>Apply:</b> use concepts in unfamiliar situations.
                </p>
                <p>
                  <b>Analyse:</b> interpret evidence, compare explanations and
                  justify conclusions.
                </p>
                <div className="bio-mini-card">
                  <span>Rule</span>
                  <strong>
                    If you cannot explain why the answer follows, you probably
                    memorised the answer rather than the concept.
                  </strong>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}

      <footer className="bio-footer">
        <div className="bio-shell">
          Biology Tools · VGB Student Council Portal · Class XI · 2026–27
        </div>
      </footer>
    </main>
  );
}
