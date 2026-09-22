'use client';

import { useEffect } from 'react';
import Icon from './Icon';

type Props = {
  title: string;
  icon?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  color?: string;
  /**
   * True, ja logā kaut kas ir ierakstīts vai mainīts.
   * Tad nejaušs pieskāriens blakus logam to NEAIZVER, lai ierakstītais nepazustu.
   */
  dirty?: boolean;
};

export default function Modal({ title, icon, onClose, children, footer, color, dirty }: Props) {
  useEffect(() => {
    // Escape ir apzināts nospiediens, tāpēc tas aizver vienmēr
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className="backdrop"
      onMouseDown={(e) => {
        // Aizver tikai tad, ja nekas nav ierakstīts — citādi teksts pazustu
        if (e.target === e.currentTarget && !dirty) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-label={title} data-color={color}>
        <div className="modal-head">
          {icon ? <Icon name={icon} /> : null}
          <span>{title}</span>
          <button className="icon-btn" onClick={onClose} aria-label="Aizvērt">
            <Icon name="close" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer ? <div className="modal-foot">{footer}</div> : null}
      </div>
    </div>
  );
}
