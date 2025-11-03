import { ButtonHTMLAttributes } from 'react';

export type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
};

export function PrimaryButton({ label, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      style={{
        backgroundColor: 'var(--brand-primary, #111827)',
        color: 'var(--brand-on-primary, #ffffff)',
        borderRadius: '0.75rem',
        border: 'none',
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        fontWeight: 600,
        cursor: 'pointer'
      }}
    >
      {label}
    </button>
  );
}
