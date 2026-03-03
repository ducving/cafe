import React from 'react';

export function Card({
  children,
  className = '',
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode; className?: string }): React.ReactElement {
  return (
    <div className={`aCard ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="aHeader">
      <div>
        <div className="aTitle">{title}</div>
        {subtitle ? <div className="aSub">{subtitle}</div> : null}
      </div>
      {right ? <div className="aHeaderRight">{right}</div> : null}
    </div>
  );
}

type ButtonVariant = 'primary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md';

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}): React.ReactElement {
  return <button className={`aBtn ${variant} ${size} ${className}`.trim()} {...props} />;
}

export function Input({
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }): React.ReactElement {
  return <input className={`aInput ${className}`.trim()} {...props} />;
}

export function Select({
  className = '',
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string; children: React.ReactNode }): React.ReactElement {
  return (
    <select className={`aInput ${className}`.trim()} {...props}>
      {children}
    </select>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode;
  hint?: React.ReactNode;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="aField">
      <div className="aLabelRow">
        <div className="aLabel">{label}</div>
        {hint ? <div className="aHint">{hint}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function Toolbar({ left, right }: { left?: React.ReactNode; right?: React.ReactNode }): React.ReactElement {
  return (
    <div className="aToolbar">
      <div className="aToolbarLeft">{left}</div>
      <div className="aToolbarRight">{right}</div>
    </div>
  );
}

type BadgeTone = 'gray' | 'green' | 'yellow' | 'red' | 'blue';

export function Badge({ tone = 'gray', children }: { tone?: BadgeTone; children: React.ReactNode }): React.ReactElement {
  return <span className={`aBadge ${tone}`}>{children}</span>;
}

export function EmptyState({
  title,
  subtitle,
  action,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="aEmpty">
      <div className="aEmptyTitle">{title}</div>
      {subtitle ? <div className="aEmptySub">{subtitle}</div> : null}
      {action ? <div style={{ marginTop: 12 }}>{action}</div> : null}
    </div>
  );
}

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
}: {
  open: boolean;
  title: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
}): React.ReactElement | null {
  if (!open) return null;
  return (
    <div className="aModalBackdrop" role="dialog" aria-modal="true" onMouseDown={onClose}>
      <div className="aModal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="aModalHead">
          <div className="aModalTitle">{title}</div>
          <button className="aIconBtn" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="aModalBody">{children}</div>
        {footer ? <div className="aModalFoot">{footer}</div> : null}
      </div>
    </div>
  );
}

