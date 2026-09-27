"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Sphere,
} from "react-simple-maps";

type MapScope = "India" | "World";
type Layer = "Political" | "Physical" | "Rivers" | "Climate" | "Resources";
type Mode = "Explore" | "Practice";
type PracticeMode = "Locate" | "Identify" | "Mark" | "Quiz";
type PracticeLevel = "Class 11" | "Class 12" | "All";
type Coordinates = [number, number];
type GeometryType = "point" | "line" | "polygon";

type GeoFeature = {
  id: string;
  name: string;
  type: string;
  coordinates: Coordinates | Coordinates[] | Coordinates[][];
  geometryType: GeometryType;
  description: string;
  layers: Layer[];
  scope: MapScope;
  classes: ("Class 11" | "Class 12")[];
  chapter: string;
};

type PracticeQuestion = {
  id: string;
  prompt: string;
  answer: string;
  coordinates: Coordinates;
  scope: MapScope;
  level: "Class 11" | "Class 12";
  type: string;
  options: string[];
  explanation: string;
};

const WORLD_GEO = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const INDIA_GEO = "https://raw.githubusercontent.com/geohacker/india/master/state/india_telengana.geojson";

const point = (
  id: string,
  name: string,
  type: string,
  coordinates: Coordinates,
  description: string,
  layers: Layer[],
  scope: MapScope,
  classes: ("Class 11" | "Class 12")[],
  chapter: string,
): GeoFeature => ({ id, name, type, coordinates, geometryType: "point", description, layers, scope, classes, chapter });

const line = (
  id: string,
  name: string,
  coordinates: Coordinates[],
  description: string,
  layers: Layer[],
  scope: MapScope,
  classes: ("Class 11" | "Class 12")[],
  chapter: string,
): GeoFeature => ({ id, name, type: "Line feature", coordinates, geometryType: "line", description, layers, scope, classes, chapter });

const polygon = (
  id: string,
  name: string,
  coordinates: Coordinates[][],
  description: string,
  layers: Layer[],
  scope: MapScope,
  classes: ("Class 11" | "Class 12")[],
  chapter: string,
): GeoFeature => ({ id, name, type: "Region", coordinates, geometryType: "polygon", description, layers, scope, classes, chapter });

/* -------------------------------------------------------------------------- */
/* INDIA: CLASS XI + SELECTED CLASS XII MAP FEATURES                         */
/* -------------------------------------------------------------------------- */

const indiaFeatures: GeoFeature[] = [
  point("india-new-delhi", "New Delhi", "Capital", [77.21, 28.61], "National capital of India.", ["Political"], "India", ["Class 11", "Class 12"], "India: Location / People & Economy"),
  point("india-mumbai", "Mumbai", "Major port", [72.88, 19.08], "Major west-coast port and urban centre.", ["Political", "Resources"], "India", ["Class 12"], "India: Transport & International Trade"),
  point("india-kolkata", "Kolkata", "Major port", [88.36, 22.57], "Major eastern port and urban centre.", ["Political", "Resources"], "India", ["Class 12"], "India: Transport & International Trade"),
  point("india-chennai", "Chennai", "Major port", [80.27, 13.08], "Major southeastern port city.", ["Political", "Resources"], "India", ["Class 12"], "India: Transport & International Trade"),
  point("india-bengaluru", "Bengaluru", "Airport / city", [77.59, 12.97], "Major southern urban and technology centre.", ["Political", "Resources"], "India", ["Class 12"], "India: Transport & Communication"),
  point("india-delhi-airport", "Delhi Airport", "Airport", [77.10, 28.56], "International airport location used in Class XII map work.", ["Resources"], "India", ["Class 12"], "India: Transport & Communication"),
  point("india-ahmedabad", "Ahmedabad", "Airport / city", [72.57, 23.03], "Major western urban centre.", ["Political", "Resources"], "India", ["Class 12"], "India: Transport & Communication"),
  point("india-hyderabad", "Hyderabad", "Airport / city", [78.47, 17.39], "Major southern urban centre.", ["Political", "Resources"], "India", ["Class 12"], "India: Transport & Communication"),
  point("india-guwahati", "Guwahati", "Airport / city", [91.74, 26.14], "Major urban centre in Assam.", ["Political", "Resources"], "India", ["Class 12"], "India: Transport & Communication"),
  point("india-amritsar", "Amritsar", "Airport / city", [74.87, 31.63], "Major city in Punjab.", ["Political", "Resources"], "India", ["Class 12"], "India: Transport & Communication"),
  point("india-thiruvananthapuram", "Thiruvananthapuram", "Airport / city", [76.95, 8.52], "Major city in Kerala.", ["Political", "Resources"], "India", ["Class 12"], "India: Transport & Communication"),
  point("india-agra", "Agra", "City", [78.01, 27.18], "Major urban centre in Uttar Pradesh.", ["Political"], "India", ["Class 12"], "India: People & Settlements"),

  point("india-k2", "K2", "Peak", [76.51, 35.88], "Major peak in the Karakoram.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-kanchenjunga", "Kanchenjunga", "Peak", [88.15, 27.70], "Major Himalayan peak.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-nanda-devi", "Nanda Devi", "Peak", [79.97, 30.38], "Major Himalayan peak.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-nanga-parbat", "Nanga Parbat", "Peak", [74.59, 35.24], "Major Himalayan peak.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-namcha-barwa", "Namcha Barwa", "Peak", [95.05, 29.63], "Major peak near the eastern Himalayas.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-anaimudi", "Anaimudi", "Peak", [77.06, 10.17], "Highest peak of the Western Ghats.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),

  point("india-shipkila", "Shipkila Pass", "Pass", [78.77, 31.51], "Important Himalayan pass.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-nathula", "Nathula", "Pass", [88.83, 27.39], "Important pass in Sikkim.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-palghat", "Palghat Gap", "Pass / gap", [76.65, 10.78], "Major gap in the Western Ghats.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-bhor", "Bhor Ghat", "Pass / gap", [73.34, 18.95], "Important Western Ghats pass.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-thal", "Thal Ghat", "Pass / gap", [73.53, 19.77], "Important Western Ghats pass.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),

  point("india-malwa", "Malwa Plateau", "Plateau", [75.70, 23.50], "Plateau region in central-western India.", ["Physical", "Resources"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-chhotanagpur", "Chhotanagpur Plateau", "Plateau", [85.50, 23.50], "Mineral-rich plateau region of eastern India.", ["Physical", "Resources"], "India", ["Class 11", "Class 12"], "India: Structure / Mineral & Energy Resources"),
  point("india-meghalaya", "Meghalaya Plateau", "Plateau", [91.30, 25.50], "Plateau region of northeastern India.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-deccan", "Deccan Plateau", "Plateau", [77.00, 17.80], "Large plateau occupying much of peninsular India.", ["Physical", "Resources"], "India", ["Class 11"], "India: Structure & Physiography"),
  point("india-thar", "Thar Desert", "Hot desert", [71.00, 27.50], "Arid region in northwestern India.", ["Physical", "Climate"], "India", ["Class 11"], "India: Structure / Climate"),

  line("india-western-ghats", "Western Ghats", [[74.8, 21], [74.0, 19], [73.5, 17], [73.2, 15], [73.3, 13], [74.0, 11], [76.0, 9]], "Mountain chain along the western side of peninsular India.", ["Physical", "Climate"], "India", ["Class 11"], "India: Structure & Physiography"),
  line("india-eastern-ghats", "Eastern Ghats", [[80.0, 18], [80.4, 16], [79.8, 14], [79.0, 12], [78.5, 11]], "Discontinuous hill system along the eastern side of peninsular India.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  line("india-aravalli", "Aravalli Range", [[74.6, 27.5], [73.9, 26.2], [73.3, 24.5], [72.9, 23.0]], "Ancient mountain system of northwestern India.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  line("india-vindhya", "Vindhya Range", [[75.0, 24.5], [77.0, 24.0], [79.0, 24.0], [81.0, 24.2]], "Major range of central India.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  line("india-satpura", "Satpura Range", [[73.8, 21.5], [75.5, 21.3], [77.5, 21.6], [79.5, 22.0]], "Major range south of the Narmada valley.", ["Physical"], "India", ["Class 11"], "India: Structure & Physiography"),
  line("india-himalayas", "Himalayas", [[74.0, 32.0], [78.0, 31.5], [82.0, 30.8], [86.0, 29.5], [90.0, 28.5], [94.0, 28.5]], "Major mountain system along northern India.", ["Physical", "Climate"], "India", ["Class 11"], "India: Structure & Physiography"),

  line("india-ganga", "Ganga", [[78.5, 30.0], [80.0, 28.5], [82.0, 27.2], [84.0, 25.5], [86.0, 25.0], [88.0, 24.5]], "Major Himalayan river system of northern India.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-yamuna", "Yamuna", [[78.4, 30.1], [78.0, 29.0], [77.7, 28.0], [77.5, 27.0], [77.8, 26.0]], "Major tributary joining the Ganga.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-brahmaputra", "Brahmaputra", [[82.5, 31.0], [88.0, 29.0], [91.0, 27.0], [93.0, 26.0], [95.0, 26.0]], "Major Himalayan river flowing through northeastern India.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-indus", "Indus", [[81.0, 31.0], [78.0, 33.0], [76.0, 34.0], [74.0, 35.0]], "Major river system of northwestern South Asia.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-narmada", "Narmada", [[81.8, 22.7], [80.0, 22.6], [78.0, 22.6], [76.0, 22.6], [74.0, 21.8]], "Major west-flowing peninsular river.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-tapti", "Tapti", [[78.5, 21.2], [77.0, 21.0], [75.5, 21.0], [73.0, 21.0]], "Major west-flowing peninsular river.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-godavari", "Godavari", [[78.5, 19.0], [80.0, 18.8], [82.0, 18.5], [84.0, 17.8], [85.5, 17.5]], "Major east-flowing peninsular river.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-krishna", "Krishna", [[75.7, 17.8], [77.0, 17.6], [79.0, 16.8], [80.5, 16.2], [82.0, 15.8]], "Major east-flowing peninsular river.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-kaveri", "Kaveri", [[75.6, 12.4], [77.0, 12.2], [78.5, 11.8], [79.8, 11.0]], "Major river of southern India.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-mahanadi", "Mahanadi", [[81.7, 21.8], [82.8, 21.0], [84.0, 20.0], [85.5, 19.2]], "Major east-flowing river of central-eastern India.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-damodar", "Damodar", [[84.0, 24.2], [85.0, 23.8], [86.5, 23.7], [87.5, 23.6]], "River associated with the Chhotanagpur region and lower Ganga basin.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-chambal", "Chambal", [[75.5, 24.5], [77.0, 26.0], [78.5, 26.5], [79.5, 26.5]], "Major tributary of the Yamuna.", ["Rivers"], "India", ["Class 11"], "India: Drainage"),
  line("india-luni", "Luni", [[72.5, 26.5], [73.5, 26.0], [74.5, 25.5], [75.5, 25.0]], "Important river of the arid region of Rajasthan.", ["Rivers", "Climate"], "India", ["Class 11"], "India: Drainage / Climate"),

  point("india-wular", "Wular Lake", "Lake", [74.70, 34.10], "Major freshwater lake in Jammu and Kashmir.", ["Physical"], "India", ["Class 11"], "India: Drainage"),
  point("india-sambhar", "Sambhar Lake", "Lake", [75.00, 26.90], "Large inland salt lake in Rajasthan.", ["Physical", "Climate"], "India", ["Class 11"], "India: Drainage"),
  point("india-chilika", "Chilika Lake", "Lagoon", [85.45, 19.75], "Large coastal lagoon on the Odisha coast.", ["Physical", "Climate"], "India", ["Class 11"], "India: Drainage"),
  point("india-kolleru", "Kolleru Lake", "Lake", [81.20, 16.75], "Large freshwater lake in Andhra Pradesh.", ["Physical"], "India", ["Class 11"], "India: Drainage"),
  point("india-pulicat", "Pulicat Lake", "Lagoon", [80.10, 13.70], "Large brackish lagoon on the southeastern coast.", ["Physical"], "India", ["Class 11"], "India: Drainage"),
  point("india-vembanad", "Vembanad", "Lake", [76.40, 9.60], "Large backwater lake in Kerala.", ["Physical"], "India", ["Class 11"], "India: Drainage"),

  point("india-palk", "Palk Strait", "Strait", [79.50, 9.60], "Strait between southeastern India and Sri Lanka.", ["Physical"], "India", ["Class 11"], "India: India Location"),
  point("india-gulf-mannar", "Gulf of Mannar", "Gulf", [79.00, 8.80], "Gulf between southeastern India and Sri Lanka.", ["Physical"], "India", ["Class 11"], "India: India Location"),
  point("india-gulf-kachchh", "Gulf of Kachchh", "Gulf", [69.80, 22.80], "Gulf on the western coast of India.", ["Physical"], "India", ["Class 11"], "India: India Location"),
  point("india-gulf-khambat", "Gulf of Khambat", "Gulf", [72.20, 21.80], "Gulf on the western coast of India.", ["Physical"], "India", ["Class 11"], "India: India Location"),

  point("india-tropic-cancer", "Tropic of Cancer", "Latitude", [78.96, 23.44], "23½° N latitude crosses central India.", ["Political", "Climate"], "India", ["Class 11"], "India: Location"),
  point("india-standard-meridian", "Standard Meridian of India", "Longitude", [82.50, 23.50], "82°30′ E is India's Standard Meridian.", ["Political", "Climate"], "India", ["Class 11"], "India: Location"),
  point("india-kanyakumari", "Kanyakumari", "Southern tip", [77.55, 8.08], "Southern tip of mainland India.", ["Political"], "India", ["Class 11"], "India: Location"),

  point("india-kandla", "Kandla", "Major port", [70.22, 23.03], "Major port on the Gulf of Kachchh.", ["Resources"], "India", ["Class 12"], "India: Transport & International Trade"),
  point("india-marmagao", "Marmagao", "Major port", [73.80, 15.42], "Major port in Goa.", ["Resources"], "India", ["Class 12"], "India: Transport & International Trade"),
  point("india-kochi", "Kochi", "Major port", [76.27, 9.97], "Major port on the Malabar coast.", ["Resources"], "India", ["Class 12"], "India: Transport & International Trade"),
  point("india-mangalore", "Mangalore", "Major port", [74.85, 12.91], "Major port on the west coast.", ["Resources"], "India", ["Class 12"], "India: Transport & International Trade"),
  point("india-tuticorin", "Tuticorin", "Major port", [78.13, 8.80], "Major port in southern Tamil Nadu.", ["Resources"], "India", ["Class 12"], "India: Transport & International Trade"),
  point("india-visakhapatnam", "Visakhapatnam", "Major port", [83.22, 17.69], "Major east-coast port.", ["Resources"], "India", ["Class 12"], "India: Transport & International Trade"),
  point("india-paradip", "Paradip", "Major port", [86.67, 20.27], "Major port on the Odisha coast.", ["Resources"], "India", ["Class 12"], "India: Transport & International Trade"),
  point("india-haldia", "Haldia", "Major port", [88.06, 22.03], "Port and industrial centre near the lower Hooghly.", ["Resources"], "India", ["Class 12"], "India: Transport & International Trade"),

  point("india-iron-mayurbhanj", "Mayurbhanj", "Iron ore", [86.65, 21.95], "Important iron-ore region listed in Class XII map work.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-iron-bailadila", "Bailadila", "Iron ore", [81.25, 18.65], "Important iron-ore region listed in Class XII map work.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-iron-ratnagiri", "Ratnagiri", "Iron ore", [73.30, 16.99], "Iron-ore region listed in Class XII map work.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-iron-bellary", "Bellary", "Iron ore", [76.92, 15.14], "Important iron-ore region listed in Class XII map work.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-manganese-balaghat", "Balaghat", "Manganese", [80.18, 21.80], "Important manganese region.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-copper-khetri", "Khetri", "Copper", [75.80, 28.00], "Important copper region in Rajasthan.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-bauxite-koraput", "Koraput", "Bauxite", [82.72, 18.81], "Important bauxite region.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-coal-jharia", "Jharia", "Coal", [86.42, 23.75], "Major coalfield in Jharkhand.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-coal-bokaro", "Bokaro", "Coal", [85.96, 23.67], "Major coalfield in Jharkhand.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-coal-raniganj", "Raniganj", "Coal", [87.30, 23.62], "Major coalfield in West Bengal.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-coal-neyveli", "Neyveli", "Lignite", [79.48, 11.53], "Important lignite field in Tamil Nadu.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-refinery-mathura", "Mathura Refinery", "Oil refinery", [77.68, 27.49], "Major oil refinery listed in Class XII map work.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-refinery-jamnagar", "Jamnagar Refinery", "Oil refinery", [70.07, 22.47], "Major oil refining centre in Gujarat.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
  point("india-refinery-barauni", "Barauni Refinery", "Oil refinery", [85.92, 25.43], "Major oil refinery in Bihar.", ["Resources"], "India", ["Class 12"], "India: Mineral & Energy Resources"),
];

/* -------------------------------------------------------------------------- */
/* WORLD: CLASS XI + XII MAP FEATURES                                        */
/* -------------------------------------------------------------------------- */

const worldFeatures: GeoFeature[] = [
  point("world-equator", "Equator", "Latitude", [0, 0], "0° latitude.", ["Climate", "Political"], "World", ["Class 11"], "Practical: Latitude & Longitude"),
  point("world-prime-meridian", "Prime Meridian", "Longitude", [0, 20], "0° longitude.", ["Political", "Climate"], "World", ["Class 11"], "Practical: Latitude & Longitude"),
  point("world-tropic-cancer", "Tropic of Cancer", "Latitude", [0, 23.44], "23½° N latitude.", ["Climate"], "World", ["Class 11"], "Practical: Latitude & Longitude"),
  point("world-tropic-capricorn", "Tropic of Capricorn", "Latitude", [0, -23.44], "23½° S latitude.", ["Climate"], "World", ["Class 11"], "Practical: Latitude & Longitude"),
  point("world-arctic-circle", "Arctic Circle", "Latitude", [0, 66.56], "66½° N latitude.", ["Climate"], "World", ["Class 11"], "Practical: Latitude & Longitude"),
  point("world-international-date-line", "International Date Line", "Longitude", [180, 0], "Approximate 180° longitude reference.", ["Political"], "World", ["Class 11"], "Practical: Latitude & Longitude"),

  point("world-london", "London", "City / port", [-0.13, 51.51], "Major European city and port reference.", ["Political", "Resources"], "World", ["Class 12"], "International Trade"),
  point("world-hamburg", "Hamburg", "Port", [9.99, 53.55], "Major European port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-vancouver", "Vancouver", "Port", [-123.12, 49.28], "Major North American port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-san-francisco", "San Francisco", "Port", [-122.42, 37.77], "Major North American port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-new-orleans", "New Orleans", "Port", [-90.07, 29.95], "Major North American port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-rio", "Rio de Janeiro", "Port", [-43.17, -22.91], "Major South American port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-valparaiso", "Valparaiso", "Port", [-71.62, -33.05], "Major Chilean port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-cape-town", "Cape Town", "Port", [18.42, -33.92], "Major southern African port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-suez", "Suez", "Port / canal", [32.55, 29.97], "Northern terminus region of the Suez Canal.", ["Resources"], "World", ["Class 12"], "Transport & International Trade"),
  point("world-yokohama", "Yokohama", "Port", [139.64, 35.44], "Major Japanese port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-shanghai", "Shanghai", "Port", [121.47, 31.23], "Major Chinese port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-hong-kong", "Hong Kong", "Port", [114.17, 22.32], "Major Asian port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-karachi", "Karachi", "Port", [67.01, 24.86], "Major South Asian port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-kolkata-port", "Kolkata", "Port", [88.36, 22.57], "Major Indian port.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-perth", "Perth", "Port / city", [115.86, -31.95], "Major Australian urban centre.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-sydney", "Sydney", "Port / city", [151.21, -33.87], "Major Australian urban centre.", ["Resources"], "World", ["Class 12"], "International Trade"),
  point("world-melbourne", "Melbourne", "Port / city", [144.96, -37.81], "Major Australian urban centre.", ["Resources"], "World", ["Class 12"], "International Trade"),

  point("world-sahara", "Sahara", "Hot desert", [13, 24], "Major hot desert of northern Africa.", ["Physical", "Climate"], "World", ["Class 11", "Class 12"], "Physical Geography"),
  point("world-gobi", "Gobi", "Hot / cold desert", [103, 43], "Large desert region of Mongolia and northern China.", ["Physical", "Climate"], "World", ["Class 11"], "Physical Geography"),
  point("world-thar", "Thar", "Hot desert", [71, 27.5], "Hot desert of northwestern India and Pakistan.", ["Physical", "Climate"], "World", ["Class 11"], "Physical Geography"),
  point("world-mojave", "Mojave", "Hot desert", [-116, 35], "Hot desert in southwestern North America.", ["Physical", "Climate"], "World", ["Class 11"], "Physical Geography"),
  point("world-patagonian", "Patagonian Desert", "Cold desert", [-69, -45], "Arid region of southern South America.", ["Physical", "Climate"], "World", ["Class 11"], "Physical Geography"),
  point("world-great-victoria", "Great Victoria Desert", "Hot desert", [130, -29], "Large desert in Australia.", ["Physical", "Climate"], "World", ["Class 11"], "Physical Geography"),
  point("world-amazon-basin", "Amazon Basin", "Physical region", [-60, -4], "Large tropical basin in South America.", ["Physical", "Climate", "Rivers"], "World", ["Class 11"], "Physical Geography"),
  point("world-rockies", "Rocky Mountains", "Mountain system", [-112, 43], "Major mountain system of western North America.", ["Physical"], "World", ["Class 11"], "Physical Geography"),
  point("world-andes", "Andes", "Mountain system", [-70, -20], "Major mountain system along western South America.", ["Physical"], "World", ["Class 11"], "Physical Geography"),
  point("world-nile", "Nile", "River", [31.2, 30.0], "Major river system of northeastern Africa.", ["Rivers"], "World", ["Class 11"], "Physical Geography"),
  point("world-amazon-river", "Amazon River", "River", [-58, -3], "Major river of tropical South America.", ["Rivers"], "World", ["Class 11"], "Physical Geography"),

  line("world-mid-atlantic-ridge", "Mid-Atlantic Ridge", [[-35, 60], [-28, 35], [-25, 10], [-15, -15], [-10, -40]], "Major submarine ridge associated with seafloor spreading.", ["Physical"], "World", ["Class 11"], "Distribution of Oceans & Continents"),
  line("world-humboldt", "Humboldt Current", [[-78, -5], [-80, -15], [-78, -25], [-75, -35]], "Cold current along the west coast of South America.", ["Climate", "Rivers"], "World", ["Class 11"], "Ocean Movements"),
  line("world-california", "California Current", [[-130, 45], [-125, 35], [-122, 25]], "Cold current along western North America.", ["Climate"], "World", ["Class 11"], "Ocean Movements"),
  line("world-gulf-stream", "Gulf Stream", [[-80, 25], [-65, 32], [-45, 40], [-25, 48], [-10, 52]], "Warm current flowing from the western Atlantic toward Europe.", ["Climate"], "World", ["Class 11"], "Ocean Movements"),
  line("world-kuroshio", "Kuroshio Current", [[125, 20], [132, 25], [140, 32], [150, 38]], "Warm current near Japan.", ["Climate"], "World", ["Class 11"], "Ocean Movements"),
  line("world-agulhas", "Agulhas Current", [[35, -10], [40, -20], [38, -30], [30, -38]], "Warm current along southeastern Africa.", ["Climate"], "World", ["Class 11"], "Ocean Movements"),
  line("world-labrador", "Labrador Current", [[-55, 60], [-55, 52], [-58, 45]], "Cold current flowing southward along northeastern North America.", ["Climate"], "World", ["Class 11"], "Ocean Movements"),

  line("world-trans-siberian", "Trans-Siberian Railway", [[37.6, 55.8], [60, 55], [90, 55], [110, 55], [139.7, 43]], "Major railway corridor across Russia.", ["Resources"], "World", ["Class 12"], "Transport & Communication"),
  line("world-trans-canadian", "Trans-Canadian Railway", [[-123, 49], [-110, 51], [-95, 50], [-80, 46]], "Major railway corridor across Canada.", ["Resources"], "World", ["Class 12"], "Transport & Communication"),
  line("world-trans-australian", "Trans-Australian Railway", [[115.9, -32], [125, -31], [135, -31], [145, -34]], "Major railway corridor across southern Australia.", ["Resources"], "World", ["Class 12"], "Transport & Communication"),
  line("world-suez-canal", "Suez Canal", [[32.3, 31.2], [32.4, 30.5], [32.5, 30.0]], "Artificial waterway linking the Mediterranean and Red Sea.", ["Resources"], "World", ["Class 12"], "Transport & International Trade"),
  line("world-panama-canal", "Panama Canal", [[-79.9, 9.3], [-79.6, 9.0], [-79.5, 8.9]], "Artificial waterway connecting the Atlantic and Pacific oceans.", ["Resources"], "World", ["Class 12"], "Transport & International Trade"),
  line("world-rhine", "Rhine", [[8.7, 47.6], [7.6, 50.0], [6.9, 51.0], [4.5, 51.9]], "Major European river and inland waterway.", ["Rivers", "Resources"], "World", ["Class 12"], "Transport & Communication"),
  line("world-st-lawrence", "St Lawrence", [[-74, 45], [-72, 46], [-68, 47], [-64, 48]], "Major river and waterway in eastern Canada.", ["Rivers", "Resources"], "World", ["Class 12"], "Transport & Communication"),
];

const practiceQuestions: PracticeQuestion[] = [
  { id: "i1", prompt: "Locate the capital of India.", answer: "New Delhi", coordinates: [77.21, 28.61], scope: "India", level: "Class 11", type: "Political", options: ["New Delhi", "Mumbai", "Kolkata", "Chennai"], explanation: "New Delhi is the national capital of India." },
  { id: "i2", prompt: "Locate the Thar Desert.", answer: "Thar Desert", coordinates: [71, 27.5], scope: "India", level: "Class 11", type: "Physiography", options: ["Thar Desert", "Deccan Plateau", "Western Ghats", "Himalayas"], explanation: "The Thar Desert is in northwestern India, especially Rajasthan." },
  { id: "i3", prompt: "Locate the Himalayas.", answer: "Himalayas", coordinates: [80, 30.8], scope: "India", level: "Class 11", type: "Physiography", options: ["Himalayas", "Western Ghats", "Deccan Plateau", "Aravalli Range"], explanation: "The Himalayas form the major mountain system along northern India." },
  { id: "i4", prompt: "Locate the Deccan Plateau.", answer: "Deccan Plateau", coordinates: [77, 17.8], scope: "India", level: "Class 11", type: "Physiography", options: ["Deccan Plateau", "Himalayas", "Thar Desert", "Malwa Plateau"], explanation: "The Deccan Plateau occupies a large part of peninsular India." },
  { id: "i5", prompt: "Locate the Ganga.", answer: "Ganga", coordinates: [84, 25.5], scope: "India", level: "Class 11", type: "Drainage", options: ["Ganga", "Narmada", "Godavari", "Brahmaputra"], explanation: "The Ganga is one of the major Himalayan river systems." },
  { id: "i6", prompt: "Locate the Western Ghats.", answer: "Western Ghats", coordinates: [73.5, 15], scope: "India", level: "Class 11", type: "Physiography", options: ["Western Ghats", "Himalayas", "Aravalli Range", "Eastern Ghats"], explanation: "The Western Ghats run roughly parallel to India's western coast." },
  { id: "i7", prompt: "Locate the Tropic of Cancer in India.", answer: "Tropic of Cancer", coordinates: [78.96, 23.44], scope: "India", level: "Class 11", type: "Location", options: ["Tropic of Cancer", "Standard Meridian of India", "Kanyakumari", "Equator"], explanation: "The Tropic of Cancer is at about 23½° N and crosses central India." },
  { id: "i8", prompt: "Locate the Gulf of Kachchh.", answer: "Gulf of Kachchh", coordinates: [69.8, 22.8], scope: "India", level: "Class 11", type: "Location", options: ["Gulf of Kachchh", "Gulf of Mannar", "Palk Strait", "Gulf of Khambat"], explanation: "The Gulf of Kachchh lies on the western coast of Gujarat." },
  { id: "i9", prompt: "Locate Jharia, a major coalfield.", answer: "Jharia", coordinates: [86.42, 23.75], scope: "India", level: "Class 12", type: "Mineral Resources", options: ["Jharia", "Bokaro", "Raniganj", "Neyveli"], explanation: "Jharia is a major coalfield in Jharkhand." },
  { id: "i10", prompt: "Locate a major port on the Odisha coast.", answer: "Paradip", coordinates: [86.67, 20.27], scope: "India", level: "Class 12", type: "Transport", options: ["Paradip", "Kochi", "Kandla", "Mangalore"], explanation: "Paradip is a major port on the Odisha coast." },
  { id: "w1", prompt: "Locate the Equator.", answer: "Equator", coordinates: [0, 0], scope: "World", level: "Class 11", type: "Latitude", options: ["Equator", "Tropic of Cancer", "Prime Meridian", "Arctic Circle"], explanation: "The Equator represents 0° latitude." },
  { id: "w2", prompt: "Locate the Prime Meridian.", answer: "Prime Meridian", coordinates: [0, 20], scope: "World", level: "Class 11", type: "Longitude", options: ["Prime Meridian", "Equator", "Tropic of Capricorn", "International Date Line"], explanation: "The Prime Meridian represents 0° longitude." },
  { id: "w3", prompt: "Locate the Sahara.", answer: "Sahara", coordinates: [13, 24], scope: "World", level: "Class 11", type: "Physical Geography", options: ["Sahara", "Gobi", "Mojave", "Great Victoria Desert"], explanation: "The Sahara extends across much of northern Africa." },
  { id: "w4", prompt: "Locate the Andes.", answer: "Andes", coordinates: [-70, -20], scope: "World", level: "Class 11", type: "Physical Geography", options: ["Andes", "Rocky Mountains", "Sahara", "Mid-Atlantic Ridge"], explanation: "The Andes run along the western side of South America." },
  { id: "w5", prompt: "Locate the Mid-Atlantic Ridge.", answer: "Mid-Atlantic Ridge", coordinates: [-25, 10], scope: "World", level: "Class 11", type: "Plate Tectonics", options: ["Mid-Atlantic Ridge", "Gulf Stream", "Andes", "Sahara"], explanation: "The Mid-Atlantic Ridge is a major submarine ridge associated with seafloor spreading." },
  { id: "w6", prompt: "Locate the Suez Canal.", answer: "Suez Canal", coordinates: [32.4, 30.5], scope: "World", level: "Class 12", type: "Transport", options: ["Suez Canal", "Panama Canal", "Rhine", "St Lawrence"], explanation: "The Suez Canal links the Mediterranean Sea with the Red Sea." },
  { id: "w7", prompt: "Locate the Trans-Siberian Railway.", answer: "Trans-Siberian Railway", coordinates: [90, 55], scope: "World", level: "Class 12", type: "Transport", options: ["Trans-Siberian Railway", "Trans-Canadian Railway", "Trans-Australian Railway", "Rhine"], explanation: "The Trans-Siberian Railway crosses Russia from western Russia toward the Pacific coast." },
  { id: "w8", prompt: "Locate the Gulf Stream.", answer: "Gulf Stream", coordinates: [-45, 40], scope: "World", level: "Class 11", type: "Ocean Currents", options: ["Gulf Stream", "Humboldt Current", "California Current", "Labrador Current"], explanation: "The Gulf Stream is a warm Atlantic current flowing northeastward from the western Atlantic." },
];

const allFeatures = [...indiaFeatures, ...worldFeatures];

function featureCenter(feature: GeoFeature): Coordinates {
  if (feature.geometryType === "point") return feature.coordinates as Coordinates;
  const coordinates = feature.coordinates as Coordinates[] | Coordinates[][];
  if (feature.geometryType === "line") {
    const lineCoordinates = coordinates as Coordinates[];
    return lineCoordinates[Math.floor(lineCoordinates.length / 2)] ?? [0, 0];
  }
  const polygonCoordinates = coordinates as Coordinates[][];
  const ring = polygonCoordinates[0] ?? [];
  return ring[Math.floor(ring.length / 2)] ?? [0, 0];
}

function distance(a: Coordinates, b: Coordinates) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return Math.sqrt(dx * dx + dy * dy);
}

export default function GeographyLabPage() {
  const [scope, setScope] = useState<MapScope>("India");
  const [layer, setLayer] = useState<Layer>("Political");
  const [mode, setMode] = useState<Mode>("Explore");
  const [selected, setSelected] = useState<GeoFeature | null>(null);
  const [search, setSearch] = useState("");
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("Locate");
  const [practiceLevel, setPracticeLevel] = useState<PracticeLevel>("All");
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [practiceResult, setPracticeResult] = useState<"idle" | "correct" | "wrong">("idle");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [exploreZoom, setExploreZoom] = useState(1);

  const features = scope === "India" ? indiaFeatures : worldFeatures;

  const filteredFeatures = useMemo(() => {
    const q = search.trim().toLowerCase();
    return features.filter((feature) => {
      const layerMatch = feature.layers.includes(layer);
      const searchMatch = !q || feature.name.toLowerCase().includes(q) || feature.type.toLowerCase().includes(q) || feature.chapter.toLowerCase().includes(q);
      return layerMatch && searchMatch;
    });
  }, [features, layer, search]);

  const questions = useMemo(() => practiceQuestions.filter((item) => item.scope === scope && (practiceLevel === "All" || item.level === practiceLevel)), [scope, practiceLevel]);
  const question = questions.length ? questions[practiceIndex % questions.length] : null;
  const accuracy = attempts ? Math.round((score / attempts) * 100) : 0;

  const projectionConfig = scope === "India"
    ? { center: [79, 22] as Coordinates, scale: 900 }
    : { center: [0, 10] as Coordinates, scale: 145 };

  useEffect(() => {
    setSelected(null);
    setSearch("");
    setExploreZoom(1);
    setPracticeIndex(0);
    setPracticeResult("idle");
  }, [scope]);

  useEffect(() => {
    setPracticeIndex(0);
    setPracticeResult("idle");
  }, [practiceLevel, practiceMode]);

  function resetPractice() {
    setScore(0);
    setAttempts(0);
    setPracticeIndex(0);
    setPracticeResult("idle");
  }

  function answerQuestion(answer: string) {
    if (!question || practiceResult !== "idle") return;
    const correct = answer === question.answer;
    setAttempts((n) => n + 1);
    setPracticeResult(correct ? "correct" : "wrong");
    if (correct) setScore((n) => n + 1);
  }

  function answerByCoordinates(coordinates: Coordinates) {
    if (!question || practiceResult !== "idle") return;
    const tolerance = scope === "India" ? 4.5 : 8;
    const correct = distance(coordinates, question.coordinates) <= tolerance;
    setAttempts((n) => n + 1);
    setPracticeResult(correct ? "correct" : "wrong");
    if (correct) setScore((n) => n + 1);
  }

  function nextQuestion() {
    if (!questions.length) return;
    setPracticeIndex((n) => (n + 1) % questions.length);
    setPracticeResult("idle");
  }

  function renderFeature(feature: GeoFeature, interactive = true) {
    const coords = feature.coordinates;
    const center = featureCenter(feature);
    const isSelected = selected?.id === feature.id;

    if (feature.geometryType === "point") {
      return (
        <Marker key={feature.id} coordinates={coords as Coordinates} onClick={() => interactive && setSelected(feature)}>
          <circle r={isSelected ? 7 : 4.5} fill={isSelected ? "#0f172a" : "#2563eb"} stroke="#fff" strokeWidth={2} className={interactive ? "cursor-pointer" : ""} />
          {isSelected && <circle r={12} fill="none" stroke="#0f172a" strokeWidth={1.5} opacity={0.4} />}
        </Marker>
      );
    }

    if (feature.geometryType === "line") {
      return (
        <Geographies
          key={feature.id}
          geography={{ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords as Coordinates[] } } as any}
        >
          {({ geographies }) => geographies.map((geo) => (
            <Geography
              key={`${feature.id}-${geo.rsmKey}`}
              geography={geo}
              onClick={() => interactive && setSelected(feature)}
              style={{
                default: { fill: "none", stroke: isSelected ? "#0f172a" : "#0891b2", strokeWidth: isSelected ? 2.8 : 1.8, outline: "none" },
                hover: { fill: "none", stroke: "#0f172a", strokeWidth: 3.2, outline: "none" },
                pressed: { fill: "none", stroke: "#0f172a", strokeWidth: 3.2, outline: "none" },
              }}
            />
          ))}
        </Geographies>
      );
    }

    return (
      <Geographies
        key={feature.id}
        geography={{ type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: coords as Coordinates[][] } } as any}
      >
        {({ geographies }) => geographies.map((geo) => (
          <Geography
            key={`${feature.id}-${geo.rsmKey}`}
            geography={geo}
            onClick={() => interactive && setSelected(feature)}
            style={{
              default: { fill: isSelected ? "#bfdbfe" : "#fde68a", fillOpacity: 0.45, stroke: isSelected ? "#0f172a" : "#d97706", strokeWidth: 1.2, outline: "none" },
              hover: { fill: "#fbbf24", fillOpacity: 0.5, stroke: "#0f172a", strokeWidth: 1.8, outline: "none" },
              pressed: { fill: "#f59e0b", fillOpacity: 0.5, stroke: "#0f172a", strokeWidth: 1.8, outline: "none" },
            }}
          />
        ))}
      </Geographies>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <div className="mx-auto max-w-[1550px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-5">
          <div className="text-[11px] font-bold uppercase tracking-[.18em] text-slate-500">VGB Tools · Geography</div>
          <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Geography Lab</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Explore physical, political and economic geography, then practise CBSE map-work through spatial interaction.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["India", "World"] as MapScope[]).map((item) => (
                <button key={item} onClick={() => setScope(item)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${scope === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{item}</button>
              ))}
              <button onClick={() => setMode(mode === "Explore" ? "Practice" : "Explore")} className={`rounded-xl px-4 py-2 text-sm font-semibold ${mode === "Practice" ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{mode === "Practice" ? "Map Explorer" : "Map Practice"}</button>
            </div>
          </div>
        </header>

        {mode === "Explore" ? (
          <section className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)_320px]">
            <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Layers</div>
              <div className="mt-3 space-y-1">
                {(["Political", "Physical", "Rivers", "Climate", "Resources"] as Layer[]).map((item) => (
                  <button key={item} onClick={() => setLayer(item)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold ${layer === item ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-50"}`}>
                    <span className={`h-2.5 w-2.5 rounded-full ${layer === item ? "bg-white" : item === "Political" ? "bg-blue-500" : item === "Physical" ? "bg-amber-500" : item === "Rivers" ? "bg-cyan-500" : item === "Climate" ? "bg-emerald-500" : "bg-violet-500"}`} />
                    {item}
                  </button>
                ))}
              </div>
              <div className="mt-5 rounded-2xl bg-slate-50 p-3 text-xs leading-5 text-slate-500">{layer === "Political" ? "Boundaries, capitals and major cities." : layer === "Physical" ? "Mountains, plateaus, deserts and relief features." : layer === "Rivers" ? "Major rivers, drainage and waterways." : layer === "Climate" ? "Latitudes, currents and climate-related geography." : "Ports, minerals, energy and transport features."}</div>
              <button onClick={() => { setLayer("Political"); setSelected(null); setSearch(""); setExploreZoom(1); }} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600">Reset explorer</button>
            </aside>

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">{scope} · {layer}</div>
                  <div className="mt-1 text-lg font-semibold">Interactive map</div>
                </div>
                <div className="flex gap-2">
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search feature…" className="w-44 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-slate-400" />
                  <button onClick={() => setExploreZoom((z) => Math.max(0.75, z - 0.2))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">−</button>
                  <button onClick={() => setExploreZoom((z) => Math.min(2, z + 0.2))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold">+</button>
                </div>
              </div>

              <div className="relative min-h-[680px] bg-slate-50">
                <ComposableMap projection={scope === "India" ? "geoMercator" : "geoEqualEarth"} projectionConfig={{ ...projectionConfig, scale: projectionConfig.scale * exploreZoom }} className="h-[680px] w-full">
                  <Sphere fill="#f8fafc" stroke="#cbd5e1" strokeWidth={0.7} />
                  <Graticule stroke="#e2e8f0" strokeWidth={0.35} />
                  <Geographies geography={scope === "India" ? INDIA_GEO : WORLD_GEO}>
                    {({ geographies }) => geographies.map((geo) => (
                      <Geography key={geo.rsmKey} geography={geo} fill="#e5e7eb" stroke="#94a3b8" strokeWidth={0.5} style={{ default: { outline: "none" }, hover: { outline: "none", fill: "#d5dbe3" }, pressed: { outline: "none" } }} />
                    ))}
                  </Geographies>
                  {filteredFeatures.map((feature) => renderFeature(feature))}
                </ComposableMap>
                <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-500 shadow-sm">{filteredFeatures.length} visible feature{filteredFeatures.length === 1 ? "" : "s"} · click a feature for details</div>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Selected feature</div>
                {selected ? (
                  <div className="mt-4">
                    <h2 className="text-xl font-semibold">{selected.name}</h2>
                    <div className="mt-1 text-xs font-semibold text-slate-400">{selected.type} · {selected.chapter}</div>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{selected.description}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">{selected.classes.map((c) => <span key={c} className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{c}</span>)}</div>
                  </div>
                ) : <p className="mt-4 text-sm leading-6 text-slate-500">Select a point, river, range or other mapped feature to inspect it.</p>}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Visible features</div>
                <div className="mt-3 max-h-[360px] space-y-1 overflow-auto pr-1">
                  {filteredFeatures.map((feature) => (
                    <button key={feature.id} onClick={() => setSelected(feature)} className={`w-full rounded-xl px-3 py-2 text-left text-sm ${selected?.id === feature.id ? "bg-slate-950 text-white" : "hover:bg-slate-50"}`}>
                      <div className="font-semibold">{feature.name}</div>
                      <div className={`text-[11px] ${selected?.id === feature.id ? "text-slate-300" : "text-slate-400"}`}>{feature.type}</div>
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </section>
        ) : (
          <section className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div><div className="text-[10px] font-bold uppercase tracking-[.18em] text-emerald-600">CBSE Map Practice</div><h2 className="mt-1 text-xl font-semibold">Spatial recall and map skills</h2></div>
                <div className="flex flex-wrap gap-2">{(["Locate", "Identify", "Mark", "Quiz"] as PracticeMode[]).map((item) => <button key={item} onClick={() => setPracticeMode(item)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${practiceMode === item ? "bg-slate-950 text-white" : "border border-slate-200 bg-white text-slate-700"}`}>{item}</button>)}</div>
                <div className="flex flex-wrap gap-2">{(["All", "Class 11", "Class 12"] as PracticeLevel[]).map((item) => <button key={item} onClick={() => setPracticeLevel(item)} className={`rounded-xl px-3 py-2 text-xs font-semibold ${practiceLevel === item ? "bg-emerald-600 text-white" : "border border-slate-200 bg-white text-slate-600"}`}>{item}</button>)}</div>
              </div>
            </div>

            {!question ? <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">No practice questions are available for this filter.</div> : (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 p-5">
                    <div className="flex items-start justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">{question.level} · {question.type}</div><h2 className="mt-1 text-xl font-semibold">{question.prompt}</h2></div><div className="text-right text-xs text-slate-500">{practiceIndex + 1} / {questions.length}</div></div>
                    <p className="mt-2 text-sm text-slate-500">{practiceMode === "Identify" ? "Identify the feature marked on the map." : practiceMode === "Mark" ? "Click the correct numbered location." : practiceMode === "Quiz" ? "Answer using the choices." : "Select the correct feature."}</p>
                  </div>
                  <div className="relative bg-slate-50">
                    <ComposableMap projection={scope === "India" ? "geoMercator" : "geoEqualEarth"} projectionConfig={projectionConfig} className="h-[650px] w-full">
                      <Sphere fill="#f8fafc" stroke="#cbd5e1" strokeWidth={0.7} /><Graticule stroke="#e2e8f0" strokeWidth={0.35} />
                      <Geographies geography={scope === "India" ? INDIA_GEO : WORLD_GEO}>{({ geographies }) => geographies.map((geo) => <Geography key={geo.rsmKey} geography={geo} fill="#e5e7eb" stroke="#94a3b8" strokeWidth={0.5} style={{ default: { outline: "none" }, hover: { outline: "none", fill: "#d5dbe3" }, pressed: { outline: "none" } }} />)}</Geographies>

                      {practiceMode === "Identify" && <Marker coordinates={question.coordinates}><circle r={9} fill="#ef4444" stroke="#fff" strokeWidth={3} /><circle r={17} fill="none" stroke="#ef4444" strokeWidth={1.5} opacity={0.45} /></Marker>}

                      {practiceMode === "Mark" && question.options.map((option, index) => {
                        const feature = allFeatures.find((f) => f.scope === scope && f.name === option);
                        if (!feature) return null;
                        const coordinates = featureCenter(feature);
                        const isAnswer = feature.name === question.answer;
                        const reveal = practiceResult !== "idle";
                        return <Marker key={option} coordinates={coordinates} onClick={() => answerByCoordinates(coordinates)}>
                          <circle r={15} fill={reveal ? (isAnswer ? "#10b981" : "#ef4444") : "#fff"} stroke="#0f172a" strokeWidth={1.5} className="cursor-pointer" />
                          <text textAnchor="middle" y={4} style={{ fontFamily: "system-ui", fontSize: 9, fontWeight: 800, fill: "#0f172a", pointerEvents: "none" }}>{index + 1}</text>
                        </Marker>;
                      })}

                      {practiceMode === "Locate" && practiceResult === "idle" && <g />}
                      {practiceResult !== "idle" && practiceMode !== "Identify" && practiceMode !== "Mark" && <Marker coordinates={question.coordinates}><circle r={9} fill={practiceResult === "correct" ? "#10b981" : "#ef4444"} stroke="#fff" strokeWidth={3} /></Marker>}
                    </ComposableMap>
                    <div className="absolute bottom-4 left-4 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs text-slate-500 shadow-sm">{practiceMode === "Identify" ? "Identify the marked location." : practiceMode === "Mark" ? "Click a numbered location." : "Answer from the panel."}</div>
                  </div>
                </div>

                <aside className="space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="grid grid-cols-3 gap-3">{[["Score", score], ["Attempts", attempts], ["Accuracy", `${accuracy}%`]].map(([label, value]) => <div key={String(label)}><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div><div className="mt-1 text-2xl font-semibold">{value}</div></div>)}</div></div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Answer</div>
                    {(practiceMode === "Locate" || practiceMode === "Quiz" || practiceMode === "Identify") && <div className="mt-4 space-y-2">{question.options.map((option) => <button key={option} onClick={() => answerQuestion(option)} disabled={practiceResult !== "idle"} className={`w-full rounded-xl border px-4 py-3 text-left text-sm font-medium ${practiceResult !== "idle" ? option === question.answer ? "border-emerald-300 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-slate-50 text-slate-400" : "border-slate-200 hover:bg-slate-50"}`}>{option}</button>)}</div>}
                    {practiceMode === "Mark" && <p className="mt-3 text-sm leading-6 text-slate-500">The numbered markers correspond to the answer choices. Click one directly on the map.</p>}

                    {practiceResult !== "idle" && <div className={`mt-4 rounded-2xl p-4 text-sm ${practiceResult === "correct" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}><div className="font-semibold">{practiceResult === "correct" ? "Correct." : `Not quite. The answer is ${question.answer}.`}</div><p className="mt-1 leading-5">{question.explanation}</p></div>}

                    <div className="mt-4 flex gap-2"><button onClick={nextQuestion} disabled={practiceResult === "idle"} className="flex-1 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40">Next question</button><button onClick={resetPractice} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold">Reset</button></div>
                  </div>

                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-[10px] font-bold uppercase tracking-[.18em] text-slate-400">Practice design</div><p className="mt-3 text-sm leading-6 text-slate-500">Questions are grouped by Class XI and XII and use actual mapped locations for the current dataset. The goal is spatial reasoning, not merely recognising a list of names.</p></div>
                </aside>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
