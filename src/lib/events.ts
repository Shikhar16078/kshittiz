'use client';

// Cross-section links (e.g. a skill's "where I used it", an education card's projects link).
// Sections listen for these on `window`; the sender doesn't need to know how they scroll.

/** Bring an Experience role into view (Experience scrolls to and activates that chapter). */
export const EXPERIENCE_SHOW = 'experience:show';
export type ExperienceShowDetail = { id: string };

/** Show Projects filtered (Projects switches to its grid, applies the filter and scrolls). */
export const PROJECTS_FILTER = 'projects:filter';
export type ProjectsFilterDetail = {
  /** Only projects using this technology (matches `techStack` names). */
  tech?: string;
  /** Only projects whose start year is within [from, to]. */
  years?: [number, number];
};

export function showExperience(id: string) {
  window.dispatchEvent(
    new CustomEvent<ExperienceShowDetail>(EXPERIENCE_SHOW, { detail: { id } })
  );
}

export function showProjects(detail: ProjectsFilterDetail) {
  window.dispatchEvent(
    new CustomEvent<ProjectsFilterDetail>(PROJECTS_FILTER, { detail })
  );
}
