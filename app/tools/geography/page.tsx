"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Sphere,
  ZoomableGroup,
} from "react-simple-maps";

type MapScope = "India" | "World";
type ClassLevel = "XI" | "XII" | "Both";
type Layer =
  | "Political"
  | "Physiography"
  | "Drainage"
  | "Climate"
  | "Resources"
  | "Transport"
  | "Population";

type ExplorerMode = "Explore" | "Practice";
type PracticeMode = "Locate" | "Identify" | "Mark" | "Quiz";

type Coordinates = [number, number];
type GeometryType = "Point" | "LineString" | "Polygon";

type GeoFeature = {
  id: string;
  name: string;
  geometry: {
    type: GeometryType;
    coordinates: Coordinates | Coordinates[] | Coordinates[][];
  };
  geometryType: GeometryType;
  scope: MapScope;
  classes: ClassLevel[];
  layers: Layer[];
  category: string;
  chapter: string;
  description: string;
  coordinates: Coordinates;
  color?: string;
};

type PracticeQuestion = {
  id: string;
  prompt: string;
  answer: string;
  scope: MapScope;
  level: "XI" | "XII";
  category: string;
  options: string[];
  explanation: string;
  coordinates: Coordinates;
  tolerance?: number;
};

/* -------------------------------------------------------------------------- */
/* MAP SOURCES                                                                */
/* -------------------------------------------------------------------------- */

const WORLD_GEO =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const INDIA_GEO =
  "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson";

/* -------------------------------------------------------------------------- */
/* SMALL GEOJSON HELPERS                                                      */
/* -------------------------------------------------------------------------- */

const point = (
  id: string,
  name: string,
  coordinates: Coordinates,
  scope: MapScope,
  classes: ClassLevel[],
  layers: Layer[],
  category: string,
  chapter: string,
  description: string
): GeoFeature => ({
  id,
  name,
  coordinates,
  geometry: { type: "Point", coordinates },
  geometryType: "Point",
  scope,
  classes,
  layers,
  category,
  chapter,
  description,
});

const line = (
  id: string,
  name: string,
  coordinates: Coordinates[],
  scope: MapScope,
  classes: ClassLevel[],
  layers: Layer[],
  category: string,
  chapter: string,
  description: string,
  color?: string
): GeoFeature => ({
  id,
  name,
  coordinates: coordinates[0],
  geometry: { type: "LineString", coordinates },
  geometryType: "LineString",
  scope,
  classes,
  layers,
  category,
  chapter,
  description,
  color,
});

const polygon = (
  id: string,
  name: string,
  coordinates: Coordinates[][],
  scope: MapScope,
  classes: ClassLevel[],
  layers: Layer[],
  category: string,
  chapter: string,
  description: string,
  color?: string
): GeoFeature => ({
  id,
  name,
  coordinates: coordinates[0][0],
  geometry: { type: "Polygon", coordinates },
  geometryType: "Polygon",
  scope,
  classes,
  layers,
  category,
  chapter,
  description,
  color,
});

/* -------------------------------------------------------------------------- */
/* INDIA CLASS XI: PHYSICAL ENVIRONMENT + MAP WORK                           */
/* -------------------------------------------------------------------------- */

const indiaFeatures: GeoFeature[] = [
  // Physiographic regions
  polygon(
    "india-himalayas",
    "Himalayas",
    [[
      [73, 35], [78, 35.8], [84, 35.5], [90, 34.8], [96, 32.8],
      [95, 29.5], [89, 28.5], [83, 29.2], [77, 30], [73, 31.2], [73, 35],
    ]],
    "India", ["XI"], ["Physiography", "Climate"], "Mountain system",
    "XI · India Physical Environment · Structure & Physiography",
    "The northern mountain system of India, represented here as a spatial region rather than a single point."
  ),
  polygon(
    "india-deccan",
    "Deccan Plateau",
    [[
      [73, 21.5], [77, 22.5], [82, 22], [86, 20], [85, 15],
      [82, 12], [76, 13], [73, 16], [73, 21.5],
    ]],
    "India", ["XI"], ["Physiography", "Resources"], "Plateau",
    "XI · India Physical Environment · Structure & Physiography",
    "A broad plateau region of peninsular India, bounded broadly by the Western and Eastern Ghats."
  ),
  polygon(
    "india-thar",
    "Thar Desert",
    [[
      [68.5, 30], [73.5, 30], [76, 28], [74, 24], [69, 24],
      [68.5, 30],
    ]],
    "India", ["XI"], ["Physiography", "Climate"], "Desert",
    "XI · India Physical Environment · Structure & Physiography",
    "The arid region of northwestern India, centred mainly on Rajasthan."
  ),
  polygon(
    "india-northern-plain",
    "Northern Plain",
    [[
      [74, 30], [79, 31], [86, 29], [92, 29], [95, 27],
      [91, 24], [84, 24], [77, 26], [74, 30],
    ]],
    "India", ["XI"], ["Physiography", "Drainage"], "Plain",
    "XI · India Physical Environment · Structure & Physiography",
    "The extensive alluvial plain associated with the Himalayan river systems."
  ),
  polygon(
    "india-meghalaya-plateau",
    "Meghalaya Plateau",
    [[
      [89, 26.5], [93, 26.8], [93, 24], [90, 24], [89, 26.5],
    ]],
    "India", ["XI"], ["Physiography"], "Plateau",
    "XI · India Physical Environment · Structure & Physiography",
    "A plateau region of northeastern India."
  ),
  polygon(
    "india-malva-plateau",
    "Malwa Plateau",
    [[
      [73.5, 25], [79, 25], [80, 22], [75, 21], [73.5, 25],
    ]],
    "India", ["XI"], ["Physiography"], "Plateau",
    "XI · India Physical Environment · Structure & Physiography",
    "A plateau region of central-western India."
  ),

  // Ranges
  line(
    "india-western-ghats",
    "Western Ghats",
    [[
      [74.8, 21], [74, 19], [73.5, 17], [73.2, 15], [73.3, 13],
      [74, 11], [76, 9],
    ]],
    "India", ["XI"], ["Physiography", "Climate"], "Mountain range",
    "XI · India Physical Environment · Structure & Physiography",
    "A mountain range running broadly parallel to India's western coast."
  ),
  line(
    "india-eastern-ghats",
    "Eastern Ghats",
    [[
      [78, 20], [80, 18], [80.5, 16], [80, 14], [79, 12],
    ]],
    "India", ["XI"], ["Physiography"], "Mountain range",
    "XI · India Physical Environment · Structure & Physiography",
    "Discontinuous hill ranges along parts of the eastern side of peninsular India."
  ),
  line(
    "india-aravalli",
    "Aravalli Range",
    [[
      [72.5, 27], [73.5, 25.5], [74.5, 24], [75, 23],
    ]],
    "India", ["XI"], ["Physiography"], "Mountain range",
    "XI · India Physical Environment · Structure & Physiography",
    "An ancient mountain system extending through northwestern India."
  ),
  line(
    "india-vindhya",
    "Vindhya Range",
    [[
      [74, 24], [78, 24], [82, 24.5], [85, 24],
    ]],
    "India", ["XI"], ["Physiography"], "Mountain range",
    "XI · India Physical Environment · Structure & Physiography",
    "A major highland system of central India."
  ),
  line(
    "india-satpura",
    "Satpura Range",
    [[
      [74, 22], [78, 21], [82, 21], [85, 21],
    ]],
    "India", ["XI"], ["Physiography"], "Mountain range",
    "XI · India Physical Environment · Structure & Physiography",
    "A major range of central India lying broadly south of the Narmada."
  ),

  // Major rivers as lines
  line(
    "river-ganga",
    "Ganga",
    [[
      [78.4, 30.1], [80, 28.8], [82, 27], [84, 25.5],
      [86, 25.2], [88, 24.5], [89.8, 23.8],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A major Himalayan river system flowing across the northern plains."
  ),
  line(
    "river-yamuna",
    "Yamuna",
    [[
      [78.4, 31], [78, 30], [77.5, 29], [77.3, 28],
      [77.7, 27], [79, 26],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A major tributary of the Ganga."
  ),
  line(
    "river-brahmaputra",
    "Brahmaputra",
    [[
      [91, 30], [92, 29], [93, 28], [94, 27], [91, 26],
      [89, 25.5],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A major Himalayan river entering India through the northeast."
  ),
  line(
    "river-indus",
    "Indus",
    [[
      [78, 34], [77, 33], [76, 32], [75, 31], [74, 30],
      [73, 29],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "One of the major Himalayan river systems associated with northwestern India."
  ),
  line(
    "river-narmada",
    "Narmada",
    [[
      [81.8, 22.7], [80, 22.5], [78, 22.4], [76, 22.1], [74, 21.8],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A major west-flowing peninsular river associated with a rift valley."
  ),
  line(
    "river-tapti",
    "Tapti",
    [[
      [78.5, 21.8], [77, 21.4], [75.5, 21.1], [73.2, 21],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A west-flowing peninsular river."
  ),
  line(
    "river-godavari",
    "Godavari",
    [[
      [80, 19.8], [81, 19], [82.5, 18.8], [84, 18.5], [86.7, 17],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A major east-flowing peninsular river."
  ),
  line(
    "river-krishna",
    "Krishna",
    [[
      [75.7, 16.8], [78, 16.5], [80, 16.2], [82.2, 15.8],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A major east-flowing peninsular river."
  ),
  line(
    "river-kaveri",
    "Kaveri",
    [[
      [75.7, 12.4], [77, 12], [78.5, 11.8], [80.3, 11.5],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A major peninsular river flowing towards the Bay of Bengal."
  ),
  line(
    "river-mahanadi",
    "Mahanadi",
    [[
      [82.2, 21.2], [83.5, 20.5], [84.5, 20], [85.8, 19],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A major east-flowing river of central-eastern India."
  ),
  line(
    "river-damodar",
    "Damodar",
    [[
      [84, 24], [85, 23.5], [86, 23.7], [87, 23.5],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A river of eastern India associated with the Chota Nagpur region."
  ),
  line(
    "river-chambal",
    "Chambal",
    [[
      [76.3, 24], [77.5, 25], [78.5, 26], [79.5, 26.5],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A major tributary of the Yamuna."
  ),
  line(
    "river-luni",
    "Luni",
    [[
      [74.5, 26.8], [73.5, 26], [72.5, 25.5], [71.2, 25],
    ]],
    "India", ["XI"], ["Drainage"], "River",
    "XI · India Physical Environment · Drainage",
    "A major river of the arid region of Rajasthan."
  ),

  // Lakes
  polygon(
    "lake-wular",
    "Wular Lake",
    [[[
      [74.5, 34.3], [75.1, 34.4], [75.3, 34], [74.8, 33.8],
      [74.5, 34.3],
    ]]],
    "India", ["XI"], ["Drainage"], "Lake",
    "XI · India Physical Environment · Drainage",
    "A major freshwater lake in Jammu and Kashmir."
  ),
  polygon(
    "lake-sambhar",
    "Sambhar Lake",
    [[[
      [74.8, 26.9], [75.3, 27], [75.5, 26.6], [75, 26.5],
      [74.8, 26.9],
    ]]],
    "India", ["XI"], ["Drainage", "Resources"], "Lake",
    "XI · India Physical Environment · Drainage",
    "A large inland saline lake in Rajasthan."
  ),
  polygon(
    "lake-chilika",
    "Chilika Lake",
    [[[
      [85, 19.9], [86, 20], [86.8, 19.7], [86.2, 19.3],
      [85.2, 19.5], [85, 19.9],
    ]]],
    "India", ["XI"], ["Drainage"], "Lake",
    "XI · India Physical Environment · Drainage",
    "A major coastal lagoon on the Odisha coast."
  ),
  polygon(
    "lake-pulicat",
    "Pulicat Lake",
    [[[
      [80, 13.9], [80.5, 14.2], [80.7, 13.6], [80.2, 13.3],
      [80, 13.9],
    ]]],
    "India", ["XI"], ["Drainage"], "Lake",
    "XI · India Physical Environment · Drainage",
    "A coastal lagoon on the southeastern coast."
  ),
  polygon(
    "lake-vembanad",
    "Vembanad",
    [[[
      [76, 10.2], [76.7, 10.3], [76.8, 9.5], [76.2, 9],
      [76, 10.2],
    ]]],
    "India", ["XI"], ["Drainage"], "Lake",
    "XI · India Physical Environment · Drainage",
    "A major backwater-lake system of Kerala."
  ),

  // Points: extent, peaks, passes, islands, bays and climatic extremes
  point("india-kanyakumari", "Kanyakumari", [77.55, 8.08], "India", ["XI"], ["Political"], "Location", "XI · India Physical Environment · India Location", "The southern extremity of mainland India."),
  point("india-standard-meridian", "Standard Meridian", [82.5, 25.5], "India", ["XI"], ["Political"], "Longitude", "XI · Practical Geography · Latitude, Longitude & Time", "India's Standard Meridian is 82°30′E."),
  point("india-tropic-cancer", "Tropic of Cancer", [78, 23.44], "India", ["XI"], ["Climate"], "Latitude", "XI · India Physical Environment · India Location", "The Tropic of Cancer crosses India at about 23°30′N."),
  point("india-k2", "K2", [76.5, 35.9], "India", ["XI"], ["Physiography"], "Peak", "XI · India Physical Environment · Structure & Physiography", "A major high peak of the Karakoram."),
  point("india-kanchenjunga", "Kanchenjunga", [88.15, 27.7], "India", ["XI"], ["Physiography"], "Peak", "XI · India Physical Environment · Structure & Physiography", "A major Himalayan peak."),
  point("india-nanda-devi", "Nanda Devi", [79.97, 30.38], "India", ["XI"], ["Physiography"], "Peak", "XI · India Physical Environment · Structure & Physiography", "A major Himalayan peak in Uttarakhand."),
  point("india-nanga-parbat", "Nanga Parbat", [74.6, 35.2], "India", ["XI"], ["Physiography"], "Peak", "XI · India Physical Environment · Structure & Physiography", "A major peak of the northwestern Himalaya."),
  point("india-namcha-barwa", "Namcha Barwa", [95.0, 29.6], "India", ["XI"], ["Physiography"], "Peak", "XI · India Physical Environment · Structure & Physiography", "A major peak near the eastern Himalaya."),
  point("india-anaimudi", "Anaimudi", [77.06, 10.17], "India", ["XI"], ["Physiography"], "Peak", "XI · India Physical Environment · Structure & Physiography", "A major peak of the southern Western Ghats."),
  point("india-shipkila", "Shipki La", [78.65, 31.3], "India", ["XI"], ["Physiography"], "Pass", "XI · India Physical Environment · Structure & Physiography", "A mountain pass in Himachal Pradesh."),
  point("india-nathula", "Nathu La", [88.85, 27.4], "India", ["XI"], ["Physiography"], "Pass", "XI · India Physical Environment · Structure & Physiography", "A mountain pass in Sikkim."),
  point("india-palghat", "Palghat Gap", [76.7, 10.75], "India", ["XI"], ["Physiography"], "Pass", "XI · India Physical Environment · Structure & Physiography", "A major gap between the Nilgiri and Anaimalai hills."),
  point("india-bhor", "Bhor Ghat", [73.35, 18.8], "India", ["XI"], ["Physiography"], "Pass", "XI · India Physical Environment · Structure & Physiography", "A mountain pass/gap in the Western Ghats."),
  point("india-thal", "Thal Ghat", [73.55, 19.9], "India", ["XI"], ["Physiography"], "Pass", "XI · India Physical Environment · Structure & Physiography", "A mountain pass/gap in the Western Ghats."),
  point("india-andaman", "Andaman & Nicobar Islands", [92.7, 11.7], "India", ["XI"], ["Physiography", "Resources"], "Island group", "XI · India Physical Environment · Structure & Physiography", "An island group in the Bay of Bengal."),
  point("india-lakshadweep", "Lakshadweep", [72.8, 10.5], "India", ["XI"], ["Physiography"], "Island group", "XI · India Physical Environment · Structure & Physiography", "An island group in the Arabian Sea."),
  point("india-palk", "Palk Strait", [79.2, 9.3], "India", ["XI"], ["Physiography"], "Strait", "XI · India Physical Environment · Structure & Physiography", "A strait between India and Sri Lanka."),
  point("india-gulf-kachchh", "Gulf of Kachchh", [69.7, 22.6], "India", ["XI"], ["Physiography"], "Gulf", "XI · India Physical Environment · Structure & Physiography", "A gulf on India's northwestern coast."),
  point("india-gulf-mannar", "Gulf of Mannar", [78.9, 8.9], "India", ["XI"], ["Physiography"], "Gulf", "XI · India Physical Environment · Structure & Physiography", "A gulf between southeastern India and Sri Lanka."),
  point("india-gulf-khambat", "Gulf of Khambat", [72.2, 21.8], "India", ["XI"], ["Physiography"], "Gulf", "XI · India Physical Environment · Structure & Physiography", "A gulf on the Gujarat coast."),
  point("india-rann", "Rann of Kachchh", [69.8, 23.8], "India", ["XI"], ["Physiography"], "Salt marsh", "XI · India Physical Environment · Structure & Physiography", "A salt-marsh region in Gujarat."),
  point("india-high-rainfall", "Highest Rainfall Area", [91.6, 25.3], "India", ["XI"], ["Climate"], "Climate extreme", "XI · India Physical Environment · Climate", "The Meghalaya region is associated with very high annual rainfall."),
  point("india-low-rainfall", "Low Rainfall Area", [70.5, 26.8], "India", ["XI"], ["Climate"], "Climate extreme", "XI · India Physical Environment · Climate", "The western Rajasthan region receives very low rainfall."),
];

/* -------------------------------------------------------------------------- */
/* WORLD CLASS XI MAP WORK                                                    */
/* -------------------------------------------------------------------------- */

const worldFeatures: GeoFeature[] = [
  // Major deserts
  polygon(
    "world-sahara",
    "Sahara",
    [[[
      [-17, 28], [-10, 35], [10, 35], [30, 31], [37, 22],
      [30, 15], [10, 15], [-5, 20], [-17, 28],
    ]]],
    "World", ["XI"], ["Physiography", "Climate"], "Hot desert",
    "XI · World Map Work · Major Hot Deserts",
    "The major hot desert belt of northern Africa."
  ),
  polygon(
    "world-gobi",
    "Gobi",
    [[[
      [95, 44], [105, 48], [116, 47], [120, 42], [111, 39],
      [101, 40], [95, 44],
    ]]],
    "World", ["XI"], ["Physiography", "Climate"], "Hot desert",
    "XI · World Map Work · Major Hot Deserts",
    "A major desert region of Mongolia and northern China."
  ),
  polygon(
    "world-mojave",
    "Mojave",
    [[[
      [-118, 37], [-113, 37], [-113, 34], [-117, 32],
      [-120, 34], [-118, 37],
    ]]],
    "World", ["XI"], ["Physiography", "Climate"], "Hot desert",
    "XI · World Map Work · Major Hot Deserts",
    "A desert of the southwestern United States."
  ),
  polygon(
    "world-great-victoria",
    "Great Victoria Desert",
    [[[
      [122, -27], [135, -26], [137, -30], [128, -34],
      [120, -31], [122, -27],
    ]]],
    "World", ["XI"], ["Physiography", "Climate"], "Hot desert",
    "XI · World Map Work · Major Hot Deserts",
    "A large desert region of Australia."
  ),
  polygon(
    "world-patagonian",
    "Patagonian Desert",
    [[[
      [-73, -39], [-65, -39], [-64, -48], [-70, -50],
      [-74, -45], [-73, -39],
    ]]],
    "World", ["XI"], ["Physiography", "Climate"], "Desert",
    "XI · World Map Work · Major Hot Deserts",
    "A major arid region of southern South America."
  ),

  // Oceans and seas
  point("world-indian-ocean", "Indian Ocean", [80, -20], "World", ["XI"], ["Climate"], "Ocean", "XI · World Map Work · Major Oceans", "A major ocean south of Asia."),
  point("world-pacific-ocean", "Pacific Ocean", [-150, 0], "World", ["XI"], ["Climate"], "Ocean", "XI · World Map Work · Major Oceans", "The largest ocean basin."),
  point("world-atlantic-ocean", "Atlantic Ocean", [-30, 15], "World", ["XI"], ["Climate"], "Ocean", "XI · World Map Work · Major Oceans", "An ocean between the Americas and Europe/Africa."),
  point("world-arctic-ocean", "Arctic Ocean", [0, 85], "World", ["XI"], ["Climate"], "Ocean", "XI · World Map Work · Major Oceans", "The ocean surrounding the Arctic region."),
  point("world-southern-ocean", "Southern Ocean", [0, -65], "World", ["XI"], ["Climate"], "Ocean", "XI · World Map Work · Major Oceans", "The ocean surrounding Antarctica."),
  point("world-black-sea", "Black Sea", [35, 43], "World", ["XI"], ["Climate"], "Sea", "XI · World Map Work · Major Seas", "A sea between southeastern Europe and western Asia."),
  point("world-baltic", "Baltic Sea", [20, 58], "World", ["XI"], ["Climate"], "Sea", "XI · World Map Work · Major Seas", "A sea of northern Europe."),
  point("world-caspian", "Caspian Sea", [51, 41], "World", ["XI"], ["Climate"], "Sea", "XI · World Map Work · Major Seas", "The world's largest inland body of water."),
  point("world-mediterranean", "Mediterranean Sea", [17, 36], "World", ["XI"], ["Climate"], "Sea", "XI · World Map Work · Major Seas", "A sea between Europe, Africa and Asia."),
  point("world-red-sea", "Red Sea", [39, 20], "World", ["XI"], ["Climate"], "Sea", "XI · World Map Work · Major Seas", "A sea between northeastern Africa and the Arabian Peninsula."),
  point("world-north-sea", "North Sea", [3, 56], "World", ["XI"], ["Climate"], "Sea", "XI · World Map Work · Major Seas", "A sea of northwestern Europe."),
  point("world-bay-fundy", "Bay of Fundy", [-65, 45], "World", ["XI"], ["Climate"], "Bay", "XI · World Map Work · Major Seas", "A major tidal bay on Canada's Atlantic coast."),

  // Plates / physical features
  point("world-ring-fire", "Ring of Fire", [-120, 5], "World", ["XI"], ["Physiography", "Climate"], "Tectonic belt", "XI · World Map Work · Lithospheric Plates", "A broad belt of frequent volcanic and seismic activity around the Pacific."),
  line(
    "world-mid-atlantic",
    "Mid-Atlantic Ridge",
    [[-35, 65], [-30, 30], [-25, 0], [-20, -30], [-15, -55]],
    "World", ["XI"], ["Physiography"], "Plate boundary",
    "XI · World Map Work · Lithospheric Plates",
    "A major submarine ridge associated with seafloor spreading."
  ),

  // Currents
  line("current-humboldt", "Humboldt Current", [[-80, -5], [-78, -20], [-76, -35]], "World", ["XI"], ["Climate"], "Cold current", "XI · World Map Work · Ocean Currents", "Cold current along the west coast of South America."),
  line("current-california", "California Current", [[-130, 45], [-125, 35], [-120, 25]], "World", ["XI"], ["Climate"], "Cold current", "XI · World Map Work · Ocean Currents", "Cold current along western North America."),
  line("current-gulf-stream", "Gulf Stream", [[-75, 35], [-55, 40], [-35, 45], [-20, 50]], "World", ["XI"], ["Climate"], "Warm current", "XI · World Map Work · Ocean Currents", "A major warm current in the North Atlantic."),
  line("current-kuroshio", "Kuroshio Current", [[130, 20], [140, 30], [150, 35]], "World", ["XI"], ["Climate"], "Warm current", "XI · World Map Work · Ocean Currents", "A warm western boundary current of the North Pacific."),
  line("current-agulhas", "Agulhas Current", [[35, -20], [38, -30], [30, -38]], "World", ["XI"], ["Climate"], "Warm current", "XI · World Map Work · Ocean Currents", "A warm current along southeastern Africa."),
  line("current-labrador", "Labrador Current", [[-55, 60], [-55, 50], [-50, 45]], "World", ["XI"], ["Climate"], "Cold current", "XI · World Map Work · Ocean Currents", "A cold current in the western North Atlantic."),

  // Hotspot points
  point("hotspot-eastern-himalaya", "Eastern Himalaya", [89, 27], "World", ["XI"], ["Climate"], "Ecological hotspot", "XI · World Map Work · Ecological Hotspots", "An ecological hotspot region associated with high biodiversity."),
  point("hotspot-western-ghats", "Western Ghats", [75, 15], "World", ["XI"], ["Climate"], "Ecological hotspot", "XI · World Map Work · Ecological Hotspots", "A globally significant biodiversity hotspot in India."),
  point("hotspot-indonesia", "Indonesia", [117, -2], "World", ["XI"], ["Climate"], "Ecological hotspot", "XI · World Map Work · Ecological Hotspots", "A biodiversity-rich tropical region."),
  point("hotspot-madagascar", "Eastern Madagascar", [49, -19], "World", ["XI"], ["Climate"], "Ecological hotspot", "XI · World Map Work · Ecological Hotspots", "A major biodiversity hotspot."),
  point("hotspot-tropical-andes", "Tropical Andes", [-76, -5], "World", ["XI"], ["Climate"], "Ecological hotspot", "XI · World Map Work · Ecological Hotspots", "A biodiversity hotspot along the tropical Andes."),

  // Human geography map-work points from XII
  point("port-london", "London", [-0.1, 51.5], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major European port."),
  point("port-hamburg", "Hamburg", [10, 53.5], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major European port."),
  point("port-vancouver", "Vancouver", [-123.1, 49.3], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major North American port."),
  point("port-san-francisco", "San Francisco", [-122.4, 37.8], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major North American port."),
  point("port-new-orleans", "New Orleans", [-90.1, 29.95], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major North American port."),
  point("port-rio", "Rio de Janeiro", [-43.2, -22.9], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major South American port."),
  point("port-valparaiso", "Valparaiso", [-71.6, -33], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major South American port."),
  point("port-suez", "Suez", [32.55, 29.97], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major port associated with the Suez Canal."),
  point("port-cape-town", "Cape Town", [18.4, -33.9], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major southern African port."),
  point("port-yokohama", "Yokohama", [139.6, 35.4], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major Japanese port."),
  point("port-shanghai", "Shanghai", [121.5, 31.2], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major Chinese port."),
  point("port-hong-kong", "Hong Kong", [114.2, 22.3], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major East Asian port."),
  point("port-karachi", "Karachi", [67, 24.9], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major Pakistani port."),
  point("port-kolkata", "Kolkata", [88.36, 22.57], "World", ["XII"], ["Transport"], "Port", "XII · World Map Work · Major Ports", "Major Indian port."),
  point("airport-tokyo", "Tokyo", [139.7, 35.7], "World", ["XII"], ["Transport"], "Airport", "XII · World Map Work · Airports", "Major Asian aviation centre."),
  point("airport-beijing", "Beijing", [116.4, 39.9], "World", ["XII"], ["Transport"], "Airport", "XII · World Map Work · Airports", "Major Asian aviation centre."),
  point("airport-mumbai", "Mumbai", [72.88, 19.08], "World", ["XII"], ["Transport"], "Airport", "XII · World Map Work · Airports", "Major Indian aviation centre."),
  point("airport-london", "London", [-0.1, 51.5], "World", ["XII"], ["Transport"], "Airport", "XII · World Map Work · Airports", "Major European aviation centre."),
  point("airport-chicago", "Chicago", [-87.63, 41.88], "World", ["XII"], ["Transport"], "Airport", "XII · World Map Work · Airports", "Major North American aviation centre."),
  point("airport-sydney", "Sydney", [151.2, -33.9], "World", ["XII"], ["Transport"], "Airport", "XII · World Map Work · Airports", "Major Australian aviation centre."),
];

/* -------------------------------------------------------------------------- */
/* CLASS XII INDIA MAP WORK                                                   */
/* -------------------------------------------------------------------------- */

const indiaHumanFeatures: GeoFeature[] = [
  point("india-density-high", "Highest Population Density State (2011)", [88.3, 26.1], "India", ["XII"], ["Population"], "Population", "XII · India People & Economy · Population", "Bihar had the highest population density among Indian states in the 2011 Census."),
  point("india-density-low", "Lowest Population Density State (2011)", [86, 28], "India", ["XII"], ["Population"], "Population", "XII · India People & Economy · Population", "Arunachal Pradesh had the lowest population density among Indian states in the 2011 Census."),
  point("crop-rice", "Leading Rice Region", [82, 23], "India", ["XII"], ["Resources"], "Crop", "XII · India People & Economy · Land Resources & Agriculture", "A major rice-producing belt of India."),
  point("crop-wheat", "Leading Wheat Region", [80, 29], "India", ["XII"], ["Resources"], "Crop", "XII · India People & Economy · Land Resources & Agriculture", "A major wheat-producing belt of northern India."),
  point("crop-cotton", "Leading Cotton Region", [75, 21], "India", ["XII"], ["Resources"], "Crop", "XII · India People & Economy · Land Resources & Agriculture", "A major cotton-producing belt of western and central India."),
  point("crop-jute", "Leading Jute Region", [88, 24], "India", ["XII"], ["Resources"], "Crop", "XII · India People & Economy · Land Resources & Agriculture", "A major jute-producing region of eastern India."),
  point("crop-sugarcane", "Leading Sugarcane Region", [80, 27], "India", ["XII"], ["Resources"], "Crop", "XII · India People & Economy · Land Resources & Agriculture", "A major sugarcane-producing belt of northern India."),
  point("crop-tea", "Leading Tea Region", [94, 27], "India", ["XII"], ["Resources"], "Crop", "XII · India People & Economy · Land Resources & Agriculture", "A major tea-producing region of northeastern India."),
  point("crop-coffee", "Leading Coffee Region", [76, 13], "India", ["XII"], ["Resources"], "Crop", "XII · India People & Economy · Land Resources & Agriculture", "A major coffee-producing region of southern India."),

  // Mines
  point("mine-mayurbhanj", "Mayurbhanj Iron Ore", [86.7, 21.9], "India", ["XII"], ["Resources"], "Iron ore", "XII · India People & Economy · Mineral & Energy Resources", "An important iron ore location listed in the syllabus."),
  point("mine-bailadila", "Bailadila Iron Ore", [81.2, 18.6], "India", ["XII"], ["Resources"], "Iron ore", "XII · India People & Economy · Mineral & Energy Resources", "An important iron ore location listed in the syllabus."),
  point("mine-ratnagiri", "Ratnagiri Iron Ore", [73.3, 16.9], "India", ["XII"], ["Resources"], "Iron ore", "XII · India People & Economy · Mineral & Energy Resources", "An iron ore location listed in the syllabus."),
  point("mine-bellary", "Bellary Iron Ore", [76.9, 15.1], "India", ["XII"], ["Resources"], "Iron ore", "XII · India People & Economy · Mineral & Energy Resources", "An important iron ore location listed in the syllabus."),
  point("mine-balaghat", "Balaghat Manganese", [80.2, 21.8], "India", ["XII"], ["Resources"], "Manganese", "XII · India People & Economy · Mineral & Energy Resources", "A manganese location listed in the syllabus."),
  point("mine-shimoga", "Shimoga Manganese", [75.6, 14], "India", ["XII"], ["Resources"], "Manganese", "XII · India People & Economy · Mineral & Energy Resources", "A manganese location listed in the syllabus."),
  point("mine-hazaribagh", "Hazaribagh Copper", [85.4, 23.9], "India", ["XII"], ["Resources"], "Copper", "XII · India People & Economy · Mineral & Energy Resources", "A copper location listed in the syllabus."),
  point("mine-singhbhum", "Singhbhum Copper", [86, 22.6], "India", ["XII"], ["Resources"], "Copper", "XII · India People & Economy · Mineral & Energy Resources", "A copper location listed in the syllabus."),
  point("mine-khetri", "Khetri Copper", [75.8, 28.0], "India", ["XII"], ["Resources"], "Copper", "XII · India People & Economy · Mineral & Energy Resources", "A copper location listed in the syllabus."),
  point("mine-katni", "Katni Bauxite", [80.4, 23.8], "India", ["XII"], ["Resources"], "Bauxite", "XII · India People & Economy · Mineral & Energy Resources", "A bauxite location listed in the syllabus."),
  point("mine-bilaspur", "Bilaspur Bauxite", [82.2, 22.1], "India", ["XII"], ["Resources"], "Bauxite", "XII · India People & Economy · Mineral & Energy Resources", "A bauxite location listed in the syllabus."),
  point("mine-koraput", "Koraput Bauxite", [82.7, 19.2], "India", ["XII"], ["Resources"], "Bauxite", "XII · India People & Economy · Mineral & Energy Resources", "A bauxite location listed in the syllabus."),
  point("mine-jharia", "Jharia Coalfield", [86.4, 23.7], "India", ["XII"], ["Resources"], "Coal", "XII · India People & Economy · Mineral & Energy Resources", "A major coalfield listed in the syllabus."),
  point("mine-bokaro", "Bokaro Coalfield", [85.9, 23.7], "India", ["XII"], ["Resources"], "Coal", "XII · India People & Economy · Mineral & Energy Resources", "A major coalfield listed in the syllabus."),
  point("mine-raniganj", "Raniganj Coalfield", [87.1, 23.6], "India", ["XII"], ["Resources"], "Coal", "XII · India People & Economy · Mineral & Energy Resources", "A major coalfield listed in the syllabus."),
  point("mine-neyveli", "Neyveli Lignite", [79.5, 11.6], "India", ["XII"], ["Resources"], "Lignite", "XII · India People & Economy · Mineral & Energy Resources", "A lignite location listed in the syllabus."),

  // Ports
  point("port-kandla", "Kandla", [70.2, 23], "India", ["XII"], ["Transport"], "Port", "XII · India People & Economy · Transport & Communication", "Major port listed in the syllabus."),
  point("port-mumbai", "Mumbai Port", [72.84, 18.95], "India", ["XII"], ["Transport"], "Port", "XII · India People & Economy · Transport & Communication", "Major port listed in the syllabus."),
  point("port-marmagao", "Marmagao", [73.8, 15.4], "India", ["XII"], ["Transport"], "Port", "XII · India People & Economy · Transport & Communication", "Major port listed in the syllabus."),
  point("port-kochi", "Kochi", [76.3, 9.97], "India", ["XII"], ["Transport"], "Port", "XII · India People & Economy · Transport & Communication", "Major port listed in the syllabus."),
  point("port-mangalore", "Mangalore", [74.85, 12.9], "India", ["XII"], ["Transport"], "Port", "XII · India People & Economy · Transport & Communication", "Major port listed in the syllabus."),
  point("port-tuticorin", "Tuticorin", [78.13, 8.8], "India", ["XII"], ["Transport"], "Port", "XII · India People & Economy · Transport & Communication", "Major port listed in the syllabus."),
  point("port-chennai", "Chennai Port", [80.3, 13.1], "India", ["XII"], ["Transport"], "Port", "XII · India People & Economy · Transport & Communication", "Major port listed in the syllabus."),
  point("port-visakhapatnam", "Visakhapatnam", [83.3, 17.7], "India", ["XII"], ["Transport"], "Port", "XII · India People & Economy · Transport & Communication", "Major port listed in the syllabus."),
  point("port-paradip", "Paradip", [86.7, 20.3], "India", ["XII"], ["Transport"], "Port", "XII · India People & Economy · Transport & Communication", "Major port listed in the syllabus."),
  point("port-haldia", "Haldia", [88.1, 22], "India", ["XII"], ["Transport"], "Port", "XII · India People & Economy · Transport & Communication", "Major port listed in the syllabus."),

  // Airports
  point("airport-ahmedabad", "Ahmedabad", [72.6, 23], "India", ["XII"], ["Transport"], "Airport", "XII · India People & Economy · Transport & Communication", "Airport location listed in the syllabus."),
  point("airport-bengaluru", "Bengaluru", [77.6, 13], "India", ["XII"], ["Transport"], "Airport", "XII · India People & Economy · Transport & Communication", "Airport location listed in the syllabus."),
  point("airport-chennai", "Chennai Airport", [80.27, 13.08], "India", ["XII"], ["Transport"], "Airport", "XII · India People & Economy · Transport & Communication", "Airport location listed in the syllabus."),
  point("airport-kolkata", "Kolkata Airport", [88.45, 22.65], "India", ["XII"], ["Transport"], "Airport", "XII · India People & Economy · Transport & Communication", "Airport location listed in the syllabus."),
  point("airport-guwahati", "Guwahati", [91.6, 26.1], "India", ["XII"], ["Transport"], "Airport", "XII · India People & Economy · Transport & Communication", "Airport location listed in the syllabus."),
  point("airport-delhi", "Delhi Airport", [77.1, 28.6], "India", ["XII"], ["Transport"], "Airport", "XII · India People & Economy · Transport & Communication", "Airport location listed in the syllabus."),
  point("airport-amritsar", "Amritsar", [74.8, 31.6], "India", ["XII"], ["Transport"], "Airport", "XII · India People & Economy · Transport & Communication", "Airport location listed in the syllabus."),
  point("airport-thiruvananthapuram", "Thiruvananthapuram", [76.9, 8.5], "India", ["XII"], ["Transport"], "Airport", "XII · India People & Economy · Transport & Communication", "Airport location listed in the syllabus."),
  point("airport-hyderabad", "Hyderabad", [78.5, 17.4], "India", ["XII"], ["Transport"], "Airport", "XII · India People & Economy · Transport & Communication", "Airport location listed in the syllabus."),
];

/* -------------------------------------------------------------------------- */
/* CBSE PRACTICE DATA                                                         */
/* -------------------------------------------------------------------------- */

const practiceQuestions: PracticeQuestion[] = [
  {
    id: "india-himalayas",
    prompt: "Mark the Himalayan mountain system.",
    answer: "Himalayas",
    scope: "India",
    level: "XI",
    category: "Physiography",
    options: ["Himalayas", "Western Ghats", "Aravalli Range", "Deccan Plateau"],
    coordinates: [82, 31.5],
    tolerance: 5,
    explanation: "The Himalayas form India's major northern mountain system.",
  },
  {
    id: "india-thar",
    prompt: "Locate the Thar Desert.",
    answer: "Thar Desert",
    scope: "India",
    level: "XI",
    category: "Physiography",
    options: ["Thar Desert", "Deccan Plateau", "Northern Plain", "Meghalaya Plateau"],
    coordinates: [72, 27],
    tolerance: 5,
    explanation: "The Thar Desert occupies much of northwestern India, especially Rajasthan.",
  },
  {
    id: "india-ganga",
    prompt: "Identify the marked river.",
    answer: "Ganga",
    scope: "India",
    level: "XI",
    category: "Drainage",
    options: ["Ganga", "Narmada", "Godavari", "Brahmaputra"],
    coordinates: [84, 25.5],
    tolerance: 4,
    explanation: "The Ganga is one of the major Himalayan river systems of northern India.",
  },
  {
    id: "india-western-ghats",
    prompt: "Locate the Western Ghats.",
    answer: "Western Ghats",
    scope: "India",
    level: "XI",
    category: "Physiography",
    options: ["Western Ghats", "Eastern Ghats", "Aravalli Range", "Satpura Range"],
    coordinates: [74, 15],
    tolerance: 4,
    explanation: "The Western Ghats run broadly parallel to India's western coast.",
  },
  {
    id: "india-kanyakumari",
    prompt: "Locate Kanyakumari.",
    answer: "Kanyakumari",
    scope: "India",
    level: "XI",
    category: "Location",
    options: ["Kanyakumari", "Nathu La", "K2", "Rann of Kachchh"],
    coordinates: [77.55, 8.08],
    tolerance: 3,
    explanation: "Kanyakumari is the southern extremity of mainland India.",
  },
  {
    id: "india-nathu-la",
    prompt: "Identify the marked pass.",
    answer: "Nathu La",
    scope: "India",
    level: "XI",
    category: "Physiography",
    options: ["Nathu La", "Shipki La", "Bhor Ghat", "Palghat Gap"],
    coordinates: [88.85, 27.4],
    tolerance: 3,
    explanation: "Nathu La is a mountain pass in Sikkim.",
  },
  {
    id: "india-chilika",
    prompt: "Locate Chilika Lake.",
    answer: "Chilika Lake",
    scope: "India",
    level: "XI",
    category: "Drainage",
    options: ["Chilika Lake", "Wular Lake", "Sambhar Lake", "Pulicat Lake"],
    coordinates: [86, 19.7],
    tolerance: 3,
    explanation: "Chilika is a major coastal lagoon on the Odisha coast.",
  },
  {
    id: "world-sahara",
    prompt: "Locate the Sahara Desert.",
    answer: "Sahara",
    scope: "World",
    level: "XI",
    category: "Climate",
    options: ["Sahara", "Gobi", "Mojave", "Patagonian Desert"],
    coordinates: [13, 25],
    tolerance: 12,
    explanation: "The Sahara extends across much of northern Africa.",
  },
  {
    id: "world-equator",
    prompt: "Identify the marked latitude.",
    answer: "Equator",
    scope: "World",
    level: "XI",
    category: "Latitudes",
    options: ["Equator", "Tropic of Cancer", "Prime Meridian", "Arctic Circle"],
    coordinates: [0, 0],
    tolerance: 10,
    explanation: "The Equator represents 0° latitude.",
  },
  {
    id: "world-gulf-stream",
    prompt: "Identify the marked current.",
    answer: "Gulf Stream",
    scope: "World",
    level: "XI",
    category: "Ocean Currents",
    options: ["Gulf Stream", "Labrador Current", "California Current", "Humboldt Current"],
    coordinates: [-45, 42],
    tolerance: 10,
    explanation: "The Gulf Stream is a major warm current in the North Atlantic.",
  },
  {
    id: "india-port-mumbai",
    prompt: "Locate Mumbai Port.",
    answer: "Mumbai Port",
    scope: "India",
    level: "XII",
    category: "Transport",
    options: ["Mumbai Port", "Kandla", "Chennai Port", "Paradip"],
    coordinates: [72.84, 18.95],
    tolerance: 3,
    explanation: "Mumbai is one of the major ports listed for Class XII map work.",
  },
  {
    id: "india-mine-jharia",
    prompt: "Locate Jharia Coalfield.",
    answer: "Jharia Coalfield",
    scope: "India",
    level: "XII",
    category: "Resources",
    options: ["Jharia Coalfield", "Bokaro Coalfield", "Raniganj Coalfield", "Neyveli Lignite"],
    coordinates: [86.4, 23.7],
    tolerance: 3,
    explanation: "Jharia is one of the coal locations specified in the Class XII map work.",
  },
  {
    id: "india-crop-tea",
    prompt: "Locate the major tea-producing region.",
    answer: "Leading Tea Region",
    scope: "India",
    level: "XII",
    category: "Agriculture",
    options: ["Leading Tea Region", "Leading Wheat Region", "Leading Cotton Region", "Leading Jute Region"],
    coordinates: [94, 27],
    tolerance: 4,
    explanation: "Northeastern India is a major tea-producing region.",
  },
  {
    id: "world-port-yokohama",
    prompt: "Locate Yokohama.",
    answer: "Yokohama",
    scope: "World",
    level: "XII",
    category: "Transport",
    options: ["Yokohama", "Hamburg", "Cape Town", "Vancouver"],
    coordinates: [139.6, 35.4],
    tolerance: 8,
    explanation: "Yokohama is one of the major Asian ports listed in the Class XII map work.",
  },
];

/* -------------------------------------------------------------------------- */
/* DATA HELPERS                                                               */
/* -------------------------------------------------------------------------- */

const allFeatures = [...indiaFeatures, ...worldFeatures, ...indiaHumanFeatures];

function featureCollection(features: GeoFeature[]) {
  return {
    type: "FeatureCollection",
    features: features
      .filter((f) => f.geometryType !== "Point")
      .map((f) => ({
        type: "Feature",
        properties: {
          id: f.id,
          name: f.name,
          category: f.category,
        },
        geometry: f.geometry,
      })),
  };
}

function featureGeometry(f: GeoFeature) {
  return {
    type: "Feature",
    properties: { id: f.id, name: f.name, category: f.category },
    geometry: f.geometry,
  };
}

function distance(a: Coordinates, b: Coordinates) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchesClass(feature: GeoFeature, level: ClassLevel) {
  return (
    level === "Both" ||
    feature.classes.includes(level) ||
    feature.classes.includes("Both")
  );
}

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function GeographyLabPage() {
  const [scope, setScope] = useState<MapScope>("India");
  const [level, setLevel] = useState<ClassLevel>("XI");
  const [layer, setLayer] = useState<Layer>("Physiography");
  const [mode, setMode] = useState<ExplorerMode>("Explore");

  const [selected, setSelected] = useState<GeoFeature | null>(null);
  const [search, setSearch] = useState("");
  const [zoom, setZoom] = useState(1);

  const [practiceMode, setPracticeMode] = useState<PracticeMode>("Locate");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceResult, setPracticeResult] =
    useState<"idle" | "correct" | "wrong">("idle");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const scopedFeatures = useMemo(
    () =>
      allFeatures.filter(
        (feature) =>
          feature.scope === scope &&
          matchesClass(feature, level)
      ),
    [scope, level]
  );

  const filteredFeatures = useMemo(() => {
    const q = normalize(search.trim());

    return scopedFeatures.filter((feature) => {
      const layerMatch = feature.layers.includes(layer);
      const searchMatch =
        !q ||
        normalize(feature.name).includes(q) ||
        normalize(feature.category).includes(q) ||
        normalize(feature.chapter).includes(q);

      return layerMatch && searchMatch;
    });
  }, [scopedFeatures, layer, search]);

  const mapFeatures = useMemo(
    () => filteredFeatures.filter((feature) => feature.geometryType !== "Point"),
    [filteredFeatures]
  );

  const pointFeatures = useMemo(
    () => filteredFeatures.filter((feature) => feature.geometryType === "Point"),
    [filteredFeatures]
  );

  const practiceQuestions = useMemo(
    () =>
      practiceQuestionsData.filter(
        (question) =>
          question.scope === scope &&
          (level === "Both" || question.level === level)
      ),
    [scope, level]
  );

  const question =
    practiceQuestions.length > 0
      ? practiceQuestions[practiceIndex % practiceQuestions.length]
      : null;

  const accuracy =
    attempts === 0 ? 0 : Math.round((score / attempts) * 100);

  const projectionConfig =
    scope === "India"
      ? {
          center: [79, 22] as Coordinates,
          scale: 900,
        }
      : {
          center: [0, 10] as Coordinates,
          scale: 145,
        };

  const layerDescription: Record<Layer, string> = {
    Political: "Boundaries, locations and political geography.",
    Physiography: "Mountains, plateaus, plains, deserts, peaks and passes.",
    Drainage: "Rivers, lakes, drainage systems and water bodies.",
    Climate: "Climate-related regions, latitudes and oceanic patterns.",
    Resources: "Agriculture, minerals, energy and economic locations.",
    Transport: "Ports, airports and major transport geography.",
    Population: "Population distribution and human-geography locations.",
  };

  const layerDotClass: Record<Layer, string> = {
    Political: "bg-blue-500",
    Physiography: "bg-amber-500",
    Drainage: "bg-cyan-500",
    Climate: "bg-emerald-500",
    Resources: "bg-violet-500",
    Transport: "bg-orange-500",
    Population: "bg-pink-500",
  };

  useEffect(() => {
    setSelected(null);
    setSearch("");
    setZoom(1);
    setPracticeIndex(0);
    setPracticeResult("idle");
  }, [scope, level]);

  useEffect(() => {
    setSelected(null);
  }, [layer]);

  function answerQuestion(answer: string) {
    if (!question || practiceResult !== "idle") return;

    const correct = answer === question.answer;
    setAttempts((value) => value + 1);

    if (correct) {
      setScore((value) => value + 1);
      setPracticeResult("correct");
    } else {
      setPracticeResult("wrong");
    }
  }

  function answerByCoordinates(coordinates: Coordinates) {
    if (!question || practiceResult !== "idle") return;

    const tolerance =
      question.tolerance ?? (scope === "India" ? 4 : 10);

    const correct =
      distance(coordinates, question.coordinates) <= tolerance;

    setAttempts((value) => value + 1);

    if (correct) {
      setScore((value) => value + 1);
      setPracticeResult("correct");
    } else {
      setPracticeResult("wrong");
    }
  }

  function nextQuestion() {
    if (!practiceQuestions.length) return;

    setPracticeIndex(
      (value) => (value + 1) % practiceQuestions.length
    );
    setPracticeResult("idle");
  }

  function randomQuestion() {
    if (!practiceQuestions.length) return;

    let next = Math.floor(
      Math.random() * practiceQuestions.length
    );

    if (
      practiceQuestions.length > 1 &&
      next === practiceIndex
    ) {
      next = (next + 1) % practiceQuestions.length;
    }

    setPracticeIndex(next);
    setPracticeResult("idle");
  }

  function resetMap() {
    setZoom(1);
    setSelected(null);
  }

  function selectFeature(feature: GeoFeature) {
    setSelected(feature);
  }

  const practiceOptionFeatures = useMemo(() => {
    if (!question) return [];

    return question.options
      .map((option) =>
        scopedFeatures.find(
          (feature) =>
            feature.name === option ||
            normalize(feature.name) === normalize(option)
        )
      )
      .filter(Boolean) as GeoFeature[];
  }, [question, scopedFeatures]);

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">
            VGB Tools · Geography
          </div>

          <div className="mt-2 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Geography Lab
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Explore geographical patterns spatially, practise CBSE map
                work and connect physical and human geography through
                interactive maps.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["India", "World"] as MapScope[]).map((item) => (
                <button
                  key={item}
                  onClick={() => setScope(item)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    scope === item
                      ? "bg-slate-950 text-white"
                      : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {item}
                </button>
              ))}

              <button
                onClick={() =>
                  setMode(
                    mode === "Explore" ? "Practice" : "Explore"
                  )
                }
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  mode === "Practice"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {mode === "Practice"
                  ? "Map Explorer"
                  : "Map Practice"}
              </button>
            </div>
          </div>
        </header>

        {mode === "Practice" ? (
          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-600">
                    CBSE Map Practice
                  </div>
                  <h2 className="mt-1 text-xl font-semibold">
                    Practise spatial recall
                  </h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {(
                    ["Locate", "Identify", "Mark", "Quiz"] as PracticeMode[]
                  ).map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setPracticeMode(item);
                        setPracticeResult("idle");
                      }}
                      className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                        practiceMode === item
                          ? "bg-slate-950 text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {(["Both", "XI", "XII"] as ClassLevel[]).map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => setLevel(item)}
                        className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                          level === item
                            ? "bg-emerald-600 text-white"
                            : "border border-slate-200 bg-white text-slate-600"
                        }`}
                      >
                        Class {item === "Both" ? "XI + XII" : item}
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>

            {question ? (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                          Class {question.level} · {question.category}
                        </p>
                        <h2 className="mt-1 text-xl font-semibold">
                          {question.prompt}
                        </h2>
                      </div>

                      <div className="text-right text-xs text-slate-500">
                        Question {practiceIndex + 1} /{" "}
                        {practiceQuestions.length}
                      </div>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      {practiceMode === "Locate" &&
                        "Choose the correct feature."}
                      {practiceMode === "Identify" &&
                        "Identify the feature represented by the marker."}
                      {practiceMode === "Mark" &&
                        "Click the correct numbered location."}
                      {practiceMode === "Quiz" &&
                        "Answer using the choices."}
                    </p>
                  </div>

                  <div className="relative min-h-[600px] bg-slate-50">
                    <ComposableMap
                      projection={
                        scope === "India"
                          ? "geoMercator"
                          : "geoEqualEarth"
                      }
                      projectionConfig={projectionConfig}
                      className="h-[600px] w-full"
                    >
                      <Sphere
                        stroke="#cbd5e1"
                        strokeWidth={0.7}
                        fill="#f8fafc"
                      />
                      <Graticule
                        stroke="#e2e8f0"
                        strokeWidth={0.35}
                      />

                      <Geographies
                        geography={
                          scope === "India" ? INDIA_GEO : WORLD_GEO
                        }
                      >
                        {({ geographies }) =>
                          geographies.map((geo) => (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              fill="#e5e7eb"
                              stroke="#94a3b8"
                              strokeWidth={0.5}
                              style={{
                                default: { outline: "none" },
                                hover: {
                                  outline: "none",
                                  fill: "#d1d5db",
                                },
                                pressed: { outline: "none" },
                              }}
                            />
                          ))
                        }
                      </Geographies>

                      {practiceMode === "Identify" && (
                        <Marker coordinates={question.coordinates}>
                          <circle
                            r={9}
                            fill="#ef4444"
                            stroke="#fff"
                            strokeWidth={3}
                          />
                          <circle
                            r={16}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth={1.5}
                            opacity={0.45}
                          />
                        </Marker>
                      )}

                      {practiceMode === "Mark" &&
                        practiceOptionFeatures.map(
                          (feature, index) => (
                            <Marker
                              key={feature.id}
                              coordinates={feature.coordinates}
                              onClick={() =>
                                answerByCoordinates(
                                  feature.coordinates
                                )
                              }
                            >
                              <circle
                                r={14}
                                fill={
                                  practiceResult === "idle"
                                    ? "#fff"
                                    : feature.name ===
                                        question.answer
                                      ? "#10b981"
                                      : "#ef4444"
                                }
                                stroke="#0f172a"
                                strokeWidth={1.5}
                                className="cursor-pointer"
                              />
                              <text
                                textAnchor="middle"
                                y={4}
                                style={{
                                  fontFamily: "system-ui",
                                  fontSize: 8,
                                  fontWeight: 800,
                                  fill: "#0f172a",
                                  pointerEvents: "none",
                                }}
                              >
                                {index + 1}
                              </text>
                            </Marker>
                          )
                        )}

                      {practiceResult !== "idle" &&
                        practiceMode !== "Identify" &&
                        practiceMode !== "Mark" && (
                          <Marker coordinates={question.coordinates}>
                            <circle
                              r={9}
                              fill={
                                practiceResult === "correct"
                                  ? "#10b981"
                                  : "#ef4444"
                              }
                              stroke="#fff"
                              strokeWidth={3}
                            />
                          </Marker>
                        )}
                    </ComposableMap>

                    <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-500 shadow-sm">
                      {practiceMode === "Identify"
                        ? "Identify the marked location."
                        : practiceMode === "Mark"
                          ? "Click a numbered location."
                          : "The answer location stays hidden until submission."}
                    </div>
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Score
                        </div>
                        <div className="mt-1 text-2xl font-semibold">
                          {score}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Attempts
                        </div>
                        <div className="mt-1 text-2xl font-semibold">
                          {attempts}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Accuracy
                        </div>
                        <div className="mt-1 text-2xl font-semibold">
                          {accuracy}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                      Answer
                    </p>

                    {(practiceMode === "Locate" ||
                      practiceMode === "Quiz" ||
                      practiceMode === "Identify") && (
                      <div className="mt-4 space-y-2">
                        {question.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => answerQuestion(option)}
                            disabled={practiceResult !== "idle"}
                            className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                              practiceResult !== "idle"
                                ? option === question.answer
                                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                                  : "border-slate-200 text-slate-400"
                                : "border-slate-200 text-slate-700 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}

                    {practiceMode === "Mark" && (
                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        Click one of the numbered locations directly on
                        the map.
                      </p>
                    )}

                    {practiceResult !== "idle" && (
                      <div
                        className={`mt-4 rounded-2xl p-4 text-sm leading-6 ${
                          practiceResult === "correct"
                            ? "bg-emerald-50 text-emerald-800"
                            : "bg-rose-50 text-rose-800"
                        }`}
                      >
                        <div className="font-semibold">
                          {practiceResult === "correct"
                            ? "Correct."
                            : `The answer is ${question.answer}.`}
                        </div>
                        <div className="mt-1">
                          {question.explanation}
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={nextQuestion}
                        className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
                      >
                        Next
                      </button>
                      <button
                        onClick={randomQuestion}
                        className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                      >
                        Random
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center">
                <h2 className="text-xl font-semibold">
                  No questions available
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  This combination of scope and class level has no
                  practice questions yet.
                </p>
              </div>
            )}
          </section>
        ) : (
          <section className="grid gap-5 lg:grid-cols-[250px_minmax(0,1fr)_330px]">
            <aside className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="px-2 py-2">
                <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                  Map Explorer
                </div>
                <div className="mt-1 text-sm font-semibold">
                  Layers
                </div>
              </div>

              <div className="mt-2 space-y-1">
                {(
                  [
                    "Political",
                    "Physiography",
                    "Drainage",
                    "Climate",
                    "Resources",
                    "Transport",
                    "Population",
                  ] as Layer[]
                ).map((item) => (
                  <button
                    key={item}
                    onClick={() => setLayer(item)}
                    className={`w-full rounded-xl px-3 py-3 text-left transition ${
                      layer === item
                        ? "bg-slate-950 text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${layerDotClass[item]}`}
                      />
                      <span className="text-sm font-semibold">
                        {item}
                      </span>
                    </div>
                    <div
                      className={`mt-1 pl-4 text-xs ${
                        layer === item
                          ? "text-slate-300"
                          : "text-slate-400"
                      }`}
                    >
                      {layerDescription[item]}
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">
                <span className="font-semibold text-slate-700">
                  Current layer
                </span>
                <div className="mt-1">{layerDescription[layer]}</div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-4">
                <div className="px-2 text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                  Class filter
                </div>
                <div className="mt-2 grid grid-cols-3 gap-1">
                  {(["XI", "XII", "Both"] as ClassLevel[]).map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() => setLevel(item)}
                        className={`rounded-lg px-2 py-2 text-xs font-semibold ${
                          level === item
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-50 text-slate-600"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}
                </div>
              </div>

              <button
                onClick={resetMap}
                className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Reset map
              </button>
            </aside>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                      {scope} · Class {level} · {layer}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">
                      Spatial feature explorer
                    </h2>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <input
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search feature, chapter..."
                      className="w-56 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
                    />

                    <button
                      onClick={() =>
                        setZoom((value) =>
                          Math.max(1, value - 0.25)
                        )
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                      aria-label="Zoom out"
                    >
                      −
                    </button>
                    <button
                      onClick={() =>
                        setZoom((value) =>
                          Math.min(5, value + 0.25)
                        )
                      }
                      className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold"
                      aria-label="Zoom in"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="relative bg-slate-50">
                <ComposableMap
                  projection={
                    scope === "India"
                      ? "geoMercator"
                      : "geoEqualEarth"
                  }
                  projectionConfig={projectionConfig}
                  className="h-[680px] w-full"
                >
                  <ZoomableGroup
                    zoom={zoom}
                    onMoveEnd={({ zoom: newZoom }) =>
                      setZoom(newZoom)
                    }
                  >
                    <Sphere
                      stroke="#cbd5e1"
                      strokeWidth={0.7}
                      fill="#f8fafc"
                    />
                    <Graticule
                      stroke="#e2e8f0"
                      strokeWidth={0.35}
                    />

                    <Geographies
                      geography={
                        scope === "India" ? INDIA_GEO : WORLD_GEO
                      }
                    >
                      {({ geographies }) =>
                        geographies.map((geo) => (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={
                              scope === "India"
                                ? "#e8edf2"
                                : "#e2e8f0"
                            }
                            stroke="#94a3b8"
                            strokeWidth={0.5}
                            style={{
                              default: { outline: "none" },
                              hover: {
                                outline: "none",
                                fill: "#cbd5e1",
                                cursor: "pointer",
                              },
                              pressed: { outline: "none" },
                            }}
                          />
                        ))
                      }
                    </Geographies>

                    {mapFeatures.map((feature) => (
                      <Geographies
                        key={feature.id}
                        geography={featureGeometry(feature)}
                      >
                        {({ geographies }) =>
                          geographies.map((geo) => (
                            <Geography
                              key={geo.rsmKey}
                              geography={geo}
                              onClick={() =>
                                selectFeature(feature)
                              }
                              fill={
                                feature.geometryType ===
                                "Polygon"
                                  ? feature.color ??
                                    (layer === "Physiography"
                                      ? "#f6d58a"
                                      : "#bfdbfe")
                                  : "none"
                              }
                              fillOpacity={
                                feature.geometryType ===
                                "Polygon"
                                  ? 0.38
                                  : 0
                              }
                              stroke={
                                feature.color ??
                                (layer === "Drainage"
                                  ? "#0891b2"
                                  : layer === "Climate"
                                    ? "#059669"
                                    : "#b45309")
                              }
                              strokeWidth={
                                feature.geometryType ===
                                "LineString"
                                  ? 2.4
                                  : 1.1
                              }
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                default: {
                                  outline: "none",
                                  cursor: "pointer",
                                },
                                hover: {
                                  outline: "none",
                                  cursor: "pointer",
                                  fill:
                                    feature.geometryType ===
                                    "Polygon"
                                      ? "#fbbf24"
                                      : "none",
                                  fillOpacity:
                                    feature.geometryType ===
                                    "Polygon"
                                      ? 0.55
                                      : 0,
                                  strokeWidth:
                                    feature.geometryType ===
                                    "LineString"
                                      ? 4
                                      : 1.7,
                                },
                                pressed: { outline: "none" },
                              }}
                            />
                          ))
                        }
                      </Geographies>
                    ))}

                    {pointFeatures.map((feature) => (
                      <Marker
                        key={feature.id}
                        coordinates={feature.coordinates}
                        onClick={() => selectFeature(feature)}
                      >
                        <circle
                          r={
                            selected?.id === feature.id
                              ? 7
                              : 4.2
                          }
                          fill={
                            selected?.id === feature.id
                              ? "#0f172a"
                              : "#2563eb"
                          }
                          stroke="#fff"
                          strokeWidth={1.5}
                          className="cursor-pointer"
                        />
                        <text
                          textAnchor="middle"
                          y={-9}
                          style={{
                            fontFamily: "system-ui",
                            fontSize: 7,
                            fontWeight: 650,
                            fill: "#334155",
                            pointerEvents: "none",
                          }}
                        >
                          {feature.name}
                        </text>
                      </Marker>
                    ))}
                  </ZoomableGroup>
                </ComposableMap>

                <div className="absolute bottom-4 left-4 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-sm backdrop-blur">
                  <div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-400">
                    Legend
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                    Point feature
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-2 w-5 rounded-full bg-cyan-600" />
                    Linear feature
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                    <span className="h-3 w-5 rounded bg-amber-300" />
                    Regional feature
                  </div>
                </div>

                <div className="absolute bottom-4 right-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-500 shadow-sm">
                  {filteredFeatures.length} mapped feature
                  {filteredFeatures.length === 1 ? "" : "s"}
                </div>
              </div>
            </div>

            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                Feature information
              </div>

              {selected ? (
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    {selected.category}
                  </div>
                  <h2 className="mt-1 text-2xl font-semibold">
                    {selected.name}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {selected.description}
                  </p>

                  <div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs font-medium leading-5 text-blue-800">
                    <span className="font-bold">
                      Syllabus connection:
                    </span>{" "}
                    {selected.chapter}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Geometry
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-700">
                        {selected.geometryType ===
                        "LineString"
                          ? "Linear"
                          : selected.geometryType ===
                              "Polygon"
                            ? "Regional"
                            : "Point"}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400">
                        Class
                      </div>
                      <div className="mt-1 text-xs font-semibold text-slate-700">
                        {selected.classes.join(" / ")}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    Approx. reference coordinate:{" "}
                    {selected.coordinates[1].toFixed(2)}°,{" "}
                    {selected.coordinates[0].toFixed(2)}°
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <p className="text-sm leading-6 text-slate-500">
                    Click a river, range, region, lake, port, mine,
                    peak or other mapped feature to inspect it.
                  </p>
                </div>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">
                  Visible features
                </div>

                <div className="mt-3 max-h-80 space-y-1 overflow-auto">
                  {filteredFeatures.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => selectFeature(feature)}
                      className={`w-full rounded-xl px-3 py-2 text-left text-xs transition ${
                        selected?.id === feature.id
                          ? "bg-slate-950 text-white"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="font-semibold">
                        {feature.name}
                      </div>
                      <div
                        className={`mt-0.5 ${
                          selected?.id === feature.id
                            ? "text-slate-300"
                            : "text-slate-400"
                        }`}
                      >
                        {feature.category} ·{" "}
                        {feature.geometryType}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="text-xs font-semibold text-slate-700">
                  Current system
                </div>
                <div className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                  <div>• Real spatial regions, not only markers</div>
                  <div>• Rivers and ranges represented as lines</div>
                  <div>• Lakes and physiographic units as regions</div>
                  <div>• CBSE XI/XII class filtering</div>
                  <div>• Searchable syllabus connections</div>
                  <div>• Interactive CBSE map practice</div>
                </div>
              </div>
            </aside>
          </section>
        )}
      </div>
    </main>
  );
}
