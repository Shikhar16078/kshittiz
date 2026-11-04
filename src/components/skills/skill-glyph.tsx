import type { SkillIcon } from '@/lib/skills';
import { cn } from '@/lib/utils';

/**
 * A skill's logo: an inline simple-icons path in its brand colour, a monogram in the headline
 * font, or a lucide icon in the accent colour. Sized by `className` (e.g. `size-5`).
 */
export function SkillGlyph({
  icon,
  className,
}: {
  icon: SkillIcon;
  className?: string;
}) {
  if (icon.type === 'brand') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className={cn('shrink-0', className)}
        style={{ color: icon.color === 'currentColor' ? undefined : icon.color }}
        fill="currentColor"
      >
        <path d={icon.path} />
      </svg>
    );
  }
  if (icon.type === 'mono') {
    return (
      <span
        aria-hidden
        style={{ containerType: 'size' }}
        className={cn(
          'flex shrink-0 items-center justify-center font-headline font-bold leading-none tracking-tight text-primary-ink',
          className
        )}
      >
        {/* Sized to the box (container query units), whatever size the caller gives it. */}
        <span style={{ fontSize: '72cqh' }}>{icon.text}</span>
      </span>
    );
  }
  const Icon = icon.icon;
  return <Icon aria-hidden className={cn('shrink-0 text-primary-ink', className)} />;
}
