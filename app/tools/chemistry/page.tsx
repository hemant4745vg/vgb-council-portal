"use client";

import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";

type TabId =
  | "lab"
  | "xi"
  | "xii"
  | "practical"
  | "calculators"
  | "reference";

type ToolId =
  | "periodic"
  | "balance"
  | "moles"
  | "atomic"
  | "bonding"
  | "ph"
  | "redox"
  | "thermo"
  | "equilibrium"
  | "kinetics"
  | "electro"
  | "organic"
  | "stoich"
  | "solutions"
  | "limiting"
  | "coordination"
  | "chromatography"
  | "biomolecules"
  | "reactions"
  | "practical";

type Element = {
  z: number;
  symbol: string;
  name: string;
  mass: number;
  group: number;
  period: number;
  block: string;
  category: string;
  config: string;
};

const elements: Element[] = [
  { z: 1, symbol: "H", name: "Hydrogen", mass: 1.008, group: 1, period: 1, block: "s", category: "nonmetal", config: "1s¹" },
  { z: 2, symbol: "He", name: "Helium", mass: 4.003, group: 18, period: 1, block: "s", category: "noble", config: "1s²" },
  { z: 3, symbol: "Li", name: "Lithium", mass: 6.94, group: 1, period: 2, block: "s", category: "alkali", config: "[He] 2s¹" },
  { z: 4, symbol: "Be", name: "Beryllium", mass: 9.012, group: 2, period: 2, block: "s", category: "alkaline", config: "[He] 2s²" },
  { z: 5, symbol: "B", name: "Boron", mass: 10.81, group: 13, period: 2, block: "p", category: "metalloid", config: "[He] 2s² 2p¹" },
  { z: 6, symbol: "C", name: "Carbon", mass: 12.011, group: 14, period: 2, block: "p", category: "nonmetal", config: "[He] 2s² 2p²" },
  { z: 7, symbol: "N", name: "Nitrogen", mass: 14.007, group: 15, period: 2, block: "p", category: "nonmetal", config: "[He] 2s² 2p³" },
  { z: 8, symbol: "O", name: "Oxygen", mass: 15.999, group: 16, period: 2, block: "p", category: "nonmetal", config: "[He] 2s² 2p⁴" },
  { z: 9, symbol: "F", name: "Fluorine", mass: 18.998, group: 17, period: 2, block: "p", category: "halogen", config: "[He] 2s² 2p⁵" },
  { z: 10, symbol: "Ne", name: "Neon", mass: 20.180, group: 18, period: 2, block: "p", category: "noble", config: "[He] 2s² 2p⁶" },
  { z: 11, symbol: "Na", name: "Sodium", mass: 22.990, group: 1, period: 3, block: "s", category: "alkali", config: "[Ne] 3s¹" },
  { z: 12, symbol: "Mg", name: "Magnesium", mass: 24.305, group: 2, period: 3, block: "s", category: "alkaline", config: "[Ne] 3s²" },
  { z: 13, symbol: "Al", name: "Aluminium", mass: 26.982, group: 13, period: 3, block: "p", category: "post", config: "[Ne] 3s² 3p¹" },
  { z: 14, symbol: "Si", name: "Silicon", mass: 28.085, group: 14, period: 3, block: "p", category: "metalloid", config: "[Ne] 3s² 3p²" },
  { z: 15, symbol: "P", name: "Phosphorus", mass: 30.974, group: 15, period: 3, block: "p", category: "nonmetal", config: "[Ne] 3s² 3p³" },
  { z: 16, symbol: "S", name: "Sulfur", mass: 32.06, group: 16, period: 3, block: "p", category: "nonmetal", config: "[Ne] 3s² 3p⁴" },
  { z: 17, symbol: "Cl", name: "Chlorine", mass: 35.45, group: 17, period: 3, block: "p", category: "halogen", config: "[Ne] 3s² 3p⁵" },
  { z: 18, symbol: "Ar", name: "Argon", mass: 39.948, group: 18, period: 3, block: "p", category: "noble", config: "[Ne] 3s² 3p⁶" },
  { z: 19, symbol: "K", name: "Potassium", mass: 39.098, group: 1, period: 4, block: "s", category: "alkali", config: "[Ar] 4s¹" },
  { z: 20, symbol: "Ca", name: "Calcium", mass: 40.078, group: 2, period: 4, block: "s", category: "alkaline", config: "[Ar] 4s²" },
  { z: 21, symbol: "Sc", name: "Scandium", mass: 44.956, group: 3, period: 4, block: "d", category: "transition", config: "[Ar] 3d¹ 4s²" },
  { z: 22, symbol: "Ti", name: "Titanium", mass: 47.867, group: 4, period: 4, block: "d", category: "transition", config: "[Ar] 3d² 4s²" },
  { z: 23, symbol: "V", name: "Vanadium", mass: 50.942, group: 5, period: 4, block: "d", category: "transition", config: "[Ar] 3d³ 4s²" },
  { z: 24, symbol: "Cr", name: "Chromium", mass: 51.996, group: 6, period: 4, block: "d", category: "transition", config: "[Ar] 3d⁵ 4s¹" },
  { z: 25, symbol: "Mn", name: "Manganese", mass: 54.938, group: 7, period: 4, block: "d", category: "transition", config: "[Ar] 3d⁵ 4s²" },
  { z: 26, symbol: "Fe", name: "Iron", mass: 55.845, group: 8, period: 4, block: "d", category: "transition", config: "[Ar] 3d⁶ 4s²" },
  { z: 27, symbol: "Co", name: "Cobalt", mass: 58.933, group: 9, period: 4, block: "d", category: "transition", config: "[Ar] 3d⁷ 4s²" },
  { z: 28, symbol: "Ni", name: "Nickel", mass: 58.693, group: 10, period: 4, block: "d", category: "transition", config: "[Ar] 3d⁸ 4s²" },
  { z: 29, symbol: "Cu", name: "Copper", mass: 63.546, group: 11, period: 4, block: "d", category: "transition", config: "[Ar] 3d¹⁰ 4s¹" },
  { z: 30, symbol: "Zn", name: "Zinc", mass: 65.38, group: 12, period: 4, block: "d", category: "transition", config: "[Ar] 3d¹⁰ 4s²" },
  { z: 31, symbol: "Ga", name: "Gallium", mass: 69.723, group: 13, period: 4, block: "p", category: "post", config: "[Ar] 3d¹⁰ 4s² 4p¹" },
  { z: 32, symbol: "Ge", name: "Germanium", mass: 72.630, group: 14, period: 4, block: "p", category: "metalloid", config: "[Ar] 3d¹⁰ 4s² 4p²" },
  { z: 33, symbol: "As", name: "Arsenic", mass: 74.922, group: 15, period: 4, block: "p", category: "metalloid", config: "[Ar] 3d¹⁰ 4s² 4p³" },
  { z: 34, symbol: "Se", name: "Selenium", mass: 78.971, group: 16, period: 4, block: "p", category: "nonmetal", config: "[Ar] 3d¹⁰ 4s² 4p⁴" },
  { z: 35, symbol: "Br", name: "Bromine", mass: 79.904, group: 17, period: 4, block: "p", category: "halogen", config: "[Ar] 3d¹⁰ 4s² 4p⁵" },
  { z: 36, symbol: "Kr", name: "Krypton", mass: 83.798, group: 18, period: 4, block: "p", category: "noble", config: "[Ar] 3d¹⁰ 4s² 4p⁶" },
  { z: 37, symbol: "Rb", name: "Rubidium", mass: 85.468, group: 1, period: 5, block: "s", category: "alkali", config: "[Kr] 5s¹" },
  { z: 38, symbol: "Sr", name: "Strontium", mass: 87.62, group: 2, period: 5, block: "s", category: "alkaline", config: "[Kr] 5s²" },
  { z: 39, symbol: "Y", name: "Yttrium", mass: 88.906, group: 3, period: 5, block: "d", category: "transition", config: "[Kr] 4d¹ 5s²" },
  { z: 40, symbol: "Zr", name: "Zirconium", mass: 91.224, group: 4, period: 5, block: "d", category: "transition", config: "[Kr] 4d² 5s²" },
  { z: 41, symbol: "Nb", name: "Niobium", mass: 92.906, group: 5, period: 5, block: "d", category: "transition", config: "[Kr] 4d⁴ 5s¹" },
  { z: 42, symbol: "Mo", name: "Molybdenum", mass: 95.95, group: 6, period: 5, block: "d", category: "transition", config: "[Kr] 4d⁵ 5s¹" },
  { z: 43, symbol: "Tc", name: "Technetium", mass: 98, group: 7, period: 5, block: "d", category: "transition", config: "[Kr] 4d⁵ 5s²" },
  { z: 44, symbol: "Ru", name: "Ruthenium", mass: 101.07, group: 8, period: 5, block: "d", category: "transition", config: "[Kr] 4d⁷ 5s¹" },
  { z: 45, symbol: "Rh", name: "Rhodium", mass: 102.906, group: 9, period: 5, block: "d", category: "transition", config: "[Kr] 4d⁸ 5s¹" },
  { z: 46, symbol: "Pd", name: "Palladium", mass: 106.42, group: 10, period: 5, block: "d", category: "transition", config: "[Kr] 4d¹⁰" },
  { z: 47, symbol: "Ag", name: "Silver", mass: 107.868, group: 11, period: 5, block: "d", category: "transition", config: "[Kr] 4d¹⁰ 5s¹" },
  { z: 48, symbol: "Cd", name: "Cadmium", mass: 112.414, group: 12, period: 5, block: "d", category: "transition", config: "[Kr] 4d¹⁰ 5s²" },
  { z: 49, symbol: "In", name: "Indium", mass: 114.818, group: 13, period: 5, block: "p", category: "post", config: "[Kr] 4d¹⁰ 5s² 5p¹" },
  { z: 50, symbol: "Sn", name: "Tin", mass: 118.710, group: 14, period: 5, block: "p", category: "post", config: "[Kr] 4d¹⁰ 5s² 5p²" },
  { z: 51, symbol: "Sb", name: "Antimony", mass: 121.760, group: 15, period: 5, block: "p", category: "metalloid", config: "[Kr] 4d¹⁰ 5s² 5p³" },
  { z: 52, symbol: "Te", name: "Tellurium", mass: 127.60, group: 16, period: 5, block: "p", category: "metalloid", config: "[Kr] 4d¹⁰ 5s² 5p⁴" },
  { z: 53, symbol: "I", name: "Iodine", mass: 126.904, group: 17, period: 5, block: "p", category: "halogen", config: "[Kr] 4d¹⁰ 5s² 5p⁵" },
  { z: 54, symbol: "Xe", name: "Xenon", mass: 131.293, group: 18, period: 5, block: "p", category: "noble", config: "[Kr] 4d¹⁰ 5s² 5p⁶" },
  { z: 55, symbol: "Cs", name: "Cesium", mass: 132.905, group: 1, period: 6, block: "s", category: "alkali", config: "[Xe] 6s¹" },
  { z: 56, symbol: "Ba", name: "Barium", mass: 137.327, group: 2, period: 6, block: "s", category: "alkaline", config: "[Xe] 6s²" },
  { z: 58, symbol: "Ce", name: "Cerium", mass: 140.116, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f¹ 5d¹ 6s²" },
  { z: 59, symbol: "Pr", name: "Praseodymium", mass: 140.908, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f³ 6s²" },
  { z: 60, symbol: "Nd", name: "Neodymium", mass: 144.242, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f⁴ 6s²" },
  { z: 61, symbol: "Pm", name: "Promethium", mass: 145, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f⁵ 6s²" },
  { z: 62, symbol: "Sm", name: "Samarium", mass: 150.36, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f⁶ 6s²" },
  { z: 63, symbol: "Eu", name: "Europium", mass: 151.964, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f⁷ 6s²" },
  { z: 64, symbol: "Gd", name: "Gadolinium", mass: 157.25, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f⁷ 5d¹ 6s²" },
  { z: 65, symbol: "Tb", name: "Terbium", mass: 158.925, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f⁹ 6s²" },
  { z: 66, symbol: "Dy", name: "Dysprosium", mass: 162.500, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f¹⁰ 6s²" },
  { z: 67, symbol: "Ho", name: "Holmium", mass: 164.930, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f¹¹ 6s²" },
  { z: 68, symbol: "Er", name: "Erbium", mass: 167.259, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f¹² 6s²" },
  { z: 69, symbol: "Tm", name: "Thulium", mass: 168.934, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f¹³ 6s²" },
  { z: 70, symbol: "Yb", name: "Ytterbium", mass: 173.045, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f¹⁴ 6s²" },
  { z: 71, symbol: "Lu", name: "Lutetium", mass: 174.967, group: 0, period: 6, block: "f", category: "lanthanide", config: "[Xe] 4f¹⁴ 5d¹ 6s²" },
  { z: 57, symbol: "La", name: "Lanthanum", mass: 138.905, group: 3, period: 6, block: "f", category: "lanthanide", config: "[Xe] 5d¹ 6s²" },
  { z: 72, symbol: "Hf", name: "Hafnium", mass: 178.49, group: 4, period: 6, block: "d", category: "transition", config: "[Xe] 4f¹⁴ 5d² 6s²" },
  { z: 73, symbol: "Ta", name: "Tantalum", mass: 180.948, group: 5, period: 6, block: "d", category: "transition", config: "[Xe] 4f¹⁴ 5d³ 6s²" },
  { z: 74, symbol: "W", name: "Tungsten", mass: 183.84, group: 6, period: 6, block: "d", category: "transition", config: "[Xe] 4f¹⁴ 5d⁴ 6s²" },
  { z: 75, symbol: "Re", name: "Rhenium", mass: 186.207, group: 7, period: 6, block: "d", category: "transition", config: "[Xe] 4f¹⁴ 5d⁵ 6s²" },
  { z: 76, symbol: "Os", name: "Osmium", mass: 190.23, group: 8, period: 6, block: "d", category: "transition", config: "[Xe] 4f¹⁴ 5d⁶ 6s²" },
  { z: 77, symbol: "Ir", name: "Iridium", mass: 192.217, group: 9, period: 6, block: "d", category: "transition", config: "[Xe] 4f¹⁴ 5d⁷ 6s²" },
  { z: 78, symbol: "Pt", name: "Platinum", mass: 195.084, group: 10, period: 6, block: "d", category: "transition", config: "[Xe] 4f¹⁴ 5d⁹ 6s¹" },
  { z: 79, symbol: "Au", name: "Gold", mass: 196.967, group: 11, period: 6, block: "d", category: "transition", config: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹" },
  { z: 80, symbol: "Hg", name: "Mercury", mass: 200.592, group: 12, period: 6, block: "d", category: "transition", config: "[Xe] 4f¹⁴ 5d¹⁰ 6s²" },
  { z: 81, symbol: "Tl", name: "Thallium", mass: 204.38, group: 13, period: 6, block: "p", category: "post", config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹" },
  { z: 82, symbol: "Pb", name: "Lead", mass: 207.2, group: 14, period: 6, block: "p", category: "post", config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²" },
  { z: 83, symbol: "Bi", name: "Bismuth", mass: 208.980, group: 15, period: 6, block: "p", category: "post", config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³" },
  { z: 84, symbol: "Po", name: "Polonium", mass: 209, group: 16, period: 6, block: "p", category: "post", config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴" },
  { z: 85, symbol: "At", name: "Astatine", mass: 210, group: 17, period: 6, block: "p", category: "halogen", config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵" },
  { z: 86, symbol: "Rn", name: "Radon", mass: 222, group: 18, period: 6, block: "p", category: "noble", config: "[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶" },
  { z: 87, symbol: "Fr", name: "Francium", mass: 223, group: 1, period: 7, block: "s", category: "alkali", config: "[Rn] 7s¹" },
  { z: 88, symbol: "Ra", name: "Radium", mass: 226, group: 2, period: 7, block: "s", category: "alkaline", config: "[Rn] 7s²" },
  { z: 90, symbol: "Th", name: "Thorium", mass: 232.038, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 6d² 7s²" },
  { z: 91, symbol: "Pa", name: "Protactinium", mass: 231.036, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f² 6d¹ 7s²" },
  { z: 92, symbol: "U", name: "Uranium", mass: 238.029, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f³ 6d¹ 7s²" },
  { z: 93, symbol: "Np", name: "Neptunium", mass: 237, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f⁴ 6d¹ 7s²" },
  { z: 94, symbol: "Pu", name: "Plutonium", mass: 244, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f⁶ 7s²" },
  { z: 95, symbol: "Am", name: "Americium", mass: 243, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f⁷ 7s²" },
  { z: 96, symbol: "Cm", name: "Curium", mass: 247, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f⁷ 6d¹ 7s²" },
  { z: 97, symbol: "Bk", name: "Berkelium", mass: 247, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f⁹ 7s²" },
  { z: 98, symbol: "Cf", name: "Californium", mass: 251, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f¹⁰ 7s²" },
  { z: 99, symbol: "Es", name: "Einsteinium", mass: 252, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f¹¹ 7s²" },
  { z: 100, symbol: "Fm", name: "Fermium", mass: 257, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f¹² 7s²" },
  { z: 101, symbol: "Md", name: "Mendelevium", mass: 258, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f¹³ 7s²" },
  { z: 102, symbol: "No", name: "Nobelium", mass: 259, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f¹⁴ 7s²" },
  { z: 103, symbol: "Lr", name: "Lawrencium", mass: 266, group: 0, period: 7, block: "f", category: "actinide", config: "[Rn] 5f¹⁴ 7s² 7p¹" },
  { z: 89, symbol: "Ac", name: "Actinium", mass: 227, group: 3, period: 7, block: "f", category: "actinide", config: "[Rn] 6d¹ 7s²" },
  { z: 104, symbol: "Rf", name: "Rutherfordium", mass: 267, group: 4, period: 7, block: "d", category: "transition", config: "[Rn] 5f¹⁴ 6d² 7s²" },
  { z: 105, symbol: "Db", name: "Dubnium", mass: 268, group: 5, period: 7, block: "d", category: "transition", config: "[Rn] 5f¹⁴ 6d³ 7s²" },
  { z: 106, symbol: "Sg", name: "Seaborgium", mass: 269, group: 6, period: 7, block: "d", category: "transition", config: "[Rn] 5f¹⁴ 6d⁴ 7s²" },
  { z: 107, symbol: "Bh", name: "Bohrium", mass: 270, group: 7, period: 7, block: "d", category: "transition", config: "[Rn] 5f¹⁴ 6d⁵ 7s²" },
  { z: 108, symbol: "Hs", name: "Hassium", mass: 277, group: 8, period: 7, block: "d", category: "transition", config: "[Rn] 5f¹⁴ 6d⁶ 7s²" },
  { z: 109, symbol: "Mt", name: "Meitnerium", mass: 278, group: 9, period: 7, block: "d", category: "transition", config: "[Rn] 5f¹⁴ 6d⁷ 7s²" },
  { z: 110, symbol: "Ds", name: "Darmstadtium", mass: 281, group: 10, period: 7, block: "d", category: "transition", config: "[Rn] 5f¹⁴ 6d⁸ 7s²" },
  { z: 111, symbol: "Rg", name: "Roentgenium", mass: 282, group: 11, period: 7, block: "d", category: "transition", config: "[Rn] 5f¹⁴ 6d⁹ 7s²" },
  { z: 112, symbol: "Cn", name: "Copernicium", mass: 285, group: 12, period: 7, block: "d", category: "transition", config: "[Rn] 5f¹⁴ 6d¹⁰ 7s²" },
  { z: 113, symbol: "Nh", name: "Nihonium", mass: 286, group: 13, period: 7, block: "p", category: "post", config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹" },
  { z: 114, symbol: "Fl", name: "Flerovium", mass: 289, group: 14, period: 7, block: "p", category: "post", config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²" },
  { z: 115, symbol: "Mc", name: "Moscovium", mass: 290, group: 15, period: 7, block: "p", category: "post", config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³" },
  { z: 116, symbol: "Lv", name: "Livermorium", mass: 293, group: 16, period: 7, block: "p", category: "post", config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴" },
  { z: 117, symbol: "Ts", name: "Tennessine", mass: 294, group: 17, period: 7, block: "p", category: "halogen", config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵" },
  { z: 118, symbol: "Og", name: "Oganesson", mass: 294, group: 18, period: 7, block: "p", category: "noble", config: "[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶" },
];

const bySymbol = Object.fromEntries(elements.map((e) => [e.symbol, e]));
const atomicMasses: Record<string, number> = Object.fromEntries(elements.map((e) => [e.symbol, e.mass]));

const xiUnits = [
  ["01", "Some Basic Concepts of Chemistry", "7 marks", "Mole concept · stoichiometry · uncertainty"],
  ["02", "Structure of Atom", "9 marks", "Models · Bohr · quantum mechanics"],
  ["03", "Classification & Periodicity", "6 marks", "Periodic law · blocks · trends"],
  ["04", "Chemical Bonding", "7 marks", "VSEPR · hybridisation · MOT · H-bonding"],
  ["05", "Thermodynamics", "9 marks", "ΔU · ΔH · calorimetry · ΔG"],
  ["06", "Equilibrium", "7 marks", "K · Q · ionic equilibrium · buffers"],
  ["07", "Redox Reactions", "4 marks", "Oxidation number · electron transfer"],
  ["08", "Organic Chemistry Basics", "11 marks", "IUPAC · isomerism · mechanisms"],
  ["09", "Hydrocarbons", "10 marks", "Alkanes · alkenes · alkynes · aromatics"],
];

const xiiUnits = [
  ["01", "Solutions", "7 marks", "Concentration · colligative properties"],
  ["02", "Electrochemistry", "9 marks", "Cells · Nernst · conductance · corrosion"],
  ["03", "Chemical Kinetics", "7 marks", "Rate · order · Arrhenius · collision theory"],
  ["04", "d- and f-Block Elements", "7 marks", "Transition elements · lanthanoids"],
  ["05", "Coordination Compounds", "7 marks", "Werner · nomenclature · isomerism"],
  ["06", "Haloalkanes & Haloarenes", "6 marks", "C–X bond · reactions"],
  ["07", "Alcohols, Phenols & Ethers", "6 marks", "Functional groups · reactions"],
  ["08", "Aldehydes, Ketones & Acids", "8 marks", "Carbonyl · carboxyl chemistry"],
  ["09", "Amines", "6 marks", "Amines · diazonium salts"],
  ["10", "Biomolecules", "7 marks", "Carbohydrates · proteins · nucleic acids"],
];

const toolCards: { id: ToolId; icon: string; title: string; desc: string; tag: string }[] = [
  { id: "periodic", icon: "⚛", title: "Periodic Table", desc: "Explore elements, configurations and periodic trends.", tag: "XI · U3" },
  { id: "balance", icon: "⚗", title: "Equation Balancer", desc: "Balance common molecular equations and inspect atom counts.", tag: "XI · U1/U7" },
  { id: "moles", icon: "∿", title: "Mole Calculator", desc: "Move between mass, moles, particles and molar mass.", tag: "XI · U1" },
  { id: "atomic", icon: "◉", title: "Atomic Structure", desc: "Explore shells, configurations and quantum-number ideas.", tag: "XI · U2" },
  { id: "bonding", icon: "⌬", title: "Bonding & VSEPR", desc: "Lewis structures, geometry, bond angles and hybridisation.", tag: "XI · U4" },
  { id: "ph", icon: "pH", title: "pH & Titration", desc: "Calculate pH and visualize simple titration curves.", tag: "XI · U6 · Practical" },
  { id: "redox", icon: "⇄", title: "Redox Analyzer", desc: "Track oxidation numbers, oxidized and reduced species.", tag: "XI · U7" },
  { id: "thermo", icon: "ΔH", title: "Thermodynamics", desc: "Calorimetry, Hess's law and Gibbs energy tools.", tag: "XI · U5" },
  { id: "equilibrium", icon: "⇌", title: "Equilibrium Lab", desc: "Explore K, Q and concentration-driven shifts.", tag: "XI · U6" },
  { id: "kinetics", icon: "↗", title: "Kinetics", desc: "Model concentration-time curves and reaction rate ideas.", tag: "XII · U3" },
  { id: "electro", icon: "⚡", title: "Electrochemistry", desc: "Cell potential, Nernst equation and galvanic cells.", tag: "XII · U2" },
  { id: "organic", icon: "⌁", title: "Organic Explorer", desc: "Formula, functional groups, isomerism and IUPAC basics.", tag: "XI · U8/U9" },
  { id: "stoich", icon: "∑", title: "Stoichiometry", desc: "Use reaction ratios and limiting-reagent reasoning.", tag: "XI · U1" },
  { id: "solutions", icon: "M", title: "Solutions", desc: "Molarity, molality, mole fraction, mass percent and dilution.", tag: "XII · U1" },
  { id: "limiting", icon: "LR", title: "Limiting Reagent", desc: "Compare reactants, identify the limiting reagent and theoretical yield.", tag: "XI · U1" },
  { id: "coordination", icon: "◈", title: "Coordination Chemistry", desc: "Oxidation state, coordination number, charge and geometry.", tag: "XII · U5" },
  { id: "chromatography", icon: "Rf", title: "Chromatography", desc: "Calculate Rf and compare conceptual separation results.", tag: "Practical" },
  { id: "biomolecules", icon: "DNA", title: "Biomolecules", desc: "Navigate carbohydrates, proteins, nucleic acids and lipids.", tag: "XII · U10" },
  { id: "reactions", icon: "→", title: "Organic Reaction Map", desc: "Trace common Class XI–XII functional-group transformations.", tag: "XI/XII · Organic" },
  { id: "practical", icon: "🧪", title: "Practical Lab", desc: "Interactive, conceptual versions of core practical skills.", tag: "Practical" },
];

const practicals = [
  ["Volumetric Analysis", "Standard solution → titre → concentration", "XI/XII"],
  ["Salt Analysis", "Ion identification through a decision tree", "XI/XII"],
  ["pH Experiments", "Acid/base comparisons and titration curves", "XI"],
  ["Chemical Equilibrium", "Visualize concentration-driven shifts", "XI"],
  ["Kinetics", "Rate dependence on concentration and temperature", "XII"],
  ["Thermochemistry", "Energy change and calorimetry concepts", "XII"],
  ["Electrochemistry", "Zn/Cu cell and concentration effects", "XII"],
  ["Chromatography", "Separation and Rf calculation", "XII"],
  ["Functional Groups", "Identify organic functional groups from observations", "XII"],
  ["Biomolecule Tests", "Carbohydrates, proteins and food analysis", "XII"],
];

const organicExamples = [
  ["CH₄", "Methane", "alkane"],
  ["C₂H₅OH", "Ethanol", "alcohol"],
  ["CH₃COOH", "Ethanoic acid", "carboxylic acid"],
  ["CH₃CHO", "Ethanal", "aldehyde"],
  ["CH₃COCH₃", "Propanone", "ketone"],
  ["CH₃CH₂NH₂", "Ethanamine", "amine"],
  ["CH₂=CH₂", "Ethene", "alkene"],
  ["HC≡CH", "Ethyne", "alkyne"],
];

function parseFormula(formula: string) {
  const clean = formula.replace(/\s+/g, "").replace(/[·•].*$/, "");
  const result: Record<string, number> = {};
  let index = 0;

  const merge = (target: Record<string, number>, source: Record<string, number>, multiplier: number) => {
    Object.entries(source).forEach(([symbol, count]) => {
      target[symbol] = (target[symbol] || 0) + count * multiplier;
    });
  };

  const readNumber = () => {
    const start = index;
    while (index < clean.length && /[0-9]/.test(clean[index])) index++;
    return start === index ? 1 : Number(clean.slice(start, index));
  };

  const parseGroup = (untilClose = false): Record<string, number> => {
    const group: Record<string, number> = {};
    while (index < clean.length) {
      if (clean[index] === ")") {
        if (untilClose) index++;
        break;
      }
      if (clean[index] === "(") {
        index++;
        const nested = parseGroup(true);
        const multiplier = readNumber();
        merge(group, nested, multiplier);
        continue;
      }
      const match = clean.slice(index).match(/^([A-Z][a-z]?)/);
      if (!match) {
        index++;
        continue;
      }
      const symbol = match[1];
      index += symbol.length;
      const multiplier = readNumber();
      merge(group, { [symbol]: 1 }, multiplier);
    }
    return group;
  };

  return parseGroup();
}

function molarMass(formula: string) {
  const parsed = parseFormula(formula);
  return Object.entries(parsed).reduce((sum, [s, n]) => sum + atomicMasses[s] * n, 0);
}

function subscriptFormula(formula: string) {
  return formula.replace(/(\d+)/g, (_, n) => String(n).split("").map((d) => "₀₁₂₃₄₅₆₇₈₉"[Number(d)]).join(""));
}

function gcdInt(a: number, b: number): number {
  a = Math.abs(a); b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}
function lcmInt(a: number, b: number) {
  return Math.abs(a * b) / gcdInt(a, b);
}
function balanceEquation(input: string) {
  const [leftRaw, rightRaw] = input.split(/→|->|=/).map((x) => x.trim());
  if (!leftRaw || !rightRaw) return { text: input, coefficients: [], ok: false, message: "Use the form reactants → products." };
  const left = leftRaw.split("+").map((x) => x.trim()).filter(Boolean);
  const right = rightRaw.split("+").map((x) => x.trim()).filter(Boolean);
  const formulas = [...left, ...right];
  const counts = formulas.map(parseFormula);
  const elementsSet = Array.from(new Set(formulas.flatMap((f) => Object.keys(parseFormula(f)))));
  if (!elementsSet.length || formulas.some((f) => !Object.keys(parseFormula(f)).length)) {
    return { text: input, coefficients: [], ok: false, message: "Check the molecular formulae and element symbols." };
  }

  // Search integer coefficients with one coefficient fixed to 1.
  // Every valid positive solution can be normalized to a primitive integer vector.
  const n = formulas.length;
  const max = 12;
  const tryFixed = (fixedIndex: number) => {
    const recurse = (idx: number, coeffs: number[]): number[] | null => {
      if (idx === n) {
        for (const el of elementsSet) {
          const total = coeffs.reduce((sum, c, i) =>
            sum + c * (i < left.length ? 1 : -1) * (counts[i][el] || 0), 0);
          if (total !== 0) return null;
        }
        return coeffs;
      }
      if (idx === fixedIndex) return recurse(idx + 1, [...coeffs, 1]);
      for (let c = 1; c <= max; c++) {
        const found = recurse(idx + 1, [...coeffs, c]);
        if (found) return found;
      }
      return null;
    };
    return recurse(0, []);
  };

  let found: number[] | null = null;
  for (let fixed = 0; fixed < n && !found; fixed++) found = tryFixed(fixed);
  if (!found) return { text: input, coefficients: [], ok: false, message: "No small-integer balance found. Try checking the formulae." };

  const g = found.reduce(gcdInt);
  const normalized = found.map((x) => x / g);
  const formatSide = (arr: string[], offset: number) =>
    arr.map((f, i) => `${normalized[offset + i] === 1 ? "" : normalized[offset + i] + " "}${subscriptFormula(f)}`).join(" + ");
  return {
    text: `${formatSide(left, 0)} → ${formatSide(right, left.length)}`,
    coefficients: normalized,
    ok: true,
    message: "Atoms are conserved on both sides."
  };
}

function ToolShell({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return <section className="chem-tool"><div className="tool-head"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div></div>{children}</section>;
}

function PeriodicTable() {
  const [selected, setSelected] = useState<Element>(bySymbol.C);
  const [filter, setFilter] = useState("all");
  const visible = elements.filter((e) => filter === "all" || e.category === filter || e.block === filter);
  return <ToolShell title="Periodic Table Explorer" eyebrow="XI · UNIT 3">
    <div className="controls"><select value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">All elements</option><option value="s">s-block</option><option value="p">p-block</option><option value="d">d-block</option><option value="f">f-block</option><option value="noble">Noble gases</option><option value="halogen">Halogens</option><option value="transition">Transition metals</option></select><div className="hint">Click an element to inspect it.</div></div>
    <div className="periodic-grid">{visible.map((e) => <button key={e.z} style={{gridColumn:e.group,gridRow:e.block==="f"?(e.period===6?8:9):e.period}} className={`element ${selected.z === e.z ? "selected" : ""} cat-${e.category}`} onClick={() => setSelected(e)}><small>{e.z}</small><strong>{e.symbol}</strong><span>{e.name}</span></button>)}</div>
    <div className="element-detail"><div className="big-symbol">{selected.symbol}</div><div><h3>{selected.name}</h3><p>Atomic number {selected.z} · Relative atomic mass {selected.mass}</p><p>Group {selected.group} · Period {selected.period} · {selected.block}-block</p><code>{selected.config}</code></div><div className="property-list"><span>Category <b>{selected.category}</b></span><span>Valence pattern <b>{selected.config.split(" ").slice(-1)[0]}</b></span></div></div>
  </ToolShell>;
}

function EquationBalancer() {
  const [eq, setEq] = useState("Fe + O2 → Fe2O3");
  const result = useMemo(() => balanceEquation(eq), [eq]);
  return <ToolShell title="Chemical Equation Balancer" eyebrow="XI · UNITS 1 & 7"><div className="input-row"><input value={eq} onChange={(e) => setEq(e.target.value)} aria-label="chemical equation"/><button className="primary" onClick={() => setEq(eq)}>Balance</button></div><div className={`result-box ${result.ok ? "success" : ""}`}><span className="result-label">Balanced equation</span><strong>{result.text}</strong><p>{result.message}</p></div><div className="example-row">{["H2 + O2 → H2O", "Na + Cl2 → NaCl", "C3H8 + O2 → CO2 + H2O"].map((x) => <button key={x} onClick={() => setEq(x)}>{x}</button>)}</div></ToolShell>;
}

function MoleCalculator() {
  const [formula, setFormula] = useState("H2O");
  const [mass, setMass] = useState("18");
  const mm = molarMass(formula);
  const moles = Number(mass) / (mm || 1);
  const particles = moles * 6.02214076e23;
  return <ToolShell title="Mole & Molar Mass" eyebrow="XI · UNIT 1"><div className="split"><div><label>Formula<input value={formula} onChange={(e) => setFormula(e.target.value)} /></label><label>Mass (g)<input type="number" value={mass} onChange={(e) => setMass(e.target.value)} /></label></div><div className="metric-grid"><div><span>Molar mass</span><b>{Number.isFinite(mm) ? mm.toFixed(3) : "—"} g mol⁻¹</b></div><div><span>Moles</span><b>{Number.isFinite(moles) ? moles.toPrecision(5) : "—"}</b></div><div><span>Particles</span><b>{Number.isFinite(particles) ? particles.toExponential(3) : "—"}</b></div><div><span>Atoms</span><b>{Number.isFinite(particles) ? (particles * Object.values(parseFormula(formula)).reduce((a,b)=>a+b,0)).toExponential(3) : "—"}</b></div></div></div></ToolShell>;
}

function AtomicStructure() {
  const [z, setZ] = useState("11");
  const n = Math.max(1, Math.min(118, Number(z) || 1));
  const element = elements.find((e) => e.z === n) || elements[0];
  const shells: number[] = [];
  let remaining = n;
  const capacities = [2, 8, 18, 32, 32, 18, 8];
  for (const cap of capacities) { const take = Math.min(remaining, cap); shells.push(take); remaining -= take; if (!remaining) break; }
  return <ToolShell title="Atomic Structure Explorer" eyebrow="XI · UNIT 2"><div className="input-row"><label>Atomic number<input type="number" min="1" max="118" value={z} onChange={(e)=>setZ(e.target.value)} /></label><div className="selected-mini"><strong>{element.symbol}</strong> {element.name}</div></div><div className="atom-stage"><div className="nucleus"><b>{element.symbol}</b><small>p {element.z}</small></div>{shells.map((count, i) => <div key={i} className="shell" style={{ width: `${100 + i*62}px`, height: `${100 + i*62}px` }}>{Array.from({length: count}).map((_,j)=><span key={j} className="electron" style={{transform:`rotate(${j*(360/count)}deg) translateY(-${50+i*31}px)`}} />)}<em>n={i+1}</em></div>)}</div><div className="config-card"><span>Electron configuration</span><strong>{element.config}</strong><div className="shell-summary">{shells.map((x,i)=><span key={i}>n={i+1}: <b>{x}</b></span>)}</div></div></ToolShell>;
}

const geometry: Record<string, {shape:string; angle:string; hybrid:string; note:string}> = {
  CH4:{shape:"Tetrahedral",angle:"109.5°",hybrid:"sp³",note:"Four bonding pairs around carbon."},
  NH3:{shape:"Trigonal pyramidal",angle:"~107°",hybrid:"sp³",note:"One lone pair compresses the bond angle."},
  H2O:{shape:"Bent / V-shaped",angle:"~104.5°",hybrid:"sp³",note:"Two lone pairs create stronger repulsion."},
  BF3:{shape:"Trigonal planar",angle:"120°",hybrid:"sp²",note:"Three electron domains around boron."},
  CO2:{shape:"Linear",angle:"180°",hybrid:"sp",note:"Two electron domains around carbon."},
  BeCl2:{shape:"Linear",angle:"180°",hybrid:"sp",note:"Two bonding domains around beryllium."},
  PCl5:{shape:"Trigonal bipyramidal",angle:"90° / 120°",hybrid:"sp³d",note:"Five electron domains."},
  SF6:{shape:"Octahedral",angle:"90°",hybrid:"sp³d²",note:"Six electron domains."},
};

function Bonding() {
  const [formula, setFormula] = useState("CH4");
  const data = geometry[formula] || geometry.CH4;
  return <ToolShell title="Lewis · VSEPR · Hybridisation" eyebrow="XI · UNIT 4"><div className="example-row">{Object.keys(geometry).map((x)=><button className={x===formula?"active":""} key={x} onClick={()=>setFormula(x)}>{subscriptFormula(x)}</button>)}</div><div className="molecule-stage"><div className="molecule-center">{formula.replace(/\d/g,"")}</div><div className="bond-line one"/><div className="bond-line two"/><div className="bond-line three"/><div className="bond-line four"/></div><div className="metric-grid"><div><span>Geometry</span><b>{data.shape}</b></div><div><span>Bond angle</span><b>{data.angle}</b></div><div><span>Hybridisation</span><b>{data.hybrid}</b></div><div><span>Interpretation</span><b>{data.note}</b></div></div></ToolShell>;
}

function PHLab() {
  const [acid, setAcid] = useState("0.001");
  const c = Math.max(1e-14, Number(acid) || 1e-3);
  const pH = -Math.log10(c);
  const points = Array.from({length: 25},(_,i)=>({x:i,y:7 + 6*Math.tanh((i-12)/2)}));
  return <ToolShell title="pH & Titration Lab" eyebrow="XI · UNIT 6 · PRACTICAL"><div className="split"><div><label>[H⁺] (mol L⁻¹)<input value={acid} onChange={e=>setAcid(e.target.value)} /></label><div className="result-box success"><span>Calculated pH</span><strong>{pH.toFixed(3)}</strong><p>{pH < 7 ? "Acidic solution" : pH > 7 ? "Basic solution" : "Neutral solution"}</p></div></div><div><div className="ph-scale">{Array.from({length:15},(_,i)=><span key={i} className={Math.round(pH)===i?"mark":""}>{i}</span>)}</div><svg viewBox="0 0 500 180" className="chart" role="img" aria-label="titration curve"><polyline fill="none" stroke="currentColor" strokeWidth="3" points={points.map(p=>`${p.x*20},${160-p.y*12}`).join(" ")} /></svg></div></div><p className="safety-note">This is a conceptual simulator. Real laboratory work should follow your school laboratory instructions and teacher supervision.</p></ToolShell>;
}

function Redox() {
  const [formula, setFormula] = useState("KMnO4");
  const parsed = parseFormula(formula);
  const common: Record<string,string> = {K:"+1",O:"−2",Mn:"+7",Fe:"+2/+3",Cu:"+1/+2",Cl:"−1",S:"−2/+4/+6",N:"−3/+1/+2/+3/+4/+5"};
  return <ToolShell title="Oxidation Number Explorer" eyebrow="XI · UNIT 7"><div className="input-row"><input value={formula} onChange={e=>setFormula(e.target.value)} /><span className="hint">Common oxidation states shown for each element.</span></div><div className="ion-grid">{Object.keys(parsed).map(s=><div key={s}><strong>{s}</strong><span>{common[s] || "variable"}</span></div>)}</div><div className="result-box"><span>Redox lens</span><strong>Oxidation = increase in oxidation number</strong><p>Reduction = decrease in oxidation number. In electron-transfer language, oxidation involves loss of electrons and reduction involves gain.</p></div></ToolShell>;
}

function Thermo() {
  const [m,setM]=useState("100"); const [c,setC]=useState("4.18"); const [dt,setDt]=useState("10"); const q=Number(m)*Number(c)*Number(dt);
  const [dh,setDh]=useState("-92.4"); const [ds,setDs]=useState("-198"); const [temp,setTemp]=useState("298"); const dg=Number(dh)-(Number(temp)*Number(ds)/1000);
  return <ToolShell title="Thermodynamics" eyebrow="XI · UNIT 5"><div className="split"><div><h3>Calorimetry</h3><label>m (g)<input value={m} onChange={e=>setM(e.target.value)}/></label><label>c (J g⁻¹ K⁻¹)<input value={c} onChange={e=>setC(e.target.value)}/></label><label>ΔT (K)<input value={dt} onChange={e=>setDt(e.target.value)}/></label><div className="result-box success"><span>q = mcΔT</span><strong>{q.toFixed(2)} J</strong></div></div><div><h3>Gibbs energy</h3><label>ΔH (kJ mol⁻¹)<input value={dh} onChange={e=>setDh(e.target.value)}/></label><label>ΔS (J mol⁻¹ K⁻¹)<input value={ds} onChange={e=>setDs(e.target.value)}/></label><label>T (K)<input value={temp} onChange={e=>setTemp(e.target.value)}/></label><div className="result-box success"><span>ΔG = ΔH − TΔS</span><strong>{dg.toFixed(2)} kJ mol⁻¹</strong><p>{dg<0?"Negative ΔG under these inputs":"Non-negative ΔG under these inputs"}</p></div></div></div></ToolShell>;
}

function Equilibrium() {
  const [a,setA]=useState(1); const [b,setB]=useState(1); const [p,setP]=useState(1); const k=(p*p)/(a*b);
  return <ToolShell title="Equilibrium Simulator" eyebrow="XI · UNIT 6"><p className="formula-line">A + B ⇌ P &nbsp;&nbsp; K = [P]² / ([A][B])</p><div className="sliders">{[["[A]",a,setA],["[B]",b,setB],["[P]",p,setP]].map(([label,val,setter])=><label key={label as string}>{label as string}<input type="range" min="0.1" max="5" step="0.1" value={val as number} onChange={e=>(setter as Dispatch<SetStateAction<number>>)(Number(e.target.value))}/><b>{(val as number).toFixed(1)}</b></label>)}</div><div className="result-box success"><span>Reaction quotient style readout</span><strong>K = {k.toFixed(3)}</strong><p>Changing concentrations changes Q immediately; equilibrium responds by shifting until Q approaches K for the specified reaction.</p></div><div className="equilibrium-bar"><span style={{width:`${Math.min(90,20+p*10)}%`}} /></div></ToolShell>;
}

function Kinetics() {
  const [k,setK]=useState(0.25); const [initial,setInitial]=useState(1); const data=Array.from({length:31},(_,i)=>({t:i,A:initial*Math.exp(-k*i)}));
  return <ToolShell title="Chemical Kinetics" eyebrow="XII · UNIT 3"><div className="input-row"><label>Rate constant k<input type="number" step="0.01" value={k} onChange={e=>setK(Number(e.target.value))}/></label><label>Initial concentration<input type="number" step="0.1" value={initial} onChange={e=>setInitial(Number(e.target.value))}/></label></div><svg viewBox="0 0 620 250" className="chart"><line x1="45" y1="210" x2="600" y2="210" stroke="currentColor"/><line x1="45" y1="20" x2="45" y2="210" stroke="currentColor"/><polyline fill="none" stroke="currentColor" strokeWidth="4" points={data.map(p=>`${45+p.t*18},${210-p.A*170}`).join(" ")} /></svg><div className="metric-grid"><div><span>Model</span><b>[A] = [A]₀e⁻ᵏᵗ</b></div><div><span>Half-life</span><b>{(Math.log(2)/k).toFixed(3)} time units</b></div><div><span>k</span><b>{k.toFixed(3)}</b></div></div></ToolShell>;
}

function Electrochemistry() {
  const [zn,setZn]=useState(1); const [cu,setCu]=useState(1); const E0=1.10; const R=8.314; const T=298; const F=96485; const Q=zn/cu; const E=E0-(R*T/(2*F))*Math.log(Q);
  return <ToolShell title="Electrochemical Cell" eyebrow="XII · UNIT 2"><div className="cell-diagram"><div><b>Zn | Zn²⁺</b><span>anode · oxidation</span></div><strong>e⁻ →</strong><div><b>Cu²⁺ | Cu</b><span>cathode · reduction</span></div></div><div className="split"><label>[Zn²⁺]<input type="number" step="0.1" value={zn} onChange={e=>setZn(Number(e.target.value))}/></label><label>[Cu²⁺]<input type="number" step="0.1" value={cu} onChange={e=>setCu(Number(e.target.value))}/></label></div><div className="result-box success"><span>Nernst-style calculation at 298 K</span><strong>E = {E.toFixed(4)} V</strong><p>E° = 1.10 V · Q = {Q.toFixed(3)} · n = 2</p></div></ToolShell>;
}

function OrganicExplorer() {
  const [selected,setSelected]=useState(organicExamples[1]);
  return <ToolShell title="Organic Chemistry Explorer" eyebrow="XI · UNITS 8 & 9"><div className="example-row">{organicExamples.map((x)=><button className={selected[0]===x[0]?"active":""} key={x[0]} onClick={()=>setSelected(x)}>{x[0]}</button>)}</div><div className="organic-card"><div className="organic-formula">{selected[0]}</div><div><h3>{selected[1]}</h3><p>Functional class: <b>{selected[2]}</b></p><p>Use this panel as a nomenclature and functional-group reference. More advanced reaction pathways can be added without changing the page architecture.</p></div></div><div className="functional-grid">{["Alkane","Alkene","Alkyne","Alcohol","Phenol","Aldehyde","Ketone","Carboxylic acid","Amine","Halo compound"].map(x=><span key={x}>{x}</span>)}</div></ToolShell>;
}

function Stoichiometry() {
  const [given,setGiven]=useState("10"); const [mm,setMm]=useState("2.016"); const [ratio,setRatio]=useState("1"); const [productMm,setProductMm]=useState("18.015"); const moles=Number(given)/(Number(mm)||1); const productMoles=moles*Number(ratio); const productMass=productMoles*Number(productMm);
  return <ToolShell title="Stoichiometry Solver" eyebrow="XI · UNIT 1"><div className="reaction-banner">2H₂ + O₂ → 2H₂O</div><div className="input-grid"><label>Given mass (g)<input value={given} onChange={e=>setGiven(e.target.value)}/></label><label>Given molar mass<input value={mm} onChange={e=>setMm(e.target.value)}/></label><label>Product ratio<input value={ratio} onChange={e=>setRatio(e.target.value)}/></label><label>Product molar mass<input value={productMm} onChange={e=>setProductMm(e.target.value)}/></label></div><div className="result-box success"><span>Calculated product mass</span><strong>{productMass.toFixed(3)} g</strong><p>{moles.toFixed(4)} mol given → {productMoles.toFixed(4)} mol product using the entered stoichiometric ratio.</p></div></ToolShell>;
}


function SolutionsLab() {
  const [moles, setMoles] = useState("0.50");
  const [volume, setVolume] = useState("2.00");
  const [mass, setMass] = useState("10");
  const [soluteMass, setSoluteMass] = useState("5");
  const [solventMass, setSolventMass] = useState("95");
  const [v1, setV1] = useState("25");
  const [c1, setC1] = useState("2");
  const [v2, setV2] = useState("100");
  const molarity = Number(volume) > 0 ? Number(moles) / Number(volume) : 0;
  const massPercent = Number(solventMass) + Number(soluteMass) > 0 ? 100 * Number(soluteMass) / (Number(soluteMass) + Number(solventMass)) : 0;
  const dilution = Number(v2) > 0 ? Number(c1) * Number(v1) / Number(v2) : 0;
  const molality = Number(solventMass) > 0 ? Number(moles) / (Number(solventMass) / 1000) : 0;
  return <ToolShell title="Solutions & Concentration" eyebrow="XII · UNIT 1">
    <div className="input-grid">
      <Field label="Moles of solute (mol)" value={moles} onChange={setMoles} />
      <Field label="Solution volume (L)" value={volume} onChange={setVolume} />
      <Field label="Solute mass (g)" value={soluteMass} onChange={setSoluteMass} />
      <Field label="Solvent mass (g)" value={solventMass} onChange={setSolventMass} />
      <Field label="C₁ (mol L⁻¹)" value={c1} onChange={setC1} />
      <Field label="V₁ (mL)" value={v1} onChange={setV1} />
      <Field label="V₂ (mL)" value={v2} onChange={setV2} />
    </div>
    <div className="metric-grid">
      <Metric label="Molarity" value={`${molarity.toFixed(3)} mol L⁻¹`} />
      <Metric label="Molality" value={`${molality.toFixed(3)} mol kg⁻¹`} />
      <Metric label="Mass %" value={`${massPercent.toFixed(2)} %`} />
      <Metric label="C₂ after dilution" value={`${dilution.toFixed(3)} mol L⁻¹`} />
    </div>
    <FormulaStrip text="M = n/V  ·  m = n/kg solvent  ·  mass % = mass solute / mass solution × 100  ·  C₁V₁ = C₂V₂" />
  </ToolShell>;
}

function LimitingReagent() {
  const [a, setA] = useState("H₂");
  const [b, setB] = useState("O₂");
  const [ca, setCA] = useState("2");
  const [cb, setCB] = useState("1");
  const [cp, setCP] = useState("2");
  const [aM, setAM] = useState("2.016");
  const [bM, setBM] = useState("32.00");
  const [aMass, setAMass] = useState("4.032");
  const [bMass, setBMass] = useState("32");
  const [productM, setProductM] = useState("18.015");
  const coeffA = Math.max(0, Number(ca));
  const coeffB = Math.max(0, Number(cb));
  const coeffP = Math.max(0, Number(cp));
  const na = Number(aMass) / Number(aM);
  const nb = Number(bMass) / Number(bM);
  const extentA = coeffA > 0 ? na / coeffA : 0;
  const extentB = coeffB > 0 ? nb / coeffB : 0;
  const limiting = extentA <= extentB ? a : b;
  const extent = Math.min(extentA, extentB);
  const productMoles = extent * coeffP;
  const productMass = productMoles * Number(productM || 0);
  return <ToolShell title="Limiting Reagent" eyebrow="XI · UNIT 1">
    <div className="reaction-banner"><span>{ca || "?"}{subscriptFormula(a)} + {cb || "?"}{subscriptFormula(b)} → {cp || "?"} Product</span><small>Compare n/coefficient for each reactant. The smaller reaction extent determines the limiting reagent.</small></div>
    <div className="input-grid">
      <Field label="Reactant A formula" value={a} onChange={setA} type="text" />
      <Field label="Reactant B formula" value={b} onChange={setB} type="text" />
      <Field label="A coefficient" value={ca} onChange={setCA} />
      <Field label="B coefficient" value={cb} onChange={setCB} />
      <Field label="Product coefficient" value={cp} onChange={setCP} />
      <Field label="A molar mass (g mol⁻¹)" value={aM} onChange={setAM} />
      <Field label="B molar mass (g mol⁻¹)" value={bM} onChange={setBM} />
      <Field label="A available mass (g)" value={aMass} onChange={setAMass} />
      <Field label="B available mass (g)" value={bMass} onChange={setBMass} />
      <Field label="Product molar mass (g mol⁻¹)" value={productM} onChange={setProductM} />
    </div>
    <div className="metric-grid">
      <Metric label="n(A)/coefficient" value={extentA.toFixed(4)} />
      <Metric label="n(B)/coefficient" value={extentB.toFixed(4)} />
      <Metric label="Limiting reagent" value={subscriptFormula(limiting)} />
      <Metric label="Theoretical product" value={`${productMass.toFixed(3)} g`} />
    </div>
  </ToolShell>;
}

function CoordinationLab() {
  const examples = [
    ["[Co(NH3)6]Cl3", "Co", "+3", "6", "Octahedral", "ammine complex"],
    ["[Cu(NH3)4]SO4", "Cu", "+2", "4", "Square planar", "tetraammine complex"],
    ["K4[Fe(CN)6]", "Fe", "+2", "6", "Octahedral", "hexacyanidoferrate(II)"],
    ["[Ag(NH3)2]Cl", "Ag", "+1", "2", "Linear", "diamminesilver(I)"],
  ];
  const [selected, setSelected] = useState(0);
  const x = examples[selected];
  return <ToolShell title="Coordination Chemistry Explorer" eyebrow="XII · UNIT 5">
    <div className="example-tabs">{examples.map((e, i) => <button key={e[0]} className={i === selected ? "active" : ""} onClick={() => setSelected(i)}>{e[0]}</button>)}</div>
    <div className="coord-card">
      <div className="coord-core"><span>{x[1]}</span><small>metal centre</small></div>
      <div><span className="eyebrow">COORDINATION ANALYSIS</span><h3>{x[0]}</h3>
        <div className="metric-grid compact">
          <Metric label="Oxidation state" value={x[2]} /><Metric label="Coordination number" value={x[3]} />
          <Metric label="Geometry" value={x[4]} /><Metric label="Class" value={x[5]} />
        </div>
      </div>
    </div>
    <FormulaStrip text="Oxidation state: total complex charge = metal OS + ligand charges. Coordination number counts donor atoms directly attached to the central metal." />
  </ToolShell>;
}

function ChromatographyLab() {
  const [distance, setDistance] = useState("4.2");
  const [solvent, setSolvent] = useState("7.0");
  const rf = Number(solvent) > 0 ? Number(distance) / Number(solvent) : 0;
  return <ToolShell title="Chromatography" eyebrow="PRACTICAL · SEPARATION">
    <div className="input-grid">
      <Field label="Distance travelled by solute (cm)" value={distance} onChange={setDistance} />
      <Field label="Distance travelled by solvent front (cm)" value={solvent} onChange={setSolvent} />
    </div>
    <div className="rf-visual"><div className="chrom-strip"><span className="baseline"/><i style={{bottom:`${Math.min(88,rf*88)}%`}}/><b>solvent front</b></div><div><span className="eyebrow">RETENTION FACTOR</span><strong>Rf = {rf.toFixed(3)}</strong><p>Rf = distance travelled by component ÷ distance travelled by solvent front. In a given setup, it is useful for comparison rather than as a universal identity.</p></div></div>
  </ToolShell>;
}

function BiomoleculesLab() {
  const cards = [
    ["Carbohydrates", "Glucose, fructose, sucrose, starch and cellulose", "Energy, glycosidic linkages, reducing/non-reducing ideas"],
    ["Proteins", "Amino acids linked by peptide bonds", "Primary → secondary → tertiary → quaternary structure"],
    ["Nucleic acids", "DNA and RNA built from nucleotides", "Sugar + phosphate + nitrogenous base"],
    ["Lipids", "Triglycerides, phospholipids and related molecules", "Hydrophobic character and biological membranes"],
  ];
  const [active, setActive] = useState(0);
  return <ToolShell title="Biomolecules Reference" eyebrow="XII · UNIT 10">
    <div className="bio-grid">{cards.map((c, i) => <button key={c[0]} className={i === active ? "active" : ""} onClick={() => setActive(i)}><span>{c[0]}</span><small>{c[1]}</small></button>)}</div>
    <div className="bio-detail"><span className="eyebrow">CONCEPT MAP</span><h3>{cards[active][0]}</h3><p>{cards[active][1]}</p><strong>{cards[active][2]}</strong></div>
  </ToolShell>;
}

function OrganicReactionMap() {
  const reactions = [
    ["Alkene", "C=C", "→", "Alcohol", "hydration / addition"],
    ["Alcohol", "R–OH", "→", "Aldehyde / Ketone", "controlled oxidation"],
    ["Aldehyde", "R–CHO", "→", "Carboxylic acid", "oxidation"],
    ["Carboxylic acid", "R–COOH", "⇌", "Ester", "esterification"],
    ["Haloalkane", "R–X", "→", "Alcohol", "nucleophilic substitution"],
    ["Alcohol", "R–OH", "→", "Alkene", "dehydration"],
    ["Nitro compound", "R–NO₂", "→", "Amine", "reduction"],
  ];
  const [active, setActive] = useState(0);
  const r = reactions[active];
  return <ToolShell title="Organic Reaction Map" eyebrow="XI/XII · ORGANIC CHEMISTRY">
    <div className="reaction-map">{reactions.map((x, i) => <button key={i} className={i === active ? "active" : ""} onClick={() => setActive(i)}><b>{x[0]}</b><span>{x[1]} {x[2]} {x[3]}</span><small>{x[4]}</small></button>)}</div>
    <div className="reaction-focus"><div><span>{r[0]}</span><strong>{r[1]}</strong></div><em>{r[2]}</em><div><span>{r[3]}</span><strong>{r[4]}</strong></div></div>
  </ToolShell>;
}

function Field({ label, value, onChange, type = "number" }: { label: string; value: string; onChange: (value: string) => void; type?: "number" | "text" }) {
  return <label className="field"><span>{label}</span><input type={type} step={type === "number" ? "any" : undefined} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}
function Metric({ label, value }: { label: string; value: string }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}
function FormulaStrip({ text }: { text: string }) {
  return <div className="formula-strip">{text}</div>;
}

function PracticalLab() {
  const [active,setActive]=useState(0); const item=practicals[active];
  return <ToolShell title="Practical Chemistry Lab" eyebrow="CBSE PRACTICAL · XI–XII"><div className="practical-grid">{practicals.map((p,i)=><button key={p[0]} className={active===i?"active":""} onClick={()=>setActive(i)}><span>{p[0]}</span><small>{p[2]}</small></button>)}</div><div className="practical-detail"><span className="eyebrow">{item[2]}</span><h3>{item[0]}</h3><p>{item[1]}</p><div className="lab-stage"><div className="apparatus">◯</div><div className="apparatus-line"/><div className="apparatus">▱</div><div className="apparatus-line"/><div className="apparatus">△</div></div><p className="safety-note">Virtual learning aid only. Practical work involving chemicals, heat or laboratory apparatus must be carried out under qualified school supervision.</p></div></ToolShell>;
}

function UnitSection({title, units, tab}: {title:string; units:string[][]; tab:TabId}) {
  return <section className="units-section"><div className="section-title"><div><span className="eyebrow">SYLLABUS MAP</span><h2>{title}</h2></div><span>70 marks theory</span></div><div className="unit-grid">{units.map(u=><div className="unit-card" key={u[0]}><div className="unit-number">{u[0]}</div><div><span>{u[2]}</span><h3>{u[1]}</h3><p>{u[3]}</p></div></div>)}</div></section>;
}

function Reference() {
  const references = [
    ["Common constants", "Nₐ = 6.022 × 10²³ mol⁻¹ · R = 8.314 J mol⁻¹ K⁻¹ · F = 96485 C mol⁻¹"],
    ["Core formulas", "n = m/M · q = mcΔT · ΔG = ΔH − TΔS · E = E° − (RT/nF)lnQ"],
    ["Practical", "Volumetric analysis · salt analysis · pH · equilibrium · kinetics · thermochemistry · electrochemistry · chromatography"],
    ["Organic families", "Alkanes · alkenes · alkynes · halo compounds · alcohols · phenols · ethers · aldehydes · ketones · acids · amines"],
  ];
  return <section className="reference-section"><div className="section-title"><div><span className="eyebrow">QUICK REFERENCE</span><h2>Chemistry Desk</h2></div></div><div className="reference-grid">{references.map(x=><div key={x[0]}><span>{x[0]}</span><p>{x[1]}</p></div>)}</div></section>;
}

export default function ChemistryPage() {
  const [tab,setTab]=useState<TabId>("lab"); const [tool,setTool]=useState<ToolId>("periodic");
  const openTool=(id:ToolId)=>{setTool(id);setTab("lab");setTimeout(()=>document.getElementById("tool-workbench")?.scrollIntoView({behavior:"smooth",block:"start"}),20)};
  return <main className="chem-page"><style jsx global>{styles}</style>
    <section className="chem-hero"><div className="hero-grid"/><div className="hero-copy"><div className="subject-kicker">CHEMISTRY <span>SUBJECT CODE: 043</span></div><h1>Chemistry <em>Lab</em></h1><p>Explore matter from the macroscopic to the molecular and symbolic level.</p><div className="hero-actions"><button className="primary" onClick={()=>openTool("periodic")}>Open Lab</button><button onClick={()=>setTab("xi")}>Explore syllabus</button></div></div><div className="molecule-orbit"><span className="atom-core">C</span>{[0,1,2,3,4].map(i=><i key={i} style={{transform:`rotate(${i*72}deg) translateX(116px)`}} />)}</div></section>
    <nav className="chem-nav">{([["lab","Lab"],["xi","Class XI"],["xii","Class XII"],["practical","Practical Lab"],["calculators","Calculators"],["reference","Reference"]] as [TabId,string][]).map(([id,label])=><button className={tab===id?"active":""} key={id} onClick={()=>setTab(id)}>{label}</button>)}</nav>
    {tab==="lab" && <><section className="tool-index"><div className="section-title"><div><span className="eyebrow">INTERACTIVE TOOLS</span><h2>Core Chemistry Lab</h2></div><p>Built around CBSE 043, Classes XI–XII, 2026–27.</p></div><div className="tool-card-grid">{toolCards.map(t=><button key={t.id} className={`tool-card ${tool===t.id?"chosen":""}`} onClick={()=>openTool(t.id)}><span className="tool-icon">{t.icon}</span><span className="tool-tag">{t.tag}</span><h3>{t.title}</h3><p>{t.desc}</p><span className="launch">Explore →</span></button>)}</div></section><section id="tool-workbench" className="workbench"><div className="workbench-head"><div><span className="eyebrow">WORKBENCH</span><h2>{toolCards.find(x=>x.id===tool)?.title}</h2></div><div className="workbench-tabs">{toolCards.slice(0,8).map(t=><button className={tool===t.id?"active":""} key={t.id} onClick={()=>setTool(t.id)}>{t.title}</button>)}</div></div>{tool==="periodic"&&<PeriodicTable/>}{tool==="balance"&&<EquationBalancer/>}{tool==="moles"&&<MoleCalculator/>}{tool==="atomic"&&<AtomicStructure/>}{tool==="bonding"&&<Bonding/>}{tool==="ph"&&<PHLab/>}{tool==="redox"&&<Redox/>}{tool==="thermo"&&<Thermo/>}{tool==="equilibrium"&&<Equilibrium/>}{tool==="kinetics"&&<Kinetics/>}{tool==="electro"&&<Electrochemistry/>}{tool==="organic"&&<OrganicExplorer/>}{tool==="stoich"&&<Stoichiometry/>}{tool==="solutions"&&<SolutionsLab/>}{tool==="limiting"&&<LimitingReagent/>}{tool==="coordination"&&<CoordinationLab/>}{tool==="chromatography"&&<ChromatographyLab/>}{tool==="biomolecules"&&<BiomoleculesLab/>}{tool==="reactions"&&<OrganicReactionMap/>}{tool==="practical"&&<PracticalLab/>}</section></>}
    {tab==="xi"&&<><UnitSection title="Class XI · Theory" units={xiUnits} tab="xi"/><section className="coverage"><h2>XI tools mapped to the syllabus</h2><div className="coverage-grid">{["Mole & Stoichiometry","Atomic Structure","Periodic Table","Bonding & VSEPR","Thermodynamics","Equilibrium","Redox","Organic Explorer"].map(x=><button key={x} onClick={()=>openTool(({"Mole & Stoichiometry":"moles","Atomic Structure":"atomic","Periodic Table":"periodic","Bonding & VSEPR":"bonding","Thermodynamics":"thermo","Equilibrium":"equilibrium","Redox":"redox","Organic Explorer":"organic"}[x] as ToolId))}>{x} →</button>)}</div></section></>}
    {tab==="xii"&&<><UnitSection title="Class XII · Theory" units={xiiUnits} tab="xii"/><section className="coverage"><h2>XII tools mapped to the syllabus</h2><div className="coverage-grid">{[
["Solutions & concentration","solutions"],["Electrochemistry","electro"],["Chemical Kinetics","kinetics"],
["Coordination chemistry","coordination"],["Organic functional groups","organic"],["Organic reactions","reactions"],
["Biomolecules","biomolecules"],["Chromatography","chromatography"]
].map(([x,id])=><button key={x} onClick={()=>openTool(id as ToolId)}>{x}<span>Open tool →</span></button>)}</div></section></>}
    {tab==="practical"&&<section className="practical-page"><div className="section-title"><div><span className="eyebrow">PRACTICAL SYLLABUS</span><h2>Virtual Practical Lab</h2></div><p>Conceptual simulations aligned with the listed CBSE practical areas.</p></div><PracticalLab/></section>}
    {tab==="calculators"&&<section className="calculator-page"><div className="section-title"><div><span className="eyebrow">CALCULATORS</span><h2>Quantitative Chemistry</h2></div></div><div className="calculator-grid">{[
["Moles & molar mass","moles"],["Stoichiometry","stoich"],["Solutions","solutions"],["Limiting reagent","limiting"],
["pH","ph"],["Thermodynamics","thermo"],["Equilibrium","equilibrium"],["Electrochemistry","electro"],["Kinetics","kinetics"],["Chromatography","chromatography"]
].map(([x,id])=><button key={x} onClick={()=>openTool(id as ToolId)}><b>{x}</b><span>Open calculator →</span></button>)}</div></section>}
    {tab==="reference"&&<Reference/>}
    <footer className="chem-footer"><span>CHEMISTRY 043</span><span>CLASSES XI–XII · 2026–27</span><span>Learn · Model · Calculate · Predict</span></footer>
  </main>;
}

const styles = `
:root{--chem-bg:#07120f;--chem-surface:#0d1c18;--chem-surface2:#10241e;--chem-line:rgba(167,255,218,.12);--chem-text:#edf9f4;--chem-muted:#91aaa1;--chem-accent:#57e0a5;--chem-accent2:#6bd9ff;--chem-warm:#ffd166}
*{box-sizing:border-box}.chem-page{min-height:100vh;background:radial-gradient(circle at 75% 0%,rgba(65,214,151,.08),transparent 30%),var(--chem-bg);color:var(--chem-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;padding-bottom:30px}.chem-page button,.chem-page input,.chem-page select{font:inherit}.chem-page button{cursor:pointer}.chem-hero{min-height:470px;position:relative;overflow:hidden;border-bottom:1px solid var(--chem-line);display:flex;align-items:center;padding:70px max(28px,6vw)}.hero-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(120,255,210,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(120,255,210,.04) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,black,transparent)}.hero-copy{position:relative;z-index:2;max-width:760px}.subject-kicker{font-size:12px;letter-spacing:.18em;font-weight:800;color:var(--chem-accent)}.subject-kicker span{color:var(--chem-muted);margin-left:14px}.chem-hero h1{font-size:clamp(56px,9vw,116px);line-height:.9;letter-spacing:-.07em;margin:18px 0 24px}.chem-hero h1 em{font-style:normal;color:var(--chem-accent)}.chem-hero p{font-size:18px;line-height:1.65;color:#b8cbc4;max-width:600px}.hero-actions{display:flex;gap:12px;margin-top:30px}.chem-page button{border:1px solid var(--chem-line);background:rgba(255,255,255,.025);color:var(--chem-text);border-radius:12px;padding:11px 15px;transition:.18s ease}.chem-page button:hover{border-color:rgba(87,224,165,.42);background:rgba(87,224,165,.07);transform:translateY(-1px)}.chem-page button.primary{background:var(--chem-accent);border-color:var(--chem-accent);color:#052016;font-weight:850}.molecule-orbit{position:absolute;right:7vw;top:50%;width:260px;height:260px;transform:translateY(-50%);border:1px solid rgba(87,224,165,.14);border-radius:50%;box-shadow:0 0 90px rgba(87,224,165,.08)}.molecule-orbit:before,.molecule-orbit:after{content:"";position:absolute;inset:30px;border:1px solid rgba(107,217,255,.12);border-radius:50%;transform:rotate(60deg) scaleY(.5)}.molecule-orbit:after{transform:rotate(-60deg) scaleY(.5)}.atom-core{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:66px;height:66px;border-radius:50%;display:grid;place-items:center;background:var(--chem-accent);color:#052016;font-weight:900;font-size:22px;box-shadow:0 0 35px rgba(87,224,165,.35);z-index:2}.molecule-orbit i{position:absolute;left:calc(50% - 5px);top:calc(50% - 5px);width:10px;height:10px;background:var(--chem-accent2);border-radius:50%;box-shadow:0 0 16px rgba(107,217,255,.7)}.chem-nav{position:sticky;top:0;z-index:10;display:flex;gap:4px;overflow:auto;padding:10px max(20px,6vw);background:rgba(7,18,15,.88);backdrop-filter:blur(18px);border-bottom:1px solid var(--chem-line)}.chem-nav button{white-space:nowrap;border:0;background:transparent;border-radius:9px;padding:10px 14px;color:var(--chem-muted)}.chem-nav button.active{background:rgba(87,224,165,.1);color:var(--chem-accent)}.tool-index,.workbench,.units-section,.coverage,.practical-page,.calculator-page,.reference-section{max-width:1240px;margin:0 auto;padding:72px max(22px,3vw)}.section-title,.workbench-head{display:flex;justify-content:space-between;gap:25px;align-items:end;margin-bottom:28px}.section-title h2,.workbench-head h2{font-size:32px;letter-spacing:-.035em;margin:5px 0 0}.section-title p,.section-title>span{color:var(--chem-muted);max-width:520px}.eyebrow{font-size:10px;font-weight:900;letter-spacing:.16em;color:var(--chem-accent);text-transform:uppercase}.tool-card-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.tool-card{text-align:left;min-height:205px;padding:19px;position:relative;background:linear-gradient(150deg,rgba(255,255,255,.035),rgba(255,255,255,.012));display:flex;flex-direction:column;align-items:flex-start}.tool-card.chosen{border-color:rgba(87,224,165,.5);box-shadow:0 0 0 1px rgba(87,224,165,.1) inset}.tool-icon{font-size:28px;margin-bottom:20px}.tool-tag{position:absolute;top:18px;right:15px;font-size:9px;color:var(--chem-accent);font-weight:800;letter-spacing:.1em}.tool-card h3{font-size:17px;margin:0 0 7px}.tool-card p{font-size:13px;color:var(--chem-muted);line-height:1.55;margin:0}.launch{margin-top:auto;color:var(--chem-accent);font-size:12px;font-weight:800}.workbench{padding-top:20px}.workbench-head{align-items:center}.workbench-tabs{display:flex;gap:5px;max-width:700px;overflow:auto}.workbench-tabs button{font-size:11px;white-space:nowrap;padding:8px 10px}.workbench-tabs button.active{color:var(--chem-accent);background:rgba(87,224,165,.09)}.chem-tool{background:linear-gradient(145deg,rgba(255,255,255,.035),rgba(255,255,255,.012));border:1px solid var(--chem-line);border-radius:18px;padding:24px}.tool-head{margin-bottom:22px}.tool-head h2{font-size:25px;margin:5px 0 0}.controls,.input-row,.split{display:flex;gap:14px;align-items:end}.controls{margin-bottom:16px}.controls select,.chem-page input,.chem-page select{background:#091713;border:1px solid var(--chem-line);color:var(--chem-text);border-radius:10px;padding:11px 12px;outline:none}.chem-page input:focus,.chem-page select:focus{border-color:rgba(87,224,165,.55);box-shadow:0 0 0 3px rgba(87,224,165,.06)}label{display:flex;flex-direction:column;gap:7px;color:var(--chem-muted);font-size:11px;font-weight:700;flex:1}label input{width:100%;color:var(--chem-text)}.hint{font-size:12px;color:var(--chem-muted)}.periodic-grid{display:grid;grid-template-columns:repeat(18,minmax(38px,1fr));gap:5px}.element{padding:7px 3px!important;min-height:73px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:8px!important}.element small{font-size:8px;color:var(--chem-muted)}.element strong{font-size:17px}.element span{font-size:7px;color:var(--chem-muted);white-space:nowrap}.element.selected{border-color:var(--chem-accent);box-shadow:0 0 0 1px rgba(87,224,165,.35) inset}.cat-noble{background:rgba(107,217,255,.06)}.cat-alkali{background:rgba(255,209,102,.05)}.cat-transition{background:rgba(87,224,165,.05)}.cat-halogen{background:rgba(179,145,255,.06)}.element-detail{margin-top:18px;display:grid;grid-template-columns:110px 1fr auto;gap:20px;align-items:center;padding:20px;border:1px solid var(--chem-line);border-radius:15px;background:#091713}.big-symbol{font-size:56px;font-weight:900;color:var(--chem-accent)}.element-detail h3{margin:0 0 5px;font-size:23px}.element-detail p{margin:4px 0;color:var(--chem-muted);font-size:12px}.element-detail code{display:inline-block;margin-top:8px;color:var(--chem-accent2)}.property-list{display:flex;flex-direction:column;gap:8px;color:var(--chem-muted);font-size:11px}.property-list b{display:block;color:var(--chem-text);margin-top:2px}.result-box{margin-top:16px;padding:18px;border:1px solid var(--chem-line);border-radius:14px;background:#091713}.result-box.success{border-color:rgba(87,224,165,.25);background:rgba(87,224,165,.035)}.result-box span,.metric-grid span{display:block;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--chem-muted);font-weight:800}.result-box strong{display:block;font-size:22px;margin-top:6px;color:var(--chem-text)}.result-box p{color:var(--chem-muted);font-size:12px;margin:7px 0 0}.example-row{display:flex;flex-wrap:wrap;gap:7px;margin-top:13px}.example-row button{font-size:11px}.example-row button.active{color:var(--chem-accent);border-color:rgba(87,224,165,.5)}.metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.metric-grid>div{padding:15px;border:1px solid var(--chem-line);border-radius:12px;background:#091713}.metric-grid b{display:block;margin-top:8px;font-size:15px}.split>div{flex:1}.atom-stage{height:380px;position:relative;display:grid;place-items:center;overflow:hidden;background:radial-gradient(circle,rgba(87,224,165,.08),transparent 45%);border-radius:14px;margin:15px 0}.nucleus{position:absolute;z-index:5;width:64px;height:64px;border-radius:50%;background:var(--chem-accent);color:#062117;display:grid;place-items:center;box-shadow:0 0 30px rgba(87,224,165,.3)}.nucleus small{font-size:8px}.shell{position:absolute;border:1px solid rgba(107,217,255,.23);border-radius:50%;display:grid;place-items:center}.shell em{position:absolute;right:4px;top:50%;font-size:8px;color:var(--chem-muted);font-style:normal}.electron{position:absolute;width:9px;height:9px;border-radius:50%;background:var(--chem-accent2);box-shadow:0 0 10px rgba(107,217,255,.65)}.config-card{padding:18px;background:#091713;border:1px solid var(--chem-line);border-radius:14px}.config-card span{display:block;color:var(--chem-muted);font-size:10px;text-transform:uppercase;letter-spacing:.1em}.config-card strong{display:block;margin:8px 0;color:var(--chem-accent);font-size:17px}.shell-summary{display:flex;gap:10px;flex-wrap:wrap}.shell-summary span{font-size:11px;text-transform:none;letter-spacing:0}.selected-mini{padding:11px 14px;border:1px solid var(--chem-line);border-radius:10px;color:var(--chem-muted)}.selected-mini strong{color:var(--chem-accent);font-size:20px;margin-right:8px}.molecule-stage{height:260px;position:relative;display:grid;place-items:center;background:radial-gradient(circle,rgba(107,217,255,.07),transparent 45%);border-radius:14px;margin:15px 0}.molecule-center{width:100px;height:100px;border-radius:50%;display:grid;place-items:center;background:rgba(87,224,165,.12);border:1px solid rgba(87,224,165,.5);font-size:22px;font-weight:900}.bond-line{position:absolute;width:100px;height:3px;background:var(--chem-accent);transform-origin:left center;left:calc(50% + 20px);top:calc(50% - 1px)}.bond-line.one{transform:rotate(0deg)}.bond-line.two{transform:rotate(90deg)}.bond-line.three{transform:rotate(180deg)}.bond-line.four{transform:rotate(270deg)}.ph-scale{display:flex;height:42px;border-radius:9px;overflow:hidden;background:linear-gradient(90deg,#f07f7f,#ffd166,#57e0a5,#6bd9ff);align-items:center}.ph-scale span{flex:1;text-align:center;font-size:9px;color:#07120f;font-weight:800}.ph-scale .mark{font-size:13px;text-decoration:underline}.chart{width:100%;height:auto;margin-top:15px;color:var(--chem-accent)}.safety-note{font-size:11px;color:#839a92;padding:10px 0 0}.formula-line,.reaction-banner{padding:16px;border-radius:12px;background:#091713;border:1px solid var(--chem-line);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--chem-accent);text-align:center}.sliders{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin:20px 0}.sliders label{gap:10px}.sliders input{padding:0}.equilibrium-bar{height:14px;background:#091713;border-radius:99px;overflow:hidden;margin-top:20px}.equilibrium-bar span{display:block;height:100%;background:linear-gradient(90deg,var(--chem-accent2),var(--chem-accent));border-radius:99px}.cell-diagram{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:20px;padding:30px;border-radius:14px;background:#091713;border:1px solid var(--chem-line);margin-bottom:18px}.cell-diagram div{display:flex;flex-direction:column;gap:5px}.cell-diagram div:last-child{text-align:right}.cell-diagram span{color:var(--chem-muted);font-size:11px}.cell-diagram strong{color:var(--chem-accent);font-size:24px}.organic-card{display:grid;grid-template-columns:180px 1fr;gap:25px;align-items:center;padding:25px;border-radius:14px;background:#091713;border:1px solid var(--chem-line);margin-top:15px}.organic-formula{font-size:34px;font-family:ui-monospace,monospace;color:var(--chem-accent);text-align:center}.organic-card h3{font-size:25px;margin:0}.organic-card p{color:var(--chem-muted);font-size:12px}.functional-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:15px}.functional-grid span{padding:12px;border:1px solid var(--chem-line);border-radius:10px;text-align:center;font-size:11px;color:var(--chem-muted)}.input-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.practical-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.practical-grid button{text-align:left;min-height:70px}.practical-grid button.active{border-color:rgba(87,224,165,.5);background:rgba(87,224,165,.06)}.practical-grid span{display:block;font-weight:800;font-size:12px}.practical-grid small{color:var(--chem-muted);font-size:9px}.practical-detail{margin-top:15px;padding:22px;border:1px solid var(--chem-line);border-radius:15px;background:#091713}.practical-detail h3{font-size:24px;margin:5px 0}.practical-detail p{color:var(--chem-muted);font-size:13px}.lab-stage{height:170px;display:flex;align-items:center;justify-content:center;gap:22px;background:radial-gradient(circle,rgba(87,224,165,.06),transparent 55%);border-radius:12px}.apparatus{width:62px;height:62px;border:1px solid rgba(107,217,255,.4);display:grid;place-items:center;border-radius:12px;color:var(--chem-accent2);font-size:25px}.apparatus-line{width:60px;height:1px;background:var(--chem-line)}.coverage-grid,.calculator-grid,.reference-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.coverage h2{font-size:23px}.coverage-grid button,.coverage-grid>div,.calculator-grid button,.reference-grid>div{min-height:85px;padding:15px;text-align:left}.coverage-grid span{display:block;color:var(--chem-muted);font-size:10px;margin-top:8px}.unit-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.unit-card{display:grid;grid-template-columns:52px 1fr;gap:14px;padding:18px;border:1px solid var(--chem-line);border-radius:14px;background:linear-gradient(145deg,rgba(255,255,255,.025),transparent)}.unit-number{font-size:21px;color:var(--chem-accent);font-weight:900}.unit-card span{font-size:10px;color:var(--chem-accent);font-weight:800}.unit-card h3{font-size:15px;margin:5px 0}.unit-card p{font-size:11px;color:var(--chem-muted);line-height:1.5;margin:0}.calculator-grid{grid-template-columns:repeat(3,1fr)}.calculator-grid button{display:flex;flex-direction:column;gap:9px}.calculator-grid span{font-size:11px;color:var(--chem-accent)}.reference-grid{grid-template-columns:repeat(2,1fr)}.reference-grid>div{padding:20px}.reference-grid span{font-size:10px;text-transform:uppercase;letter-spacing:.1em;color:var(--chem-accent)}.reference-grid p{font-size:13px;line-height:1.6;color:var(--chem-muted)}.chem-footer{max-width:1240px;margin:0 auto;padding:25px max(22px,3vw);display:flex;justify-content:space-between;gap:12px;border-top:1px solid var(--chem-line);color:#627970;font-size:9px;letter-spacing:.13em;font-weight:800}
@media(max-width:1000px){.tool-card-grid{grid-template-columns:repeat(3,1fr)}.periodic-grid{grid-template-columns:repeat(12,1fr);overflow:auto}.unit-grid{grid-template-columns:repeat(2,1fr)}.practical-grid{grid-template-columns:repeat(3,1fr)}.functional-grid{grid-template-columns:repeat(3,1fr)}.molecule-orbit{opacity:.35;right:-70px}.coverage-grid,.calculator-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:700px){.chem-hero{min-height:430px;padding:55px 22px}.chem-hero h1{font-size:62px}.molecule-orbit{display:none}.tool-index,.workbench,.units-section,.coverage,.practical-page,.calculator-page,.reference-section{padding-left:18px;padding-right:18px}.tool-card-grid{grid-template-columns:1fr 1fr}.section-title,.workbench-head{display:block}.workbench-tabs{margin-top:15px}.metric-grid{grid-template-columns:1fr 1fr}.split{display:block}.split>div+div{margin-top:16px}.element-detail{grid-template-columns:70px 1fr}.property-list{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr}.input-grid,.sliders{grid-template-columns:1fr 1fr}.unit-grid,.practical-grid{grid-template-columns:1fr 1fr}.organic-card{grid-template-columns:1fr}.reference-grid{grid-template-columns:1fr}.chem-footer{display:block}.chem-footer span{display:block;margin:7px 0}}
@media(max-width:480px){.tool-card-grid{grid-template-columns:1fr}.input-grid,.sliders,.metric-grid,.coverage-grid,.calculator-grid,.unit-grid,.practical-grid,.functional-grid{grid-template-columns:1fr}.cell-diagram{grid-template-columns:1fr;text-align:center}.cell-diagram div:last-child{text-align:center}.chem-nav{padding-left:10px}.chem-hero p{font-size:15px}}

.periodic-grid{display:grid;grid-template-columns:repeat(18,minmax(48px,1fr));grid-template-rows:repeat(9,76px);gap:5px;overflow-x:auto;padding:4px;min-width:930px}
.element{min-height:76px;padding:7px 4px;position:relative}.element small{position:absolute;top:5px;left:6px;font-size:8px}.element strong{display:block;font-size:20px;margin-top:7px}.element span{display:block;font-size:8px;color:var(--chem-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.element.selected{outline:2px solid var(--chem-accent);transform:translateY(-2px)}
.example-tabs,.bio-grid,.reaction-map{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.example-tabs button,.bio-grid button,.reaction-map button{padding:13px;text-align:left}.example-tabs button.active,.bio-grid button.active,.reaction-map button.active{border-color:var(--chem-accent);background:rgba(88,231,182,.09)}
.coord-card{display:grid;grid-template-columns:140px 1fr;gap:20px;align-items:center;padding:22px;border:1px solid var(--chem-line);border-radius:16px;background:rgba(255,255,255,.02)}.coord-core{height:120px;width:120px;border-radius:50%;display:grid;place-items:center;align-content:center;border:1px solid var(--chem-accent);background:radial-gradient(circle,rgba(88,231,182,.18),transparent 65%)}.coord-core span{font-size:32px;font-weight:900}.coord-core small{font-size:9px;color:var(--chem-muted)}
.metric-grid.compact{margin-top:14px}.formula-strip,.reaction-banner{margin-top:16px;padding:14px;border:1px solid var(--chem-line);border-radius:12px;color:var(--chem-muted);font-size:11px;line-height:1.6}
.rf-visual{display:grid;grid-template-columns:180px 1fr;gap:25px;align-items:center}.chrom-strip{height:220px;width:90px;margin:auto;border:1px solid var(--chem-line);border-radius:8px;position:relative;background:linear-gradient(to top,rgba(88,231,182,.05),rgba(255,255,255,.02))}.chrom-strip .baseline{position:absolute;left:0;right:0;bottom:0;border-top:2px solid var(--chem-accent)}.chrom-strip i{position:absolute;left:50%;width:15px;height:15px;border-radius:50%;background:var(--chem-accent);transform:translate(-50%,50%)}.chrom-strip b{position:absolute;top:-20px;left:0;font-size:8px;color:var(--chem-muted)}
.rf-visual strong{display:block;font-size:38px;margin:8px 0}.rf-visual p{color:var(--chem-muted);line-height:1.6;font-size:12px}
.bio-grid{grid-template-columns:repeat(4,1fr)}.bio-grid button span{display:block;font-weight:900}.bio-grid button small{display:block;color:var(--chem-muted);margin-top:8px;line-height:1.4}.bio-detail{margin-top:15px;padding:22px;border:1px solid var(--chem-line);border-radius:15px}.bio-detail h3{font-size:25px;margin:6px 0}.bio-detail p{color:var(--chem-muted);line-height:1.5}.bio-detail strong{font-size:13px}
.reaction-map{grid-template-columns:repeat(2,1fr)}.reaction-map b,.reaction-map span,.reaction-map small{display:block}.reaction-map span{margin-top:7px;font-size:16px}.reaction-map small{color:var(--chem-muted);margin-top:7px}.reaction-focus{display:grid;grid-template-columns:1fr 80px 1fr;align-items:center;gap:15px;margin-top:18px;padding:24px;border:1px solid var(--chem-line);border-radius:15px;text-align:center}.reaction-focus div{padding:20px;border-radius:12px;background:rgba(255,255,255,.025)}.reaction-focus span,.reaction-focus strong{display:block}.reaction-focus strong{font-size:22px;margin-top:7px}.reaction-focus em{font-size:30px;color:var(--chem-accent);font-style:normal}
@media(max-width:700px){.example-tabs,.bio-grid{grid-template-columns:1fr 1fr}.coord-card{grid-template-columns:1fr}.rf-visual{grid-template-columns:1fr}.reaction-map{grid-template-columns:1fr}.reaction-focus{grid-template-columns:1fr}.reaction-focus em{transform:rotate(90deg)}}
@media(max-width:480px){.example-tabs,.bio-grid{grid-template-columns:1fr}.coord-core{margin:auto}}
`;
