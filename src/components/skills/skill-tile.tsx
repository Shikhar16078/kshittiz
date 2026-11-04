import type { Skill } from '@/lib/skills';
import { SkillGlyph } from '@/components/skills/skill-glyph';
import { cn } from '@/lib/utils';

/**
 * The face of a logo tile: a glass chip with the glyph and name. Its brand-coloured light is a
 * separate layer whose opacity fades in when the tile is hot (`data-hot`, hovered) or lit
 * (`data-lit`, in the selected category), so nothing but opacity changes. The `data-lift`
 * element is what the wall lifts on hover. A small dot marks skills used in a role.
 */
export function SkillTileFace({
  skill,
  large = false,
  className,
}: {
  skill: Skill;
  /** The wall's bigger tiles from md up (the grid keeps the compact size to fit one screen). */
  large?: boolean;
  className?: string;
}) {
  const glow = skill.icon.glow;
  return (
    <div
      data-lift=""
      className={cn(
        'relative flex h-11 items-center gap-2 overflow-hidden whitespace-nowrap rounded-xl border border-foreground/10 bg-card/70 px-3 text-[13px] font-medium text-foreground/80 shadow-sm transition-colors duration-300 md:h-12 md:gap-2.5 md:px-4 md:text-sm',
        large && 'md:h-14 md:gap-3 md:rounded-2xl md:px-5 md:text-[15px]',
        'group-hover/tile:text-foreground group-data-[hot]/tile:text-foreground group-data-[lit]/tile:text-foreground',
        className
      )}
    >
      {/* Glass: a soft top highlight over the card colour. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-foreground/[0.07] to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-data-[lit]/tile:opacity-60 group-hover/tile:opacity-100 group-data-[hot]/tile:opacity-100"
        style={{
          background: `radial-gradient(120% 150% at 30% 0%, color-mix(in srgb, ${glow} 30%, transparent), transparent 72%)`,
          boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${glow} 55%, transparent)`,
        }}
      />
      <SkillGlyph
        icon={skill.icon}
        className={cn('relative size-[18px] md:size-5', large && 'md:size-6')}
      />
      <span className="relative">{skill.name}</span>
      {skill.roles.length > 0 && (
        <span
          aria-hidden
          className="relative -mr-0.5 size-1.5 rounded-full bg-primary/80"
        />
      )}
    </div>
  );
}
