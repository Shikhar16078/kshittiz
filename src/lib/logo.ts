import type { WorkExperience } from '@/lib/types';

/**
 * Image classes for a company logo inside a round or rounded frame: transparent marks are inset
 * so they sit whole inside the frame; full-bleed logos fill it.
 */
export function logoImageClass(job: Pick<WorkExperience, 'logoFit'>) {
  return job.logoFit === 'contain'
    ? 'h-full w-full object-contain p-[22%]'
    : 'h-full w-full object-cover';
}
