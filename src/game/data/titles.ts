import type { Color } from '../types';

// Titles from projectInfo/colorlition_victory_titles_headlines.md.
// Stored without leading ellipsis or trailing punctuation so the renderer
// composes them into `<playerName>, the <Title>!` (or whatever surrounds).

export const SINGLE_TITLES: Record<Color, string> = {
  red: "the Workers’ Champion",
  purple: "the Social Revolutionary",
  green: "the Eco-Radical",
  blue: "the Market Architect",
  orange: "the Rural Autocrat",
  yellow: "the Iron Prefect",
  grey: "the Holy Patriarch/Matriarch",
};

// Keys are the two colors joined alphabetically with '+'.
export const DUAL_TITLES: Record<string, string> = {
  'blue+green': "the Tech-Environmentalist",
  'blue+grey': "the Old Money Gentry",
  'blue+orange': "the Export Tycoon",
  'blue+purple': "the Liberal Reformist",
  'blue+red': "the State Capitalist",
  'blue+yellow': "the Fiscal Hawk",
  'green+grey': "the Sacred Conservationist",
  'green+orange': "the Sustainable Planter",
  'green+purple': "the Progressive Guardian",
  'green+red': "the Green Syndicalist",
  'green+yellow': "the Eco-Watchman",
  'grey+orange': "the Traditional Harvester",
  'grey+purple': "the Moral Reformer",
  'grey+red': "the National Worker",
  'grey+yellow': "the Divine Sentinel",
  'orange+purple': "the Agrarian Liberator",
  'orange+red': "the Rural Laborer",
  'orange+yellow': "the Frontier Defender",
  'purple+red': "the Socialist Vanguard",
  'purple+yellow': "the Inclusive Enforcer",
  'red+yellow': "the Orderly Unionist",
};

// Keys are three colors joined alphabetically with '+'.
export const TRIPLE_TITLES: Record<string, string> = {
  'blue+green+grey': "Preserver of the Sustainable Heritage",
  'blue+green+orange': "Manager of the Resource Sovereignty",
  'blue+green+purple': "Visionary of the Tech-Equity Era",
  'blue+green+red': "Strategist of the Sustainable Economy",
  'blue+green+yellow': "Operator of the Strategic Green Market",
  'blue+grey+orange': "Patron of the Aristocratic Landed-Class",
  'blue+grey+purple': "Statesman of the Civil Establishment",
  'blue+grey+red': "Anchor of the Institutional Core",
  'blue+grey+yellow': "Strongman of the Capital-Order Pact",
  'blue+orange+purple': "Broker of the Global Trade Reform",
  'blue+orange+red': "Director of the Industrial-Agri Complex",
  'blue+orange+yellow': "Architect of the Export Fortress",
  'blue+purple+red': "Mediator of the Modern Welfare State",
  'blue+purple+yellow': "Reformer of the Constitutional Guard",
  'blue+red+yellow': "Sentinel of National Productivity",
  'green+grey+orange': "Shepherd of the Sacred Soil",
  'green+grey+purple': "Custodian of the Pluralist Legacy",
  'green+grey+red': "Steward of the Ancestral Earth",
  'green+grey+yellow': "Enforcer of the Ecological Tradition",
  'green+orange+purple': "Liberator of the Shared Harvest",
  'green+orange+red': "Champion of the Rural-Green Alliance",
  'green+orange+yellow': "Scout of the Environmental Frontier",
  'green+purple+red': "Architect of the Social-Ecological Pact",
  'green+purple+yellow': "Protector of the Safe Transition",
  'green+red+yellow': "Commander of the Ecological Defense",
  'grey+orange+purple': "Representative of the Diverse Interior",
  'grey+orange+red': "Icon of the Workers' Heartland",
  'grey+orange+yellow': "Grandmaster of the Conservative Heartland",
  'grey+purple+red': "Unity Leader of the National Front",
  'grey+purple+yellow': "Voice of the Moral Majority",
  'grey+red+yellow': "Sovereign of the Patriotic Laborers",
  'orange+purple+red': "Voice of the People’s Heartland",
  'orange+purple+yellow': "Shield of the Frontier Communities",
  'orange+red+yellow': "Commander of the Rural Worker-Defense",
  'purple+red+yellow': "Guardian of the Inclusive Peace",
};
