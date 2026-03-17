import { CategoryDefinition } from './types';

import skills from './json/Skills.json';
import traits from './json/traits.json';
import powers from './json/powers.json';
import statusEffects from './json/Status_Effects.json';

import weapons from './json/Weapons.json';
import pistols from './json/Pistols.json';
import shotguns from './json/Shotguns.json';
import apparel from './json/Apparel.json';
import weaponMods from './json/weapon_mods.json';
import armorMods from './json/armor_mods.json';
import prefixes from './json/Prefixes.json';

import cockpits from './json/cockpits.json';
import engines from './json/Engines.json';
import reactors from './json/reactors.json';
import gravDrives from './json/grav_drives.json';
import fuelTanks from './json/fuel_tanks.json';
import shieldGenerators from './json/shield_generators.json';
import shipWeapons from './json/ship_weapons.json';
import structuralComponents from './json/structural_components.json';
import habs from './json/habs.json';
import landingGears from './json/landing_gears.json';
import bays from './json/Bays.json';
import dockers from './json/dockers.json';

import galaxy from './json/galaxy.json';
import temples from './json/temples.json';

import resources from './json/resources.json';
import materials from './json/Materials.json';
import consumables from './json/Consumables.json';

import recipes from './json/recipes.json';
import researchLab from './json/research_laboratory.json';

const categories: CategoryDefinition[] = [
  // ── CHARACTER ──
  {
    id: 'skills',
    label: 'Skills',
    icon: 'school-outline',
    description: 'Character skill trees and ranks',
    group: 'character',
    data: () => skills as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'tree', 'description', 'ranks'],
    listFields: ['tier', 'tree'],
  },
  {
    id: 'traits',
    label: 'Traits',
    icon: 'finger-print-outline',
    description: 'Character background traits',
    group: 'character',
    data: () => traits as Record<string, unknown>[],
    nameField: 'trait',
    searchFields: ['trait', 'benefit', 'drawback'],
    listFields: ['benefit'],
  },
  {
    id: 'powers',
    label: 'Powers',
    icon: 'flash-outline',
    description: 'Starborn powers and temples',
    group: 'character',
    data: () => powers as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'effect', 'location'],
    listFields: ['cost', 'location'],
  },
  {
    id: 'status-effects',
    label: 'Status Effects',
    icon: 'medkit-outline',
    description: 'Afflictions and treatments',
    group: 'character',
    data: () => statusEffects as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'possible Symptoms', 'treatment Aid Items'],
    listFields: ['treatment Aid Items'],
  },

  // ── WEAPONS & GEAR ──
  {
    id: 'weapons',
    label: 'Weapons',
    icon: 'hardware-chip-outline',
    description: 'All personal weapons',
    group: 'weapons',
    data: () => weapons as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'type', 'ammo'],
    listFields: ['type', 'dmg'],
  },
  {
    id: 'pistols',
    label: 'Pistols',
    icon: 'ellipse-outline',
    description: 'Sidearms and handguns',
    group: 'weapons',
    data: () => pistols as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'ammo'],
    listFields: ['dmg', 'ammo'],
  },
  {
    id: 'shotguns',
    label: 'Shotguns',
    icon: 'reorder-four-outline',
    description: 'Close-range shotguns',
    group: 'weapons',
    data: () => shotguns as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'ammo'],
    listFields: ['dmg', 'ammo'],
  },
  {
    id: 'apparel',
    label: 'Apparel',
    icon: 'shirt-outline',
    description: 'Clothing and outfits',
    group: 'weapons',
    data: () => apparel as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name'],
    listFields: ['mods'],
  },
  {
    id: 'weapon-mods',
    label: 'Weapon Mods',
    icon: 'build-outline',
    description: 'Weapon modifications',
    group: 'weapons',
    data: () => weaponMods as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'type', 'effect'],
    listFields: ['type', 'effect'],
  },
  {
    id: 'armor-mods',
    label: 'Armor Mods',
    icon: 'shield-outline',
    description: 'Armor modifications',
    group: 'weapons',
    data: () => armorMods as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'type', 'effect'],
    listFields: ['type', 'effect'],
  },
  {
    id: 'prefixes',
    label: 'Prefixes',
    icon: 'pricetag-outline',
    description: 'Weapon perks and prefixes',
    group: 'weapons',
    data: () => prefixes as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'type', 'effect'],
    listFields: ['type', 'effect'],
  },

  // ── SHIP PARTS ──
  {
    id: 'cockpits',
    label: 'Cockpits',
    icon: 'navigate-outline',
    description: 'Ship cockpit modules',
    group: 'shipParts',
    data: () => cockpits as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand'],
    listFields: ['brand', 'hull', 'mass'],
  },
  {
    id: 'engines',
    label: 'Engines',
    icon: 'flame-outline',
    description: 'Ship engine modules',
    group: 'shipParts',
    data: () => engines as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand'],
    listFields: ['brand', 'thrust', 'mass'],
  },
  {
    id: 'reactors',
    label: 'Reactors',
    icon: 'nuclear-outline',
    description: 'Ship power reactors',
    group: 'shipParts',
    data: () => reactors as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand', 'class'],
    listFields: ['brand', 'power Generated', 'class'],
  },
  {
    id: 'grav-drives',
    label: 'Grav Drives',
    icon: 'planet-outline',
    description: 'Gravitational jump drives',
    group: 'shipParts',
    data: () => gravDrives as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand'],
    listFields: ['brand', 'jump Thrust', 'mass'],
  },
  {
    id: 'fuel-tanks',
    label: 'Fuel Tanks',
    icon: 'water-outline',
    description: 'He3 fuel storage tanks',
    group: 'shipParts',
    data: () => fuelTanks as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand'],
    listFields: ['brand', 'fuel Capacity', 'mass'],
  },
  {
    id: 'shield-generators',
    label: 'Shield Generators',
    icon: 'shield-checkmark-outline',
    description: 'Ship shield systems',
    group: 'shipParts',
    data: () => shieldGenerators as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand'],
    listFields: ['brand', 'shield Health', 'mass'],
  },
  {
    id: 'ship-weapons',
    label: 'Ship Weapons',
    icon: 'radio-outline',
    description: 'Ship-mounted weaponry',
    group: 'shipParts',
    data: () => shipWeapons as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand', 'class'],
    listFields: ['brand', 'hull DMG', 'class'],
  },
  {
    id: 'structural',
    label: 'Structural',
    icon: 'cube-outline',
    description: 'Ship structural components',
    group: 'shipParts',
    data: () => structuralComponents as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand'],
    listFields: ['brand', 'mass', 'value'],
  },
  {
    id: 'habs',
    label: 'Habs',
    icon: 'home-outline',
    description: 'Ship habitation modules',
    group: 'shipParts',
    data: () => habs as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand'],
    listFields: ['brand', 'hull', 'mass'],
  },
  {
    id: 'landing-gears',
    label: 'Landing Gears',
    icon: 'download-outline',
    description: 'Landing gear systems',
    group: 'shipParts',
    data: () => landingGears as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand'],
    listFields: ['brand', 'lander Thrust', 'mass'],
  },
  {
    id: 'bays',
    label: 'Landing Bays',
    icon: 'exit-outline',
    description: 'Ship landing bays',
    group: 'shipParts',
    data: () => bays as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand', 'location'],
    listFields: ['brand', 'hull', 'mass'],
  },
  {
    id: 'dockers',
    label: 'Dockers',
    icon: 'link-outline',
    description: 'Ship docking modules',
    group: 'shipParts',
    data: () => dockers as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'brand'],
    listFields: ['brand', 'hull', 'mass'],
  },

  // ── WORLD ──
  {
    id: 'galaxy',
    label: 'Planets & Moons',
    icon: 'globe-outline',
    description: 'Systems, planets, and moons',
    group: 'world',
    data: () => galaxy as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'system', 'type'],
    listFields: ['system', 'type', 'gravity'],
  },
  {
    id: 'temples',
    label: 'Temples',
    icon: 'triangle-outline',
    description: 'Temple locations and powers',
    group: 'world',
    data: () => temples as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'power'],
    listFields: ['power'],
  },

  // ── ITEMS ──
  {
    id: 'resources',
    label: 'Resources',
    icon: 'diamond-outline',
    description: 'Manufactured and organic resources',
    group: 'items',
    data: () => resources as Record<string, unknown>[],
    nameField: 'resource',
    searchFields: ['resource', 'shortName', 'type', 'rarity'],
    listFields: ['rarity', 'type', 'value'],
  },
  {
    id: 'materials',
    label: 'Materials',
    icon: 'layers-outline',
    description: 'Raw crafting materials',
    group: 'items',
    data: () => materials as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'symbol', 'rarity'],
    listFields: ['symbol', 'rarity', 'value'],
  },
  {
    id: 'consumables',
    label: 'Consumables',
    icon: 'nutrition-outline',
    description: 'Food, drinks, and chems',
    group: 'items',
    data: () => consumables as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'effect', 'description'],
    listFields: ['effect', 'value'],
  },

  // ── CRAFTING ──
  {
    id: 'recipes',
    label: 'Recipes',
    icon: 'construct-outline',
    description: 'Crafting recipes and materials',
    group: 'crafting',
    data: () =>
      (recipes as { name: string; requires: { name: string; quantity: number }[] }[]).map((r) => ({
        name: r.name,
        materials: r.requires.map((req) => `${req.name} x${req.quantity}`).join(', '),
      })) as Record<string, unknown>[],
    nameField: 'name',
    searchFields: ['name', 'materials'],
    listFields: ['materials'],
  },
  {
    id: 'research',
    label: 'Research',
    icon: 'flask-outline',
    description: 'Research laboratory projects',
    group: 'crafting',
    data: () => researchLab as Record<string, unknown>[],
    nameField: 'research Project',
    searchFields: ['research Project', 'crafting Unlocked', 'required Materials'],
    listFields: ['required Skills', 'crafting Unlocked'],
  },
];

export const categoryMap = new Map<string, CategoryDefinition>(
  categories.map((c) => [c.id, c])
);

export function getCategory(id: string): CategoryDefinition | undefined {
  return categoryMap.get(id);
}

export function getCategoriesByGroup(group: string): CategoryDefinition[] {
  return categories.filter((c) => c.group === group);
}

export { categories };
