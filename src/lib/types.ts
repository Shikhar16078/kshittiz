import { type LucideIcon } from 'lucide-react';

export type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export type SocialLink = {
  name: string;
  url: string;
  icon: LucideIcon;
};

/** A headline number, e.g. { value: '~300 TB', label: 'Moved to Snowflake' }. */
export type Stat = {
  value: string;
  label: string;
};

export type PersonalData = {
  name: string;
  title: string;
  /** Rotating focus areas shown under the hero title. */
  roles: string[];
  /** One-sentence impact statement for the hero. */
  tagline: string;
  bio: string[];
  /** Headline numbers for the hero stats strip. */
  stats: Stat[];
  contact: {
    email: string;
    social: SocialLink[];
  };
};

export type WorkExperience = {
  /** Stable slug, used for anchors and cross-links (e.g. 'microsoft'). */
  id: string;
  company: string;
  /** One-line impact headline for the role. */
  headline: string;
  /** Three short wins, outcome first. */
  wins: string[];
  /** Technologies used in this role (names match the Skills section). */
  stack: string[];
  /** Company logo under /public. */
  logo?: string;
  /** Key numbers from this role, shown as impact chips. */
  impact?: Stat[];
  role: string;
  startDate: string;
  endDate: string;
  accomplishments: string[];
};

export type Education = {
  institution: string;
  /** Institution logo under /public. */
  logo?: string;
  degree: string;
  startDate: string;
  endDate: string;
  description: string;
  courses: string[];
  gpa?: string;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  type: 'Academic' | 'Personal';
  techStack: string[];
  githubUrl: string;
};
