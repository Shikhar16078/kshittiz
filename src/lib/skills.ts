import {
  siBootstrap,
  siC,
  siDocker,
  siFramer,
  siGit,
  siGo,
  siHtml5,
  siJavascript,
  siJenkins,
  siJunit5,
  siLangchain,
  siLinux,
  siMongodb,
  siNextdotjs,
  siNodedotjs,
  siOpenjdk,
  siPandas,
  siPostgresql,
  siPython,
  siPytorch,
  siReact,
  siRedis,
  siRuby,
  siRubyonrails,
  siScikitlearn,
  siSnowflake,
  siSpringboot,
  siTailwindcss,
  siTensorflow,
  siTypescript,
  type SimpleIcon,
} from 'simple-icons';
import {
  BrainCircuit,
  Boxes,
  Database,
  FlaskConical,
  Globe,
  Layers,
  Network,
  Puzzle,
  Repeat,
  Shuffle,
  Sparkles,
  Webhook,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { projects, workExperience } from '@/lib/data';

// The Skills section's data: every skill with its logo, category and where it was used. "Where
// used" is derived from `workExperience[].stack` and `projects[].techStack`, so adding a
// technology to a role or project links it here without touching this file (as long as the
// names match a skill's name or one of its `aliases`).

export const SKILL_CATEGORIES = [
  'Frontend',
  'Backend',
  'Data',
  'AI/ML',
  'Cloud & DevOps',
  'Practices',
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

/**
 * How a tile draws its logo: a simple-icons path (24×24 viewBox) in its brand colour, a
 * monogram for brands simple-icons doesn't carry, or a lucide icon for concepts.
 * `color` is a CSS colour; near-black and near-white brand colours become `currentColor` so the
 * glyph stays visible in every theme. `glow` is what the hover light is tinted with.
 */
export type SkillIcon =
  | { type: 'brand'; path: string; color: string; glow: string }
  | { type: 'mono'; text: string; glow: string }
  | { type: 'lucide'; icon: LucideIcon; glow: string };

export type SkillRole = {
  id: string;
  company: string;
  role: string;
  /** e.g. "2019–2022" or "2022–now". */
  span: string;
};

export type SkillProject = { id: string; title: string; year: string };

export type Skill = {
  id: string;
  name: string;
  category: SkillCategory;
  icon: SkillIcon;
  roles: SkillRole[];
  projects: SkillProject[];
  /** The `techStack` name to filter Projects by (the first one this skill matched). */
  projectTech?: string;
  /** Time used across roles, e.g. "4+ years" or "3 months". */
  experience?: string;
  /** First and last year of use across roles and projects, e.g. "2015–now". */
  span?: string;
  /** This portfolio is built with it. */
  site: boolean;
};

/** What this site itself is built with (see CLAUDE.md, Stack). */
const SITE_STACK = new Set(['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'HTML & CSS', 'Framer Motion', 'Git']);

const THEME_GLOW = 'hsl(var(--glow))';

/** Relative luminance (WCAG) of a 6-digit hex colour, 0 (black) to 1 (white). */
function luminance(hex: string) {
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function brand(icon: SimpleIcon): SkillIcon {
  const l = luminance(icon.hex);
  // Too dark for the dark theme or too light for the light one: follow the text colour.
  const neutral = l < 0.06 || l > 0.85;
  return {
    type: 'brand',
    path: icon.path,
    color: neutral ? 'currentColor' : `#${icon.hex}`,
    glow: neutral ? THEME_GLOW : `#${icon.hex}`,
  };
}
const mono = (text: string): SkillIcon => ({ type: 'mono', text, glow: THEME_GLOW });
const lucide = (icon: LucideIcon): SkillIcon => ({ type: 'lucide', icon, glow: THEME_GLOW });

type SkillDef = {
  name: string;
  category: SkillCategory;
  icon: SkillIcon;
  /** Other spellings used in `stack` / `techStack` (matching ignores case and punctuation). */
  aliases?: string[];
};

const defs: SkillDef[] = [
  // Frontend
  { name: 'React', category: 'Frontend', icon: brand(siReact) },
  { name: 'Next.js', category: 'Frontend', icon: brand(siNextdotjs) },
  { name: 'TypeScript', category: 'Frontend', icon: brand(siTypescript) },
  { name: 'JavaScript', category: 'Frontend', icon: brand(siJavascript), aliases: ['JavaScript (ES6+)', 'JS'] },
  { name: 'Tailwind CSS', category: 'Frontend', icon: brand(siTailwindcss), aliases: ['Tailwind'] },
  { name: 'HTML & CSS', category: 'Frontend', icon: brand(siHtml5), aliases: ['HTML5 & CSS3', 'HTML5', 'HTML', 'CSS'] },
  { name: 'Framer Motion', category: 'Frontend', icon: brand(siFramer), aliases: ['Motion'] },
  { name: 'Bootstrap', category: 'Frontend', icon: brand(siBootstrap) },
  // Backend
  { name: 'Java', category: 'Backend', icon: brand(siOpenjdk) },
  { name: 'Go', category: 'Backend', icon: brand(siGo), aliases: ['Golang'] },
  { name: 'Python', category: 'Backend', icon: brand(siPython) },
  { name: 'Node.js', category: 'Backend', icon: brand(siNodedotjs), aliases: ['Node', 'NodeJS'] },
  { name: 'Spring Boot', category: 'Backend', icon: brand(siSpringboot), aliases: ['Spring'] },
  { name: 'Java EE', category: 'Backend', icon: mono('EE'), aliases: ['JEE', 'J2EE', 'JPA'] },
  { name: 'REST APIs', category: 'Backend', icon: lucide(Webhook), aliases: ['REST', 'REST API'] },
  { name: 'gRPC', category: 'Backend', icon: mono('gR') },
  { name: 'Microservices', category: 'Backend', icon: lucide(Boxes) },
  { name: 'Ruby', category: 'Backend', icon: brand(siRuby) },
  { name: 'Ruby on Rails', category: 'Backend', icon: brand(siRubyonrails), aliases: ['Rails'] },
  { name: 'C', category: 'Backend', icon: brand(siC) },
  // Data
  { name: 'Snowflake', category: 'Data', icon: brand(siSnowflake) },
  { name: 'Azure Cosmos DB', category: 'Data', icon: lucide(Globe), aliases: ['Cosmos DB', 'CosmosDB'] },
  { name: 'PostgreSQL', category: 'Data', icon: brand(siPostgresql), aliases: ['Postgres'] },
  { name: 'MongoDB', category: 'Data', icon: brand(siMongodb), aliases: ['Mongo'] },
  { name: 'Redis', category: 'Data', icon: brand(siRedis) },
  { name: 'SQL', category: 'Data', icon: lucide(Database) },
  { name: 'NoSQL', category: 'Data', icon: lucide(Layers) },
  { name: 'MapReduce', category: 'Data', icon: lucide(Shuffle), aliases: ['Map Reduce'] },
  { name: 'Pandas', category: 'Data', icon: brand(siPandas) },
  // AI/ML
  { name: 'Genkit', category: 'AI/ML', icon: lucide(Sparkles) },
  { name: 'LLM Integration', category: 'AI/ML', icon: lucide(BrainCircuit), aliases: ['LLMs', 'LLM'] },
  { name: 'OpenAI', category: 'AI/ML', icon: mono('AI') },
  { name: 'LangChain', category: 'AI/ML', icon: brand(siLangchain) },
  { name: 'TensorFlow', category: 'AI/ML', icon: brand(siTensorflow) },
  { name: 'PyTorch', category: 'AI/ML', icon: brand(siPytorch) },
  { name: 'scikit-learn', category: 'AI/ML', icon: brand(siScikitlearn), aliases: ['sklearn'] },
  // Cloud & DevOps
  { name: 'Azure', category: 'Cloud & DevOps', icon: mono('Az'), aliases: ['Cloud Computing (Azure)', 'Microsoft Azure'] },
  { name: 'AWS Lambda', category: 'Cloud & DevOps', icon: mono('λ'), aliases: ['Lambda'] },
  { name: 'Docker', category: 'Cloud & DevOps', icon: brand(siDocker) },
  { name: 'Jenkins', category: 'Cloud & DevOps', icon: brand(siJenkins) },
  { name: 'CI/CD', category: 'Cloud & DevOps', icon: lucide(Workflow) },
  { name: 'Git', category: 'Cloud & DevOps', icon: brand(siGit) },
  { name: 'OpenTracing', category: 'Cloud & DevOps', icon: mono('OT') },
  { name: 'Linux', category: 'Cloud & DevOps', icon: brand(siLinux), aliases: ['Linux Kernel'] },
  // Practices
  { name: 'Distributed Systems', category: 'Practices', icon: lucide(Network) },
  { name: 'Testing', category: 'Practices', icon: lucide(FlaskConical), aliases: ['TestNG', 'Mockito', 'RSpec'] },
  { name: 'JUnit', category: 'Practices', icon: brand(siJunit5), aliases: ['JUnit5', 'JUnit 5'] },
  { name: 'Agile', category: 'Practices', icon: lucide(Repeat), aliases: ['Agile Methodologies', 'Scrum'] },
  { name: 'Problem Solving', category: 'Practices', icon: lucide(Puzzle) },
];

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

/** "July 2019" → months since year 0; "Present" → `now`; a bare year → January of it. */
function toMonth(date: string, now: number) {
  if (/present|now|current/i.test(date)) return now;
  const year = Number(date.match(/\d{4}/)?.[0]);
  if (!year) return null;
  const month = MONTHS.indexOf(date.trim().slice(0, 3).toLowerCase());
  return year * 12 + Math.max(month, 0);
}

// Built at module load (once per server render / client bundle). "Present" counts up to the
// current month; the page is revalidated, so it never goes far out of date.
const today = new Date();
const NOW = today.getFullYear() * 12 + today.getMonth();
const yearOf = (month: number) => Math.floor(month / 12);
const spanLabel = (from: number, to: number) => {
  const end = to >= NOW ? 'now' : String(yearOf(to));
  const start = String(yearOf(from));
  return start === end ? start : `${start}–${end}`;
};

function experienceLabel(months: number) {
  if (months < 12) return `${months} month${months === 1 ? '' : 's'}`;
  const years = Math.floor(months / 12);
  const plus = months % 12 >= 3 ? '+' : '';
  return `${years}${plus} year${years === 1 && !plus ? '' : 's'}`;
}

function buildSkill(def: SkillDef): Skill {
  const names = new Set([def.name, ...(def.aliases ?? [])].map(norm));
  const roles: SkillRole[] = [];
  const intervals: [number, number][] = [];
  for (const job of workExperience) {
    if (!job.stack.some((t) => names.has(norm(t)))) continue;
    const from = toMonth(job.startDate, NOW);
    const to = toMonth(job.endDate, NOW);
    if (from !== null && to !== null) intervals.push([from, Math.max(from + 1, to)]);
    roles.push({
      id: job.id,
      company: job.company,
      role: job.role,
      span: from !== null && to !== null ? spanLabel(from, to) : `${job.startDate}–${job.endDate}`,
    });
  }

  let projectTech: string | undefined;
  const used: SkillProject[] = [];
  for (const p of projects) {
    const hit = p.techStack.find((t) => names.has(norm(t)));
    if (!hit) continue;
    projectTech ??= hit;
    used.push({ id: p.id, title: p.title, year: p.startDate.match(/\d{4}/)?.[0] ?? '' });
  }

  // Union of the role intervals, so overlapping roles aren't counted twice.
  intervals.sort((a, b) => a[0] - b[0]);
  let months = 0;
  let reach = -Infinity;
  for (const [from, to] of intervals) {
    const start = Math.max(from, reach);
    if (to > start) months += to - start;
    reach = Math.max(reach, to);
  }

  const points = [
    ...intervals.flat(),
    ...used.map((p) => Number(p.year) * 12).filter(Boolean),
  ];
  const span = points.length
    ? spanLabel(Math.min(...points), Math.max(...points))
    : undefined;

  return {
    id: slug(def.name),
    name: def.name,
    category: def.category,
    icon: def.icon,
    roles,
    projects: used,
    projectTech,
    experience: months > 0 ? experienceLabel(months) : undefined,
    span,
    site: SITE_STACK.has(def.name),
  };
}

export const skills: Skill[] = defs.map(buildSkill);

export const skillsByCategory = SKILL_CATEGORIES.map((category) => ({
  category,
  skills: skills.filter((s) => s.category === category),
}));

/** e.g. "45+": the count rounded down to a multiple of five. */
export const skillCountLabel = `${Math.floor(skills.length / 5) * 5}+`;

/**
 * Deals the skills into `count` rows round-robin in category order, so every row mixes
 * categories and the rows come out about equally long.
 */
export function skillRows(count: number) {
  const rows: Skill[][] = Array.from({ length: count }, () => []);
  skills.forEach((s, i) => rows[i % count].push(s));
  return rows;
}
