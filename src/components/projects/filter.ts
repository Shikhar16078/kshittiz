import type { Project } from '@/lib/types';
import type { ProjectsFilterDetail } from '@/lib/events';

/** A project's start year ("May 2018" → 2018), or null when it has none. */
function startYear(project: Pick<Project, 'startDate'>) {
  const match = project.startDate.match(/\d{4}/);
  return match ? Number(match[0]) : null;
}

// Names that mean the same technology, keyed by a lower-cased spelling.
const ALIASES: Record<string, string> = {
  node: 'node.js',
  nodejs: 'node.js',
  js: 'javascript',
  ts: 'typescript',
  golang: 'go',
  rails: 'ruby on rails',
  ror: 'ruby on rails',
  cpp: 'c++',
  sklearn: 'scikit-learn',
  postgres: 'postgresql',
  'next.js': 'nextjs',
  'react.js': 'react',
  reactjs: 'react',
  py: 'python',
};

export function canonical(name: string) {
  const key = name.trim().toLowerCase();
  return ALIASES[key] ?? key;
}

/**
 * Whether a project uses a technology: case-insensitive, through simple aliases, and a base
 * language also matches its framework-style names ("Ruby" matches "Ruby on Rails", but "Java"
 * doesn't match "JavaScript").
 */
function usesTech(project: Pick<Project, 'techStack'>, tech: string) {
  const want = canonical(tech);
  return project.techStack.some((item) => {
    const have = canonical(item);
    return have === want || have.startsWith(`${want} `);
  });
}

/** Projects matching an external filter (every given part must match). */
export function matchesFilter(project: Project, filter: ProjectsFilterDetail) {
  if (filter.tech && !usesTech(project, filter.tech)) return false;
  if (filter.years) {
    const year = startYear(project);
    const [from, to] = filter.years;
    if (year === null || year < Math.min(from, to) || year > Math.max(from, to)) {
      return false;
    }
  }
  return true;
}

/** The technologies used by at least `min` projects, most used first (for the filter chips). */
export function commonTech(projects: Project[], min = 2) {
  const counts = new Map<string, { name: string; count: number }>();
  for (const project of projects) {
    for (const item of project.techStack) {
      const key = canonical(item);
      const entry = counts.get(key) ?? { name: item, count: 0 };
      entry.count += 1;
      counts.set(key, entry);
    }
  }
  return [...counts.values()]
    .filter((e) => e.count >= min)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

/** The data's own spelling of a technology (e.g. "rails" → "Rails"), for labels. */
export function techLabel(projects: Project[], tech: string) {
  const want = canonical(tech);
  for (const project of projects) {
    const found = project.techStack.find((item) => canonical(item) === want);
    if (found) return found;
  }
  return tech;
}
