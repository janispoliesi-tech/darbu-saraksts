'use client';

import { iconMarkup } from '@/lib/icons';

type Props = {
  name: string;
  size?: number;
  className?: string;
  strokeWidth?: number;
};

export default function Icon({ name, size, className, strokeWidth = 1.8 }: Props) {
  return (
    <svg
      className={className ? `icon ${className}` : 'icon'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={size ? { width: size, height: size } : undefined}
      dangerouslySetInnerHTML={{ __html: iconMarkup(name) }}
    />
  );
}
